<template>
  <Transition name="fade">
    <div v-if="modelValue" class="concurrency-overlay" @click.self="$emit('update:modelValue', false)">
      <div class="concurrency-modal" @click.stop>
        <div class="concurrency-icon warning">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>

        <h3>{{ title }}</h3>
        <p>{{ message }}</p>

        <div v-if="lockInfo" class="lock-info">
          <div class="lock-detail">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
            <span>{{ lockInfo.nombre_usuario }}</span>
          </div>
          <div class="lock-detail">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>{{ formatDate(lockInfo.fecha_bloqueo) }}</span>
          </div>
        </div>

        <div class="concurrency-actions">
          <button class="btn btn-secondary" @click="$emit('cancel')">
            {{ cancelLabel }}
          </button>
          <button v-if="showRetry" class="btn btn-primary" @click="$emit('retry')">
            {{ retryLabel }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: 'Registro en uso' },
  message: { type: String, default: 'Otro usuario está editando este registro' },
  lockInfo: Object,
  cancelLabel: { type: String, default: 'Cerrar' },
  retryLabel: { type: String, default: 'Reintentar' },
  showRetry: Boolean,
})

defineEmits(['update:modelValue', 'cancel', 'retry'])

function formatDate(dateStr) {
  if (!dateStr) return 'Fecha desconocida'
  const date = new Date(dateStr)
  return date.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.concurrency-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.concurrency-modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 440px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.concurrency-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.concurrency-icon.warning {
  background: #fef3c7;
  color: #d97706;
}

.concurrency-modal h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--gray-900);
}

.concurrency-modal p {
  font-size: 14px;
  color: var(--gray-600);
  margin-bottom: 20px;
}

.lock-info {
  background: var(--gray-50);
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lock-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--gray-700);
  justify-content: center;
}

.concurrency-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>