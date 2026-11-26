import { watch, onBeforeUnmount, toValue } from 'vue'

/**
 * Panggil `handler` saat pengguna menekan di luar elemen `target`.
 * `enabled` boleh boolean, ref, atau getter, sehingga listener hanya aktif saat dibutuhkan
 * (mis. hanya ketika dropdown terbuka).
 */
export function useClickOutside(target, handler, enabled = true) {
  const onPointerDown = (e) => {
    const el = toValue(target)
    if (el && !el.contains(e.target)) handler(e)
  }

  const stop = watch(
    () => toValue(enabled),
    (on) => {
      if (on) document.addEventListener('pointerdown', onPointerDown)
      else document.removeEventListener('pointerdown', onPointerDown)
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    stop()
    document.removeEventListener('pointerdown', onPointerDown)
  })
}