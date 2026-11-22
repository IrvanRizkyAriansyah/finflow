<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'
import { useTransactionModal } from '@/composables/useTransactionModal'

const { open } = useTransactionModal()
</script>

<template>
  <div class="grid grid-cols-2 gap-3">
    <button
      class="flex items-center justify-center gap-2 rounded-xl bg-secondary-container py-4 font-semibold text-on-secondary-container"
      @click="open({ type: 'income' })"
    >
      <AppIcon name="add_card" /> Top Up
    </button>
    <button
      class="flex items-center justify-center gap-2 rounded-xl bg-surface-container-lowest py-4 font-semibold shadow-sm"
      @click="open({ type: 'expense' })"
    >
      <AppIcon name="send" /> Send
    </button>
  </div>
</template>