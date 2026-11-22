<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AvatarImage from '@/components/ui/AvatarImage.vue'
import { useGoogleAuth } from '@/composables/useGoogleAuth'

const { user } = useGoogleAuth()
const greeting = computed(() => {
  const h = new Date().getHours()
  return h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam'
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
    <button class="rounded-full bg-surface-container-lowest p-3 shadow-sm flex" aria-label="Notifikasi">
      <AppIcon name="notifications" />
    </button>
  </header>
</template>