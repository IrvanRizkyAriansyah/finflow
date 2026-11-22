import { ref } from 'vue'

// null | { name: 'detail'|'form'|'entry', ..., back, nonce }
const modal = ref(null)
let seed = 0
const show = (m) => { modal.value = { ...m, nonce: ++seed } }

export function useGoalUi() {
  return {
    modal,
    openDetail: (id) => show({ name: 'detail', id }),
    openForm: (goal = null) => show({ name: 'form', goal, back: goal?.id ?? null }),
    openEntry: (goalId, type) => show({ name: 'entry', goalId, type, back: goalId }),
    close: () => { modal.value = null },
    // Kembali ke detail tujuan bila datang dari sana, selain itu tutup
    back: () => {
      const id = modal.value?.back
      if (id) show({ name: 'detail', id })
      else modal.value = null
    },
  }
}