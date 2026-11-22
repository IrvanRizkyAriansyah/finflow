<script setup>
import { computed } from 'vue'

const props = defineProps({ series: { type: Array, default: () => [] } }) // [{label, income, expense}]

const max = computed(() => Math.max(1, ...props.series.flatMap((d) => [d.income, d.expense])))
const pct = (v) => `${v > 0 ? Math.max(6, (v / max.value) * 100) : 0}%`
</script>

<template>
  <div class="flex h-28 items-end justify-between gap-2">
    <div v-for="d in series" :key="d.date" class="flex h-full flex-1 flex-col items-center justify-end gap-1">
      <div class="flex w-full flex-1 items-end justify-center gap-0.5">
        <div class="w-2 rounded-t bg-on-secondary-container/40" :style="{ height: pct(d.income) }" />
        <div class="w-2 rounded-t bg-on-secondary-container" :style="{ height: pct(d.expense) }" />
      </div>
      <span class="text-label-sm capitalize">{{ d.label }}</span>
    </div>
  </div>
</template>