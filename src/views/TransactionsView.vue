<script setup>
import { ref, computed } from 'vue'
import PageHeader from '@/components/transactions/PageHeader.vue'
import PeriodFilter from '@/components/transactions/PeriodFilter.vue'
import PeriodSummary from '@/components/transactions/PeriodSummary.vue'
import TopExpenses from '@/components/transactions/TopExpenses.vue'
import GroupedTransactionList from '@/components/transactions/GroupedTransactionList.vue'
import ChartCard from '@/components/charts/ChartCard.vue'
import TimelineChart from '@/components/charts/TimelineChart.vue'
import CategoryBreakdownCard from '@/components/charts/CategoryBreakdownCard.vue'
import WeekdayChart from '@/components/charts/WeekdayChart.vue'
import WalletBars from '@/components/charts/WalletBars.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useTransactions } from '@/composables/useTransactions'
import { useTransactionAnalytics } from '@/composables/useTransactionAnalytics'
import { usePeriodFilter } from '@/composables/usePeriodFilter'
import { useBalanceVisibility } from '@/composables/useBalanceVisibility'

const { categoryMap, wallets } = useTransactions()
const { periodTransactions, timeline, timelineMode, weekday, walletRows, topExpenses } = useTransactionAnalytics()
const { rangeLabel } = usePeriodFilter()
const { hidden } = useBalanceVisibility()

const MODE_LABEL = { day: 'hari', week: 'minggu', month: 'bulan' }

const TYPES = [
  { id: 'all', label: 'Semua' },
  { id: 'income', label: 'Pemasukan' },
  { id: 'expense', label: 'Pengeluaran' },
]
const typeFilter = ref('all')
const query = ref('')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return periodTransactions.value.filter((t) => {
    if (typeFilter.value !== 'all' && t.type !== typeFilter.value) return false
    if (!q) return true
    const haystack = `${t.note ?? ''} ${categoryMap.value.get(t.category_id)?.name ?? ''}`.toLowerCase()
    return haystack.includes(q)
  })
})
const resetKey = computed(() => `${rangeLabel.value}|${typeFilter.value}|${query.value}`)
</script>

<template>
  <div class="space-y-gutter-mobile md:space-y-gutter">
    <PageHeader title="Transactions" />
    <PeriodFilter />
    <PeriodSummary />

    <div class="grid gap-gutter-mobile md:grid-cols-2 md:gap-gutter">
      <ChartCard class="md:col-span-2" title="Arus kas" :subtitle="`Pemasukan vs pengeluaran per ${MODE_LABEL[timelineMode]}`">
        <TimelineChart :buckets="timeline" :hidden="hidden" />
      </ChartCard>

      <CategoryBreakdownCard />

      <ChartCard title="Pola mingguan" subtitle="Rata-rata pengeluaran per hari dalam seminggu">
        <WeekdayChart :days="weekday" :hidden="hidden" />
      </ChartCard>

      <ChartCard v-if="wallets.length > 1" title="Per dompet" subtitle="Pemasukan dan pengeluaran tiap dompet">
        <WalletBars :rows="walletRows" :hidden="hidden" />
      </ChartCard>

      <ChartCard title="Pengeluaran terbesar" subtitle="5 transaksi teratas">
        <TopExpenses :items="topExpenses" />
      </ChartCard>

      <section class="rounded-xl bg-surface-container-lowest p-5 shadow-sm md:col-span-2">
        <h2 class="mb-3 text-headline-sm">Daftar transaksi</h2>

        <div class="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div class="flex gap-2 overflow-x-auto" role="group" aria-label="Tipe transaksi">
            <button
              v-for="t in TYPES" :key="t.id" type="button"
              class="shrink-0 rounded-full px-4 py-1.5 text-label-sm"
              :class="typeFilter === t.id ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'"
              :aria-pressed="typeFilter === t.id"
              @click="typeFilter = t.id"
            >{{ t.label }}</button>
          </div>
          <label class="relative block flex-1">
            <span class="sr-only">Cari transaksi</span>
            <AppIcon name="search" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              v-model="query" type="search" placeholder="Cari catatan atau kategori"
              class="w-full rounded-lg border border-outline-variant bg-transparent py-2 pl-10 pr-3"
            />
          </label>
        </div>

        <GroupedTransactionList :items="filtered" :reset-key="resetKey" />
      </section>
    </div>
  </div>
</template>