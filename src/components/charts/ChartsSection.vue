<script setup>
import ChartCard from './ChartCard.vue'
import MonthSummary from './MonthSummary.vue'
import DonutChart from './DonutChart.vue'
import CashFlowChart from './CashFlowChart.vue'
import BalanceTrendChart from './BalanceTrendChart.vue'
import { useCharts } from '@/composables/useCharts'
import { useTransactions } from '@/composables/useTransactions'
import { useBalanceVisibility } from '@/composables/useBalanceVisibility'

const { monthSummary, categoryBreakdown, monthlyFlow, balanceTrend } = useCharts()
const { transactions, isLoading } = useTransactions()
const { hidden } = useBalanceVisibility()
</script>

<template>
  <section class="space-y-gutter-mobile md:space-y-gutter" aria-label="Analitik keuangan">
    <div
      v-if="isLoading && !transactions.length"
      class="grid gap-gutter-mobile md:grid-cols-2 md:gap-gutter" aria-busy="true"
    >
      <div
        v-for="n in 3" :key="n"
        class="h-56 animate-pulse rounded-xl bg-surface-container"
        :class="n === 3 ? 'md:col-span-2' : ''"
      />
    </div>

    <template v-else>
      <MonthSummary />

      <div class="grid gap-gutter-mobile md:grid-cols-2 md:gap-gutter">
        <ChartCard title="Pengeluaran per kategori" :subtitle="monthSummary.label">
          <p v-if="!categoryBreakdown.segments.length" class="py-10 text-center text-body-sm text-on-surface-variant">
            Belum ada pengeluaran bulan ini.
          </p>
          <DonutChart v-else :segments="categoryBreakdown.segments" :total="categoryBreakdown.total" :hidden="hidden" />
        </ChartCard>

        <ChartCard title="Arus kas" subtitle="6 bulan terakhir">
          <CashFlowChart :months="monthlyFlow" :hidden="hidden" />
        </ChartCard>

        <ChartCard class="md:col-span-2" title="Tren saldo" subtitle="30 hari terakhir">
          <p v-if="!transactions.length" class="py-10 text-center text-body-sm text-on-surface-variant">
            Catat transaksi pertama Anda untuk melihat tren saldo.
          </p>
          <BalanceTrendChart v-else :points="balanceTrend" :hidden="hidden" />
        </ChartCard>
      </div>
    </template>
  </section>
</template>