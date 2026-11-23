import { ref, computed } from 'vue'
import { todayStr, formatDate } from '@/utils/formatDate'
import { addDays, addMonths, diffDays } from '@/utils/dateRange'

export const PRESETS = [
  { id: '7d', label: '7 Hari' },
  { id: '1m', label: '1 Bulan' },
  { id: '3m', label: '3 Bulan' },
  { id: 'custom', label: 'Kustom' },
]
const NAMES = { '7d': '7 hari terakhir', '1m': '1 bulan terakhir', '3m': '3 bulan terakhir', custom: 'Rentang kustom' }

// State level modul: pilihan periode bertahan selama sesi
const preset = ref('1m')
const customStart = ref(addDays(todayStr(), -29))
const customEnd = ref(todayStr())

const range = computed(() => {
  const end = todayStr()
  switch (preset.value) {
    case '7d': return { start: addDays(end, -6), end }
    case '1m': return { start: addDays(addMonths(end, -1), 1), end }
    case '3m': return { start: addDays(addMonths(end, -3), 1), end }
    default: {
      const a = customStart.value || addDays(end, -29)
      const b = customEnd.value || end
      return a <= b ? { start: a, end: b } : { start: b, end: a } // tanggal terbalik otomatis ditukar
    }
  }
})

const days = computed(() => diffDays(range.value.start, range.value.end) + 1)

// Periode pembanding: rentang sama panjang tepat sebelum periode terpilih
const previousRange = computed(() => {
  const end = addDays(range.value.start, -1)
  return { start: addDays(end, -(days.value - 1)), end }
})

const rangeLabel = computed(() => `${formatDate(range.value.start)} – ${formatDate(range.value.end)}`)
const periodName = computed(() => NAMES[preset.value])

export function usePeriodFilter() {
  return { preset, customStart, customEnd, range, days, previousRange, rangeLabel, periodName }
}