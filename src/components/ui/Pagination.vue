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

// Genera la lista de botones de página con puntos suspensivos correctos
const pages = computed(() => {
  const tp = props.totalPages
  const c  = props.current

  if (tp <= 7) {
    return Array.from({ length: tp }, (_, i) => i + 1)
  }

  if (c <= 4) {
    return [1, 2, 3, 4, 5, '...', tp]
  }

  if (c >= tp - 3) {
    return [1, '...', tp - 4, tp - 3, tp - 2, tp - 1, tp]
  }

  return [1, '...', c - 1, c, c + 1, '...', tp]
})
</script>