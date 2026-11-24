<script setup>
import { ref, computed } from 'vue'
import { formatCompactCurrency } from '@/utils/formatCurrency'

const props = defineProps({ days: { type: Array, default: () => [] }, hidden: Boolean })
const sel = ref(null)

const max = computed(() => Math.max(0, ...props.days.map((d) => d.avg)))
const peak = computed(() => (max.value > 0 ? props.days.find((d) => d.avg === max.value) : null))
const shown = computed(() => (sel.value !== null ? props.days[sel.value] : peak.value))

const money = (v) => (props.hidden ? 'Rp ••••' : formatCompactCurrency(v))
const barHeight = (v) => (max.value > 0 && v > 0 ? `${Math.max(4, (v / max.value) * 100)}%` : '0%')
</script>

<template>
  <p v-if="max === 0" class="py-10 text-center text-body-sm text-on-surface-variant">
    {{ $t('common.noExpensePeriod') }}
  </p>

  <div v-else>
    <div class="flex h-32 gap-2">
      <button
        v-for="(d, i) in days" :key="d.short" type="button"
        class="flex h-full min-w-0 flex-1 flex-col"
        :aria-pressed="sel === i" :aria-label="`${d.long}: rata-rata ${money(d.avg)}`"
        @click="sel = sel === i ? null : i"
      >
        <span
          class="flex w-full flex-1 items-end justify-center rounded-t-md"
          :class="shown && shown.short === d.short ? 'bg-surface-container-low' : ''"
        >
          <span
            class="w-full max-w-6 rounded-t"
            :class="peak && peak.short === d.short ? 'bg-error' : 'bg-error/40'"
            :style="{ height: barHeight(d.avg) }"
          />
        </span>
        <span class="h-6 pt-1 text-center text-label-sm text-on-surface-variant">{{ d.short }}</span>
      </button>
    </div>

    <p v-if="shown" class="mt-3 rounded-lg bg-surface-container-low p-3 text-body-sm">
      <strong>{{ shown.long }}</strong>: rata-rata {{ money(shown.avg) }} per hari
      <span class="text-on-surface-variant">({{ shown.count }} hari, total {{ money(shown.total) }})</span>
    </p>
  </div>
</template>