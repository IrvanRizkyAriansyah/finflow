import { ref } from 'vue'
import id from '@/i18n/id'
import en from '@/i18n/en'

const KEY = 'ff_lang'
const MESSAGES = { id, en }
const LOCALES = { id: 'id-ID', en: 'en-US' }
export const LANGS = [
  { code: 'id', label: 'ID', name: 'Indonesia' },
  { code: 'en', label: 'EN', name: 'English' },
]

const read = () => { try { return localStorage.getItem(KEY) } catch { return null } }
const locale = ref(read() in MESSAGES ? read() : 'id')
document.documentElement.lang = locale.value

export function setLocale(code) {
  if (!(code in MESSAGES)) return
  locale.value = code
  document.documentElement.lang = code
  try { localStorage.setItem(KEY, code) } catch { /* abaikan */ }
}

// Dipakai di template ($t), computed, dan modul biasa — semuanya ikut reaktif
export function t(key, params) {
  const s = MESSAGES[locale.value][key] ?? MESSAGES.id[key] ?? key
  return params ? s.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? '') : s
}

// Locale untuk toLocaleString / Intl
export const dateLocale = () => LOCALES[locale.value]

export const useI18n = () => ({ t, locale, setLocale, dateLocale })