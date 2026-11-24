import { dateLocale } from "../composables/useI18n"

// "2026-11-16" menurut zona waktu perangkat (bukan UTC)
export const todayStr = () => new Date().toLocaleDateString('sv-SE')

export function formatDate(value) {
  const d = new Date(`${value}T00:00:00`)
  return Number.isNaN(d.getTime())
    ? String(value)
    : d.toLocaleDateString(dateLocale(), { day: 'numeric', month: 'short', year: 'numeric' })
}

// Sel tanggal yang diedit manual di Sheets bisa terbaca sebagai angka serial
export function sheetDateToString(v) {
  if (typeof v === 'number') {
    return new Date(Date.UTC(1899, 11, 30) + v * 86400000).toISOString().slice(0, 10)
  }
  return String(v).slice(0, 10)
}