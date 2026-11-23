<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useCharts } from '@/composables/useCharts'
import { useBalanceVisibility } from '@/composables/useBalanceVisibility'
import { formatCompactCurrency } from '@/utils/formatCurrency'

const { monthSummary: s } = useCharts()
const { hidden } = useBalanceVisibility()

const money = (v) => (hidden.value ? 'Rp ••••' : formatCompactCurrency(v))
const pct = (d) => `${d >= 0 ? '+' : '-'}${Math.round(Math.abs(d) * 100)}%`

const tiles = computed(() => [
  { key: 'income', label: 'Pemasukan', value: s.value.income, delta: s.value.incomeDelta, goodWhen: 'up', icon: 'trending_up', tone: 'text-primary' },
  { key: 'expense', label: 'Pengeluaran', value: s.value.expense, delta: s.value.expenseDelta, goodWhen: 'down', icon: 'trending_down', tone: 'text-error' },
  { key: 'net', label: 'Sisa', value: s.value.net, delta: null, goodWhen: null, icon: 'savings', tone: s.value.net >= 0 ? 'text-primary' : 'text-error' },
])

function deltaClass(t) {
  if (t.delta === null) return ''
  const up = t.delta >= 0
  return (t.goodWhen === 'up' ? up : !up) ? 'text-primary' : 'text-error'
}
</script>

<template>
  <section>
    <h2 class="mb-3 text-headline-sm">Ringkasan {{ s.label }}</h2>
    <div class="grid grid-cols-3 gap-3">
      <div v-for="t in tiles" :key="t.key" class="min-w-0 rounded-xl bg-surface-container-lowest p-3 shadow-sm sm:p-4">
        <div class="flex items-center gap-1 text-label-sm text-on-surface-variant">
          <AppIcon :name="t.icon" /> <span class="truncate">{{ t.label }}</span>
        </div>
        <p class="mt-1 truncate font-display text-body-md font-semibold sm:text-headline-sm" :class="t.tone">
          {{ money(t.value) }}
        </p>

        <p v-if="t.key === 'net'" class="mt-0.5 truncate text-label-sm text-on-surface-variant">
          <template v-if="s.savingsRate !== null">{{ Math.round(s.savingsRate * 100) }}% dari pemasukan</template>
          <template v-else>Belum ada pemasukan</template>
        </p>
        <p v-else-if="t.delta !== null" class="mt-0.5 truncate text-label-sm" :class="deltaClass(t)">
          {{ pct(t.delta) }} <span class="text-on-surface-variant">vs bulan lalu</span>
        </p>
        <p v-else class="mt-0.5 truncate text-label-sm text-on-surface-variant">Bulan lalu kosong</p>
      </div>
    </div>
  </section>
</template>