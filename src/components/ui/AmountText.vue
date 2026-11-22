<script setup>
import { computed } from 'vue'
import { formatCurrency, formatSignedCurrency } from '@/utils/formatCurrency'

const props = defineProps({
  value: { type: Number, default: 0 },
  type: { type: String, default: null }, // 'income' | 'expense' | null
  hidden: Boolean,
})

const text = computed(() => {
  if (props.hidden) return 'Rp ••••••'
  return props.type ? formatSignedCurrency(props.value, props.type) : formatCurrency(props.value)
})
const color = computed(() =>
  props.type === 'income' ? 'text-primary' : props.type === 'expense' ? 'text-error' : '',
)
</script>

<template>
  <span :class="color" class="tabular-nums">{{ text }}</span>
</template>