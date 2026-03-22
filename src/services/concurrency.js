import api from './api'

/**
 * Sistema de gestión de concurrencia en el frontend
 */

// Cache de bloqueos activos
const activeLocks = new Map()

// Temporizadores para renovación de bloqueos
const lockTimers = new Map()

/**
 * Adquiere un bloqueo para editar un registro
 */
export async function acquireLock(tabla, registroId, duracionMinutos = 10) {
  try {
    const res = await api.post('/concurrency/lock', {
      tabla,
      registro_id: registroId,
      duracion_minutos: duracionMinutos
    })

    const bloqueo = res.data.bloqueo
    const lockKey = `${tabla}:${registroId}`

    // Guardar en cache
    activeLocks.set(lockKey, bloqueo)

    // Configurar renovación automática cada 5 minutos
    const timer = setInterval(() => {
      renewLock(tabla, registroId, duracionMinutos)
    }, 5 * 60 * 1000) // 5 minutos

    lockTimers.set(lockKey, timer)

    return { success: true, bloqueo }
  } catch (error) {
    const errorData = error.response?.data

    if (errorData?.error === 'locked_by_other') {
      return {
        success: false,
        locked: true,
        bloqueo: errorData.bloqueo,
        mensaje: errorData.mensaje
      }
    }

    return {
      success: false,
      locked: false,
      mensaje: errorData?.error || 'Error al adquirir bloqueo'
    }
  }
}

/**
 * Renueva un bloqueo existente
 */
async function renewLock(tabla, registroId, duracionMinutos = 10) {
  try {
    await api.post('/concurrency/lock', {
      tabla,
      registro_id: registroId,
      duracion_minutos: duracionMinutos
    })

    console.log(`Bloqueo renovado: ${tabla}:${registroId}`)
  } catch (error) {
    console.error('Error renovando bloqueo:', error)
  }
}

/**
 * Libera un bloqueo
 */
export async function releaseLock(tabla, registroId) {
  const lockKey = `${tabla}:${registroId}`

  // Cancelar timer de renovación
  const timer = lockTimers.get(lockKey)
  if (timer) {
    clearInterval(timer)
    lockTimers.delete(lockKey)
  }

  // Remover de cache
  activeLocks.delete(lockKey)

  // Liberar en backend
  try {
    await api.post('/concurrency/unlock', {
      tabla,
      registro_id: registroId
    })

    return true
  } catch (error) {
    console.error('Error liberando bloqueo:', error)
    return false
  }
}

/**
 * Verifica si un registro está bloqueado
 */
export async function checkLock(tabla, registroId) {
  try {
    const res = await api.get('/concurrency/check-lock', {
      params: { tabla, registro_id: registroId }
    })

    return res.data
  } catch (error) {
    console.error('Error verificando bloqueo:', error)
    return { bloqueado: false, bloqueo: null }
  }
}

/**
 * Libera todos los bloqueos activos al cerrar sesión
 */
export function releaseAllLocks() {
  // Cancelar todos los timers
  lockTimers.forEach(timer => clearInterval(timer))
  lockTimers.clear()

  // Liberar todos los bloqueos
  const promises = []
  activeLocks.forEach((bloqueo, lockKey) => {
    const [tabla, registroId] = lockKey.split(':')
    promises.push(releaseLock(tabla, parseInt(registroId)))
  })

  activeLocks.clear()

  return Promise.all(promises)
}

/**
 * Obtiene todos los bloqueos activos del usuario
 */
export async function getMyLocks() {
  try {
    const res = await api.get('/concurrency/my-locks')
    return res.data.bloqueos
  } catch (error) {
    console.error('Error obteniendo bloqueos:', error)
    return []
  }
}