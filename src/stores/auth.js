import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('token') || null)
  const permisos = ref(JSON.parse(localStorage.getItem('permisos') || '{}'))
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  async function login(correo, password) {
    loading.value = true
    error.value = null
    try {
      const res = await authApi.login({ correo_electronico: correo, password })
      token.value = res.data.token
      user.value = res.data.usuario
      permisos.value = res.data.permisos || {}
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))
      localStorage.setItem('permisos', JSON.stringify(permisos.value))
      return true
    } catch (e) {
      error.value = e.response?.data?.error || 'Error al iniciar sesión'
      return false
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    permisos.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('permisos')
  }

  function canDo(modulo, accion) {
    const p = permisos.value[modulo]
    if (!p) return false
    return !!p[accion]
  }

  return { user, token, permisos, loading, error, isAuthenticated, login, logout, canDo }
})