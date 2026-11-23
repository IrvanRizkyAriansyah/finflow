import { computed } from 'vue'
import { useTransactions } from './useTransactions'
import { usePeriodFilter } from './usePeriodFilter'
import { todayStr, formatDate } from '@/utils/formatDate'
import {
  addDays, diffDays, parseDate, lastDayOfMonth, monthKeyAdd,
  shortDate, monthShortLabel, monthLongLabel,
} from '@/utils/dateRange'

const { sortedTransactions, categoryMap, wallets } = useTransactions()
const { range, days, previousRange } = usePeriodFilter()

const FALLBACK_COLORS = ['#10412a', '#3B82F6', '#8B5CF6', '#F97316', '#EAB308', '#EC4899']
const OTHER_COLOR = '#9CA3AF'
const MAX_SEGMENTS = 5
const WEEKDAYS = [
  { short: 'Sen', long: 'Senin' }, { short: 'Sel', long: 'Selasa' }, { short: 'Rab', long: 'Rabu' },
  { short: 'Kam', long: 'Kamis' }, { short: 'Jum', long: 'Jumat' }, { short: 'Sab', long: 'Sabtu' },
  { short: 'Min', long: 'Minggu' },
]

const inRange = (t, r) => t.date >= r.start && t.date <= r.end
const totals = (list) =>
  list.reduce((a, t) => {
    if (t.type === 'income') a.income += t.amount
    else if (t.type === 'expense') a.expense += t.amount
    return a
  }, { income: 0, expense: 0 })

// Transaksi dalam periode terpilih (sudah terurut: terbaru di atas)
const periodTransactions = computed(() => sortedTransactions.value.filter((t) => inRange(t, range.value)))

// Jumlah hari yang sudah berjalan (tidak melewati hari ini), dasar rata-rata harian
const elapsedDays = computed(() => {
  const today = todayStr()
  const last = range.value.end > today ? today : range.value.end
  return Math.max(1, diffDays(range.value.start, last) + 1)
})

// ---------- Ringkasan + perbandingan dengan periode sebelumnya ----------
const summary = computed(() => {
  const cur = totals(periodTransactions.value)
  const prevList = sortedTransactions.value.filter((t) => inRange(t, previousRange.value))
  const prev = totals(prevList)
  const delta = (a, b) => (b > 0 ? (a - b) / b : null) // null = periode sebelumnya kosong
  const net = cur.income - cur.expense
  return {
    income: cur.income,
    expense: cur.expense,
    net,
    count: periodTransactions.value.length,
    avgDailyExpense: cur.expense / elapsedDays.value,
    incomeDelta: delta(cur.income, prev.income),
    expenseDelta: delta(cur.expense, prev.expense),
    savingsRate: cur.income > 0 ? net / cur.income : null,
  }
})

// ---------- Arus kas: harian / mingguan / bulanan menurut panjang periode ----------
const timelineMode = computed(() => (days.value <= 31 ? 'day' : days.value <= 120 ? 'week' : 'month'))

const timeline = computed(() => {
  const { start, end } = range.value
  const n = days.value
  const mode = timelineMode.value
  let buckets = []

  if (mode === 'day') {
    buckets = Array.from({ length: n }, (_, i) => {
      const d = addDays(start, i)
      return { key: d, from: d, to: d, label: String(parseDate(d).getDate()), long: formatDate(d) }
    })
  } else if (mode === 'week') {
    buckets = Array.from({ length: Math.ceil(n / 7) }, (_, i) => {
      const from = addDays(start, i * 7)
      const to = addDays(start, Math.min(n - 1, i * 7 + 6))
      return { key: from, from, to, label: shortDate(from), long: `${shortDate(from)} – ${shortDate(to)}` }
    })
  } else {
    const first = start.slice(0, 7)
    const last = end.slice(0, 7)
    for (let key = first; key <= last; key = monthKeyAdd(key, 1)) {
      buckets.push({
        key,
        from: key === first ? start : `${key}-01`,
        to: key === last ? end : lastDayOfMonth(key),
        label: monthShortLabel(key),
        long: monthLongLabel(key),
      })
    }
  }

  const rows = buckets.map((b) => ({ ...b, income: 0, expense: 0 }))
  for (const t of periodTransactions.value) {
    const row = rows.find((b) => t.date >= b.from && t.date <= b.to)
    if (!row) continue
    if (t.type === 'income') row.income += t.amount
    else if (t.type === 'expense') row.expense += t.amount
  }
  return rows.map((r) => ({ ...r, net: r.income - r.expense }))
})

// ---------- Per kategori ----------
function breakdown(list, type) {
  const byCategory = new Map()
  let total = 0
  for (const t of list) {
    if (t.type !== type) continue
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
  return { total, segments: rows.map((r) => ({ ...r, percent: total > 0 ? (r.value / total) * 100 : 0 })) }
}
const expenseBreakdown = computed(() => breakdown(periodTransactions.value, 'expense'))
const incomeBreakdown = computed(() => breakdown(periodTransactions.value, 'income'))

// ---------- Pola mingguan: rata-rata pengeluaran per hari dalam seminggu ----------
const weekday = computed(() => {
  const today = todayStr()
  const { start, end } = range.value
  const last = end > today ? today : end
  const idx = (d) => (parseDate(d).getDay() + 6) % 7 // Senin = 0
  const counts = Array(7).fill(0)
  const sums = Array(7).fill(0)

  const span = diffDays(start, last) + 1
  for (let i = 0; i < span; i++) counts[idx(addDays(start, i))]++
  for (const t of periodTransactions.value) {
    if (t.type === 'expense' && t.date <= last) sums[idx(t.date)] += t.amount
  }
  return WEEKDAYS.map((w, i) => ({ ...w, total: sums[i], count: counts[i], avg: counts[i] ? sums[i] / counts[i] : 0 }))
})

// ---------- Per dompet ----------
const walletRows = computed(() => {
  const map = new Map(wallets.value.map((w) => [w.id, { id: w.id, name: w.name, income: 0, expense: 0 }]))
  for (const t of periodTransactions.value) {
    const row = map.get(t.wallet_id)
    if (!row) continue
    if (t.type === 'income') row.income += t.amount
    else if (t.type === 'expense') row.expense += t.amount
  }
  return [...map.values()].sort((a, b) => b.income + b.expense - (a.income + a.expense))
})

// ---------- 5 pengeluaran terbesar ----------
const topExpenses = computed(() =>
  periodTransactions.value.filter((t) => t.type === 'expense').sort((a, b) => b.amount - a.amount).slice(0, 5),
)

export function useTransactionAnalytics() {
  return {
    periodTransactions, summary, timeline, timelineMode,
    expenseBreakdown, incomeBreakdown, weekday, walletRows, topExpenses,
  }
}