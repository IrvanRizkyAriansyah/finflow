<script setup>
import BankCard from './BankCard.vue'
import { useTransactions } from '@/composables/useTransactions'
import { useBalanceVisibility } from '@/composables/useBalanceVisibility'

defineProps({
  showHeader: { type: Boolean, default: true },
  stacked: Boolean,
  editable: Boolean, // kartu bisa diklik untuk diubah
})
defineEmits(['select'])

const { walletsWithBalance } = useTransactions()
const { hidden } = useBalanceVisibility()
</script>

<template>
  <section>
    <div v-if="showHeader" class="mb-3 flex items-center justify-between">
      <h2 class="text-headline-sm">Cards</h2>
      <RouterLink to="/wallets" class="text-label-md text-primary">Lihat semua</RouterLink>
    </div>

    <p v-if="!walletsWithBalance.length" class="rounded-xl bg-surface-container-low p-4 text-body-sm text-on-surface-variant">
      Belum ada dompet.
    </p>
    <div
      v-else
      :class="stacked
        ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3'
        : 'hide-scrollbar -mx-margin-mobile flex snap-x snap-mandatory gap-4 overflow-x-auto px-margin-mobile md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0'"
    >
      <BankCard
        v-for="w in walletsWithBalance" :key="w.id"
        :wallet="w" :hidden="hidden" :interactive="editable"
        @select="$emit('select', $event)"
      />
    </div>
  </section>
</template>