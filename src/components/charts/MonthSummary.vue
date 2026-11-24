<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useCharts } from '@/composables/useCharts'
import { useBalanceVisibility } from '@/composables/useBalanceVisibility'
import { formatCompactCurrency } from '@/utils/formatCurrency'
import { t } from '../../composables/useI18n'

const { monthSummary: s } = useCharts()
const { hidden } = useBalanceVisibility()

const money = (v) => (hidden.value ? 'Rp ••••' : formatCompactCurrency(v))
const pct = (d) => `${d >= 0 ? '+' : '-'}${Math.round(Math.abs(d) * 100)}%`

const tiles = computed(() => [
  { key: 'income', label: t('common.income'), value: s.value.income, delta: s.value.incomeDelta, goodWhen: 'up', icon: 'trending_up', tone: 'text-primary' },
  { key: 'expense', label: t('common.expense'), value: s.value.expense, delta: s.value.expenseDelta, goodWhen: 'down', icon: 'trending_down', tone: 'text-error' },
  { key: 'net', label: t('common.remaining'), value: s.value.net, delta: null, goodWhen: null, icon: 'savings', tone: s.value.net >= 0 ? 'text-primary' : 'text-error' },
])

function deltaClass(t) {
  if (t.delta === null) return ''
  const up = t.delta >= 0
  return (t.goodWhen === 'up' ? up : !up) ? 'text-primary' : 'text-error'
}
</script>

<template>
  <section>
    <h2 class="mb-3 text-headline-sm">{{ $t('summary.title', { label: s.label }) }}</h2>
    <div class="grid grid-cols-3 gap-3">
      <div v-for="t in tiles" :key="t.key" class="min-w-0 rounded-xl bg-surface-container-lowest p-3 shadow-sm sm:p-4">
        <div class="flex items-center gap-1 text-label-sm text-on-surface-variant">
          <AppIcon :name="t.icon" /> <span class="truncate">{{ t.label }}</span>
        </div>
        <p class="mt-1 truncate font-display text-body-md font-semibold sm:text-headline-sm" :class="t.tone">
          {{ money(t.value) }}
        </p>

        <p v-if="t.key === 'net'" class="mt-0.5 truncate text-label-sm text-on-surface-variant">
          <template v-if="s.savingsRate !== null">{{ $t('period.ofIncome', { n: Math.round(s.savingsRate * 100) }) }}</template>
          <template v-else>{{ $t('period.noIncome') }}</template>
        </p>
        <p v-else-if="t.delta !== null" class="mt-0.5 truncate text-label-sm" :class="deltaClass(t)">
          {{ pct(t.delta) }} <span class="text-on-surface-variant">{{ $t('summary.vsLastMonth') }}</span>
        </p>
        <p v-else class="mt-0.5 truncate text-label-sm text-on-surface-variant">{{ $t('summary.lastMonthEmpty') }}</p>
      </div>
    </div>
  </section>
</template>