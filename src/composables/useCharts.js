import { computed } from 'vue'
import { useTransactions } from './useTransactions'
import { todayStr } from '@/utils/formatDate'

const { transactions, categoryMap, wallets } = useTransactions()

const FALLBACK_COLORS = ['#10412a', '#3B82F6', '#8B5CF6', '#F97316', '#EAB308', '#EC4899']
const OTHER_COLOR = '#9CA3AF'
const MAX_SEGMENTS = 5

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
const monthKey = (date) => date.slice(0, 7)
const nowKey = () => monthKey(todayStr())

function shiftKey(key, delta) {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
const monthShort = (key) => cap(new Date(`${key}-01T00:00:00`).toLocaleDateString('id-ID', { month: 'short' }))
const monthLong = (key) => cap(new Date(`${key}-01T00:00:00`).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }))

// Total pemasukan dan pengeluaran per bulan: Map<'YYYY-MM', { income, expense }>
const totalsByMonth = computed(() => {
  const map = new Map()
  for (const t of transactions.value) {
    const key = monthKey(t.date)
    const row = map.get(key) ?? { income: 0, expense: 0 }
    if (t.type === 'income') row.income += t.amount
    else if (t.type === 'expense') row.expense += t.amount
    map.set(key, row)
  }
  return map
})

// 1) Ringkasan bulan ini + perbandingan dengan bulan lalu
const monthSummary = computed(() => {
  const cur = nowKey()
  const c = totalsByMonth.value.get(cur) ?? { income: 0, expense: 0 }
  const p = totalsByMonth.value.get(shiftKey(cur, -1)) ?? { income: 0, expense: 0 }
  const delta = (a, b) => (b > 0 ? (a - b) / b : null) // null = bulan lalu kosong, tidak ada pembanding
  const net = c.income - c.expense
  return {
    label: monthLong(cur),
    income: c.income,
    expense: c.expense,
    net,
    incomeDelta: delta(c.income, p.income),
    expenseDelta: delta(c.expense, p.expense),
    savingsRate: c.income > 0 ? net / c.income : null,
  }
})

// 2) Pengeluaran per kategori (bulan ini)
const categoryBreakdown = computed(() => {
  const cur = nowKey()
  const byCategory = new Map()
  let total = 0
  for (const t of transactions.value) {
    if (t.type !== 'expense' || monthKey(t.date) !== cur) continue
    byCategory.set(t.category_id, (byCategory.get(t.category_id) ?? 0) + t.amount)
    total += t.amount
  }

  let rows = [...byCategory.entries()]
    .map(([id, value]) => ({ id, value, category: categoryMap.value.get(id) }))
    .sort((a, b) => b.value - a.value)
    .map((r, i) => ({
      id: r.id,
      value: r.value,
      label: r.category?.name ?? 'Tanpa kategori',
      color: r.category ? r.category.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length] : OTHER_COLOR,
    }))

  if (rows.length > MAX_SEGMENTS) {
    const head = rows.slice(0, MAX_SEGMENTS - 1)
    const rest = rows.slice(MAX_SEGMENTS - 1).reduce((s, r) => s + r.value, 0)
    rows = [...head, { id: '__other', label: 'Lainnya', color: OTHER_COLOR, value: rest }]
  }

  return {
    total,
    segments: rows.map((r) => ({ ...r, percent: total > 0 ? (r.value / total) * 100 : 0 })),
  }
})

// 3) Arus kas 6 bulan terakhir (termasuk bulan ini)
const monthlyFlow = computed(() => {
  const cur = nowKey()
  return Array.from({ length: 6 }, (_, i) => {
    const key = shiftKey(cur, i - 5)
    const t = totalsByMonth.value.get(key) ?? { income: 0, expense: 0 }
    return { key, label: monthShort(key), long: monthLong(key), income: t.income, expense: t.expense, net: t.income - t.expense }
  })
})

// 4) Saldo harian 30 hari terakhir (konsisten dengan Total Balance: hanya transaksi yang dompetnya ada)
const balanceTrend = computed(() => {
  const days = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toLocaleDateString('sv-SE'))
  }

  const walletIds = new Set(wallets.value.map((w) => w.id))
  let balance = wallets.value.reduce((s, w) => s + w.initial_balance, 0)
  const netByDate = new Map()

  for (const t of transactions.value) {
    if (!walletIds.has(t.wallet_id)) continue
    const net = t.type === 'income' ? t.amount : -t.amount
    if (t.date < days[0]) balance += net // saldo pembuka sebelum jendela 30 hari
    else netByDate.set(t.date, (netByDate.get(t.date) ?? 0) + net)
  }

  return days.map((date) => {
    balance += netByDate.get(date) ?? 0
    return { date, balance }
  })
})

export function useCharts() {
  return { monthSummary, categoryBreakdown, monthlyFlow, balanceTrend }
}