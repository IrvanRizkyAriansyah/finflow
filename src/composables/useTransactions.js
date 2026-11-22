import { ref, computed, watch } from 'vue'
import { useGoogleAuth } from './useGoogleAuth'
import { useGoogleSheets } from './useGoogleSheets'
import { cacheGet, cacheSet, cacheClear } from '@/services/localCache'
import { todayStr, sheetDateToString } from '@/utils/formatDate'
import { formatCurrency } from '@/utils/formatCurrency'
import { APP_CURRENCY } from '@/utils/constants'

const { user } = useGoogleAuth()
const { readTable, appendRow, updateRowById, deleteRowById, SHEETS } = useGoogleSheets()

// ---------- State (level modul, dibagi antar komponen) ----------
const transactions = ref([])
const categories = ref([])
const wallets = ref([])
const contactRows = ref([]) // bentuk mentah seperti di Sheets (accounts = string JSON)
const goalRows = ref([])
const goalEntryRows = ref([])
// Operasi yang belum terkirim: { opId, kind: 'add'|'update'|'delete', sheet, id, row, tries, sending }
const queue = ref([])
const isLoading = ref(false)
const isSyncing = ref(false)
const error = ref(null)
const lastSyncedAt = ref(null)
const selectedMonth = ref(todayStr().slice(0, 7)) // "YYYY-MM"

let loadPromise = null
let hydratedFor = null

const pad = (n) => String(n).padStart(2, '0')
const sum = (list, type) => list.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0)
const newId = () =>
  `${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2, 8)}`
const norm = (s) => String(s ?? '').trim().toLowerCase()

const makeOp = (kind, sheet, id, row = null, tries = 0) => ({
  opId: `op-${newId()}`, kind, sheet, id, row, tries, sending: false,
})

const normalizeTx = (r) => ({ ...r, amount: Number(r.amount) || 0, date: sheetDateToString(r.date) })
const normalizeWallet = (w) => ({ ...w, initial_balance: Number(w.initial_balance) || 0 })
const normalizeGoal = (g) => ({
  ...g,
  target_amount: Number(g.target_amount) || 0,
  deadline: g.deadline ? sheetDateToString(g.deadline) : '',
})
const normalizeEntry = (e) => ({ ...e, amount: Number(e.amount) || 0, date: sheetDateToString(e.date) })
const parseAccounts = (v) => {
  try {
    const a = JSON.parse(v)
    return Array.isArray(a) ? a : []
  } catch {
    return []
  }
}

function describeError(e) {
  if (e?.code === 'OFFLINE' || !navigator.onLine) return null // offline bukan error
  if (e?.code === 'AUTH_REQUIRED') return 'Sesi Google berakhir. Hubungkan ulang untuk menyinkronkan data.'
  return e?.message || 'Terjadi kesalahan saat menghubungi Google Sheets.'
}

// ---------- Antrean ----------
function enqueueAdd(sheet, row) {
  queue.value = [...queue.value, makeOp('add', sheet, row.id, row)]
}

function enqueueUpdate(sheet, id, row) {
  // Gabungkan hanya dengan operasi yang belum pernah dicoba dikirim
  const mergeable = queue.value.find(
    (o) => o.sheet === sheet && o.id === id && !o.sending &&
      (o.kind === 'update' || (o.kind === 'add' && !o.tries)),
  )
  if (mergeable) mergeable.row = row
  else queue.value = [...queue.value, makeOp('update', sheet, id, row)]
}

function enqueueDelete(sheet, id) {
  const q = queue.value
  const untouchedAdd = q.find((o) => o.sheet === sheet && o.id === id && o.kind === 'add' && !o.tries)
  if (untouchedAdd) {
    // Belum pernah menyentuh Sheets: batalkan semua operasi baris ini
    queue.value = q.filter((o) => !(o.sheet === sheet && o.id === id))
  } else {
    queue.value = [
      ...q.filter((o) => !(o.sheet === sheet && o.id === id && o.kind === 'update' && !o.sending)),
      makeOp('delete', sheet, id),
    ]
  }
}

// Terapkan operasi yang masih antre ke data dari server, agar tampilan tetap konsisten
function applyQueue(list, sheet, place) {
  let out = [...list]
  for (const op of queue.value.filter((o) => o.sheet === sheet)) {
    if (op.kind === 'add') {
      if (!out.some((r) => r.id === op.id)) place === 'start' ? out.unshift(op.row) : out.push(op.row)
    } else if (op.kind === 'update') {
      out = out.map((r) => (r.id === op.id ? { ...r, ...op.row } : r))
    } else if (op.kind === 'delete') {
      out = out.filter((r) => r.id !== op.id)
    }
  }
  return out
}

