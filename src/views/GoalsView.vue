<script setup>
import PageHeader from '@/components/transactions/PageHeader.vue'
import GoalCard from '@/components/goals/GoalCard.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AmountText from '@/components/ui/AmountText.vue'
import { useTransactions } from '@/composables/useTransactions'
import { useGoalUi } from '@/composables/useGoalUi'
import { useBalanceVisibility } from '@/composables/useBalanceVisibility'

const { goalsWithProgress, totalSaved, availableBalance } = useTransactions()
const { openDetail, openForm } = useGoalUi()
const { hidden } = useBalanceVisibility()
</script>

<template>
  <div class="space-y-gutter-mobile md:space-y-gutter">
    <div class="flex items-center justify-between gap-3">
      <PageHeader title="Tabungan" />
      <button
        class="flex items-center gap-1 rounded-full bg-secondary-container px-4 py-2 text-label-md text-on-secondary-container"
        @click="openForm()"
      >
        <AppIcon name="add" /> Tujuan
      </button>
    </div>

    <section class="grid grid-cols-2 gap-3 rounded-xl bg-primary p-5 text-on-primary">
      <div>
        <p class="text-body-sm text-on-primary-container">{{$t('goal.totalSaved')}}</p>
        <p class="font-display text-headline-sm"><AmountText :value="totalSaved" :hidden="hidden" /></p>
      </div>
      <div>
        <p class="text-body-sm text-on-primary-container">{{$t('goal.availableBalance')}}</p>
        <p class="font-display text-headline-sm"><AmountText :value="availableBalance" :hidden="hidden" /></p>
      </div>
    </section>

    <p
      v-if="!goalsWithProgress.length"
      class="rounded-xl bg-surface-container-low p-6 text-center text-body-sm text-on-surface-variant"
    >
      {{$t('goal.emptyBefore')}} <strong>{{ $t('goal.addShort') }}</strong> {{$t('goal.emptyAfter')}}
    </p>
    <div v-else class="grid gap-3 md:grid-cols-2">
      <GoalCard v-for="g in goalsWithProgress" :key="g.id" :goal="g" @select="openDetail(g.id)" />
    </div>
  </div>
</template>