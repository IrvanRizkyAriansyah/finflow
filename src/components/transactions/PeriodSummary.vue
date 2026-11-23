<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useTransactionAnalytics } from '@/composables/useTransactionAnalytics'
import { usePeriodFilter } from '@/composables/usePeriodFilter'
import { useBalanceVisibility } from '@/composables/useBalanceVisibility'
import { formatCompactCurrency } from '@/utils/formatCurrency'

const { summary: s, expenseBreakdown, weekday } = useTransactionAnalytics()
const { days } = usePeriodFilter()
const { hidden } = useBalanceVisibility()

const money = (v) => (hidden.value ? 'Rp ••••' : formatCompactCurrency(v))
const pct = (d) => `${d >= 0 ? '+' : '-'}${Math.round(Math.abs(d) * 100)}%`

const tiles = computed(() => [
  { key: 'income', label: 'Pemasukan', icon: 'trending_up', value: s.value.income, delta: s.value.incomeDelta, goodWhen: 'up', tone: 'text-primary' },
  { key: 'expense', label: 'Pengeluaran', icon: 'trending_down', value: s.value.expense, delta: s.value.expenseDelta, goodWhen: 'down', tone: 'text-error' },
  {
    key: 'net', label: 'Selisih', icon: 'savings', value: s.value.net,
    tone: s.value.net >= 0 ? 'text-primary' : 'text-error',
    sub: s.value.savingsRate !== null ? `${Math.round(s.value.savingsRate * 100)}% dari pemasukan` : 'Belum ada pemasukan',
  },
  { key: 'avg', label: 'Pengeluaran/hari', icon: 'calendar_today', value: s.value.avgDailyExpense, tone: '', sub: `${s.value.count} transaksi` },
])

function deltaClass(t) {
  const up = t.delta >= 0
  return (t.goodWhen === 'up' ? up : !up) ? 'text-primary' : 'text-error'
}

const insights = computed(() => {
  const out = []
  if (s.value.expenseDelta !== null) {
    out.push(`Pengeluaran ${s.value.expenseDelta >= 0 ? 'naik' : 'turun'} ${Math.round(Math.abs(s.value.expenseDelta) * 100)}% dibanding periode sebelumnya.`)
  }
  const top = expenseBreakdown.value.segments[0]
  if (top) out.push(`Pengeluaran terbesar: ${top.label} (${Math.round(top.percent)}% dari total pengeluaran).`)

  const peak = [...weekday.value].sort((a, b) => b.avg - a.avg)[0]
  if (days.value >= 14 && peak?.avg > 0) out.push(`Hari paling boros: ${peak.long}, rata-rata ${money(peak.avg)}.`)

  if (s.value.savingsRate !== null) {
    out.push(s.value.net >= 0
      ? `Anda menyisihkan ${Math.round(s.value.savingsRate * 100)}% dari pemasukan.`
      : `Pengeluaran melebihi pemasukan sebesar ${money(-s.value.net)}.`)
  }
  return out
})
</script>

<template>
  <section class="space-y-3">
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div v-for="t in tiles" :key="t.key" class="min-w-0 rounded-xl bg-surface-container-lowest p-4 shadow-sm">
        <div class="flex items-center gap-1 text-label-sm text-on-surface-variant">
          <AppIcon :name="t.icon" /> <span class="truncate">{{ t.label }}</span>
        </div>
        <p class="mt-1 truncate font-display text-headline-sm" :class="t.tone">{{ money(t.value) }}</p>
        <p v-if="t.sub" class="mt-0.5 truncate text-label-sm text-on-surface-variant">{{ t.sub }}</p>
        <p v-else-if="t.delta !== null" class="mt-0.5 truncate text-label-sm" :class="deltaClass(t)">
          {{ pct(t.delta) }} <span class="text-on-surface-variant">vs periode lalu</span>
        </p>
        <p v-else class="mt-0.5 truncate text-label-sm text-on-surface-variant">Periode lalu kosong</p>
      </div>
    </div>

    <ul v-if="insights.length" class="space-y-1 rounded-xl bg-surface-container-low p-4 text-body-sm">
      <li v-for="(text, i) in insights" :key="i" class="flex gap-2">
        <AppIcon name="lightbulb" /> <span>{{ text }}</span>
      </li>
    </ul>
  </section>
</template>