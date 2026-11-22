<script setup>
import { reactive, computed, ref } from 'vue'
import AmountText from '@/components/ui/AmountText.vue'
import { useTransactions } from '@/composables/useTransactions'
import { useGoalUi } from '@/composables/useGoalUi'
import { todayStr } from '@/utils/formatDate'

const props = defineProps({ goal: { type: Object, required: true }, type: { type: String, default: 'deposit' } })
const { availableBalance, addGoalEntry } = useTransactions()
const { back } = useGoalUi()

const isDeposit = computed(() => props.type !== 'withdraw')
const form = reactive({ amountText: '', date: todayStr(), note: '' })
const errorMsg = ref('')

const amount = computed(() => Number(form.amountText.replace(/\D/g, '')) || 0)

// Batas yang berlaku + isian cepat
const limit = computed(() => Math.max(0, isDeposit.value ? availableBalance.value : props.goal.saved))
const quick = computed(() =>
  isDeposit.value
    ? { label: 'Sisa target', value: Math.min(props.goal.remaining, limit.value) }
    : { label: 'Semua', value: limit.value },
)

const setAmount = (n) => { form.amountText = n > 0 ? Number(n).toLocaleString('id-ID') : '' }
function onAmountInput(e) {
  const digits = e.target.value.replace(/\D/g, '')
  form.amountText = digits ? Number(digits).toLocaleString('id-ID') : ''
}

function submit() {
  errorMsg.value = ''
  try {
    addGoalEntry({
      goal_id: props.goal.id,
      type: props.type,
      amount: amount.value,
      date: form.date,
      note: form.note,
    })
    back()
  } catch (e) {
    errorMsg.value = e.message
  }
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
    <p class="rounded-lg bg-surface-container-low p-3 text-body-sm">
      <template v-if="isDeposit">Saldo tersedia: <strong><AmountText :value="Math.max(0, availableBalance)" /></strong></template>
      <template v-else>Tersimpan di tujuan ini: <strong><AmountText :value="Math.max(0, goal.saved)" /></strong></template>
    </p>

    <label class="block">
      <span class="text-label-md">Nominal</span>
      <div class="mt-1 flex items-center rounded-lg border border-outline-variant px-4 focus-within:border-primary">
        <span class="text-on-surface-variant">Rp</span>
        <input
          :value="form.amountText" inputmode="numeric" placeholder="0" autocomplete="off"
          class="w-full bg-transparent px-2 py-3 font-display text-headline-sm outline-none"
          @input="onAmountInput"
        />
        <button
          v-if="quick.value > 0" type="button"
          class="shrink-0 rounded-full bg-surface-container px-3 py-1 text-label-sm"
          @click="setAmount(quick.value)"
        >{{ quick.label }}</button>
      </div>
    </label>

    <div class="grid grid-cols-2 gap-3">
      <label class="block">
        <span class="text-label-md">Tanggal</span>
        <input v-model="form.date" type="date" class="mt-1 w-full rounded-lg border border-outline-variant bg-transparent px-4 py-3" />
      </label>
      <label class="block">
        <span class="text-label-md">Catatan</span>
        <input v-model="form.note" maxlength="80" placeholder="Opsional" class="mt-1 w-full rounded-lg border border-outline-variant bg-transparent px-4 py-3" />
      </label>
    </div>

    <p v-if="errorMsg" role="alert" class="text-body-sm text-error">{{ errorMsg }}</p>

    <div class="grid grid-cols-2 gap-3">
      <button type="button" class="rounded-xl bg-surface-container py-4 font-semibold" @click="back">Batal</button>
      <button type="submit" class="rounded-xl bg-primary py-4 font-semibold text-on-primary">
        {{ isDeposit ? 'Setor' : 'Tarik' }}
      </button>
    </div>
  </form>
</template>