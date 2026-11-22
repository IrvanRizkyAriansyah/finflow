const key = (uid, name) => `ff_cache:${uid}:${name}`

export function cacheGet(uid, name, fallback = null) {
  try {
    const raw = localStorage.getItem(key(uid, name))
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function cacheSet(uid, name, value) {
  try {
    localStorage.setItem(key(uid, name), JSON.stringify(value))
  } catch (e) {
    console.warn('[FinFlow] Gagal menyimpan cache', e)
  }
}

// Dipanggil saat logout agar data keuangan tidak tertinggal di perangkat
export function cacheClear(uid) {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(`ff_cache:${uid}:`))
    .forEach((k) => localStorage.removeItem(k))
}