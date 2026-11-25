<script setup>
import { ref, computed } from "vue";
import PageHeader from "@/components/transactions/PageHeader.vue";
import PeriodFilter from "@/components/transactions/PeriodFilter.vue";
import PeriodSummary from "@/components/transactions/PeriodSummary.vue";
import TopExpenses from "@/components/transactions/TopExpenses.vue";
import GroupedTransactionList from "@/components/transactions/GroupedTransactionList.vue";
import ChartCard from "@/components/charts/ChartCard.vue";
import TimelineChart from "@/components/charts/TimelineChart.vue";
import CategoryBreakdownCard from "@/components/charts/CategoryBreakdownCard.vue";
import WeekdayChart from "@/components/charts/WeekdayChart.vue";
import WalletBars from "@/components/charts/WalletBars.vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import { useTransactions } from "@/composables/useTransactions";
import { useTransactionAnalytics } from "@/composables/useTransactionAnalytics";
import { usePeriodFilter } from "@/composables/usePeriodFilter";
import { useBalanceVisibility } from "@/composables/useBalanceVisibility";

const { categoryMap, wallets } = useTransactions();
const {
  periodTransactions,
  timeline,
  timelineMode,
  weekday,
  walletRows,
  topExpenses,
} = useTransactionAnalytics();
const { rangeLabel } = usePeriodFilter();
const { hidden } = useBalanceVisibility();

const MODE_LABEL = { day: "hari", week: "minggu", month: "bulan" };

const TYPES = [
  { id: "all", labelKey: "common.all" },
  { id: "income", labelKey: "common.income" },
  { id: "expense", labelKey: "common.expense" },
];
const typeFilter = ref("all");
const query = ref("");

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return periodTransactions.value.filter((t) => {
    if (typeFilter.value !== "all" && t.type !== typeFilter.value) return false;
    if (!q) return true;
    const haystack =
      `${t.note ?? ""} ${categoryMap.value.get(t.category_id)?.name ?? ""}`.toLowerCase();
    return haystack.includes(q);
  });
});
const resetKey = computed(
  () => `${rangeLabel.value}|${typeFilter.value}|${query.value}`,
);
</script>

<template>
  <div
    class="w-full min-w-0 max-w-full space-y-gutter-mobile overflow-x-hidden md:space-y-gutter"
  >
    <PageHeader :title="$t('nav.transactions')" />
    <PeriodFilter />
    <section
        class="rounded-xl bg-surface-container-lowest p-5 shadow-sm md:col-span-2"
      >
        <h2 class="mb-3 text-headline-sm">{{$t('tx.list')}}</h2>

        <div class="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div
            class="flex gap-2 overflow-x-auto"
            role="group"
            :aria-label="$t('tx.type')"
          >
            <button
              v-for="t in TYPES"
              :key="t.id"
              type="button"
              class="shrink-0 rounded-full px-4 py-1.5 text-label-sm"
              :class="
                typeFilter === t.id
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant'
              "
              :aria-pressed="typeFilter === t.id"
              @click="typeFilter = t.id"
            >
              {{ $t(t.labelKey) }}
            </button>
          </div>
          <label class="relative block flex-1">
            <span class="sr-only">{{ $t('tx.search') }}</span>
            <AppIcon
              name="search"
              class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              v-model="query"
              type="search"
              :placeholder="$t('tx.searchPlaceholder')"
              class="w-full rounded-lg border border-outline-variant bg-transparent py-2 pl-10 pr-3"
            />
          </label>
        </div>

        <GroupedTransactionList :items="filtered" :reset-key="resetKey" />
      </section>
      
    <PeriodSummary />

    <section
        class="rounded-xl bg-surface-container-lowest p-5 shadow-sm md:col-span-2"
      >
        <h2 class="mb-3 text-headline-sm">{{$t('tx.list')}}</h2>

        <div class="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div
            class="flex gap-2 overflow-x-auto"
            role="group"
            :aria-label="$t('tx.type')"
          >
            <button
              v-for="t in TYPES"
              :key="t.id"
              type="button"
              class="shrink-0 rounded-full px-4 py-1.5 text-label-sm"
              :class="
                typeFilter === t.id
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant'
              "
              :aria-pressed="typeFilter === t.id"
              @click="typeFilter = t.id"
            >
              {{ $t(t.labelKey) }}
            </button>
          </div>
          <label class="relative block flex-1">
            <span class="sr-only">{{ $t('tx.search') }}</span>
            <AppIcon
              name="search"
              class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              v-model="query"
              type="search"
              :placeholder="$t('tx.searchPlaceholder')"
              class="w-full rounded-lg border border-outline-variant bg-transparent py-2 pl-10 pr-3"
            />
          </label>
        </div>

        <GroupedTransactionList :items="filtered" :reset-key="resetKey" />
      </section>
    <div
      class="grid w-full min-w-0 max-w-full grid-cols-1 gap-gutter-mobile md:grid-cols-2 md:gap-gutter"
    >
      <ChartCard
        class="md:col-span-2"
        :title="$t('tx.cashFlow')"
        :subtitle="`Pemasukan vs pengeluaran per ${MODE_LABEL[timelineMode]}`"
      >
        <TimelineChart :buckets="timeline" :hidden="hidden" />
      </ChartCard>

      <CategoryBreakdownCard />

      <ChartCard
        v-if="wallets.length > 1"
        :title="$t('tx.byWallet')"
        subtitle="Pemasukan dan pengeluaran tiap dompet"
      >
        <WalletBars :rows="walletRows" :hidden="hidden" />
      </ChartCard>

      <ChartCard :title="$t('tx.topExpenses')" subtitle="5 transaksi teratas">
        <TopExpenses :items="topExpenses" />
      </ChartCard>
    </div>
  </div>
</template>