// ---------- Cache ----------
function hydrate() {
  const uid = user.value?.id
  if (!uid || hydratedFor === uid) return
  transactions.value = cacheGet(uid, 'transactions', [])
  categories.value = cacheGet(uid, 'categories', [])
  wallets.value = cacheGet(uid, 'wallets', [])
  contactRows.value = cacheGet(uid, 'contacts', [])
  goalRows.value = cacheGet(uid, 'goals', [])
  goalEntryRows.value = cacheGet(uid, 'goal_entries', [])
  // Migrasi antrean versi lama: transaksi polos → "add"; operasi tanpa `sheet` → tab Transactions
  queue.value = cacheGet(uid, 'pending', []).map((o) => {
    if (!o.kind) return makeOp('add', SHEETS.TRANSACTIONS, o.id, o, o.tries || 0)
    const { tx, ...rest } = o
    return { ...rest, sheet: o.sheet ?? SHEETS.TRANSACTIONS, row: o.row ?? tx ?? null, sending: false }
  })
  lastSyncedAt.value = cacheGet(uid, 'synced_at')
  hydratedFor = uid
}

function persist() {
  const uid = user.value?.id
  if (!uid) return
  cacheSet(uid, 'transactions', transactions.value)
  cacheSet(uid, 'categories', categories.value)
  cacheSet(uid, 'wallets', wallets.value)
  cacheSet(uid, 'contacts', contactRows.value)
  cacheSet(uid, 'goals', goalRows.value)
  cacheSet(uid, 'goal_entries', goalEntryRows.value)
  cacheSet(uid, 'pending', queue.value)
  cacheSet(uid, 'synced_at', lastSyncedAt.value)
}

// ---------- Sinkronisasi ----------
async function runOp(op, attempted) {
  if (op.kind === 'add') {
    // Pernah dicoba sebelumnya? Cek dulu supaya tidak terduplikasi di Sheets.
    if (attempted) {
      const rows = await readTable(op.sheet)
      if (rows.some((r) => String(r.id) === op.id)) return
    }
    await appendRow(op.sheet, op.row)
  } else if (op.kind === 'update') {
    await updateRowById(op.sheet, op.id, op.row) // false = baris sudah dihapus di tempat lain, abaikan
  } else if (op.kind === 'delete') {
    await deleteRowById(op.sheet, op.id) // false = sudah tidak ada, tujuan tercapai
  }
}

async function flushQueue() {
  if (!queue.value.length || !navigator.onLine || isSyncing.value) return
  isSyncing.value = true
  try {
    let op
    // Selalu proses antrean paling depan, supaya urutan terjaga dan
    // operasi yang ditambahkan saat sinkronisasi berjalan ikut terkirim.
    while ((op = queue.value[0])) {
      const attempted = op.tries > 0
      op.sending = true
      op.tries += 1
      persist()
      try {
        await runOp(op, attempted)
      } catch (e) {
        op.sending = false
        persist()
        throw e
      }
      queue.value = queue.value.filter((o) => o.opId !== op.opId)
      persist()
    }
  } catch (e) {
    error.value = describeError(e)
  } finally {
    isSyncing.value = false
  }
}

async function doLoad() {
  isLoading.value = !lastSyncedAt.value // skeleton hanya bila belum ada cache
  error.value = null
  try {
    const [tx, cats, wals, cons, goals, entries] = await Promise.all([
      readTable(SHEETS.TRANSACTIONS),
      readTable(SHEETS.CATEGORIES),
      readTable(SHEETS.WALLETS),
      readTable(SHEETS.CONTACTS),
      readTable(SHEETS.GOALS),
      readTable(SHEETS.GOAL_ENTRIES),
    ])
    transactions.value = applyQueue(tx.map(normalizeTx), SHEETS.TRANSACTIONS, 'start')
    categories.value = applyQueue(cats, SHEETS.CATEGORIES, 'end')
    wallets.value = applyQueue(wals.map(normalizeWallet), SHEETS.WALLETS, 'end')
    contactRows.value = applyQueue(cons, SHEETS.CONTACTS, 'end')
    goalRows.value = applyQueue(goals.map(normalizeGoal), SHEETS.GOALS, 'end')
    goalEntryRows.value = applyQueue(entries.map(normalizeEntry), SHEETS.GOAL_ENTRIES, 'end')
    lastSyncedAt.value = new Date().toISOString()
    persist()
    await flushQueue()
  } catch (e) {
    error.value = describeError(e)
  } finally {
    isLoading.value = false
  }
}

