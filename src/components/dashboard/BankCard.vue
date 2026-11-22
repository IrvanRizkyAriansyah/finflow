<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AmountText from '@/components/ui/AmountText.vue'

const props = defineProps({
  wallet: { type: Object, required: true },
  hidden: Boolean,
  interactive: Boolean, // true → dirender sebagai tombol dan memancarkan "select"
})
defineEmits(['select'])

const TYPES = {
  cash: { label: 'Tunai', icon: 'payments' },
  bank: { label: 'Rekening Bank', icon: 'account_balance' },
  debit: { label: 'Kartu Debit', icon: 'credit_card' },
  credit: { label: 'Kartu Kredit', icon: 'credit_card' },
  ewallet: { label: 'E-Wallet', icon: 'account_balance_wallet' },
}
const meta = computed(() => TYPES[props.wallet.type] ?? { label: props.wallet.type || 'Dompet', icon: 'account_balance_wallet' })
</script>

<template>
  <component
    :is="interactive ? 'button' : 'article'"
    :type="interactive ? 'button' : undefined"
    class="block min-w-[17rem] snap-start rounded-xl bg-tertiary-fixed p-5 text-left text-tertiary md:min-w-0"
    :class="interactive ? 'transition-transform active:scale-[0.99]' : ''"
    @click="interactive && $emit('select', wallet)"
  >
    <div class="flex items-center justify-between">
      <span class="text-label-md">{{ meta.label }}</span>
      <AppIcon :name="meta.icon" />
    </div>
    <p class="mt-6 text-body-sm opacity-80">{{ wallet.name }}</p>
    <p class="font-display text-headline-md">
      <AmountText :value="wallet.balance" :hidden="hidden" />
    </p>
  </component>
</template>