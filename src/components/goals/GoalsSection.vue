<script setup>
import { computed } from 'vue'
import GoalCard from './GoalCard.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useTransactions } from '@/composables/useTransactions'
import { useGoalUi } from '@/composables/useGoalUi'

const { goalsWithProgress } = useTransactions()
const { openDetail, openForm } = useGoalUi()
const shown = computed(() => goalsWithProgress.value.slice(0, 3))
</script>

<template>
  <section>
    <div class="mb-3 flex items-center justify-between">
      <h2 class="text-headline-sm">Tabungan</h2>
      <RouterLink to="/goals" class="text-label-md text-primary">{{$t('common.viewAll')}}</RouterLink>
    </div>

    <button
      v-if="!goalsWithProgress.length" type="button"
      class="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-outline-variant p-4 text-left text-on-surface-variant"
      @click="openForm()"
    >
      <AppIcon name="savings" />
      <span class="text-body-sm">{{ $t('goal.sectionEmpty') }}</span>
    </button>

    <div v-else class="space-y-3">
      <GoalCard v-for="g in shown" :key="g.id" :goal="g" @select="openDetail(g.id)" />
    </div>
  </section>
</template>