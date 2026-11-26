<script setup>
import PageHeader from '@/components/transactions/PageHeader.vue'
import PeriodFilter from '@/components/transactions/PeriodFilter.vue'
import PeriodSummary from '@/components/transactions/PeriodSummary.vue'
import TopExpenses from '@/components/transactions/TopExpenses.vue'
import ChartCard from '@/components/charts/ChartCard.vue'
import TimelineChart from '@/components/charts/TimelineChart.vue'
import CategoryBreakdownCard from '@/components/charts/CategoryBreakdownCard.vue'
import WalletBars from '@/components/charts/WalletBars.vue'
import { useTransactions } from '@/composables/useTransactions'
import { useTransactionAnalytics } from '@/composables/useTransactionAnalytics'
import { usePeriodFilter } from '@/composables/usePeriodFilter'
import { useBalanceVisibility } from '@/composables/useBalanceVisibility'

const { wallets } = useTransactions()
const { timeline, timelineMode, walletRows, topExpenses } = useTransactionAnalytics()
const { rangeLabel, periodName, days } = usePeriodFilter()
const { hidden } = useBalanceVisibility()
</script>

<template>
  <div
    class="min-h-[calc(100dvh-120px)] w-full min-w-0 max-w-full space-y-gutter-mobile overflow-x-hidden md:space-y-gutter"
  >
    <PageHeader :title="$t('nav.analytics')">
      <template #actions>
        <PeriodFilter />
      </template>
    </PageHeader>

    <p class="text-body-sm text-on-surface-variant">
      {{ $t('period.summary', { name: periodName, range: rangeLabel, days }) }}
    </p>

    <PeriodSummary />

    <div
      class="grid w-full min-w-0 max-w-full grid-cols-1 gap-gutter-mobile md:grid-cols-2 md:gap-gutter"
    >
      <ChartCard
        class="md:col-span-2"
        :title="$t('tx.cashFlow')"
        :subtitle="$t('analytics.cashFlowSub', { unit: $t('analytics.unit.' + timelineMode) })"
      >
        <TimelineChart :buckets="timeline" :hidden="hidden" />
      </ChartCard>

      <CategoryBreakdownCard />

      <ChartCard
        v-if="wallets.length > 1"
        :title="$t('tx.byWallet')"
        :subtitle="$t('analytics.byWalletSub')"
      >
        <WalletBars :rows="walletRows" :hidden="hidden" />
      </ChartCard>

      <ChartCard :title="$t('tx.topExpenses')" :subtitle="$t('analytics.topSub')">
        <TopExpenses :items="topExpenses" />
      </ChartCard>
    </div>
  </div>
</template>