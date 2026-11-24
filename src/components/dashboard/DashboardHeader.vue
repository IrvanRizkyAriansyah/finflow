<script setup>
import { computed } from 'vue'
import AvatarImage from '@/components/ui/AvatarImage.vue'
import LanguageSwitch from '@/components/ui/LanguageSwitch.vue'
import { useGoogleAuth } from '@/composables/useGoogleAuth'
import { t } from '@/composables/useI18n'

const { user } = useGoogleAuth()
const greeting = computed(() => {
  const h = new Date().getHours()
  return t(h < 11 ? 'greeting.morning' : h < 15 ? 'greeting.afternoon' : h < 18 ? 'greeting.evening' : 'greeting.night')
})
</script>

<template>
  <header class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <AvatarImage :src="user?.picture" :name="user?.name" />
      <div>
        <p class="text-body-sm text-on-surface-variant">{{ greeting }},</p>
        <h1 class="text-headline-sm">{{ user?.givenName || user?.name }}</h1>
      </div>
    </div>
    <LanguageSwitch />
  </header>
</template>