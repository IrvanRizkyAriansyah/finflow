<script setup>
import { ref, computed } from 'vue'
import { formatCompactCurrency, formatCurrency } from '@/utils/formatCurrency'
import { formatDate } from '@/utils/formatDate'

const props = defineProps({ points: { type: Array, default: () => [] }, hidden: Boolean })

const W = 300
const H = 100
const active = ref(null)

const coords = computed(() => {
  const list = props.points
  if (!list.length) return []
  const values = list.map((p) => p.balance)
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  const pad = (hi - lo) * 0.12 || Math.max(1, Math.abs(hi) * 0.05) // garis datar tetap punya ruang
  const min = lo - pad
  const max = hi + pad
  return list.map((p, i) => ({
    ...p,
    x: list.length > 1 ? (i / (list.length - 1)) * W : W / 2,
    y: H - ((p.balance - min) / (max - min)) * H,
  }))
})

const linePath = computed(() => coords.value.map((c, i) => `${i ? 'L' : 'M'}${c.x.toFixed(2)} ${c.y.toFixed(2)}`).join(' '))
const areaPath = computed(() => (coords.value.length ? `${linePath.value} L${W} ${H} L0 ${H} Z` : ''))

const shown = computed(() => (active.value !== null ? coords.value[active.value] : coords.value[coords.value.length - 1]))
const change = computed(() => (shown.value ? shown.value.balance - coords.value[0].balance : 0))

const money = (v) => (props.hidden ? 'Rp ••••••' : formatCurrency(v))
const shortDate = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })

function onMove(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
  active.value = Math.round(ratio * (props.points.length - 1))
}
// Di layar sentuh nilai terakhir tetap tampil setelah jari diangkat
const onLeave = (e) => { if (e.pointerType === 'mouse') active.value = null }
</script>

<template>
  <div v-if="coords.length">
    <div class="flex items-end justify-between gap-3">
      <div class="min-w-0">
        <p class="text-body-sm text-on-surface-variant">{{ active !== null ? formatDate(shown.date) : 'Saldo hari ini' }}</p>
        <p class="truncate font-display text-headline-md">{{ money(shown.balance) }}</p>
      </div>
      <p v-if="!hidden" class="shrink-0 text-right text-body-sm font-semibold" :class="change >= 0 ? 'text-primary' : 'text-error'">
        {{ change >= 0 ? '+' : '-' }}{{ formatCompactCurrency(Math.abs(change)) }}
        <span class="block text-label-sm font-normal text-on-surface-variant">dari awal periode</span>
      </p>
    </div>

    <div
      class="relative mt-4 h-36 touch-pan-y text-primary"
      role="img" aria-label="Grafik saldo 30 hari terakhir"
      @pointermove="onMove" @pointerdown="onMove" @pointerleave="onLeave"
    >
      <svg :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" class="h-full w-full overflow-visible" aria-hidden="true">
        <path :d="areaPath" fill="currentColor" fill-opacity="0.12" />
        <path :d="linePath" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
      </svg>

      <div
        v-if="active !== null"
        class="pointer-events-none absolute inset-y-0 w-px bg-outline-variant"
        :style="{ left: `${(shown.x / W) * 100}%` }"
      />
      <div
        class="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-2 ring-white"
        :style="{ left: `${(shown.x / W) * 100}%`, top: `${(shown.y / H) * 100}%` }"
      />
    </div>

    <div class="mt-2 flex justify-between text-label-sm text-on-surface-variant">
      <span>{{ shortDate(points[0].date) }}</span>
      <span>Hari ini</span>
    </div>
  </div>
</template>