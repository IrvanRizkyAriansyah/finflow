<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'
import AmountText from '@/components/ui/AmountText.vue'
import { useTransactions } from '@/composables/useTransactions'
import { useTransactionModal } from '@/composables/useTransactionModal'
import { formatDate } from '@/utils/formatDate'

defineProps({ items: { type: Array, default: () => [] } })
const { categoryMap } = useTransactions()
const { openEdit } = useTransactionModal()
</script>

<template>
  <p v-if="!items.length" class="py-10 text-center text-body-sm text-on-surface-variant">
    {{ $t('common.noExpensePeriod') }}
  </p>
  <ol v-else class="divide-y divide-outline-variant/40">
    <li v-for="(t, i) in items" :key="t.id">
      <button
        type="button" class="flex w-full items-center gap-3 rounded-lg px-1 py-2.5 text-left hover:bg-surface-container-low"
        @click="openEdit(t)"
      >
        <span class="w-5 shrink-0 text-center text-label-md text-on-surface-variant">{{ i + 1 }}</span>
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          :style="{ backgroundColor: (categoryMap.get(t.category_id)?.color || '#6B7280') + '1A', color: categoryMap.get(t.category_id)?.color || '#6B7280' }"
        >
          <AppIcon :name="categoryMap.get(t.category_id)?.icon || 'category'" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-body-md font-semibold">{{ t.note || categoryMap.get(t.category_id)?.name || $t('common.transaction') }}</span>
          <span class="block text-body-sm text-on-surface-variant">{{ formatDate(t.date) }}</span>
        </span>
        <AmountText class="text-body-md font-semibold" :value="t.amount" type="expense" />
      </button>
    </li>
  </ol>
</template>