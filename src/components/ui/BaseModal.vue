<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="modal-overlay" @click.self="$emit('update:modelValue', false)">
        <div class="modal-box" :class="sizeClass" @click.stop>
          <div class="modal-header">
            <div>
              <div class="modal-title">{{ title }}</div>
              <div v-if="subtitle" class="modal-subtitle">{{ subtitle }}</div>
            </div>
            <button class="modal-close" @click="$emit('update:modelValue', false)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  modelValue: Boolean,
  title: String,
  subtitle: String,
  size: { type: String, default: 'md' }
})
defineEmits(['update:modelValue'])
const sizeClass = computed(() => ({ sm: 'modal-sm', lg: 'modal-lg' }[props.size] || ''))
</script>