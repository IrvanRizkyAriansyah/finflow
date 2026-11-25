<script setup>
import { ref, computed } from 'vue'
import { formatCompactCurrency, formatCurrency } from '@/utils/formatCurrency'

const props = defineProps({ buckets: { type: Array, default: () => [] }, hidden: Boolean })
const active = ref(null)

const max = computed(() => Math.max(1, ...props.buckets.flatMap((b) => [b.income, b.expense])))
const hasData = computed(() => props.buckets.some((b) => b.income > 0 || b.expense > 0))
const current = computed(() => (active.value !== null ? props.buckets[active.value] ?? null : null))
const step = computed(() => Math.max(1, Math.ceil(props.buckets.length / 8))) // label dijarangkan agar tidak bertabrakan

const barHeight = (v) => (v > 0 ? `${Math.max(3, (v / max.value) * 100)}%` : '0%')
const money = (v) => (props.hidden ? 'Rp ••••••' : formatCurrency(v))

function pick(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const ratio = Math.min(0.9999, Math.max(0, (e.clientX - rect.left) / rect.width))
  active.value = Math.floor(ratio * props.buckets.length)
}
const leave = (e) => { if (e.pointerType === 'mouse') active.value = null } // di layar sentuh pilihan tetap

function onKey(e) {
  const n = props.buckets.length
  if (!n) return
  if (e.key === 'ArrowRight') active.value = Math.min(n - 1, (active.value ?? -1) + 1)
  else if (e.key === 'ArrowLeft') active.value = Math.max(0, (active.value ?? n) - 1)
  else if (e.key === 'Escape') active.value = null
  else return
  e.preventDefault()
}
</script>

<template>
  <p v-if="!hasData" class="py-10 text-center text-body-sm text-on-surface-variant">
    {{ $t('common.noTxPeriod') }}
  </p>

  <div v-else>
    <div class="mb-2 flex items-center gap-4 text-label-sm text-on-surface-variant">
      <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-sm bg-primary" /> {{ $t('common.income') }}</span>
      <span class="flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-sm bg-error" /> {{ $t('common.expense') }}</span>
      <span v-if="!hidden" class="ml-auto">{{ $t('common.max', { value: formatCompactCurrency(max) }) }}</span>
    </div>

    <div
      class="relative touch-pan-y rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      tabindex="0" role="img" aria-label="Grafik pemasukan dan pengeluaran. Gunakan tombol panah untuk memilih periode."
      @pointermove="pick" @pointerdown="pick" @pointerleave="leave" @keydown="onKey"
    >
      <div class="pointer-events-none absolute inset-x-0 bottom-6 top-0 flex flex-col justify-between" aria-hidden="true">
        <div v-for="n in 3" :key="n" class="border-t border-dashed border-outline-variant/60" />
      </div>

      <div class="relative flex h-44">
        <div v-for="(b, i) in buckets" :key="b.key" class="flex h-full min-w-0 flex-1 flex-col">
          <div
            class="flex w-full flex-1 items-end justify-center gap-px rounded-t-md px-px"
            :class="active === i ? 'bg-surface-container-low' : ''"
          >
            <span class="max-w-3 flex-1 rounded-t bg-primary" :style="{ height: barHeight(b.income) }" />
            <span class="max-w-3 flex-1 rounded-t bg-error" :style="{ height: barHeight(b.expense) }" />
          </div>
          <span
            class="h-6 truncate pt-1 text-center text-label-sm"
            :class="active === i ? 'font-semibold text-on-surface' : 'text-on-surface-variant'"
          >{{ i % step === 0 || active === i ? b.label : '' }}</span>
        </div>
      </div>
    </div>

    <dl v-if="current" class="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-surface-container-low p-3 text-body-sm">
      <div class="min-w-0">
        <dt class="truncate text-label-sm text-on-surface-variant">{{ current.long }}</dt>
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
    <p v-else class="mt-3 text-center text-label-sm text-on-surface-variant">
      {{ $t('timeline.hint') }}
    </p>
  </div>
</template>