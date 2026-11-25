<script setup>
import { ref, computed, nextTick } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AvatarImage from '@/components/ui/AvatarImage.vue'
import ContactDetailModal from './ContactDetailModal.vue'
import ContactFormModal from './ContactFormModal.vue'
import { useTransactions } from '@/composables/useTransactions'
import { useTransactionModal } from '@/composables/useTransactionModal'
import { t } from '../../composables/useI18n.js'

const { contacts } = useTransactions()
const { open: openTransaction } = useTransactionModal()

const detailOpen = ref(false)
const formOpen = ref(false)
const selectedId = ref(null)
const editing = ref(null)

// Dicari ulang dari daftar, jadi detail selalu menampilkan data terbaru
const selected = computed(() => contacts.value.find((c) => c.id === selectedId.value) ?? null)

function openDetail(c) {
  selectedId.value = c.id
  detailOpen.value = true
}

function add() {
  editing.value = null
  formOpen.value = true
}

async function edit() {
  editing.value = selected.value
  detailOpen.value = false
  await nextTick() // tunggu modal detail tertutup sebelum membuka form
  formOpen.value = true
}

async function record() {
  const c = selected.value
  detailOpen.value = false
  await nextTick()
  openTransaction({ type: 'expense', note: t('contact.transferTo', { name: c.name }), category_id: 'cat-other' })
}
</script>

<template>
  <section>
    <h2 class="mb-3 text-headline-sm">{{$t('dash.quickSend')}}</h2>

    <div class="hide-scrollbar flex gap-4 overflow-x-auto pb-1">
      <button type="button" class="flex w-16 shrink-0 flex-col items-center gap-1" @click="add">
        <span class="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-outline text-on-surface-variant">
          <AppIcon name="add" />
        </span>
        <span class="text-label-sm">{{ $t('common.add') }}</span>
      </button>

      <button
        v-for="c in contacts" :key="c.id" type="button"
        class="flex w-16 shrink-0 flex-col items-center gap-1" @click="openDetail(c)"
      >
        <AvatarImage :name="c.name" size="h-14 w-14" />
        <span class="w-full truncate text-center text-label-sm">{{ c.name }}</span>
      </button>
    </div>

    <p v-if="!contacts.length" class="mt-2 text-body-sm text-on-surface-variant">
      {{ $t('contact.emptyHint') }}
    </p>

    <ContactDetailModal v-model="detailOpen" :contact="selected" @edit="edit" @record="record" />
    <ContactFormModal v-model="formOpen" :contact="editing" />
  </section>
</template>