<script setup>
import MiniBarChart from './MiniBarChart.vue'
import AmountText from '@/components/ui/AmountText.vue'
import { useTransactions } from '@/composables/useTransactions'

const { monthIncome, monthSpending, last7Days, monthLabel } = useTransactions()
</script>

<template>
  <section class="rounded-xl bg-secondary-container p-6 text-on-secondary-container">
    <p class="text-label-sm capitalize opacity-80">{{ monthLabel }}</p>
    <div class="mt-3 grid grid-cols-2 gap-4">
      <div>
        <p class="text-body-sm">Total Income</p>
        <p class="font-display text-headline-sm"><AmountText :value="monthIncome" /></p>
      </div>
      <div>
        <p class="text-body-sm">Total Spendings</p>
        <p class="font-display text-headline-sm"><AmountText :value="monthSpending" /></p>
      </div>
    </div>
    <div class="mt-6">
      <MiniBarChart :series="last7Days" />
      <p class="mt-2 text-center text-label-sm opacity-70">7 hari terakhir · terang: pemasukan, gelap: pengeluaran</p>
    </div>
  </section>
</template>