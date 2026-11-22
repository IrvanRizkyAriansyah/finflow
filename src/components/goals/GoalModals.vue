<script setup>
import { computed } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import GoalDetailPanel from './GoalDetailPanel.vue'
import GoalFormPanel from './GoalFormPanel.vue'
import GoalEntryPanel from './GoalEntryPanel.vue'
import { useGoalUi } from '@/composables/useGoalUi'
import { useTransactions } from '@/composables/useTransactions'

const { modal, back } = useGoalUi()
const { goalsWithProgress } = useTransactions()

// Tujuan terbaru (dengan progres) untuk panel detail dan setor/tarik
const goal = computed(() => {
  const id = modal.value?.id ?? modal.value?.goalId
  return goalsWithProgress.value.find((g) => g.id === id) ?? null
})

const title = computed(() => {
  const m = modal.value
  if (!m) return ''
  if (m.name === 'detail') return goal.value?.name ?? 'Tujuan'
  if (m.name === 'entry') return m.type === 'withdraw' ? 'Tarik Dana' : 'Setor Dana'
  return m.goal ? 'Ubah Tujuan' : 'Tujuan Baru'
})
</script>

<template>
  <BaseModal :model-value="!!modal" :title="title" @update:model-value="(v) => !v && back()">
    <template v-if="modal">
      <GoalDetailPanel v-if="modal.name === 'detail'" :key="modal.nonce" :goal="goal" />
      <GoalFormPanel v-else-if="modal.name === 'form'" :key="modal.nonce" :goal="modal.goal" />
      <GoalEntryPanel
        v-else-if="modal.name === 'entry' && goal"
        :key="modal.nonce" :goal="goal" :type="modal.type"
      />
    </template>
  </BaseModal>
</template>