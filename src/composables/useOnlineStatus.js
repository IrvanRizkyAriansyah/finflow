import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useOnlineStatus() {
  const online = ref(navigator.onLine)
  const on = () => (online.value = true)
  const off = () => (online.value = false)
  onMounted(() => {
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('online', on)
    window.removeEventListener('offline', off)
  })
  return online
}