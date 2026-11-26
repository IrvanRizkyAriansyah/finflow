<script setup>
import { ref, computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useClickOutside } from '@/composables/useClickOutside'
import { usePeriodFilter, PRESETS } from '@/composables/usePeriodFilter'

const { preset, customStart, customEnd, rangeLabel, periodName, days } = usePeriodFilter()

const root = ref(null)
const trigger = ref(null)
const open = ref(false)
const isCustom = computed(() => preset.value === 'custom')

function close({ restoreFocus = false } = {}) {
  open.value = false
  if (restoreFocus) trigger.value?.focus()
}

function choose(id) {
  preset.value = id
  // "Kustom" membiarkan panel terbuka agar tanggal bisa dipilih; pilihan lain langsung menutup
  if (id !== 'custom') close({ restoreFocus: true })
}

function onKeydown(e) {
  if (e.key === 'Escape' && open.value) {
    e.stopPropagation()
    close({ restoreFocus: true })
  }
}

useClickOutside(root, () => close(), open)
</script>

<template>
  <section ref="root" class="relative" @keydown="onKeydown">
    <button
      ref="trigger"
      type="button"
      class="flex items-center gap-2 rounded-full bg-surface-container-lowest px-4 py-2 text-label-sm shadow-sm"
      aria-haspopup="menu"
      :aria-expanded="open"
      @click="open = !open"
    >
      <AppIcon name="calendar_month" size="18"/>
      <span class="sr-only">{{ $t('period.label') }}:</span>
      <span>{{ $t('period.' + preset) }}</span>
      <AppIcon name="expand_more" class="transition-transform" :class="open ? 'rotate-180' : ''" size="18"/>
    </button>

    <div
      v-if="open"
      role="menu"
      :aria-label="$t('period.label')"
      class="absolute right-0 z-30 mt-2 md:w-[25vw] w-[calc(100vw-2rem)] max-w-none rounded-xl bg-surface-container-lowest p-2 shadow-lg ring-1 ring-outline-variant/40"
    >
      <button
        v-for="p in PRESETS" :key="p.id" type="button"
        role="menuitemradio" :aria-checked="preset === p.id"
        class="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-label-md hover:bg-surface-container-low"
        :class="preset === p.id ? 'bg-surface-container-low text-primary' : ''"
        @click="choose(p.id)"
      >
        <span>{{ $t('period.' + p.id) }}</span>
        <AppIcon v-if="preset === p.id" name="check" />
      </button>

      <div
        v-if="isCustom"
        class="mt-1 grid grid-cols-2 gap-3 border-t border-outline-variant/40 px-1 pb-1 pt-3"
      >
        <label class="block">
          <span class="text-label-sm text-on-surface-variant">{{ $t('common.from') }}</span>
          <input
            v-model="customStart" type="date" :max="customEnd || undefined"
            class="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2"
          />
        </label>
        <label class="block">
          <span class="text-label-sm text-on-surface-variant">{{ $t('common.to') }}</span>
          <input
            v-model="customEnd" type="date" :min="customStart || undefined"
            class="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2"
          />
        </label>
        <button
          type="button"
          class="col-span-2 rounded-lg bg-primary py-2 text-label-md text-on-primary"
          @click="close({ restoreFocus: true })"
        >{{ $t('common.done') }}</button>
      </div>
    </div>

    <!-- <p class="mt-2 text-body-sm text-on-surface-variant">
      {{ $t('period.summary', { name: periodName, range: rangeLabel, days }) }}
    </p> -->
  </section>
</template>