<script setup>
import { computed, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AmountText from '@/components/ui/AmountText.vue'
import { useTransactions } from '@/composables/useTransactions'
import { useGoalUi } from '@/composables/useGoalUi'
import { formatDate } from '@/utils/formatDate'
import { formatCurrency } from '@/utils/formatCurrency'

const props = defineProps({ goal: { type: Object, default: null } })
const { goalEntriesMap, deleteGoalEntry } = useTransactions()
const { openEntry, openForm, close } = useGoalUi()

const LIMIT = 20
const allEntries = computed(() => goalEntriesMap.value.get(props.goal?.id) ?? [])
const entries = computed(() => allEntries.value.slice(0, LIMIT))
const color = computed(() => props.goal?.color || '#10412a')
const percent = computed(() => Math.round((props.goal?.progress ?? 0) * 100))

const confirmId = ref(null)
const errorMsg = ref('')

function removeEntry(id) {
  errorMsg.value = ''
  try {
    deleteGoalEntry(id)
  } catch (e) {
    errorMsg.value = e.message
  }
  confirmId.value = null
}
</script>

<template>
  <div v-if="!goal" class="space-y-4 py-4 text-center">
    <p class="text-body-sm text-on-surface-variant">Tujuan ini sudah tidak ada.</p>
    <button class="rounded-xl bg-surface-container px-6 py-3 text-label-md" @click="close">{{ $t('common.close') }}</button>
  </div>

  <div v-else class="space-y-5">
    <div class="flex items-center gap-3">
      <span
        class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
        :style="{ backgroundColor: color + '1A', color }"
      >
        <AppIcon :name="goal.icon || 'savings'" />
      </span>
      <div class="min-w-0">
        <p class="font-display text-headline-md"><AmountText :value="goal.saved" /></p>
        <p class="text-body-sm text-on-surface-variant">{{ $t('common.of') }} <AmountText :value="goal.target_amount" /></p>
      </div>
    </div>

    <div>
      <div
        class="h-3 overflow-hidden rounded-full bg-surface-container"
        role="progressbar" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="percent"
      >
        <div class="h-full rounded-full transition-all" :style="{ width: percent + '%', backgroundColor: color }" />
      </div>
      <div class="mt-1 flex justify-between text-body-sm text-on-surface-variant">
        <span>{{ percent }}%</span>
        <span v-if="goal.reached" class="font-semibold text-primary">Target tercapai</span>
        <span v-else>Sisa <AmountText :value="goal.remaining" /></span>
      </div>
    </div>

    <div v-if="goal.deadline" class="rounded-lg bg-surface-container-low p-3 text-body-sm">
      <p>Target tanggal: <strong>{{ formatDate(goal.deadline) }}</strong></p>
      <p v-if="goal.monthlyNeeded" class="mt-1">
        Perlu menabung ±<strong>{{ formatCurrency(goal.monthlyNeeded) }}</strong> per bulan.
      </p>
      <p v-else-if="goal.overdue" class="mt-1 text-error">Tenggat sudah lewat dan target belum tercapai.</p>
    </div>

    <div class="grid grid-cols-3 gap-2">
      <button
        class="rounded-xl bg-primary py-3 text-label-md text-on-primary"
        @click="openEntry(goal.id, 'deposit')"
      >{{ $t('goal.deposit') }}</button>
      <button
        class="rounded-xl bg-surface-container py-3 text-label-md disabled:opacity-40"
        :disabled="goal.saved <= 0" @click="openEntry(goal.id, 'withdraw')"
      >{{ $t('goal.withdraw') }}</button>
      <button class="rounded-xl bg-surface-container py-3 text-label-md" @click="openForm(goal)">{{ $t('common.edit') }}</button>
    </div>

    <section>
      <h3 class="mb-1 text-label-md">{{ $t('goal.history') }}</h3>
      <p v-if="!entries.length" class="py-4 text-center text-body-sm text-on-surface-variant">
        {{ $t('goal.noEntries') }}
      </p>
      <ul v-else class="divide-y divide-outline-variant/40">
        <li v-for="e in entries" :key="e.id" class="flex items-center gap-3 py-2">
          <span
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            :class="e.type === 'withdraw' ? 'bg-error-container text-on-error-container' : 'bg-secondary-container text-on-secondary-container'"
          >
            <AppIcon :name="e.type === 'withdraw' ? 'arrow_downward' : 'arrow_upward'" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-body-md">{{ e.note || (e.type === 'withdraw' ? 'Penarikan' : 'Setoran') }}</p>
            <p class="text-body-sm text-on-surface-variant">{{ formatDate(e.date) }}</p>
          </div>

          <template v-if="confirmId === e.id">
            <button class="rounded-lg bg-error px-3 py-1 text-label-sm text-white" @click="removeEntry(e.id)">Hapus</button>
            <button class="rounded-lg bg-surface-container px-3 py-1 text-label-sm" @click="confirmId = null">{{ $t('common.cancel') }}</button>
          </template>
          <template v-else>
            <AmountText
              class="text-body-md font-semibold" :value="e.amount"
              :type="e.type === 'withdraw' ? 'expense' : 'income'"
            />
            <button
              class="rounded-full p-1 text-on-surface-variant hover:bg-surface-container"
              aria-label="Hapus riwayat" @click="confirmId = e.id; errorMsg = ''"
            >
              <AppIcon name="delete" />
            </button>
          </template>
        </li>
      </ul>
      <p v-if="allEntries.length > LIMIT" class="mt-2 text-center text-body-sm text-on-surface-variant">
        Menampilkan {{ LIMIT }} terbaru dari {{ allEntries.length }}.
      </p>
      <p v-if="errorMsg" role="alert" class="mt-2 text-body-sm text-error">{{ errorMsg }}</p>
    </section>
  </div>
</template>