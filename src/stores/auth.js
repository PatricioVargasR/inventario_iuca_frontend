import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/services/api'
import { releaseAllLocks } from '@/services/concurrency'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('token') || null)
  const permisos = ref(JSON.parse(localStorage.getItem('permisos') || '{}'))
  const sessionInfo = ref(JSON.parse(localStorage.getItem('sessionInfo') || 'null'))
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  function _guardarSesion(data) {
    token.value = data.token
    user.value = data.usuario
    permisos.value = data.permisos || {}
    sessionInfo.value = data.sesion_info

    localStorage.setItem('token', token.value)
    localStorage.setItem('user', JSON.stringify(user.value))
    localStorage.setItem('permisos', JSON.stringify(permisos.value))
    localStorage.setItem('sessionInfo', JSON.stringify(sessionInfo.value))
  }

  async function login(correo, password) {
    loading.value = true
    error.value = null

    try {
      const res = await authApi.login({
        correo_electronico: correo,
        password
      })

      _guardarSesion(res.data)
      return { success: true }

    } catch (e) {
      const errorData = e.response?.data

      if (errorData?.error === 'session_active_same_ip') {
        error.value = null
        return {
          success: false,
          sessionActiveSameIp: true,
          sessionInfo: errorData.sesion_info
        }
      }

      if (errorData?.error === 'session_active_different_ip') {
        error.value = null
        return {
          success: false,
          sessionActive: true,
          sessionInfo: errorData.sesion_info,
          differentIP: true
        }
      }

      error.value = errorData?.error || 'Error al iniciar sesión'
      return { success: false }

    } finally {
      loading.value = false
    }
  }

  async function forceLogin(correo, password) {
    loading.value = true
    error.value = null

    try {
      const res = await authApi.forceLogin({
        correo_electronico: correo,
        password
      })

      _guardarSesion(res.data)
      return { success: true }

    } catch (e) {
      const errorData = e.response?.data
      error.value = errorData?.error || 'Error al iniciar sesión'
      return { success: false }

    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await releaseAllLocks()
    } catch (e) {
      console.error('Error liberando bloqueos:', e)
    }

    try {
      await authApi.logout()
    } catch (e) {
      console.error('Error en logout backend:', e)
    }

    token.value = null
    user.value = null
    permisos.value = {}
    sessionInfo.value = null
    localStorage.clear()
  }

  function canDo(modulo, accion) {
    const p = permisos.value[modulo]
    if (!p) return false
    return !!p[accion]
  }

  async function me() {
    try {
      const res = await authApi.me()
      user.value = res.data
      permisos.value = res.data.permisos || {}
      return res.data
    } catch (e) {
      logout()
      throw e
    }
  }

  return {
    user,
    token,
    permisos,
    sessionInfo,
    loading,
    error,
    isAuthenticated,
    login,
    forceLogin,
    logout,
    me,
    canDo
  }
})