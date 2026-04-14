<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite">
      <TransitionGroup name="toast">
        <div v-for="toast in toasts" :key="toast.id" class="toast" :class="`toast--${toast.type}`" role="alert"
          @click="remove(toast.id)">
          <div class="toast__icon">
            <!-- success -->
            <svg v-if="toast.type === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <!-- error -->
            <svg v-else-if="toast.type === 'error'" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <!-- warning -->
            <svg v-else-if="toast.type === 'warning'" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <!-- info -->
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>

          <div class="toast__body">
            <p class="toast__title" v-if="toast.title">{{ toast.title }}</p>
            <p class="toast__message">{{ toast.message }}</p>
          </div>

          <button class="toast__close" @click.stop="remove(toast.id)" aria-label="Cerrar">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <!-- progress bar -->
          <div class="toast__progress" :style="{ animationDuration: toast.duration + 'ms' }"></div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast'
const { toasts, remove } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 380px;
  width: calc(100vw - 48px);
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.14), 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  pointer-events: all;
  transition: box-shadow 0.15s ease;
}

.toast:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* tipos */
.toast--success {
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.toast--success .toast__icon {
  color: #16a34a;
  background: #dcfce7;
}

.toast--error {
  border-color: #fecaca;
  background: #fff5f5;
}

.toast--error .toast__icon {
  color: #dc2626;
  background: #fee2e2;
}

.toast--warning {
  border-color: #fde68a;
  background: #fffbeb;
}

.toast--warning .toast__icon {
  color: #d97706;
  background: #fef3c7;
}

.toast--info {
  border-color: #bfdbfe;
  background: #eff6ff;
}

.toast--info .toast__icon {
  color: #2563eb;
  background: #dbeafe;
}

/* icon */
.toast__icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* body */
.toast__body {
  flex: 1;
  min-width: 0;
}

.toast__title {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 2px;
  line-height: 1.3;
}

.toast__message {
  font-size: 12.5px;
  color: #475569;
  line-height: 1.45;
  word-break: break-word;
}

/* close */
.toast__close {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background 0.12s, color 0.12s;
  padding: 0;
  margin-top: -2px;
}

.toast__close:hover {
  background: rgba(0, 0, 0, 0.07);
  color: #334155;
}

/* progress bar */
.toast__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  transform-origin: left;
  animation: toast-progress linear forwards;
  border-radius: 0 0 12px 12px;
}

.toast--success .toast__progress {
  background: #16a34a;
}

.toast--error .toast__progress {
  background: #dc2626;
}

.toast--warning .toast__progress {
  background: #d97706;
}

.toast--info .toast__progress {
  background: #2563eb;
}

@keyframes toast-progress {
  from {
    transform: scaleX(1);
  }

  to {
    transform: scaleX(0);
  }
}

/* transitions */
.toast-enter-active {
  animation: toast-in 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
  animation: toast-out 0.22s ease forwards;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(40px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
    max-height: 120px;
    margin-bottom: 0;
  }

  to {
    opacity: 0;
    transform: translateX(40px) scale(0.95);
    max-height: 0;
    margin-bottom: -10px;
  }
}
</style>