<script setup>
import { reactive, computed, watch, ref } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useTransactions } from '@/composables/useTransactions'

const props = defineProps({
  modelValue: Boolean,
  category: { type: Object, default: null },
  defaultType: { type: String, default: 'expense' },
})
const emit = defineEmits(['update:modelValue'])
const { categories, categoryUsage, addCategory, updateCategory, deleteCategory } = useTransactions()

const ICONS = [
  'restaurant', 'local_cafe', 'shopping_bag', 'directions_car', 'flight', 'home',
  'receipt_long', 'bolt', 'health_and_safety', 'school', 'movie', 'sports_esports',
  'pets', 'savings', 'payments', 'work', 'card_giftcard', 'trending_up', 'more_horiz', 'category',
]
const COLORS = ['#10412a', '#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#EAB308', '#EF4444', '#6B7280']

const form = reactive({ name: '', type: 'expense', icon: 'category', color: '#6B7280' })
const errorMsg = ref('')
const confirmingDelete = ref(false)

const isEdit = computed(() => !!props.category)
const usage = computed(() => (props.category ? categoryUsage.value.get(props.category.id) ?? 0 : 0))
const sameTypeCount = computed(() => categories.value.filter((c) => c.type === form.type).length)
const canDelete = computed(() => isEdit.value && usage.value === 0 && sameTypeCount.value > 1)
const close = () => emit('update:modelValue', false)

watch(() => props.modelValue, (open) => {
  if (!open) return
  const c = props.category
  Object.assign(form, c
    ? { name: c.name, type: c.type, icon: c.icon || 'category', color: c.color || '#6B7280' }
    : { name: '', type: props.defaultType, icon: 'category', color: '#6B7280' })
  errorMsg.value = ''
  confirmingDelete.value = false
})

function submit() {
  errorMsg.value = ''
  try {
    if (isEdit.value) updateCategory(props.category.id, form)
    else addCategory(form)
    close()
  } catch (e) {
    errorMsg.value = e.message
  }
}

function remove() {
  try {
    deleteCategory(props.category.id)
    close()
  } catch (e) {
    errorMsg.value = e.message
    confirmingDelete.value = false
  }
}
</script>

<template>
  <BaseModal
    :model-value="modelValue"
    :title="isEdit ? $t('common.edit')+' '+$t('common.category') : $t('common.add')+' '+$t('common.category')"
    @update:model-value="(v) => !v && close()"
  >
    <form class="space-y-4" @submit.prevent="submit">
      <div class="grid grid-cols-2 gap-1 rounded-lg bg-surface-container p-1" role="group" :aria-label="$t('cat.type')">
        <button
          type="button" :disabled="isEdit" class="rounded-md py-2 text-label-md disabled:cursor-not-allowed"
          :class="form.type === 'expense' ? 'bg-surface-container-lowest shadow-sm' : 'text-on-surface-variant'"
          @click="form.type = 'expense'"
        >{{ $t('common.expense') }}</button>
        <button
          type="button" :disabled="isEdit" class="rounded-md py-2 text-label-md disabled:cursor-not-allowed"
          :class="form.type === 'income' ? 'bg-surface-container-lowest shadow-sm' : 'text-on-surface-variant'"
          @click="form.type = 'income'"
        >{{ $t('common.income') }}</button>
      </div>

      <label class="block">
        <span class="text-label-md">{{ $t('common.name') }}</span>
        <input
          v-model="form.name" maxlength="40" :placeholder="$t('cat.placeholder')"
          class="mt-1 w-full rounded-lg border border-outline-variant bg-transparent px-4 py-3"
        />
      </label>

      <div>
        <span class="text-label-md">{{ $t('common.icon') }}</span>
        <div class="mt-2 grid grid-cols-5 gap-2">
          <button
            v-for="i in ICONS" :key="i" type="button" :aria-label="i" :aria-pressed="form.icon === i"
            class="flex h-11 items-center justify-center rounded-lg bg-surface-container"
            :class="form.icon === i ? 'ring-2 ring-primary' : ''"
            @click="form.icon = i"
          >
            <AppIcon :name="i" />
          </button>
        </div>
      </div>

      <div>
        <span class="text-label-md">{{ $t('common.color') }}</span>
        <div class="mt-2 flex flex-wrap gap-3">
          <button
            v-for="c in COLORS" :key="c" type="button" :aria-label="`Warna ${c}`" :aria-pressed="form.color === c"
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
        <p v-if="!canDelete" class="text-center text-body-sm text-on-surface-variant">
          <template v-if="usage">{{$t('cat.inUse', { n: usage })}}</template>
          <template v-else>{{$t('cat.minOne')}}</template>
        </p>
        <template v-else>
          <button
            v-if="!confirmingDelete" type="button"
            class="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-label-md text-error hover:bg-error-container/40"
            @click="confirmingDelete = true"
          >
            <AppIcon name="delete" /> {{$t('cat.delete')}}
          </button>
          <div v-else class="space-y-2">
            <p class="text-center text-body-sm">{{$t('cat.deleteConfirm')}}</p>
            <div class="grid grid-cols-2 gap-3">
              <button type="button" class="rounded-xl bg-surface-container py-3 text-label-md" @click="confirmingDelete = false">{{ $t('common.cancel') }}</button>
              <button type="button" class="rounded-xl bg-error py-3 text-label-md text-white" @click="remove">{{ $t('common.confirmDelete') }}</button>
            </div>
          </div>
        </template>
      </div>
    </form>
  </BaseModal>
</template>