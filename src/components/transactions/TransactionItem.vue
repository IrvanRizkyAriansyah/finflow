<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'
import AmountText from '@/components/ui/AmountText.vue'
import { formatDate } from '@/utils/formatDate'

defineProps({
  tx: { type: Object, required: true },
  category: { type: Object, default: null },
  pending: Boolean,
})
defineEmits(['select'])
</script>

<template>
  <li>
    <button
      type="button"
      class="flex w-full items-center gap-3 rounded-lg px-1 py-3 text-left transition-colors hover:bg-surface-container-low"
      :aria-label="`Ubah transaksi ${tx.note || category?.name || ''}`"
      @click="$emit('select', tx)"
    >
      <span
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
        :style="{ backgroundColor: (category?.color || '#6B7280') + '1A', color: category?.color || '#6B7280' }"
      >
        <AppIcon :name="category?.icon || 'category'" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="truncate text-body-md font-semibold">{{ tx.note || category?.name || $t('common.transaction') }}</p>
        <p class="flex items-center gap-1 text-body-sm text-on-surface-variant">
          {{ formatDate(tx.date) }}
          <span v-if="pending" class="flex items-center gap-0.5" :title="$t('tx.pending')">
            <AppIcon name="cloud_off" /> <span class="sr-only">{{$t('tx.pending')}}</span>
          </span>
        </p>
      </div>
      <AmountText class="text-body-md font-semibold" :value="tx.amount" :type="tx.type" />
    </button>
  </li>
</template>