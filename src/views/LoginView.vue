<template>
  <div class="login-page">
    <div class="login-bg"></div>
    <div class="login-card">
      <div class="login-logo">
        <span class="logo-bar"></span>
      </div>
      <h1 class="login-title">Sistema de inventario</h1>
      <p class="login-org">IUCA – Tulancingo</p>

      <h2 class="login-section">Iniciar sesión</h2>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-with-icon">
          <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          <input
            v-model="form.correo"
            type="email"
            class="form-input"
            placeholder="usuario@iuca.edu.mx"
            required
            autocomplete="email"
          />
        </div>

        <div class="input-with-icon" style="margin-top: 10px;">
          <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <input
            v-model="form.password"
            :type="showPass ? 'text' : 'password'"
            class="form-input"
            placeholder="••••••••"
            required
            autocomplete="current-password"
            style="padding-right: 38px;"
          />
          <button type="button" class="toggle-pass" @click="showPass = !showPass">
            <svg v-if="!showPass" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
          </button>
        </div>

        <div v-if="authStore.error" class="login-error">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          {{ authStore.error }}
        </div>

        <button type="submit" class="btn btn-primary btn-block btn-lg" :disabled="authStore.loading" style="margin-top: 18px;">
          <span v-if="authStore.loading" class="spinner" style="width:16px;height:16px;border-width:2px;border-color:rgba(255,255,255,0.3);border-top-color:white;"></span>
          <span v-else>Iniciar Sesión</span>
        </button>
      </form>

      <p class="login-help">¿Problemas para acceder? Contacta al administrador</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({ correo: '', password: '' })
const showPass = ref(false)

async function handleLogin() {
  const ok = await authStore.login(form.value.correo, form.value.password)
  if (ok) router.push('/accesos')
}
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

.logo-bar {
  display: block;
  width: 4px;
  height: 40px;
  background: var(--primary);
  border-radius: 4px;
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

.login-error {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 9px 12px;
  background: var(--danger-light);
  border-radius: 8px;
  font-size: 13px;
  color: var(--danger);
  font-weight: 500;
}

.login-help {
  margin-top: 18px;
  font-size: 12.5px;
  color: var(--gray-400);
}
</style>