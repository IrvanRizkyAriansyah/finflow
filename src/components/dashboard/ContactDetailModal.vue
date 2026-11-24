<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { copyText } from '@/utils/clipboard'
import { accountTypeMeta } from '@/utils/accountTypes'

const props = defineProps({ modelValue: Boolean, contact: { type: Object, default: null } })
const emit = defineEmits(['update:modelValue', 'edit', 'record'])

const feedback = ref(null) // { index, ok }
let timer = null
const close = () => emit('update:modelValue', false)

// Tutup otomatis bila kontaknya hilang (mis. terhapus lewat sinkronisasi)
watch(() => props.contact, (c) => { if (!c && props.modelValue) close() })
watch(() => props.modelValue, () => { feedback.value = null })
onBeforeUnmount(() => clearTimeout(timer))

async function copy(account, index) {
  // Salin tanpa spasi/tanda hubung supaya langsung bisa ditempel di aplikasi bank
  const ok = await copyText(account.number.replace(/[\s-]/g, ''))
  feedback.value = { index, ok }
  clearTimeout(timer)
  timer = setTimeout(() => (feedback.value = null), 1800)
}
</script>

<template>
  <BaseModal :model-value="modelValue" :title="contact?.name || 'Kontak'" @update:model-value="(v) => !v && close()">
    <div v-if="contact" class="space-y-4">
      <p v-if="contact.note" class="text-body-sm text-on-surface-variant">{{ contact.note }}</p>

      <p
        v-if="!contact.accounts.length"
        class="rounded-lg bg-surface-container-low p-4 text-center text-body-sm text-on-surface-variant"
      >
        {{ $t('contact.noAccounts') }}.
      </p>

      <ul v-else class="space-y-3">
        <li
          v-for="(a, i) in contact.accounts" :key="i"
          class="flex items-center gap-3 rounded-lg bg-surface-container-low p-3"
        >
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tertiary-fixed text-tertiary">
            <AppIcon :name="accountTypeMeta(a.type).icon" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-label-sm text-on-surface-variant">{{ a.provider }} · {{ accountTypeMeta(a.type).labelKey }}</p>
            <p class="break-all font-display text-headline-sm tabular-nums">{{ a.number }}</p>
          </div>
          <button
            type="button"
            class="flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-label-md"
            :class="feedback?.index === i
              ? (feedback.ok ? 'bg-primary text-on-primary' : 'bg-error-container text-on-error-container')
              : 'bg-surface-container hover:bg-surface-container-high'"
            @click="copy(a, i)"
          >
            <AppIcon :name="feedback?.index === i && feedback.ok ? 'check' : 'content_copy'" />
            <span aria-live="polite">
              {{ feedback?.index === i ? (feedback.ok ? $t('common.copied') : $t('common.failed')) : $t('common.copy') }}
            </span>
          </button>
        </li>
      </ul>

      <div class="grid grid-cols-2 gap-3 pt-2">
        <button type="button" class="rounded-xl bg-surface-container py-3 text-label-md" @click="emit('edit')">
          {{ $t('common.edit') }}
        </button>
        <button
          type="button"
          class="rounded-xl bg-secondary-container py-3 text-label-md text-on-secondary-container"
          @click="emit('record')"
        >
          {{$t('contact.logExpense')}}
        </button>
      </div>
    </div>
  </BaseModal>
</template>