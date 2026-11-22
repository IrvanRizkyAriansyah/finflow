<script setup>
import { computed } from 'vue'
import TransactionItem from './TransactionItem.vue'
import { useTransactions } from '@/composables/useTransactions'
import { useTransactionModal } from '@/composables/useTransactionModal'

const props = defineProps({ items: { type: Array, default: () => [] }, limit: Number })
const { categoryMap, pendingIds, isLoading } = useTransactions()
const { openEdit } = useTransactionModal()
const shown = computed(() => (props.limit ? props.items.slice(0, props.limit) : props.items))
</script>

<template>
  <div v-if="isLoading" class="space-y-3" aria-busy="true">
    <div v-for="n in 4" :key="n" class="h-14 animate-pulse rounded-lg bg-surface-container" />
  </div>
  <p v-else-if="!shown.length" class="py-8 text-center text-body-sm text-on-surface-variant">
    Belum ada transaksi.
  </p>
  <ul v-else class="divide-y divide-outline-variant/40">
    <TransactionItem
      v-for="tx in shown" :key="tx.id"
      :tx="tx" :category="categoryMap.get(tx.category_id)" :pending="pendingIds.has(tx.id)"
      @select="openEdit"
    />
  </ul>
</template>