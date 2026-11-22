<script setup>
import { ref, computed } from 'vue'
import PageHeader from '@/components/transactions/PageHeader.vue'
import IncomeSpendingCard from '@/components/transactions/IncomeSpendingCard.vue'
import TransactionList from '@/components/transactions/TransactionList.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useTransactions } from '@/composables/useTransactions'

const { monthlyTransactions, monthLabel, shiftMonth } = useTransactions()

const FILTERS = [
  { id: 'all', label: 'Semua' },
  { id: 'income', label: 'Pemasukan' },
  { id: 'expense', label: 'Pengeluaran' },
]
const filter = ref('all')
const items = computed(() =>
  filter.value === 'all' ? monthlyTransactions.value : monthlyTransactions.value.filter((t) => t.type === filter.value),
)
</script>

<template>
  <div class="space-y-gutter-mobile md:space-y-gutter">
    <PageHeader title="Transactions" />

    <div class="grid gap-gutter-mobile md:grid-cols-12 md:gap-gutter">
      <div class="md:col-span-5">
        <IncomeSpendingCard />
      </div>

      <section class="rounded-xl bg-surface-container-lowest p-5 shadow-sm md:col-span-7">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-headline-sm">Recent Transactions</h2>
          <div class="flex items-center gap-1">
            <button class="rounded-full p-1 hover:bg-surface-container flex" aria-label="Bulan sebelumnya" @click="shiftMonth(-1)">
              <AppIcon name="chevron_left" />
            </button>
            <span class="min-w-28 text-center text-label-md capitalize">{{ monthLabel }}</span>
            <button class="rounded-full p-1 hover:bg-surface-container flex" aria-label="Bulan berikutnya" @click="shiftMonth(1)">
              <AppIcon name="chevron_right" />
            </button>
          </div>
        </div>

        <div class="mb-2 flex gap-2">
          <button
            v-for="f in FILTERS" :key="f.id"
            class="rounded-full px-4 py-1.5 text-label-sm"
            :class="filter === f.id ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'"
            @click="filter = f.id"
          >{{ f.label }}</button>
        </div>

        <TransactionList :items="items" />
      </section>
    </div>
  </div>
</template>