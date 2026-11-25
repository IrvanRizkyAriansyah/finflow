<script setup>
import { ref, computed } from 'vue'
import ChartCard from './ChartCard.vue'
import DonutChart from './DonutChart.vue'
import { useTransactionAnalytics } from '@/composables/useTransactionAnalytics'
import { useBalanceVisibility } from '@/composables/useBalanceVisibility'
import { t } from '../../composables/useI18n.js'

const { expenseBreakdown, incomeBreakdown } = useTransactionAnalytics()
const { hidden } = useBalanceVisibility()

const mode = ref('expense')
const data = computed(() => (mode.value === 'expense' ? expenseBreakdown.value : incomeBreakdown.value))
const TABS = [
  { id: 'expense', label: t('common.expense') },
  { id: 'income', label: t('common.income') },
]
</script>

<template>
  <ChartCard title="Per kategori" subtitle="Pada periode terpilih">
    <template #action>
      <div class="flex shrink-0 gap-1 rounded-lg bg-surface-container p-1 max-sm:w-full" role="group" aria-label="Jenis kategori">
        <button
          v-for="t in TABS" :key="t.id" type="button"
          class="rounded-md px-3 py-1 text-label-sm max-sm:w-full"
          :class="mode === t.id ? 'bg-surface-container-lowest shadow-sm' : 'text-on-surface-variant'"
          :aria-pressed="mode === t.id"
          @click="mode = t.id"
        >{{ t.label }}</button>
      </div>
    </template>

    <p v-if="!data.segments.length" class="py-10 text-center text-body-sm text-on-surface-variant">
      Belum ada {{ mode === 'expense' ? 'pengeluaran' : 'pemasukan' }} pada periode ini.
    </p>
    <DonutChart v-else :key="mode" :segments="data.segments" :total="data.total" :hidden="hidden" />
  </ChartCard>
</template>