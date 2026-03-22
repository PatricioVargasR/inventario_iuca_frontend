import api from './api'

const activeLocks = new Map()
const lockTimers = new Map()

/**
 * Adquirir bloqueo (edición o eliminación)
 */
export async function acquireLock(tabla, registroId, duracionMinutos = 10, tipoBloqueo = 'edicion') {
  const key = `${tabla}:${registroId}`

  try {
    const res = await api.post('/concurrency/lock', {
      tabla,
      registro_id: registroId,
      duracion_minutos: duracionMinutos,
      tipo_bloqueo: tipoBloqueo
    })

    activeLocks.set(key, res.data.bloqueo)

    // Solo configurar renovación para bloqueos de edición (no para eliminación)
    if (tipoBloqueo === 'edicion') {
      const timerId = setInterval(async () => {
        try {
          await acquireLock(tabla, registroId, duracionMinutos, tipoBloqueo)
        } catch (e) {
          console.error('Error renovando bloqueo:', e)
          clearInterval(timerId)
          lockTimers.delete(key)
          activeLocks.delete(key)
        }
      }, 5 * 60 * 1000) // 5 minutos

      lockTimers.set(key, timerId)
    }

    return { success: true, bloqueo: res.data.bloqueo }
  } catch (error) {
    const errorData = error.response?.data

    if (errorData?.error === 'locked_by_other') {
      return {
        success: false,
        locked: true,
        lockInfo: errorData.bloqueo
      }
    }

    return { success: false, error: errorData?.mensaje || 'Error adquiriendo bloqueo' }
  }
}

/**
 * Liberar bloqueo
 */
export async function releaseLock(tabla, registroId) {
  const key = `${tabla}:${registroId}`

  const timerId = lockTimers.get(key)
  if (timerId) {
    clearInterval(timerId)
    lockTimers.delete(key)
  }

  activeLocks.delete(key)

  try {
    await api.post('/concurrency/unlock', {
      tabla,
      registro_id: registroId
    })
    return { success: true }
  } catch (error) {
    console.error('Error liberando bloqueo:', error)
    return { success: false }
  }
}

/**
 * Verificar estado de bloqueo
 */
export async function checkLock(tabla, registroId) {
  try {
    const res = await api.get('/concurrency/check-lock', {
      params: { tabla, registro_id: registroId }
    })
    return res.data
  } catch (error) {
    console.error('Error verificando bloqueo:', error)
    return { locked: false }
  }
}

/**
 * Liberar todos los bloqueos
 */
export async function releaseAllLocks() {
  for (const [key, timerId] of lockTimers.entries()) {
    clearInterval(timerId)
  }
  lockTimers.clear()

  const promises = []
  for (const [key] of activeLocks.entries()) {
    const [tabla, registroId] = key.split(':')
    promises.push(
      api.post('/concurrency/unlock', {
        tabla,
        registro_id: parseInt(registroId)
      }).catch(e => console.error('Error liberando bloqueo:', e))
    )
  }

  await Promise.all(promises)
  activeLocks.clear()
}