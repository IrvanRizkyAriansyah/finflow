<script setup>
import { useRoute } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'

const route = useRoute()
</script>

<template>
  <template v-if="route.matched.length">
    <RouterView v-if="route.meta.public" />
    <AppShell v-else><RouterView /></AppShell>
  </template>
</template>