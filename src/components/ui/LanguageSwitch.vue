<script setup>
import { LANGS, useI18n } from '@/composables/useI18n'
const { locale, setLocale } = useI18n()
</script>

<template>
  <div
    role="group"
    :aria-label="$t('lang.switch')"
    class="flex rounded-full bg-surface-container-lowest p-1 shadow-sm"
  >
    <button
      v-for="l in LANGS" :key="l.code" type="button"
      :title="l.name"
      :aria-pressed="locale === l.code"
      class="rounded-full px-3 py-1.5 text-label-sm font-semibold transition-colors"
      :class="locale === l.code ? 'bg-primary text-on-primary' : 'text-on-surface-variant'"
      @click="setLocale(l.code)"
    >{{ l.label }}</button>
  </div>
</template>