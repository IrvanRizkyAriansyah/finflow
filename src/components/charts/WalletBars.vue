<script setup>
import { computed } from 'vue'
import { formatCompactCurrency } from '@/utils/formatCurrency'

const props = defineProps({ rows: { type: Array, default: () => [] }, hidden: Boolean })

const max = computed(() => Math.max(1, ...props.rows.flatMap((r) => [r.income, r.expense])))
const width = (v) => `${v > 0 ? Math.max(2, (v / max.value) * 100) : 0}%`
const money = (v) => (props.hidden ? 'Rp ••••' : formatCompactCurrency(v))
const active = computed(() => props.rows.filter((r) => r.income > 0 || r.expense > 0))
</script>

<template>
  <p v-if="!active.length" class="py-10 text-center text-body-sm text-on-surface-variant">
    Belum ada transaksi pada periode ini.
  </p>

  <div v-else class="space-y-4">
    <div v-for="r in active" :key="r.id">
      <p class="mb-1 truncate text-body-sm font-semibold">{{ r.name }}</p>
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <div class="h-2 flex-1 overflow-hidden rounded-full bg-surface-container">
            <div class="h-full rounded-full bg-primary" :style="{ width: width(r.income) }" />
          </div>
          <span class="w-24 text-right text-label-sm tabular-nums text-primary">{{ money(r.income) }}</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="h-2 flex-1 overflow-hidden rounded-full bg-surface-container">
            <div class="h-full rounded-full bg-error" :style="{ width: width(r.expense) }" />
          </div>
          <span class="w-24 text-right text-label-sm tabular-nums text-error">{{ money(r.expense) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>