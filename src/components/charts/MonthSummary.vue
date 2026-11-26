<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

import { useCharts } from '@/composables/useCharts'
import { usePeriodFilter } from '@/composables/usePeriodFilter'
import { useBalanceVisibility } from '@/composables/useBalanceVisibility'
import { formatCompactCurrency } from '@/utils/formatCurrency'
import { t } from '../../composables/useI18n'
import PeriodFilter from '../transactions/PeriodFilter.vue'

const { monthSummary: s } = useCharts()
const { periodName, rangeLabel } = usePeriodFilter()
const { hidden } = useBalanceVisibility()

const money = (v) => (hidden.value ? 'Rp ••••' : formatCompactCurrency(v))
const pct = (d) => `${d >= 0 ? '+' : '-'}${Math.round(Math.abs(d) * 100)}%`

const tiles = computed(() => [
  { key: 'income', label: t('common.income'), value: s.value.income, delta: s.value.incomeDelta, goodWhen: 'up', icon: 'trending_up', tone: 'text-primary' },
  { key: 'expense', label: t('common.expense'), value: s.value.expense, delta: s.value.expenseDelta, goodWhen: 'down', icon: 'trending_down', tone: 'text-error' },
  { key: 'net', label: t('common.remaining'), value: s.value.net, delta: null, goodWhen: null, icon: 'savings', tone: s.value.net >= 0 ? 'text-primary' : 'text-error' },
])

function deltaClass(tile) {
  if (tile.delta === null) return ''
  const up = tile.delta >= 0
  return (tile.goodWhen === 'up' ? up : !up) ? 'text-primary' : 'text-error'
}
</script>

<template>
  <section class="min-w-0">
    <div class="mb-3 flex items-center justify-between gap-3">
      <div class="min-w-0">
        <h2 class="text-headline-sm truncate">
          {{ $t('summary.title', { label: periodName }) }}
        </h2>
        <p class="text-body-sm text-on-surface-variant">
          {{ rangeLabel }}
        </p>
      </div>

      <PeriodFilter />
    </div>

    <div class="grid grid-cols-2 gap-3 md:grid-cols-3">
      <div
        v-for="tile in tiles"
        :key="tile.key"
        class="min-w-0 rounded-xl bg-surface-container-lowest p-3 shadow-sm sm:p-4"
        :class="tile.key === 'net' ? 'col-span-2 md:col-span-1' : ''"
      >
        <div class="flex items-center gap-1 text-label-sm text-on-surface-variant">
          <AppIcon :name="tile.icon" />
          <span class="truncate">{{ tile.label }}</span>
        </div>

        <p
          class="mt-1 truncate font-display text-body-md font-semibold sm:text-headline-sm"
          :class="tile.tone"
        >
          {{ money(tile.value) }}
        </p>

        <p
          v-if="tile.key === 'net'"
          class="mt-0.5 truncate text-label-sm text-on-surface-variant"
        >
          <template v-if="s.savingsRate !== null">
            {{ $t('period.ofIncome', { n: Math.round(s.savingsRate * 100) }) }}
          </template>
          <template v-else>
            {{ $t('period.noIncome') }}
          </template>
        </p>

        <p
          v-else-if="tile.delta !== null"
          class="mt-0.5 truncate text-label-sm"
          :class="deltaClass(tile)"
        >
          {{ pct(tile.delta) }}
          <span class="text-on-surface-variant">
            {{ $t('summary.vsLastMonth') }}
          </span>
        </p>

        <p
          v-else
          class="mt-0.5 truncate text-label-sm text-on-surface-variant"
        >
          {{ $t('summary.lastMonthEmpty') }}
        </p>
      </div>
    </div>
  </section>
</template>