/** Tampilkan cache dulu, lalu segarkan dari Google Sheets bila online */
function load() {
  if (!user.value) return Promise.resolve()
  hydrate()
  if (!navigator.onLine) return Promise.resolve()
  loadPromise ??= doLoad().finally(() => { loadPromise = null })
  return loadPromise
}

// ---------- Transaksi ----------
async function addTransaction({ type, amount, category_id, wallet_id, note = '', date }) {
  const value = Number(amount)
  if (!(value > 0)) throw new Error('Nominal harus lebih dari 0.')

  const tx = {
    id: `tx-${newId()}`,
    date: date || todayStr(),
    type,
    amount: value,
    category_id,
    wallet_id: wallet_id || wallets.value[0]?.id || '',
    note: note.trim(),
    created_at: new Date().toISOString(),
  }

  transactions.value = [tx, ...transactions.value] // UI langsung berubah
  enqueueAdd(SHEETS.TRANSACTIONS, tx)
  persist()
  flushQueue() // sengaja tanpa await: UI tidak menunggu jaringan
  return tx
}

async function updateTransaction(id, changes) {
  const current = transactions.value.find((t) => t.id === id)
  if (!current) throw new Error('Transaksi tidak ditemukan.')

  const amount = Number(changes.amount ?? current.amount)
  if (!(amount > 0)) throw new Error('Nominal harus lebih dari 0.')

  const next = {
    ...current,
    ...changes,
    id: current.id,
    amount,
    note: String(changes.note ?? current.note ?? '').trim(),
  }
  transactions.value = transactions.value.map((t) => (t.id === id ? next : t))
  enqueueUpdate(SHEETS.TRANSACTIONS, id, next)
  persist()
  flushQueue()
  return next
}

function deleteTransaction(id) {
  if (!transactions.value.some((t) => t.id === id)) return
  transactions.value = transactions.value.filter((t) => t.id !== id)
  enqueueDelete(SHEETS.TRANSACTIONS, id)
  persist()
  flushQueue()
}

// ---------- Dompet ----------
function cleanWallet(data, selfId) {
  const name = String(data.name ?? '').trim()
  if (!name) throw new Error('Nama dompet wajib diisi.')
  if (wallets.value.some((w) => w.id !== selfId && norm(w.name) === norm(name))) {
    throw new Error('Nama dompet sudah dipakai.')
  }
  const initial = Number(data.initial_balance ?? 0)
  if (!Number.isFinite(initial) || initial < 0) throw new Error('Saldo awal tidak valid.')
  return { name, type: data.type || 'cash', initial_balance: initial }
}

function addWallet(data) {
  const row = { id: `wallet-${newId()}`, currency: APP_CURRENCY, color: '#10412a', ...cleanWallet(data, null) }
  wallets.value = [...wallets.value, row]
  enqueueAdd(SHEETS.WALLETS, row)
  persist()
  flushQueue()
  return row
}

function updateWallet(id, data) {
  const current = wallets.value.find((w) => w.id === id)
  if (!current) throw new Error('Dompet tidak ditemukan.')
  const next = { ...current, ...cleanWallet(data, id) }
  wallets.value = wallets.value.map((w) => (w.id === id ? next : w))
  enqueueUpdate(SHEETS.WALLETS, id, next)
  persist()
  flushQueue()
  return next
}

function deleteWallet(id) {
  const used = transactions.value.filter((t) => t.wallet_id === id).length
  if (used) throw new Error(`Dompet masih dipakai ${used} transaksi. Hapus atau pindahkan transaksinya dulu.`)
  if (wallets.value.length <= 1) throw new Error('Minimal harus ada satu dompet.')
  wallets.value = wallets.value.filter((w) => w.id !== id)
  enqueueDelete(SHEETS.WALLETS, id)
  persist()
  flushQueue()
}

// ---------- Kategori ----------
function cleanCategory(data, selfId, type) {
  const name = String(data.name ?? '').trim()
  if (!name) throw new Error('Nama kategori wajib diisi.')
  if (!['income', 'expense'].includes(type)) throw new Error('Tipe kategori tidak valid.')
  if (categories.value.some((c) => c.id !== selfId && c.type === type && norm(c.name) === norm(name))) {
    throw new Error('Nama kategori sudah dipakai.')
  }
  return { name, type, icon: data.icon || 'category', color: data.color || '#6B7280' }
}

