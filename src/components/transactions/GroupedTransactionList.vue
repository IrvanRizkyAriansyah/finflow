<script setup>
import { computed, ref, watch } from 'vue'
import TransactionItem from './TransactionItem.vue'
import AmountText from '@/components/ui/AmountText.vue'
import { useTransactions } from '@/composables/useTransactions'
import { useTransactionModal } from '@/composables/useTransactionModal'
import { todayStr } from '@/utils/formatDate'
import { addDays, parseDate } from '@/utils/dateRange'
import { t } from '../../composables/useI18n.js'

const props = defineProps({
  items: { type: Array, default: () => [] },
  resetKey: { type: String, default: '' }, // berubah → kembali ke halaman pertama
})
const { categoryMap, pendingIds, isLoading } = useTransactions()
const { openEdit } = useTransactionModal()

const PAGE = 40
const visible = ref(PAGE)
watch(() => props.resetKey, () => { visible.value = PAGE })

// Total bersih per tanggal dari seluruh item, bukan hanya yang sedang ditampilkan
const netByDate = computed(() => {
  const m = new Map()
  for (const t of props.items) m.set(t.date, (m.get(t.date) ?? 0) + (t.type === 'income' ? t.amount : -t.amount))
  return m
})

const groups = computed(() => {
  const out = []
  let cur = null
  for (const t of props.items.slice(0, visible.value)) {
    if (!cur || cur.date !== t.date) {
      cur = { date: t.date, items: [] }
      out.push(cur)
    }
    cur.items.push(t)
  }
  return out
})

function dayLabel(date) {
  const today = todayStr()
  if (date === today) return t('common.today')
  if (date === addDays(today, -1)) return t('common.yesterday')
  return parseDate(date).dateLocale()
}
</script>

<template>
  <div v-if="isLoading" class="space-y-3" aria-busy="true">
    <div v-for="n in 4" :key="n" class="h-14 animate-pulse rounded-lg bg-surface-container" />
  </div>

  <p v-else-if="!items.length" class="py-8 text-center text-body-sm text-on-surface-variant">
    {{ $t('common.noTxPeriod')}}
  </p>

  <div v-else class="space-y-4">
    <section v-for="g in groups" :key="g.date">
      <div class="flex items-center justify-between py-1 text-label-md text-on-surface-variant">
        <h3>{{ dayLabel(g.date) }}</h3>
        <AmountText :value="Math.abs(netByDate.get(g.date) ?? 0)" :type="(netByDate.get(g.date) ?? 0) >= 0 ? 'income' : 'expense'" />
      </div>
      <ul class="divide-y divide-outline-variant/40">
        <TransactionItem
          v-for="tx in g.items" :key="tx.id"
          :tx="tx" :category="categoryMap.get(tx.category_id)" :pending="pendingIds.has(tx.id)"
          @select="openEdit"
        />
      </ul>
    </section>

    <button
      v-if="items.length > visible" type="button"
      class="w-full rounded-xl bg-surface-container py-3 text-label-md"
      @click="visible += PAGE"
    >{{ $t('common.showMore', { n: items.length - visible }) }}</button>
  </div>
</template>