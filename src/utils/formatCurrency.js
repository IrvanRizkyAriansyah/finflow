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