<script setup>
import { ref } from 'vue'
import PageHeader from '@/components/transactions/PageHeader.vue'
import CardsCarousel from '@/components/dashboard/CardsCarousel.vue'
import WalletFormModal from '@/components/wallets/WalletFormModal.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { t } from '../composables/useI18n'

const open = ref(false)
const editing = ref(null)

const add = () => { editing.value = null; open.value = true }
const edit = (wallet) => { editing.value = wallet; open.value = true }
</script>

<template>
  <div class="space-y-gutter-mobile md:space-y-gutter">
    <div class="flex items-center justify-between gap-3">
      <PageHeader :title="t('nav.cards')" />
      <button
        class="flex items-center gap-1 rounded-full bg-secondary-container px-4 py-2 text-label-md text-on-secondary-container"
        @click="add"
      >
        <AppIcon name="add" /> {{ $t('common.add') }}
      </button>
    </div>

    <CardsCarousel :show-header="false" stacked editable @select="edit" />
    <WalletFormModal v-model="open" :wallet="editing" />
  </div>
</template>