export const APP_CURRENCY = 'IDR'
export const APP_LOCALE = 'id-ID'

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

// drive.file = hanya file yang dibuat aplikasi ini (bukan seluruh Drive pengguna)
export const GOOGLE_SCOPES = [
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/drive.file',
].join(' ')

export const SPREADSHEET_TITLE = 'FinFlow Database'