function addCategory(data) {
  const row = { id: `cat-${newId()}`, ...cleanCategory(data, null, data.type) }
  categories.value = [...categories.value, row]
  enqueueAdd(SHEETS.CATEGORIES, row)
  persist()
  flushQueue()
  return row
}

function updateCategory(id, data) {
  const current = categories.value.find((c) => c.id === id)
  if (!current) throw new Error('Kategori tidak ditemukan.')
  const next = { ...current, ...cleanCategory(data, id, current.type) } // tipe tidak berubah
  categories.value = categories.value.map((c) => (c.id === id ? next : c))
  enqueueUpdate(SHEETS.CATEGORIES, id, next)
  persist()
  flushQueue()
  return next
}

function deleteCategory(id) {
  const current = categories.value.find((c) => c.id === id)
  if (!current) return
  const used = transactions.value.filter((t) => t.category_id === id).length
  if (used) throw new Error(`Kategori masih dipakai ${used} transaksi. Hapus atau ubah transaksinya dulu.`)
  if (categories.value.filter((c) => c.type === current.type).length <= 1) {
    throw new Error('Minimal harus ada satu kategori untuk tiap tipe.')
  }
  categories.value = categories.value.filter((c) => c.id !== id)
  enqueueDelete(SHEETS.CATEGORIES, id)
  persist()
  flushQueue()
}

// ---------- Kontak (Quick Send) ----------
function cleanContact(data) {
  const name = String(data.name ?? '').trim()
  if (!name) throw new Error('Nama kontak wajib diisi.')

  const accounts = (data.accounts ?? [])
    .map((a) => ({
      type: a.type || 'bank',
      provider: String(a.provider ?? '').trim(),
      number: String(a.number ?? '').trim(),
    }))
    .filter((a) => a.provider || a.number) // baris kosong diabaikan

  for (const a of accounts) {
    if (!a.provider) throw new Error('Nama bank atau penyedia wajib diisi.')
    if (!a.number) throw new Error(`Nomor ${a.provider} wajib diisi.`)
    if (a.type !== 'other' && !/^\+?[0-9\s-]+$/.test(a.number)) {
      throw new Error(`Nomor ${a.provider} hanya boleh berisi angka.`)
    }
  }
  return { name, accounts: JSON.stringify(accounts), note: String(data.note ?? '').trim() }
}

function addContact(data) {
  const row = { id: `contact-${newId()}`, created_at: new Date().toISOString(), ...cleanContact(data) }
  contactRows.value = [...contactRows.value, row]
  enqueueAdd(SHEETS.CONTACTS, row)
  persist()
  flushQueue()
  return row
}

function updateContact(id, data) {
  const current = contactRows.value.find((c) => c.id === id)
  if (!current) throw new Error('Kontak tidak ditemukan.')
  const next = { ...current, ...cleanContact(data) }
  contactRows.value = contactRows.value.map((c) => (c.id === id ? next : c))
  enqueueUpdate(SHEETS.CONTACTS, id, next)
  persist()
  flushQueue()
  return next
}

function deleteContact(id) {
  if (!contactRows.value.some((c) => c.id === id)) return
  contactRows.value = contactRows.value.filter((c) => c.id !== id)
  enqueueDelete(SHEETS.CONTACTS, id)
  persist()
  flushQueue()
}

// ---------- Tujuan tabungan ----------
const signed = (e) => (e.type === 'withdraw' ? -e.amount : e.amount)
const savedFor = (goalId, entries = goalEntryRows.value) =>
  entries.filter((e) => e.goal_id === goalId).reduce((s, e) => s + signed(e), 0)

function cleanGoal(data, selfId) {
  const name = String(data.name ?? '').trim()
  if (!name) throw new Error('Nama tujuan wajib diisi.')
  if (goalRows.value.some((g) => g.id !== selfId && norm(g.name) === norm(name))) {
    throw new Error('Nama tujuan sudah dipakai.')
  }
  const target = Number(data.target_amount)
  if (!Number.isFinite(target) || target <= 0) throw new Error('Target harus lebih dari 0.')
  const deadline = String(data.deadline ?? '').trim()
  if (deadline && Number.isNaN(new Date(`${deadline}T00:00:00`).getTime())) {
    throw new Error('Tanggal target tidak valid.')
  }
  return { name, target_amount: target, deadline, icon: data.icon || 'savings', color: data.color || '#10412a' }
}

