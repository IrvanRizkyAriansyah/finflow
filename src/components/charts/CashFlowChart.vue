<script setup>
import { ref, computed } from 'vue'
import { formatCompactCurrency, formatCurrency } from '@/utils/formatCurrency'

const props = defineProps({ months: { type: Array, default: () => [] }, hidden: Boolean })
const selectedKey = ref(null)

const max = computed(() => Math.max(1, ...props.months.flatMap((m) => [m.income, m.expense])))
const hasData = computed(() => props.months.some((m) => m.income > 0 || m.expense > 0))
const current = computed(() => props.months.find((m) => m.key === selectedKey.value) ?? props.months[props.months.length - 1])

const barHeight = (v) => (v > 0 ? `${Math.max(4, (v / max.value) * 100)}%` : '0%')
const money = (v) => (props.hidden ? 'Rp ••••••' : formatCurrency(v))
const label = (m) => `${m.long}: pemasukan ${money(m.income)}, pengeluaran ${money(m.expense)}`
</script>

<template>
  <p v-if="!hasData" class="py-10 text-center text-body-sm text-on-surface-variant">
    Belum ada transaksi dalam 6 bulan terakhir.
  </p>

  <div v-else>
    <div class="mb-2 flex items-center gap-4 text-label-sm text-on-surface-variant">
      <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-sm bg-primary" /> Pemasukan</span>
      <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-sm bg-error" /> Pengeluaran</span>
      <span v-if="!hidden" class="ml-auto">Maks {{ formatCompactCurrency(max) }}</span>
    </div>

    <div class="relative">
      <!-- garis bantu: atas, tengah, dasar -->
      <div class="pointer-events-none absolute inset-x-0 bottom-6 top-0 flex flex-col justify-between" aria-hidden="true">
        <div v-for="n in 3" :key="n" class="border-t border-dashed border-outline-variant/60" />
      </div>

      <div class="relative flex h-44 gap-2">
        <button
          v-for="m in months" :key="m.key" type="button"
          class="flex h-full min-w-0 flex-1 flex-col"
          :aria-pressed="current?.key === m.key" :aria-label="label(m)"
          @click="selectedKey = m.key"
        >
          <span
            class="flex w-full flex-1 items-end justify-center gap-1 rounded-t-md px-1"
            :class="current?.key === m.key ? 'bg-surface-container-low' : ''"
          >
            <span class="w-3 rounded-t bg-primary" :style="{ height: barHeight(m.income) }" />
            <span class="w-3 rounded-t bg-error" :style="{ height: barHeight(m.expense) }" />
          </span>
          <span
            class="h-6 pt-1 text-center text-label-sm"
            :class="current?.key === m.key ? 'font-semibold text-on-surface' : 'text-on-surface-variant'"
          >{{ m.label }}</span>
        </button>
      </div>
    </div>

    <dl v-if="current" class="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-surface-container-low p-3 text-body-sm">
      <div class="min-w-0">
        <dt class="text-label-sm text-on-surface-variant">{{ current.long }}</dt>
        <dd class="font-semibold text-primary">{{ money(current.income) }}</dd>
      </div>
      <div class="min-w-0">
        <dt class="text-label-sm text-on-surface-variant">Pengeluaran</dt>
        <dd class="font-semibold text-error">{{ money(current.expense) }}</dd>
      </div>
      <div class="min-w-0">
        <dt class="text-label-sm text-on-surface-variant">Selisih</dt>
        <dd class="font-semibold" :class="current.net >= 0 ? 'text-primary' : 'text-error'">{{ money(current.net) }}</dd>
      </div>
    </dl>
  </div>
</template>