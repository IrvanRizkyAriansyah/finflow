<script setup>
import { useRoute } from 'vue-router'
import { NAV_ITEMS, isActivePath } from './navItems'
import AppIcon from '@/components/ui/AppIcon.vue'
import AvatarImage from '@/components/ui/AvatarImage.vue'
import { useGoogleAuth } from '@/composables/useGoogleAuth'
import { useTransactionModal } from '@/composables/useTransactionModal'

const route = useRoute()
const { user } = useGoogleAuth()
const { open } = useTransactionModal()
</script>

<template>
  <aside class="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col justify-between border-r border-outline-variant bg-surface-container-lowest p-6 md:flex">
    <div>
      <div class="mb-8 flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-secondary-container">
          <!-- <AppIcon name="account_balance_wallet" filled /> -->
           <img src="/logo.svg" />
        </div>
        <span class="font-display text-headline-sm">FinFlow</span>
      </div>

      <nav class="space-y-1" :aria-label="$t('nav.main')">
        <RouterLink
          v-for="item in NAV_ITEMS" :key="item.to" :to="item.to"
          class="flex items-center gap-3 rounded-lg px-4 py-3 text-label-md transition-colors"
          :class="isActivePath(route.path, item.to)
            ? 'bg-primary text-on-primary'
            : 'text-on-surface-variant hover:bg-surface-container'"
        >
          <AppIcon :name="item.icon" :filled="isActivePath(route.path, item.to)" />
          {{ $t(item.labelKey) }}
        </RouterLink>
      </nav>

      <button
        class="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-secondary-container py-3 font-semibold text-on-secondary-container"
        @click="open()"
      >
        <AppIcon name="add" /> {{ $t('nav.addTransaction') }}
      </button>
    </div>

    <RouterLink to="/profile" class="flex items-center gap-3 rounded-lg p-2 hover:bg-surface-container">
      <AvatarImage :src="user?.picture" :name="user?.name" size="h-10 w-10" />
      <div class="min-w-0">
        <p class="truncate text-label-md">{{ user?.name }}</p>
        <p class="truncate text-body-sm text-on-surface-variant">{{ user?.email }}</p>
      </div>
    </RouterLink>
  </aside>
</template>