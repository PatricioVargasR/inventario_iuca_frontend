<template>
  <div class="pagination">
  <span class="pagination-info">
    Mostrando <strong>{{ from }}</strong> a <strong>{{ to }}</strong> de <strong>{{ total }}</strong> registros
  </span>
    <div class="pagination-controls">
      <button class="page-btn" @click="$emit('change', 1)" :disabled="current === 1">«</button>
      <button class="page-btn" @click="$emit('change', current - 1)" :disabled="current === 1">‹</button>
      <template v-for="(p, i) in pages" :key="i">
        <button
          v-if="p === '...'"
          class="page-btn"
          style="cursor:default;border:none;color:var(--gray-400)"
          disabled
        >…</button>
        <button
          v-else
          class="page-btn"
          :class="{ active: p === current }"
          @click="$emit('change', p)"
        >{{ p }}</button>
      </template>
      <button class="page-btn" @click="$emit('change', current + 1)" :disabled="current === totalPages">›</button>
      <button class="page-btn" @click="$emit('change', totalPages)" :disabled="current === totalPages">»</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  current:    { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
  total:      { type: Number, default: 0 },
  perPage:    { type: Number, default: 20 },
  from:       { type: Number, default: 0 },
  to:         { type: Number, default: 0 }
})

defineEmits(['change'])

// Rango real mostrado en pantalla
const from = computed(() => {
  if (props.total === 0) return 0
  return (props.current - 1) * props.perPage + 1
})

const to = computed(() => {
  if (props.total === 0) return 0
  return Math.min(props.current * props.perPage, props.total)
})

// Genera la lista de botones de página con puntos suspensivos correctos
const pages = computed(() => {
  const tp = props.totalPages
  const c  = props.current

  // Sin necesidad de puntos suspensivos
  if (tp <= 7) {
    return Array.from({ length: tp }, (_, i) => i + 1)
  }

  // Cerca del inicio: mostrar primeras páginas + salto al final
  if (c <= 4) {
    return [1, 2, 3, 4, 5, '...', tp]
  }

  // Cerca del final: mostrar salto al inicio + últimas páginas
  if (c >= tp - 3) {
    return [1, '...', tp - 4, tp - 3, tp - 2, tp - 1, tp]
  }

  // En el medio: mostrar contexto alrededor de la página actual
  return [1, '...', c - 1, c, c + 1, '...', tp]
})
</script>