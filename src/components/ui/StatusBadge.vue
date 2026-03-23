
<script setup>
import { computed } from 'vue'
const props = defineProps({
  estado: String,
  color: String
})
const label = computed(() => props.estado || '–')
</script>

<template>
  <span
    class="badge"
    :style="{ backgroundColor: color || '#ccc', color: '#fff' }"
  >
    {{ label }}
  </span>
</template>
