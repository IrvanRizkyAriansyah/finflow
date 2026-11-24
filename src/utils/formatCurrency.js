import { APP_CURRENCY, APP_LOCALE } from './constants'
import { dateLocale, t } from '@/composables/useI18n'

const num = (n, opts) => n.toLocaleString(dateLocale(), opts)

const formatter = new Intl.NumberFormat(APP_LOCALE, {
  style: 'currency',
  currency: APP_CURRENCY,
  maximumFractionDigits: 0, // Rupiah tidak memakai desimal
})

// id: "Rp 45.000.000" | en: "Rp 45,000,000"
export const formatCurrency = (value = 0) =>
  `${value < 0 ? '-' : ''}Rp ${num(Math.abs(value), { maximumFractionDigits: 0 })}`

export const formatSignedCurrency = (value, type) =>
  `${type === 'income' ? '+' : '-'}Rp ${num(Math.abs(value), { maximumFractionDigits: 0 })}`

// id: "Rp 12,5 jt", "Rp 3,2 M" | en: "Rp 12.5 M", "Rp 3.2 B"
export function formatCompactCurrency(value = 0) {
  const sign = value < 0 ? '-' : ''
  const abs = Math.abs(value)
  const scaled = (n, unit) => `${sign}Rp ${num(n, { maximumFractionDigits: 1 })} ${t(unit)}`

  if (abs >= 1e12) return scaled(abs / 1e12, 'unit.trillion')
  if (abs >= 1e9) return scaled(abs / 1e9, 'unit.billion')
  if (abs >= 1e6) return scaled(abs / 1e6, 'unit.million')
  if (abs >= 1e4) return scaled(abs / 1e3, 'unit.thousand')
  return `${sign}Rp ${num(abs)}`
}