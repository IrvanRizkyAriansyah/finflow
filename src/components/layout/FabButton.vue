<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'
import { useTransactionModal } from '@/composables/useTransactionModal'

const { open } = useTransactionModal()
</script>

<template>
  <button
    class="flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container shadow-lg ring-4 ring-surface transition-transform active:scale-95"
    :aria-label="$t('tx.add')"
    @click="open()"
  >
    <AppIcon name="add" />
  </button>
</template>