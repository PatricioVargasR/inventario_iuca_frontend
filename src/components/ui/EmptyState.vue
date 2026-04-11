<template>
  <div class="empty-state">
    <div v-if="icon" class="empty-icon">
      <slot name="icon">
        {{ icon }}
      </slot>
    </div>

    <p class="empty-text">
      <slot>
        {{ text }}
      </slot>
    </p>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: 'No hay datos disponibles'
  },
  icon: {
    type: String,
    default: '📭'
  }
})
</script>
