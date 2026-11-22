<script setup>
defineProps({ name: { type: String, required: true }, filled: Boolean })
</script>

<template>
  <span
    class="material-symbols-outlined select-none"
    :style="filled ? { fontVariationSettings: `'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24` } : null"
    aria-hidden="true"
  >{{ name }}</span>
</template>