function addGoal(data) {
  const row = { id: `goal-${newId()}`, created_at: new Date().toISOString(), ...cleanGoal(data, null) }
  goalRows.value = [...goalRows.value, row]
  enqueueAdd(SHEETS.GOALS, row)
  persist()
  flushQueue()
  return row
}

function updateGoal(id, data) {
  const current = goalRows.value.find((g) => g.id === id)
  if (!current) throw new Error('Tujuan tidak ditemukan.')
  const next = { ...current, ...cleanGoal(data, id) }
  goalRows.value = goalRows.value.map((g) => (g.id === id ? next : g))
  enqueueUpdate(SHEETS.GOALS, id, next)
  persist()
  flushQueue()
  return next
}

/** Isi tujuan kembali ke Saldo tersedia; riwayatnya tetap di Sheets sebagai arsip (tidak dihitung) */
function deleteGoal(id) {
  if (!goalRows.value.some((g) => g.id === id)) return
  goalRows.value = goalRows.value.filter((g) => g.id !== id)
  enqueueDelete(SHEETS.GOALS, id)
  persist()
  flushQueue()
}

function addGoalEntry({ goal_id, type, amount, date, note = '' }) {
  if (!goalRows.value.some((g) => g.id === goal_id)) throw new Error('Tujuan tidak ditemukan.')
  if (!['deposit', 'withdraw'].includes(type)) throw new Error('Jenis transaksi tidak valid.')
  const value = Number(amount)
  if (!(value > 0)) throw new Error('Nominal harus lebih dari 0.')

  if (type === 'deposit' && value > availableBalance.value) {
    throw new Error(`Saldo tersedia hanya ${formatCurrency(Math.max(0, availableBalance.value))}.`)
  }
  if (type === 'withdraw' && value > savedFor(goal_id)) {
    throw new Error(`Tabungan di tujuan ini hanya ${formatCurrency(Math.max(0, savedFor(goal_id)))}.`)
  }

  const row = {
    id: `ge-${newId()}`,
    goal_id,
    type,
    amount: value,
    date: date || todayStr(),
    note: String(note).trim(),
    created_at: new Date().toISOString(),
  }
  goalEntryRows.value = [...goalEntryRows.value, row]
  enqueueAdd(SHEETS.GOAL_ENTRIES, row)
  persist()
  flushQueue()
  return row
}

function deleteGoalEntry(id) {
  const entry = goalEntryRows.value.find((e) => e.id === id)
  if (!entry) return
  const rest = goalEntryRows.value.filter((e) => e.id !== id)

  if (goalIds.value.has(entry.goal_id)) {
    if (savedFor(entry.goal_id, rest) < 0) {
      throw new Error('Tidak bisa dihapus: tabungan di tujuan ini akan menjadi negatif.')
    }
    if (entry.type === 'withdraw' && entry.amount > availableBalance.value) {
      throw new Error('Tidak bisa dihapus: saldo tersedia tidak cukup untuk mengembalikan penarikan ini.')
    }
  }
  goalEntryRows.value = rest
  enqueueDelete(SHEETS.GOAL_ENTRIES, id)
  persist()
  flushQueue()
}

function resetData() {
  const uid = user.value?.id
  if (uid) cacheClear(uid)
  transactions.value = []
  categories.value = []
  wallets.value = []
  contactRows.value = []
  goalRows.value = []
  goalEntryRows.value = []
  queue.value = []
  lastSyncedAt.value = null
  hydratedFor = null
}

// ---------- Turunan (saldo, total, grafik) ----------
const categoryMap = computed(() => new Map(categories.value.map((c) => [c.id, c])))
const pendingIds = computed(() => new Set(queue.value.map((o) => o.id)))

// Kontak dengan `accounts` sudah berupa array, diurutkan menurut nama
const contacts = computed(() =>
  contactRows.value
    .map((c) => ({ ...c, accounts: parseAccounts(c.accounts) }))
    .sort((a, b) => String(a.name).localeCompare(String(b.name), 'id')),
)

function countBy(list, key) {
  const m = new Map()
  for (const t of list) m.set(t[key], (m.get(t[key]) ?? 0) + 1)
  return m
}
const walletUsage = computed(() => countBy(transactions.value, 'wallet_id'))
const categoryUsage = computed(() => countBy(transactions.value, 'category_id'))

