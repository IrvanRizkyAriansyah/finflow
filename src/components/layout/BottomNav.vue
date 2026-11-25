<script setup>
import { useRoute } from 'vue-router'
import { NAV_ITEMS, isActivePath } from './navItems'
import AppIcon from '@/components/ui/AppIcon.vue'
import FabButton from './FabButton.vue'

const route = useRoute()
const left = NAV_ITEMS.slice(0, 2)
const right = NAV_ITEMS.slice(2)
</script>

<template>
  <nav class="fixed inset-x-4 bottom-4 z-40 pb-[env(safe-area-inset-bottom)] md:hidden" :aria-label="$t('nav.main')">
    <div class="relative flex items-center justify-between rounded-full bg-primary px-3 py-2 shadow-lg">
      <RouterLink
        v-for="item in left" :key="item.to" :to="item.to"
        class="flex flex-col items-center gap-0.5 px-1 py-1 text-label-sm w-16"
        :class="isActivePath(route.path, item.to) ? 'text-secondary-container' : 'text-on-primary-container'"
      >
        <AppIcon :name="item.icon" :filled="isActivePath(route.path, item.to)" />
        {{ $t(item.labelKey) }}
      </RouterLink>

      <div class="w-14" aria-hidden="true" />
      <FabButton class="absolute -top-5 left-1/2 -translate-x-1/2" />

      <RouterLink
        v-for="item in right" :key="item.to" :to="item.to"
        class="flex flex-col items-center gap-0.5 px-1 py-1 text-label-sm w-16"
        :class="isActivePath(route.path, item.to) ? 'text-secondary-container' : 'text-on-primary-container'"
      >
        <AppIcon :name="item.icon" :filled="isActivePath(route.path, item.to)" />
        {{ $t(item.labelKey) }}
      </RouterLink>
    </div>
  </nav>
</template>