<script setup>
import { computed } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import { useTransactionAnalytics } from "@/composables/useTransactionAnalytics";
import { usePeriodFilter } from "@/composables/usePeriodFilter";
import { useBalanceVisibility } from "@/composables/useBalanceVisibility";
import { formatCompactCurrency } from "@/utils/formatCurrency";
import { t } from "../../composables/useI18n";

const { summary: s, expenseBreakdown, weekday } = useTransactionAnalytics();
const { days } = usePeriodFilter();
const { hidden } = useBalanceVisibility();

const money = (v) => (hidden.value ? "Rp ••••" : formatCompactCurrency(v));
const pct = (d) => `${d >= 0 ? "+" : "-"}${Math.round(Math.abs(d) * 100)}%`;

const tiles = computed(() => [
  {
    key: "income",
    label: t("common.income"),
    icon: "trending_up",
    value: s.value.income,
    delta: s.value.incomeDelta,
    goodWhen: "up",
    tone: "text-primary",
  },
  {
    key: "expense",
    label: t("common.expense"),
    icon: "trending_down",
    value: s.value.expense,
    delta: s.value.expenseDelta,
    goodWhen: "down",
    tone: "text-error",
  },
  // {
  //   key: "net",
  //   label: t("common.net"),
  //   sub:
  //     s.value.savingsRate !== null
  //       ? t("period.ofIncome", { n: Math.round(s.value.savingsRate * 100) })
  //       : t("period.noIncome"),
  // },
  // {
  //   key: "avg",
  //   label: t("period.avgPerDay"),
  //   icon: "calendar_today",
  //   value: s.value.avgDailyExpense,
  //   tone: "",
  //   sub: t("common.txCount", { n: s.value.count }),
  // },
]);

function deltaClass(t) {
  const up = t.delta >= 0;
  return (t.goodWhen === "up" ? up : !up) ? "text-primary" : "text-error";
}

const insights = computed(() => {
  const out = [];
  if (s.value.expenseDelta !== null) {
    out.push(
      t(
        s.value.expenseDelta >= 0 ? "period.insight.up" : "period.insight.down",
        { n: Math.round(Math.abs(s.value.expenseDelta) * 100) },
      ),
    );
  }
  const top = expenseBreakdown.value.segments[0];
  if (top)
    out.push(
      t("period.insight.top", { label: top.label, n: Math.round(top.percent) }),
    );

  const peak = [...weekday.value].sort((a, b) => b.avg - a.avg)[0];
  if (days.value >= 14 && peak?.avg > 0)
    out.push(
      t("period.insight.peak", { day: peak.long, avg: money(peak.avg) }),
    );

  if (s.value.savingsRate !== null) {
    out.push(
      s.value.net >= 0
        ? t("period.insight.saved", {
            n: Math.round(s.value.savingsRate * 100),
          })
        : t("period.insight.over", { amount: money(-s.value.net) }),
    );
  }
  return out;
});
</script>

<template>
  <section class="space-y-3">
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div
        v-for="t in tiles"
        :key="t.key"
        class="min-w-0 rounded-xl bg-surface-container-lowest p-4 shadow-sm"
      >
        <div
          class="flex items-center gap-1 text-label-sm text-on-surface-variant"
        >
          <AppIcon :name="t.icon" /> <span class="truncate">{{ t.label }}</span>
        </div>
        <p class="mt-1 truncate font-display text-headline-sm" :class="t.tone">
          {{ money(t.value) }}
        </p>
        <p
          v-if="t.sub"
          class="mt-0.5 truncate text-label-sm text-on-surface-variant"
        >
          {{ t.sub }}
        </p>
        <p
          v-else-if="t.delta !== null"
          class="mt-0.5 truncate text-label-sm"
          :class="deltaClass(t)"
        >
          {{ pct(t.delta) }}
          <span class="text-on-surface-variant">{{$t('period.vsPrev')}}</span>
        </p>
        <p v-else class="mt-0.5 truncate text-label-sm text-on-surface-variant">
          {{$t('period.prevEmpty')}}
        </p>
      </div>
    </div>

    <ul
      v-if="insights.length"
      class="space-y-1 rounded-xl bg-surface-container-low p-4 text-body-sm"
    >
      <li v-for="(text, i) in insights" :key="i" class="flex gap-2">
        <AppIcon name="lightbulb" /> <span>{{ text }}</span>
      </li>
    </ul>
  </section>
</template>