const sortedTransactions = computed(() =>
  [...transactions.value].sort(
    (a, b) => b.date.localeCompare(a.date) || String(b.created_at || '').localeCompare(String(a.created_at || '')),
  ),
)

const walletsWithBalance = computed(() =>
  wallets.value.map((w) => {
    const mine = transactions.value.filter((t) => t.wallet_id === w.id)
    return { ...w, balance: w.initial_balance + sum(mine, 'income') - sum(mine, 'expense') }
  }),
)
const totalBalance = computed(() => walletsWithBalance.value.reduce((s, w) => s + w.balance, 0))

// Tabungan: hanya entri milik tujuan yang masih ada yang dihitung
const goalIds = computed(() => new Set(goalRows.value.map((g) => g.id)))
const totalSaved = computed(() =>
  goalEntryRows.value.filter((e) => goalIds.value.has(e.goal_id)).reduce((s, e) => s + signed(e), 0),
)
const availableBalance = computed(() => totalBalance.value - totalSaved.value)

const goalsWithProgress = computed(() => {
  const today = new Date(`${todayStr()}T00:00:00`)
  return goalRows.value.map((g) => {
    const saved = savedFor(g.id)
    const remaining = Math.max(0, g.target_amount - saved)
    const reached = g.target_amount > 0 && saved >= g.target_amount

    let daysLeft = null
    let overdue = false
    let monthlyNeeded = null
    if (g.deadline) {
      daysLeft = Math.ceil((new Date(`${g.deadline}T00:00:00`) - today) / 86400000)
      if (!reached) {
        if (daysLeft <= 0) overdue = true
        else monthlyNeeded = Math.ceil(remaining / Math.max(1, Math.ceil(daysLeft / 30)))
      }
    }
    return {
      ...g,
      saved,
      remaining,
      reached,
      overdue,
      daysLeft,
      monthlyNeeded,
      progress: g.target_amount > 0 ? Math.min(1, Math.max(0, saved / g.target_amount)) : 0,
    }
  })
})

// goal_id → riwayat setor/tarik, terbaru di atas
const goalEntriesMap = computed(() => {
  const m = new Map()
  const sorted = [...goalEntryRows.value].sort(
    (a, b) => b.date.localeCompare(a.date) || String(b.created_at || '').localeCompare(String(a.created_at || '')),
  )
  for (const e of sorted) {
    if (!m.has(e.goal_id)) m.set(e.goal_id, [])
    m.get(e.goal_id).push(e)
  }
  return m
})

const monthlyTransactions = computed(() =>
  sortedTransactions.value.filter((t) => t.date.startsWith(selectedMonth.value)),
)
const monthIncome = computed(() => sum(monthlyTransactions.value, 'income'))
const monthSpending = computed(() => sum(monthlyTransactions.value, 'expense'))

const last7Days = computed(() => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toLocaleDateString('sv-SE'))
  }
  return days.map((date) => {
    const day = transactions.value.filter((t) => t.date === date)
    return {
      date,
      label: new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'short' }),
      income: sum(day, 'income'),
      expense: sum(day, 'expense'),
    }
  })
})

const monthLabel = computed(() =>
  new Date(`${selectedMonth.value}-01T00:00:00`).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
)
function shiftMonth(delta) {
  const [y, m] = selectedMonth.value.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  selectedMonth.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

// ---------- Efek global (didaftarkan sekali) ----------
watch(user, (u) => {
  if (!u) {
    transactions.value = []
    categories.value = []
    wallets.value = []
    contactRows.value = []
    goalRows.value = []
    goalEntryRows.value = []
    queue.value = []
    hydratedFor = null
  }
})
window.addEventListener('online', () => user.value && load())

export function useTransactions() {
  return {
    transactions, categories, wallets, contacts, walletsWithBalance, categoryMap, pendingIds,
    walletUsage, categoryUsage,
    goalsWithProgress, goalEntriesMap, totalSaved, availableBalance,
    pendingCount: computed(() => queue.value.length),
    isLoading, isSyncing, error, lastSyncedAt,
    totalBalance, monthlyTransactions, monthIncome, monthSpending, last7Days,
    sortedTransactions, selectedMonth, monthLabel, shiftMonth,
    load, flushQueue, resetData,
    addTransaction, updateTransaction, deleteTransaction,
    addWallet, updateWallet, deleteWallet,
    addCategory, updateCategory, deleteCategory,
    addContact, updateContact, deleteContact,
    addGoal, updateGoal, deleteGoal, addGoalEntry, deleteGoalEntry,
  }
}