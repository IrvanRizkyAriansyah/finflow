<script setup>
import { reactive, computed, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AmountText from '@/components/ui/AmountText.vue'
import { useTransactions } from '@/composables/useTransactions'
import { useGoalUi } from '@/composables/useGoalUi'
import { GOAL_ICONS, GOAL_COLORS, GOAL_PRESETS } from '@/utils/goalPresets'
import { todayStr } from '@/utils/formatDate'

const props = defineProps({ goal: { type: Object, default: null } })
const { goalsWithProgress, addGoal, updateGoal, deleteGoal } = useTransactions()
const { back, close } = useGoalUi()

const isEdit = computed(() => !!props.goal)
const g = props.goal
const form = reactive({
  name: g?.name ?? '',
  targetText: g ? Number(g.target_amount).toLocaleString('id-ID') : '',
  deadline: g?.deadline ?? '',
  icon: g?.icon || 'savings',
  color: g?.color || '#10412a',
})
const errorMsg = ref('')
const confirmingDelete = ref(false)

const target = computed(() => Number(form.targetText.replace(/\D/g, '')) || 0)
const saved = computed(() => goalsWithProgress.value.find((x) => x.id === props.goal?.id)?.saved ?? 0)

function onTargetInput(e) {
  const digits = e.target.value.replace(/\D/g, '')
  const formatted = digits
    ? Number(digits).toLocaleString("id-ID")
    : "";
  form.targetText = formatted;
  e.target.value = formatted;
}
const applyPreset = (p) => Object.assign(form, { name: p.name, icon: p.icon, color: p.color })

function submit() {
  errorMsg.value = ''
  try {
    const data = { name: form.name, target_amount: target.value, deadline: form.deadline, icon: form.icon, color: form.color }
    if (isEdit.value) updateGoal(props.goal.id, data)
    else addGoal(data)
    back()
  } catch (e) {
    errorMsg.value = e.message
  }
}

function remove() {
  deleteGoal(props.goal.id)
  close() // tujuan sudah tidak ada, jadi tidak kembali ke detail
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
    <div v-if="!isEdit">
      <span class="text-label-md">Pilihan cepat</span>
      <div class="mt-2 flex flex-wrap gap-2">
        <button
          v-for="p in GOAL_PRESETS" :key="p.name" type="button"
          class="rounded-full bg-surface-container px-3 py-1.5 text-label-sm"
          @click="applyPreset(p)"
        >{{ p.name }}</button>
      </div>
    </div>

    <label class="block">
      <span class="text-label-md">Nama tujuan</span>
      <input
        v-model="form.name" maxlength="40" placeholder="mis. Dana Darurat"
        class="mt-1 w-full rounded-lg border border-outline-variant bg-transparent px-4 py-3"
      />
    </label>

    <label class="block">
      <span class="text-label-md">Target</span>
      <div class="mt-1 flex items-center rounded-lg border border-outline-variant px-4 focus-within:border-primary">
        <span class="text-on-surface-variant">Rp</span>
        <input
          :value="form.targetText" inputmode="numeric" placeholder="0" autocomplete="off"
          class="w-full bg-transparent px-2 py-3 font-display text-headline-sm outline-none"
          @input="onTargetInput"
        />
      </div>
    </label>

    <label class="block">
      <span class="text-label-md">Target tanggal ({{$t('common.optional')}})</span>
      <input
        v-model="form.deadline" type="date" :min="isEdit ? undefined : todayStr()"
        class="mt-1 w-full rounded-lg border border-outline-variant bg-transparent px-4 py-3"
      />
    </label>

    <div>
      <span class="text-label-md">Ikon</span>
      <div class="mt-2 grid grid-cols-5 gap-2">
        <button
          v-for="i in GOAL_ICONS" :key="i" type="button" :aria-label="i" :aria-pressed="form.icon === i"
          class="flex h-11 items-center justify-center rounded-lg bg-surface-container"
          :class="form.icon === i ? 'ring-2 ring-primary' : ''"
          @click="form.icon = i"
        ><AppIcon :name="i" /></button>
      </div>
    </div>

    <div>
      <span class="text-label-md">Warna</span>
      <div class="mt-2 flex flex-wrap gap-3">
        <button
          v-for="c in GOAL_COLORS" :key="c" type="button" :aria-label="`Warna ${c}`" :aria-pressed="form.color === c"
          class="h-8 w-8 rounded-full"
          :class="form.color === c ? 'ring-2 ring-primary ring-offset-2' : ''"
          :style="{ backgroundColor: c }"
          @click="form.color = c"
        />
      </div>
    </div>

    <p v-if="errorMsg" role="alert" class="text-body-sm text-error">{{ errorMsg }}</p>

    <button type="submit" class="w-full rounded-xl bg-primary py-4 font-semibold text-on-primary">
      {{ isEdit ? $t('common.saveChanges') : $t('common.save') }}
    </button>

    <div v-if="isEdit" class="border-t border-outline-variant/40 pt-4">
      <button
        v-if="!confirmingDelete" type="button"
        class="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-label-md text-error hover:bg-error-container/40"
        @click="confirmingDelete = true"
      >
        <AppIcon name="delete" /> Hapus tujuan
      </button>
      <div v-else class="space-y-2">
        <p class="text-center text-body-sm">
          Hapus tujuan ini?
          <template v-if="saved > 0">Dana <AmountText :value="saved" /> akan kembali ke Saldo tersedia.</template>
        </p>
        <div class="grid grid-cols-2 gap-3">
          <button type="button" class="rounded-xl bg-surface-container py-3 text-label-md" @click="confirmingDelete = false">{{ $t('common.cancel') }}</button>
          <button type="button" class="rounded-xl bg-error py-3 text-label-md text-white" @click="remove">{{ $t('common.confirmDelete') }}</button>
        </div>
      </div>
    </div>
  </form>
</template>