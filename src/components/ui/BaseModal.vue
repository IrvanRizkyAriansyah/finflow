<script setup>
import { watch, onBeforeUnmount } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({ modelValue: Boolean, title: String })
const emit = defineEmits(['update:modelValue'])
const close = () => emit('update:modelValue', false)
const onKey = (e) => e.key === 'Escape' && close()

watch(() => props.modelValue, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (open) window.addEventListener('keydown', onKey)
  else window.removeEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-end justify-center bg-inverse-surface/50 md:items-center"
        @click.self="close"
      >
        <div
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          class="max-h-[92vh] w-full overflow-y-auto rounded-t-xl bg-surface-container-lowest p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-xl md:max-w-md md:rounded-xl md:pb-6"
        >
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-headline-sm">{{ title }}</h2>
            <button class="rounded-full p-2 hover:bg-surface-container flex" :aria-label="$t('common.close')" @click="close">
              <AppIcon name="close" />
            </button>
          </div>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>