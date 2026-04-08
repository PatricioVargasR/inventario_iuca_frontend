<template>
  <div class="login-page">
    <div class="login-bg"></div>
    <div class="login-card">
      <div class="login-logo">
        <img :src="logo" alt="Logo IUCA" class="logo-img" />
      </div>
      <h1 class="login-title">Sistema de inventario</h1>
      <p class="login-org">IUCA – Tulancingo</p>

      <!-- Banner: sesión cerrada por otro dispositivo -->
      <Transition name="alert-slide">
        <div v-if="sessionInvalidated" class="session-alert warning">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            <strong>Sesión finalizada</strong>
            <p>Tu cuenta fue iniciada en otra instancia y tu sesión se cerró automáticamente</p>
          </div>
        </div>
      </Transition>

      <!-- Banner: sesión cerrada inesperadamente -->
      <Transition name="alert-slide">
        <div v-if="sessionExpired" class="session-alert expired">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            <strong>Sesión cerrada</strong>
            <p>Tu sesión se cerró inesperadamente, por favor inicia sesión de nuevo</p>
          </div>
        </div>
      </Transition>

      <h2 class="login-section">Iniciar sesión</h2>

      <form @submit.prevent="handleLogin" class="login-form" novalidate>
        <!-- Correo -->
        <div class="form-group">
          <div class="input-with-icon">
            <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            <input
              v-model="form.correo"
              type="email"
              class="form-input"
              :class="{ 'input-error': formErrors.correo }"
              placeholder="usuario@iuca.edu.mx"
              autocomplete="email"
              @input="clearErrors()"
            />
          </div>
          <span v-if="formErrors.correo" class="field-error">{{ formErrors.correo }}</span>
        </div>

        <!-- Contraseña -->
        <div class="form-group" style="margin-top: 10px;">
          <div class="input-with-icon">
            <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              v-model="form.password"
              :type="showPass ? 'text' : 'password'"
              class="form-input"
              :class="{ 'input-error': formErrors.password }"
              placeholder="••••••••"
              autocomplete="current-password"
              style="padding-right: 38px;"
              @input="clearErrors()"
            />
            <button type="button" class="toggle-pass" @click="showPass = !showPass">
              <svg v-if="!showPass" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>
              </svg>
            </button>
          </div>
          <span v-if="formErrors.password" class="field-error">{{ formErrors.password }}</span>
        </div>

        <button
          type="submit"
          class="btn btn-primary btn-block btn-lg"
          :disabled="authStore.loading"
          style="margin-top: 18px;"
        >
          <span v-if="authStore.loading" class="spinner" style="width:16px;height:16px;border-width:2px;border-color:rgba(255,255,255,0.3);border-top-color:white;"></span>
          <span v-else>Iniciar sesión</span>
        </button>
      </form>

      <p class="login-help">¿Problemas para acceder? Contacta al administrador</p>
    </div>

    <!-- Modal: sesión activa en la MISMA IP -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showSameIpModal" class="modal-overlay" @click.self="showSameIpModal = false">
          <div class="modal-box modal-sm" @click.stop>
            <div class="confirm-content">
              <div class="confirm-icon" style="background:#fef3c7;font-size:26px;">🔄</div>
              <h3>Sesión activa en este dispositivo</h3>
              <p style="margin-bottom:12px;">
                Ya tienes una sesión abierta en este dispositivo. Si continúas, se cerrará la sesión anterior.
              </p>
              <div class="session-details">
                <div class="session-detail-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>Inició: {{ formatSessionDate(sameIpSessionInfo?.fecha_inicio) }}</span>
                </div>
              </div>
            </div>
            <div class="modal-footer" style="justify-content:center;gap:10px;">
              <button class="btn btn-secondary" @click="showSameIpModal = false" :disabled="authStore.loading">
                Cancelar
              </button>
              <button class="btn btn-primary" @click="handleForceLogin" :disabled="authStore.loading">
                <span v-if="authStore.loading" class="spinner" style="width:14px;height:14px;border-width:2px;border-color:rgba(255,255,255,0.3);border-top-color:white;"></span>
                <span v-else>Continuar e iniciar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal: sesión activa en DIFERENTE IP -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showSessionModal" class="modal-overlay" @click.self="showSessionModal = false">
          <div class="modal-box modal-sm" @click.stop>
            <div class="confirm-content">
              <div class="confirm-icon" style="background:#fee2e2;font-size:26px;">🔒</div>
              <h3>Sesión activa en otro dispositivo</h3>
              <p style="margin-bottom:12px;">Ya tienes una sesión activa desde otra ubicación</p>
              <div class="session-details">
                <div class="session-detail-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>{{ formatSessionDate(activeSessionInfo?.fecha_inicio) }}</span>
                </div>
                <div class="session-detail-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/>
                    <line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
                  </svg>
                  <span>IP: {{ activeSessionInfo?.ip || 'Desconocida' }}</span>
                </div>
              </div>
              <div class="info-banner" style="margin-top:16px;background:#eff6ff;border-color:#bfdbfe;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <div>
                  <strong>Importante</strong>
                  <p>Para acceder desde aquí, primero cierra sesión desde el otro dispositivo.</p>
                </div>
              </div>
            </div>
            <div class="modal-footer" style="justify-content:center;">
              <button class="btn btn-primary btn-block" @click="showSessionModal = false">Entendido</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useFormErrors } from '@/composables/useFormErrors'
