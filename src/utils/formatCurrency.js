import { APP_CURRENCY, APP_LOCALE } from './constants'

const formatter = new Intl.NumberFormat(APP_LOCALE, {
  style: 'currency',
  currency: APP_CURRENCY,
  maximumFractionDigits: 0, // Rupiah tidak memakai desimal
})

// formatCurrency(45000000) → "Rp 45.000.000"
export const formatCurrency = (value = 0) => formatter.format(value)

// Untuk daftar transaksi: "+Rp 500.000" / "-Rp 80.000"
export const formatSignedCurrency = (value, type) =>
  `${type === 'income' ? '+' : '-'}${formatter.format(Math.abs(value))}`

// Untuk ruang sempit: "Rp 12,5 jt", "Rp 3,2 M", "Rp 45 rb"
export function formatCompactCurrency(value = 0) {
  const sign = value < 0 ? '-' : ''
  const abs = Math.abs(value)
  const scaled = (n, unit) =>
    `${sign}Rp ${n.toLocaleString(APP_LOCALE, { maximumFractionDigits: 1 })} ${unit}`

  if (abs >= 1e12) return scaled(abs / 1e12, 'T')
  if (abs >= 1e9) return scaled(abs / 1e9, 'M')
  if (abs >= 1e6) return scaled(abs / 1e6, 'jt')
  if (abs >= 1e4) return scaled(abs / 1e3, 'rb')
  return `${sign}Rp ${abs.toLocaleString(APP_LOCALE)}`
}