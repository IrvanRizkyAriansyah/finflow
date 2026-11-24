import { dateLocale } from "../composables/useI18n"

const pad = (n) => String(n).padStart(2, '0')
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

export const toDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const parseDate = (s) => new Date(`${s}T00:00:00`)

export function addDays(s, n) {
  const d = parseDate(s)
  d.setDate(d.getDate() + n)
  return toDateStr(d)
}

/** Selisih hari (b - a), dihitung dari string "YYYY-MM-DD" */
export const diffDays = (a, b) => Math.round((parseDate(b) - parseDate(a)) / 86400000)

/** Tambah bulan tanpa meluap, mis. 31 Mar - 1 bulan = 28 Feb */
export function addMonths(s, n) {
  const d = parseDate(s)
  const day = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + n)
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(day, last))
  return toDateStr(d)
}

export const monthKeyAdd = (key, n) => addMonths(`${key}-01`, n).slice(0, 7)

export function lastDayOfMonth(key) {
  const [y, m] = key.split('-').map(Number)
  return toDateStr(new Date(y, m, 0))
}

export const shortDate = (s) => parseDate(s).toLocaleDateString(dateLocale(), { day: 'numeric', month: 'short' })
export const monthShortLabel = (key) =>
  cap(new Date(`${key}-01T00:00:00`).toLocaleDateString(dateLocale(), { month: 'short' }))
export const monthLongLabel = (key) =>
  cap(new Date(`${key}-01T00:00:00`).toLocaleDateString(dateLocale(), { month: 'long', year: 'numeric' }))