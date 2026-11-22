import { ref, watch } from 'vue'

const KEY = 'ff_hide_balance'
const hidden = ref(localStorage.getItem(KEY) === '1')
watch(hidden, (v) => localStorage.setItem(KEY, v ? '1' : '0'))

export function useBalanceVisibility() {
  return { hidden, toggle: () => (hidden.value = !hidden.value) }
}