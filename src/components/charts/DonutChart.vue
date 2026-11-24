<script setup>
import { ref, computed } from 'vue'
import { formatCompactCurrency, formatCurrency } from '@/utils/formatCurrency'

const props = defineProps({
  segments: { type: Array, default: () => [] }, // [{ id, label, color, value, percent }]
  total: { type: Number, default: 0 },
  hidden: Boolean,
})

const active = ref(null)
const GAP = 0.8 // celah antar segmen (dalam % keliling)

const arcs = computed(() => {
  let offset = 0
  return props.segments.map((s) => {
    const len = Math.max(0, s.percent - (props.segments.length > 1 ? GAP : 0))
    const arc = { ...s, dash: `${len} ${100 - len}`, offset: -offset }
    offset += s.percent
    return arc
  })
})

const focus = computed(() => props.segments.find((s) => s.id === active.value) ?? null)
const compact = (v) => (props.hidden ? 'Rp ••••' : formatCompactCurrency(v))
const full = (v) => (props.hidden ? 'Rp ••••••' : formatCurrency(v))
const pct = (p) => (p < 1 ? '<1%' : `${Math.round(p)}%`)
</script>

<template>
  <div class="flex flex-col items-center gap-5">
    <div class="relative h-40 w-40 shrink-0">
      <svg viewBox="0 0 100 100" class="h-full w-full -rotate-90" role="img" aria-label="Diagram pengeluaran per kategori">
        <circle cx="50" cy="50" r="38" fill="none" stroke-width="14" class="stroke-surface-container" />
        <circle
          v-for="a in arcs" :key="a.id"
          cx="50" cy="50" r="38" fill="none" stroke-width="14" pathLength="100"
          :stroke="a.color" :stroke-dasharray="a.dash" :stroke-dashoffset="a.offset"
          :opacity="active && active !== a.id ? 0.3 : 1"
          class="transition-opacity"
        />
      </svg>
      <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <span class="max-w-full truncate text-label-sm text-on-surface-variant">{{ focus ? focus.label : 'Total' }}</span>
        <span class="font-display text-headline-sm">{{ compact(focus ? focus.value : total) }}</span>
        <span v-if="focus" class="text-label-sm text-on-surface-variant">{{ pct(focus.percent) }}</span>
      </div>
    </div>

    <ul class="w-full min-w-0 flex-1 space-y-1">
      <li v-for="s in segments" :key="s.id">
        <button
          type="button"
          class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-surface-container-low"
          :class="active === s.id ? 'bg-surface-container-low' : ''"
          :aria-pressed="active === s.id"
          @mouseenter="active = s.id" @mouseleave="active = null"
          @focus="active = s.id" @blur="active = null"
          @click="active = active === s.id ? null : s.id"
        >
          <span class="h-3 w-3 shrink-0 rounded-full" :style="{ backgroundColor: s.color }" />
          <span class="min-w-0 flex-1 truncate text-body-sm">{{ s.label }}</span>
          <span class="text-body-sm font-semibold tabular-nums">{{ full(s.value) }}</span>
          <span class="w-10 text-right text-label-sm text-on-surface-variant">{{ pct(s.percent) }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>