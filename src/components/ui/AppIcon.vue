<script setup>
defineProps({
  name: { type: String, required: true },
  filled: Boolean,
  size: { type: [String, Number], default: 24 },
})
</script>

<template>
  <span
    class="material-symbols-outlined select-none"
    :style="{
      fontSize: `${size}px`,
      ...(filled ? { fontVariationSettings: `'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24` } : {}),
    }"
    aria-hidden="true"
  >{{ name }}</span>
</template>