import { ref } from 'vue'

const isOpen = ref(false)
const preset = ref({})
const editing = ref(null) // transaksi yang sedang diubah; null = mode tambah

export function useTransactionModal() {
  return {
    isOpen,
    preset,
    editing,
    open: (p = {}) => {
      editing.value = null
      preset.value = p
      isOpen.value = true
    },
    openEdit: (tx) => {
      editing.value = tx
      preset.value = {}
      isOpen.value = true
    },
    close: () => { isOpen.value = false },
  }
}