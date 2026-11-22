import { ref, computed } from 'vue'
import { requestAccessToken, fetchUserInfo, revokeAccessToken } from '@/services/googleAuth'

const USER_KEY = 'ff_user'
const TOKEN_KEY = 'ff_token'
const EXPIRY_SKEW_MS = 60_000 // anggap kedaluwarsa 1 menit lebih awal

const readJson = (storage, key) => {
  try { return JSON.parse(storage.getItem(key)) } catch { return null }
}
const authError = (code) => Object.assign(new Error(code), { code })

const MESSAGES = {
  popup_closed: 'Login dibatalkan.',
  popup_failed_to_open: 'Popup login diblokir browser. Izinkan popup lalu coba lagi.',
  access_denied: 'Akses ditolak. Izinkan akses agar data bisa disimpan di Google Sheets Anda.',
  SCOPE_NOT_GRANTED: 'Izin Google Drive diperlukan untuk membuat database. Centang semua izin lalu coba lagi.',
  MISSING_CLIENT_ID: 'VITE_GOOGLE_CLIENT_ID belum diisi di .env.local.',
  GIS_LOAD_FAILED: 'Gagal memuat Google Sign-In. Periksa koneksi internet Anda.',
}
const toMessage = (e) => MESSAGES[e?.message] ?? 'Login gagal. Silakan coba lagi.'

// State level modul → dipakai bersama oleh semua komponen
const user = ref(readJson(localStorage, USER_KEY))         // profil: tetap ada walau offline
const tokenState = ref(readJson(sessionStorage, TOKEN_KEY)) // token: hanya selama sesi tab
const isLoading = ref(false)
const error = ref(null)
const needsReauth = ref(false)
let refreshPromise = null

function saveToken({ accessToken, expiresIn }) {
  const state = { accessToken, expiresAt: Date.now() + expiresIn * 1000 }
  tokenState.value = state
  sessionStorage.setItem(TOKEN_KEY, JSON.stringify(state))
  return state
}

async function signIn() {
  isLoading.value = true
  error.value = null
  try {
    const token = await requestAccessToken({ prompt: '' })
    saveToken(token)
    user.value = await fetchUserInfo(token.accessToken)
    localStorage.setItem(USER_KEY, JSON.stringify(user.value))
    needsReauth.value = false
    return user.value
  } catch (e) {
    error.value = toMessage(e)
    throw e
  } finally {
    isLoading.value = false
  }
}

/**
 * Mengembalikan access token yang masih valid.
 * Token Google berlaku ± 1 jam; bila habis, diminta ulang (silent bila izin sudah diberikan).
 */
async function getAccessToken({ force = false } = {}) {
  const t = tokenState.value
  if (!force && t && t.expiresAt - EXPIRY_SKEW_MS > Date.now()) return t.accessToken

  if (!user.value) throw authError('AUTH_REQUIRED')
  if (!navigator.onLine) throw authError('OFFLINE')

  refreshPromise ??= requestAccessToken({ prompt: '', hint: user.value.email })
    .then(saveToken)
    .catch(() => {
      needsReauth.value = true // UI menampilkan tombol "Hubungkan ulang"
      throw authError('AUTH_REQUIRED')
    })
    .finally(() => { refreshPromise = null })

  return (await refreshPromise).accessToken
}

async function signOut({ revoke = false } = {}) {
  const token = tokenState.value?.accessToken
  if (revoke && token) await revokeAccessToken(token).catch(() => {})
  tokenState.value = null
  user.value = null
  needsReauth.value = false
  sessionStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function useGoogleAuth() {
  return {
    user,
    isAuthenticated: computed(() => !!user.value),
    isLoading,
    error,
    needsReauth,
    signIn,
    signOut,
    getAccessToken,
  }
}