<template>
  <BaseModal :model-value="modelValue" title="Conflicto de Versión Detectado" size="lg" @update:model-value="$emit('update:modelValue', $event)">
    <div class="conflict-warning" role="alert">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <div>
        <h4>El registro fue modificado por otro usuario</h4>
        <p>Mientras editabas, otro usuario guardó cambios en {{ entityLabel }}.</p>
      </div>
    </div>
    <div class="conflict-options">
      <div class="conflict-option">
        <strong>Recargar datos actuales</strong>
        <p>Descartar tus cambios y ver la versión más reciente del registro</p>
      </div>
    </div>
    <template #footer>
        <button
        class="btn btn-secondary"
        @click="handleReload"
        >
        Recargar datos actuales
        </button>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from '@/components/ui/BaseModal.vue'
const emit = defineEmits(['update:modelValue', 'reload'])
defineProps({
  modelValue: Boolean,
  entityLabel: { type: String, default: 'este registro' }
})

const handleReload = () => {
  emit('reload')
  emit('update:modelValue', false)
}

</script>

<style scoped>
.conflict-warning {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #fef3c7;
  border-radius: 12px;
  margin-bottom: 20px;
  color: #f59e0b
}
.conflict-warning svg { color: #d97706; flex-shrink: 0; }
.conflict-warning h4 { font-size: 16px; font-weight: 700; color: var(--gray-900); margin-bottom: 6px; }
.conflict-warning p { font-size: 13px; color: var(--gray-600); margin: 0; }
.conflict-options { display: flex; flex-direction: column; gap: 12px; }
.conflict-option { padding: 14px; background: var(--gray-50); border-radius: 8px; border: 1px solid var(--gray-200); }
.conflict-option strong { display: block; font-size: 14px; color: var(--gray-900); margin-bottom: 4px; }
.conflict-option p { font-size: 12px; color: var(--gray-600); margin: 0; }
</style>