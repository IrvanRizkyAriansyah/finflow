<script setup>
import { computed } from "vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import AmountText from "@/components/ui/AmountText.vue";
import { useBalanceVisibility } from "@/composables/useBalanceVisibility";
import { formatDate } from "@/utils/formatDate";
import { formatCurrency } from "@/utils/formatCurrency";
import { t } from "../../composables/useI18n";

const props = defineProps({ goal: { type: Object, required: true } });
defineEmits(["select"]);

const { hidden } = useBalanceVisibility();
const color = computed(() => props.goal.color || "#10412a");
const percent = computed(() => Math.round(props.goal.progress * 100));
const money = (v) => (hidden.value ? "Rp ••••" : formatCurrency(v));

const status = computed(() => {
  const g = props.goal;
  if (g.reached) return t("goal.reached");
  if (g.overdue) return t("goal.overdue", { date: formatDate(g.deadline) });
  if (g.monthlyNeeded)
    return t("goal.targetPerMonth", {
      date: formatDate(g.deadline),
      amount: money(g.monthlyNeeded),
    });
  return t("goal.left", { amount: money(g.remaining) });
});
</script>

<template>
  <button
    type="button"
    class="block w-full rounded-xl bg-surface-container-lowest p-4 text-left shadow-sm transition-transform active:scale-[0.99]"
    @click="$emit('select', goal)"
  >
    <div class="flex items-center gap-3">
      <span
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
        :style="{ backgroundColor: color + '1A', color }"
      >
        <AppIcon :name="goal.icon || 'savings'" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="truncate text-body-md font-semibold">{{ goal.name }}</p>
        <p class="text-body-sm text-on-surface-variant">
          <AmountText :value="goal.saved" :hidden="hidden" />
          {{ $t("common.of") }}
          <AmountText :value="goal.target_amount" :hidden="hidden" />
        </p>
      </div>
      <span class="text-label-md" :class="goal.reached ? 'text-primary' : ''"
        >{{ percent }}%</span
      >
    </div>

    <div
      class="mt-3 h-2 overflow-hidden rounded-full bg-surface-container"
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="percent"
    >
      <div
        class="h-full rounded-full transition-all"
        :style="{ width: percent + '%', backgroundColor: color }"
      />
    </div>

    <p
      class="mt-2 text-body-sm"
      :class="goal.overdue ? 'text-error' : 'text-on-surface-variant'"
    >
      {{ status }}
    </p>
  </button>
</template>
