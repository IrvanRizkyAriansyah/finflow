<script setup>
import { ref, computed } from 'vue'
import PageHeader from '@/components/transactions/PageHeader.vue'
import CategoryFormModal from '@/components/categories/CategoryFormModal.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useTransactions } from '@/composables/useTransactions'

const { categories, categoryUsage } = useTransactions()

const tab = ref('expense')
const open = ref(false)
const editing = ref(null)

const items = computed(() => categories.value.filter((c) => c.type === tab.value))
const add = () => { editing.value = null; open.value = true }
const edit = (c) => { editing.value = c; open.value = true }
</script>

<template>
  <div class="mx-auto max-w-xl space-y-gutter-mobile">
    <div class="flex items-center justify-between gap-3">
      <PageHeader title="Kategori" />
      <button
        class="flex items-center gap-1 rounded-full bg-secondary-container px-4 py-2 text-label-md text-on-secondary-container"
        @click="add"
      >
        <AppIcon name="add" /> Tambah
      </button>
    </div>

    <div class="grid grid-cols-2 gap-1 rounded-lg bg-surface-container p-1" role="group" aria-label="Tipe kategori">
      <button
        class="rounded-md py-2 text-label-md"
        :class="tab === 'expense' ? 'bg-surface-container-lowest shadow-sm' : 'text-on-surface-variant'"
        @click="tab = 'expense'"
      >Pengeluaran</button>
      <button
        class="rounded-md py-2 text-label-md"
        :class="tab === 'income' ? 'bg-surface-container-lowest shadow-sm' : 'text-on-surface-variant'"
        @click="tab = 'income'"
      >Pemasukan</button>
    </div>

    <section class="rounded-xl bg-surface-container-lowest p-3 shadow-sm">
      <p v-if="!items.length" class="py-8 text-center text-body-sm text-on-surface-variant">Belum ada kategori.</p>
      <ul v-else class="divide-y divide-outline-variant/40">
        <li v-for="c in items" :key="c.id">
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left hover:bg-surface-container-low"
            @click="edit(c)"
          >
            <span
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              :style="{ backgroundColor: (c.color || '#6B7280') + '1A', color: c.color || '#6B7280' }"
            >
              <AppIcon :name="c.icon || 'category'" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-body-md font-semibold">{{ c.name }}</span>
              <span class="block text-body-sm text-on-surface-variant">{{ categoryUsage.get(c.id) ?? 0 }} transaksi</span>
            </span>
            <AppIcon name="chevron_right" />
          </button>
        </li>
      </ul>
    </section>

    <CategoryFormModal v-model="open" :category="editing" :default-type="tab" />
  </div>
</template>