<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppSidebar from './AppSidebar.vue'
import BottomNav from './BottomNav.vue'
import TransactionFormModal from '@/components/transactions/TransactionFormModal.vue'
import GoalModals from '@/components/goals/GoalModals.vue'
import { useGoogleAuth } from '@/composables/useGoogleAuth'
import { useTransactions } from '@/composables/useTransactions'
import { useTransactionModal } from '@/composables/useTransactionModal'
import { useOnlineStatus } from '@/composables/useOnlineStatus'

const route = useRoute()
const router = useRouter()
const isOnline = useOnlineStatus()
const { needsReauth, signIn } = useGoogleAuth()
const { load, error, pendingCount } = useTransactions()
const { open } = useTransactionModal()

onMounted(() => {
  if (route.query.add) {
    open()
    router.replace({ query: {} })
  }
  load()
})

async function reconnect() {
  try {
    await signIn()
    await load()
  } catch { /* pesan error ditangani useGoogleAuth */ }
}
</script>

<template>
  <div class="min-h-screen">
    <AppSidebar />

    <div class="md:pl-72">
      <div v-if="!isOnline" role="status" class="bg-inverse-surface px-4 py-2 text-center text-body-sm text-inverse-on-surface">
        {{ $t('app.offline') }}<template v-if="pendingCount"> · {{ $t('app.pendingSync', { n: pendingCount }) }}</template>
      </div>
      <div v-else-if="needsReauth" role="alert" class="flex items-center justify-center gap-3 bg-error-container px-4 py-2 text-body-sm text-on-error-container">
        {{ $t('auth.sessionExpired') }}
        <button class="font-semibold underline" @click="reconnect">{{ $t('auth.reconnect') }}</button>
      </div>
      <div v-else-if="error" role="alert" class="bg-error-container px-4 py-2 text-center text-body-sm text-on-error-container">
        {{ error }}
      </div>

      <main class="mx-auto max-w-6xl p-margin-mobile pb-safe-nav md:p-margin md:pb-margin">
        <slot />
      </main>
    </div>

    <BottomNav />
    <TransactionFormModal />
    <GoalModals />
  </div>
</template>