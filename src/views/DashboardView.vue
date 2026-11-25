<script setup>
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import BalanceCard from '@/components/dashboard/BalanceCard.vue'
import CardsCarousel from '@/components/dashboard/CardsCarousel.vue'
import QuickActions from '@/components/dashboard/QuickActions.vue'
import QuickSendContacts from '@/components/dashboard/QuickSendContacts.vue'
import GoalsSection from '@/components/goals/GoalsSection.vue'
import ChartsSection from '@/components/charts/ChartsSection.vue'
import TransactionList from '@/components/transactions/TransactionList.vue'
import { useTransactions } from '@/composables/useTransactions'

const { sortedTransactions } = useTransactions()

import { ref } from 'vue'
import WalletFormModal from '@/components/wallets/WalletFormModal.vue'

const walletOpen = ref(false)
const walletEditing = ref(null)
const editWallet = (wallet) => { walletEditing.value = wallet; walletOpen.value = true }
</script>

<template>
  <div class="w-full min-w-0 space-y-gutter-mobile md:space-y-gutter">
    <DashboardHeader />

    <div class="grid w-full min-w-0 grid-cols-1 gap-gutter-mobile md:grid-cols-12 md:gap-gutter">

      <!-- Main Content -->
      <div class="min-w-0 space-y-gutter-mobile md:col-span-7 md:space-y-gutter">
        <BalanceCard />
        <CardsCarousel />
        <WalletFormModal v-model="walletOpen" :wallet="walletEditing" />
        <GoalsSection />
      </div>

      <!-- Sidebar -->
      <div class="min-w-0 space-y-gutter-mobile md:col-span-5 md:space-y-gutter">
        <QuickSendContacts />

        <section class="w-full min-w-0 rounded-xl bg-surface-container-lowest p-5 shadow-sm">
          <div class="mb-2 flex items-center justify-between">
            <h2 class="text-headline-sm">{{$t('dash.recent')}}</h2>
            <RouterLink to="/transactions" class="text-label-md text-primary">
              {{$t('common.viewAll')}}
            </RouterLink>
          </div>

          <TransactionList :items="sortedTransactions" :limit="5" />
        </section>
      </div>

    </div>

    <ChartsSection />
  </div>
</template>