import logo from '@/assets/logo-iuca-exp.png'
import { primeraRutaPermitida } from '@/router'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { toast } = useToast()
const { formErrors, clearErrors, setError } = useFormErrors()

const form = ref({ correo: '', password: '' })
const showPass = ref(false)

// Modales de sesión
const showSameIpModal = ref(false)
const sameIpSessionInfo = ref(null)
const showSessionModal = ref(false)
const activeSessionInfo = ref(null)

// Banners de sesión
const sessionInvalidated = ref(false)
const sessionExpired = ref(false)

// ── Validación frontend ──────────────────────────────────────────────────────
function validateForm() {
  clearErrors()
  let valid = true

  if (!form.value.correo?.trim()) {
    setError('correo', 'El correo electrónico es obligatorio')
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.correo.trim())) {
    setError('correo', 'El formato del correo no es válido')
    valid = false
  }

  if (!form.value.password) {
    setError('password', 'La contraseña es obligatoria')
    valid = false
  }

  return valid
}

// ── Login ────────────────────────────────────────────────────────────────────
async function handleLogin() {
  if (!validateForm()) {
    toast.warning('Revisa los campos del formulario')
    return
  }

  const result = await authStore.login(form.value.correo.trim(), form.value.password)

  if (result.success) {
    router.push(primeraRutaPermitida(authStore))
    return
  }

  // Misma IP: pedir confirmación
  if (result.sessionActiveSameIp) {
    sameIpSessionInfo.value = result.sessionInfo
    showSameIpModal.value = true
    return
  }

  // IP diferente: solo informar
  if (result.sessionActive && result.differentIP) {
    activeSessionInfo.value = result.sessionInfo
    showSessionModal.value = true
    return
  }

  // Error de credenciales u otro → toast de error + marcar campos
  const mensaje = authStore.error || 'Error al iniciar sesión'

  if (mensaje.toLowerCase().includes('correo') || mensaje.toLowerCase().includes('encontrado')) {
    setError('correo', 'Correo electrónico no encontrado')
  } else if (mensaje.toLowerCase().includes('contraseña') || mensaje.toLowerCase().includes('incorrecta')) {
    setError('password', 'Contraseña incorrecta')
  } else {
    // Error genérico: marcar ambos campos sin mensaje específico
    setError('correo', ' ')
    setError('password', ' ')
  }

  toast.error(mensaje, 'Error al iniciar sesión')
}

async function handleForceLogin() {
  const result = await authStore.forceLogin(form.value.correo.trim(), form.value.password)

  if (result.success) {
    showSameIpModal.value = false
    router.push(primeraRutaPermitida(authStore))
    return
  }

  showSameIpModal.value = false
  toast.error(authStore.error || 'Error al iniciar sesión', 'Error')
}

function formatSessionDate(dateStr) {
  if (!dateStr) return 'Fecha desconocida'
  return new Date(dateStr).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

onMounted(() => {
  sessionInvalidated.value = route.query.session_invalidated === 'true'
  sessionExpired.value = route.query.session_expired === 'true'

  if (sessionInvalidated.value || sessionExpired.value) {
    router.replace({ query: {} })
  }
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2563eb;
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 30% 50%, #1d4ed8 0%, #1e3a5f 60%, #0f172a 100%);
  opacity: 0.9;
}

.login-bg::before {
  content: '';
  position: absolute;
  top: -20%;
  right: -10%;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(96,165,250,0.15) 0%, transparent 70%);
}

.login-card {
  position: relative;
  z-index: 1;
  background: white;
  border-radius: 20px;
  padding: 40px 44px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 24px 80px rgba(0,0,0,0.25);
  text-align: center;
}

.login-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.login-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--gray-900);
  margin-bottom: 4px;
}

.login-org {
  font-size: 13px;
  color: var(--primary);
  font-weight: 500;
  margin-bottom: 24px;
}

.login-section {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--gray-700);
}

.login-form { text-align: left; }

/* ── Errores de campo (igual que el resto de las vistas) ── */
.input-error {
  border-color: var(--danger) !important;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
}

.field-error {
  display: block;
  font-size: 11.5px;
  color: var(--danger);
  margin-top: 4px;
  font-weight: 500;
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Toggle contraseña ── */
.toggle-pass {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--gray-400);
  padding: 2px;
  display: flex;
}
.toggle-pass:hover { color: var(--gray-600); }

.login-help {
  margin-top: 18px;
  font-size: 12.5px;
  color: var(--gray-400);
}

/* ── Banners de sesión ── */
.session-alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  margin-bottom: 20px;
  border: 1px solid;
  text-align: left;
}

.session-alert.warning {
  background: #fef3c7;
  border-color: #fde68a;
  color: #92400e;
}

.session-alert.expired {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #991b1b;
}

.session-alert strong {
  display: block;
  font-size: 13px;
  margin-bottom: 2px;
}

.session-alert p {
  font-size: 12px;
  margin: 0;
  opacity: 0.9;
}

/* ── Detalles de sesión en modales ── */
.session-details {
  background: var(--gray-50);
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.session-detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--gray-600);
  justify-content: center;
}

.info-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 12px;
  text-align: left;
}

.info-banner strong {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
}

.info-banner p { margin: 0; line-height: 1.5; }

.confirm-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.logo-img {
  width: 90px;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.15));
}

/* ── Transiciones ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.alert-slide-enter-active { animation: slideDown 0.25s ease; }
.alert-slide-leave-active { animation: slideDown 0.2s ease reverse; }

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>