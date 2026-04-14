<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="modal-overlay" @click.self="$emit('update:modelValue', false)">
        <div class="modal-box modal-sm" @click.stop>
          <div class="confirm-content">
            <div class="confirm-icon">⚠️</div>
            <h3>{{ title }}</h3>
            <p>{{ message }}</p>
          </div>
          <div class="modal-footer" style="justify-content: center; gap: 12px;">
            <button class="btn btn-secondary" @click="$emit('update:modelValue', false)">Cancelar</button>
            <button class="btn btn-danger" @click="confirm" :disabled="loading">
              <span v-if="loading" class="spinner"
                style="width:14px;height:14px;border-width:2px;border-color:rgba(255,255,255,0.3);border-top-color:white;"></span>
              <span v-else>{{ confirmLabel }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: 'Confirmar acción' },
  message: { type: String, default: '¿Estás seguro? Esta acción no se puede deshacer.' },
  confirmLabel: { type: String, default: 'Eliminar' },
  loading: Boolean
})
const emit = defineEmits(['update:modelValue', 'confirm'])
function confirm() { emit('confirm') }
</script>