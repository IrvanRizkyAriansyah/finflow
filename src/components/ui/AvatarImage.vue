<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  src: String,
  name: { type: String, default: '' },
  size: { type: String, default: 'h-12 w-12' },
})
const failed = ref(false) // mis. offline & foto belum ter-cache → tampilkan inisial
const initial = computed(() => props.name.trim()[0]?.toUpperCase() ?? '?')
</script>

<template>
  <img
    v-if="src && !failed"
    :src="src"
    alt=""
    referrerpolicy="no-referrer"
    :class="[size, 'shrink-0 rounded-full object-cover']"
    @error="failed = true"
  />
  <div
    v-else
    :class="[size, 'flex shrink-0 items-center justify-center rounded-full bg-primary-container font-display font-semibold text-on-primary']"
  >{{ initial }}</div>
</template>