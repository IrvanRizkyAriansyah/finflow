import { GOOGLE_CLIENT_ID, GOOGLE_SCOPES } from '@/utils/constants'

const GIS_SRC = 'https://accounts.google.com/gsi/client'
let gisPromise = null

export function loadGis() {
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  if (gisPromise) return gisPromise

  gisPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GIS_SRC
    script.async = true
    script.defer = true
    script.onload = resolve
    script.onerror = () => {
      gisPromise = null
      reject(new Error('GIS_LOAD_FAILED'))
    }
    document.head.appendChild(script)
  })
  return gisPromise
}

/**
 * Minta access token lewat popup Google Identity Services.
 * prompt: '' (default) | 'consent' | 'select_account'
 */
export async function requestAccessToken({ prompt = '', hint } = {}) {
  if (!GOOGLE_CLIENT_ID) throw new Error('MISSING_CLIENT_ID')
  await loadGis()

  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: GOOGLE_SCOPES,
      hint,
      callback: (resp) => {
        if (resp.error) return reject(new Error(resp.error))
        // Pengguna bisa menghapus centang izin Drive saat consent
        if (!window.google.accounts.oauth2.hasGrantedAllScopes(resp, ...GOOGLE_SCOPES.split(' '))) {
          return reject(new Error('SCOPE_NOT_GRANTED'))
        }
        resolve({ accessToken: resp.access_token, expiresIn: Number(resp.expires_in) })
      },
      error_callback: (err) => reject(new Error(err?.type || 'popup_failed_to_open')),
    })
    client.requestAccessToken({ prompt })
  })
}

export async function fetchUserInfo(accessToken) {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error('USERINFO_FAILED')
  const d = await res.json()
  return { id: d.sub, name: d.name, givenName: d.given_name, email: d.email, picture: d.picture }
}

export async function revokeAccessToken(accessToken) {
  await loadGis()
  return new Promise((resolve) => window.google.accounts.oauth2.revoke(accessToken, resolve))
}