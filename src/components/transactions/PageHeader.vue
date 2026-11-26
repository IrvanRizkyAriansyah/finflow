<script setup>
import { useRouter } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'

defineProps({
  title: { type: String, required: true },
})

const router = useRouter()
const goBack = () => (window.history.state?.back ? router.back() : router.push('/'))
</script>

<template>
  <header class="flex items-center gap-3">
    <button
      class="flex rounded-full bg-surface-container-lowest p-2 shadow-sm md:hidden"
      :aria-label="$t('common.back')"
      @click="goBack"
    >
      <AppIcon name="arrow_back" />
    </button>

    <h1 class="text-headline-md">{{ title }}</h1>

    <div v-if="$slots.actions" class="ml-auto">
      <slot name="actions" />
    </div>
  </header>
</template>