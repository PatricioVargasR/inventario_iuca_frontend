<template>
  <span class="badge" :class="badgeClass">{{ label }}</span>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ estado: String })
const label = computed(() => props.estado || '–')
const badgeClass = computed(() => {
  const e = (props.estado || '').toLowerCase()
  if (e === 'bueno' || e === 'activo') return 'badge-success'
  if (e === 'regular' || e === 'nuevo') return 'badge-warning'
  if (e === 'malo' || e === 'inactivo') return 'badge-danger'
  return 'badge-gray'
})
</script>