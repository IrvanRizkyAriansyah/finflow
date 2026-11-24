<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'
import AmountText from '@/components/ui/AmountText.vue'
import { useTransactions } from '@/composables/useTransactions'
import { useBalanceVisibility } from '@/composables/useBalanceVisibility'

const { totalBalance, totalSaved, availableBalance, isLoading } = useTransactions()
const { hidden, toggle } = useBalanceVisibility()
</script>

<template>
  <section class="rounded-xl bg-primary p-6 text-on-primary shadow-sm">
    <div class="flex items-center justify-between">
      <p class="text-label-md text-on-primary-container">{{$t('dash.totalBalance')}}</p>
      <button
        class="rounded-full p-2 hover:bg-white/10 flex"
        :aria-label="hidden ? 'Tampilkan saldo' : 'Sembunyikan saldo'"
        :aria-pressed="hidden"
        @click="toggle"
      >
        <AppIcon :name="hidden ? 'visibility_off' : 'visibility'" />
      </button>
    </div>
    <div v-if="isLoading" class="mt-3 h-10 w-48 animate-pulse rounded bg-white/20" />
    <template v-else>
      <p class="mt-2 font-display text-numeric-stat">
        <AmountText :value="totalBalance" :hidden="hidden" />
      </p>
      <p v-if="totalSaved > 0" class="mt-2 text-body-sm text-on-primary-container">
        {{$t('common.available')}} <AmountText :value="availableBalance" :hidden="hidden" />
        · {{ $t('goal.savings') }} <AmountText :value="totalSaved" :hidden="hidden" />
      </p>
    </template>
  </section>
</template>