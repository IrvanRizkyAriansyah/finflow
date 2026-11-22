import { ref, watch } from 'vue'
import { useGoogleAuth } from './useGoogleAuth'
import { createSheetsApi } from '@/services/sheetsApi'
import { SPREADSHEET_TITLE } from '@/utils/constants'
import {
  SHEETS, SCHEMA, DEFAULT_CATEGORIES, DEFAULT_WALLETS,
  rowsToObjects, objectToRow,
} from '@/utils/sheetSchema'

// State level modul (dibagi antar komponen)
const spreadsheetId = ref(null)
const status = ref('idle') // idle | checking | creating | ready | error
const error = ref(null)
let setupPromise = null

const { user, getAccessToken } = useGoogleAuth()
const api = createSheetsApi(getAccessToken)

// ID spreadsheet disimpan per akun Google agar tidak tertukar antar pengguna
const storageKey = () => `ff_spreadsheet_id:${user.value?.id}`

// Reset saat logout
watch(user, (u) => {
  if (!u) {
    spreadsheetId.value = null
    status.value = 'idle'
    error.value = null
  }
})

// ---------- Edit & hapus berdasarkan id ----------
const sheetIdCache = new Map() // `${spreadsheetId}:${namaTab}` → sheetId

async function getSheetId(id, sheetName) {
  const key = `${id}:${sheetName}`
  if (!sheetIdCache.has(key)) {
    const ids = await api.getSheetIds(id)
    for (const [title, sheetId] of Object.entries(ids)) sheetIdCache.set(`${id}:${title}`, sheetId)
  }
  const sheetId = sheetIdCache.get(key)
  if (sheetId === undefined) throw new Error(`Tab "${sheetName}" tidak ditemukan di spreadsheet.`)
  return sheetId
}

// Nomor baris (berbasis 1) dari id, atau null bila tidak ada. Baris 1 = header.
async function findRowNumber(id, sheetName, rowId) {
  const col = await api.getValues(id, `${sheetName}!A:A`)
  const idx = col.findIndex((r, i) => i > 0 && String(r?.[0]) === String(rowId))
  return idx === -1 ? null : idx + 1
}

const lastColumn = (sheetName) => String.fromCharCode(64 + SCHEMA[sheetName].length) // A..Z

/** Isi header + data awal bila tab masih kosong (aman dipanggil berulang) */
async function ensureSeeded(id) {
  const [header] = await api.getValues(id, `${SHEETS.CATEGORIES}!A1:A1`)
  if (header?.[0]) return // sudah terisi

  await api.batchUpdateValues(id, [
    { range: `${SHEETS.TRANSACTIONS}!A1`, values: [SCHEMA[SHEETS.TRANSACTIONS]] },
    { range: `${SHEETS.CATEGORIES}!A1`, values: [SCHEMA[SHEETS.CATEGORIES], ...DEFAULT_CATEGORIES] },
    { range: `${SHEETS.WALLETS}!A1`, values: [SCHEMA[SHEETS.WALLETS], ...DEFAULT_WALLETS] },
  ])
}

const EXTRA_SHEETS = [SHEETS.CONTACTS, SHEETS.GOALS, SHEETS.GOAL_ENTRIES]

/** Pastikan tab tambahan ada + berheader (untuk spreadsheet lama maupun baru) */
async function ensureExtraSheets(id) {
  const flag = `ff_extra_sheets_v2:${id}`
  if (localStorage.getItem(flag)) return // sudah pernah dicek, hemat panggilan API

  const ids = await api.getSheetIds(id)
  for (const name of EXTRA_SHEETS) {
    if (ids[name] === undefined) await api.addSheet(id, name)
    const [header] = await api.getValues(id, `${name}!A1:A1`)
    if (!header?.[0]) await api.updateValues(id, `${name}!A1`, [SCHEMA[name]])
  }
  localStorage.setItem(flag, '1')
}

async function runSetup() {
  error.value = null
  status.value = 'checking'
  try {
    const stored = localStorage.getItem(storageKey())

    // Offline: percaya ID yang tersimpan, jangan buat file baru
    if (!navigator.onLine && stored) {
      spreadsheetId.value = stored
      status.value = 'ready'
      return stored
    }

    // 1) ID tersimpan di perangkat ini (pastikan file belum dihapus)
    let id = stored && (await api.spreadsheetExists(stored)) ? stored : null

    // 2) Perangkat baru / cache dihapus → cari file buatan aplikasi di Drive
    if (!id) id = await api.findSpreadsheetByName(SPREADSHEET_TITLE)

    // 3) Belum ada sama sekali → buat spreadsheet + 3 tab
    if (!id) {
      status.value = 'creating'
      const created = await api.createSpreadsheet({
        title: SPREADSHEET_TITLE,
        tabs: Object.values(SHEETS),
      })
      id = created.spreadsheetId
      localStorage.setItem(storageKey(), id) // simpan segera, sebelum seeding
    }

    await ensureSeeded(id)
    await ensureExtraSheets(id)

    localStorage.setItem(storageKey(), id)
    spreadsheetId.value = id
    status.value = 'ready'
    return id
  } catch (e) {
    status.value = 'error'
    error.value = e
    throw e
  }
}

export function useGoogleSheets() {
  /** Panggil setelah login. Request ganda digabung jadi satu proses. */
  function setupDatabase() {
    if (!user.value) return Promise.reject(Object.assign(new Error('AUTH_REQUIRED'), { code: 'AUTH_REQUIRED' }))
    setupPromise ??= runSetup().finally(() => { setupPromise = null })
    return setupPromise
  }

  async function requireId() {
    return spreadsheetId.value ?? setupDatabase()
  }

  /** Baca satu tab → array of object, mis. readTable('Transactions') */
  async function readTable(sheetName) {
    const id = await requireId()
    const rows = await api.getValues(id, `${sheetName}!A:Z`)
    return rowsToObjects(rows)
  }

  /** Tambah satu baris ke tab, mis. appendRow('Transactions', {...}) */
  async function appendRow(sheetName, data) {
    const id = await requireId()
    return api.appendValues(id, `${sheetName}!A1`, [objectToRow(sheetName, data)])
  }

    /** Ganti isi satu baris. Mengembalikan false bila baris sudah tidak ada. */
  async function updateRowById(sheetName, rowId, data) {
    const id = await requireId()
    const row = await findRowNumber(id, sheetName, rowId)
    if (!row) return false
    await api.updateValues(
      id,
      `${sheetName}!A${row}:${lastColumn(sheetName)}${row}`,
      [objectToRow(sheetName, data)],
    )
    return true
  }

  /** Hapus satu baris. Mengembalikan false bila baris sudah tidak ada. */
  async function deleteRowById(sheetName, rowId) {
    const id = await requireId()
    const row = await findRowNumber(id, sheetName, rowId)
    if (!row) return false
    const sheetId = await getSheetId(id, sheetName)
    await api.deleteRows(id, sheetId, row - 1, row)
    return true
  }

  const spreadsheetUrl = () =>
    spreadsheetId.value ? `https://docs.google.com/spreadsheets/d/${spreadsheetId.value}` : null

  return {
    spreadsheetId,
    status,
    error,
    SHEETS,
    setupDatabase,
    readTable,
    appendRow,
    updateRowById,   // baru
    deleteRowById,   // baru
    spreadsheetUrl,
  }
}