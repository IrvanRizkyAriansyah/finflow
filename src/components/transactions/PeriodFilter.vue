<script setup>
import { usePeriodFilter, PRESETS } from '@/composables/usePeriodFilter'

const { preset, customStart, customEnd, rangeLabel, periodName, days } = usePeriodFilter()
</script>

<template>
  <section>
    <div class="hide-scrollbar flex gap-2 overflow-x-auto" role="group" aria-label="Periode">
      <button
        v-for="p in PRESETS" :key="p.id" type="button"
        class="shrink-0 rounded-full px-4 py-2 text-label-md"
        :class="preset === p.id ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface-variant shadow-sm'"
        :aria-pressed="preset === p.id"
        @click="preset = p.id"
      >{{ p.label }}</button>
    </div>

    <div v-if="preset === 'custom'" class="mt-3 grid grid-cols-2 gap-3">
      <label class="block">
        <span class="text-label-sm text-on-surface-variant">Dari</span>
        <input
          v-model="customStart" type="date" :max="customEnd || undefined"
          class="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2"
        />
      </label>
      <label class="block">
        <span class="text-label-sm text-on-surface-variant">Sampai</span>
        <input
          v-model="customEnd" type="date" :min="customStart || undefined"
          class="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2"
        />
      </label>
    </div>

    <p class="mt-2 text-body-sm text-on-surface-variant">
      {{ periodName }} · {{ rangeLabel }} · {{ days }} hari
    </p>
  </section>
</template>