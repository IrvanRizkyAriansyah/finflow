<script setup>
defineProps({ title: { type: String, required: true }, subtitle: String })
</script>

<template>
  <section class="rounded-xl bg-surface-container-lowest p-5 shadow-sm flex flex-col justify-between">
    <header class="mb-4 flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h2 class="text-headline-sm">{{ title }}</h2>
        <p v-if="subtitle" class="text-body-sm text-on-surface-variant">{{ subtitle }}</p>
      </div>
      <slot name="action" />
    </header>
    <slot />
  </section>
</template>