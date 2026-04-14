import axios from 'axios'

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

// ── Request interceptor — adjunta JWT ────────────────────────────────
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor — manejo centralizado de errores ────────────
api.interceptors.response.use(
  res => res,
  err => {
    const errorData = err.response?.data

    // Sesión invalidada remotamente (otro dispositivo inició sesión)
    if (errorData?.error === 'session_invalidated') {
      localStorage.clear()
      window.location.href = '/login?session_invalidated=true'
      return Promise.reject(err)
    }

    // Token expirado o inválido
    if (err.response?.status === 401 && !errorData?.error) {
      localStorage.clear()
      window.location.href = '/login?session_expired=true'
      return Promise.reject(err)
    }

    // Sin respuesta del servidor: timeout (ECONNABORTED) o red caída (!err.response)
    if (err.code === 'ECONNABORTED' || !err.response) {
      // Importar useToast de forma diferida para evitar dependencias circulares
      import('@/composables/useToast').then(({ useToast }) => {
        const { toast } = useToast()
        toast.error(
          'No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.',
          'Sin conexión'
        )
      })
      return Promise.reject(err)
    }

    return Promise.reject(err)
  }
)

/**
 * Serializa parámetros para que los arrays se envíen como múltiples
 * query params del mismo nombre: usuario_id=1&usuario_id=2
 */
function paramsSerializer(params) {
  const parts = []
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value)) {
      value.forEach(v => parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`))
    } else {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    }
  }
  return parts.join('&')
}

// ===== AUTH =====
export const authApi = {
  login:      (data) => api.post('/auth/login', data),
  forceLogin: (data) => api.post('/auth/force-login', data),
  me:         ()     => api.get('/auth/me'),
  logout:     ()     => api.post('/auth/logout'),
}

// ===== EQUIPOS =====
export const equiposApi = {
  list:   (params)     => api.get('/equipos/', { params }),
  get:    (id)         => api.get(`/equipos/${id}`),
  create: (data)       => api.post('/equipos/', data),
  update: (id, data)   => api.put(`/equipos/${id}`, data),
  delete: (id)         => api.delete(`/equipos/${id}`),
}

// ===== MOBILIARIO =====
export const mobiliarioApi = {
  list:   (params)     => api.get('/mobiliario/', { params }),
  get:    (id)         => api.get(`/mobiliario/${id}`),
  create: (data)       => api.post('/mobiliario/', data),
  update: (id, data)   => api.put(`/mobiliario/${id}`, data),
  delete: (id)         => api.delete(`/mobiliario/${id}`),
}

// ===== CATÁLOGOS =====
export const catalogosApi = {
  getAreas:               (params) => api.get('/catalogos/areas',            { params }),
  getAreasCompleto:        ()      => api.get('/catalogos/areas-completo'),
  getTiposActivo:         (params) => api.get('/catalogos/tipos-activo',     { params }),
  getTiposActivoCompleto:  ()      => api.get('/catalogos/tipos-activo-completo'),
  getEstados:             (params) => api.get('/catalogos/estados',          { params }),
  getEstadosCompleto:      ()      => api.get('/catalogos/estados-completo'),
  getTiposMobiliario:     (params) => api.get('/catalogos/tipos-mobiliario', { params }),
  getMobiliarioCompleto:   ()      => api.get('/catalogos/tipo-completo'),

  getArea:       (id) => api.get(`/catalogos/areas/${id}`),
  getActivo:     (id) => api.get(`/catalogos/activo/${id}`),
  getEstado:     (id) => api.get(`/catalogos/estados/${id}`),
  getMobiliario: (id) => api.get(`/catalogos/mobiliario/${id}`),

  createArea:           (data)     => api.post('/catalogos/areas', data),
  updateArea:           (id, data) => api.put(`/catalogos/areas/${id}`, data),
  deleteArea:           (id)       => api.delete(`/catalogos/areas/${id}`),
  createTipoActivo:     (data)     => api.post('/catalogos/tipos-activo', data),
  updateTipoActivo:     (id, data) => api.put(`/catalogos/tipos-activo/${id}`, data),
  deleteTipoActivo:     (id)       => api.delete(`/catalogos/tipos-activo/${id}`),
  createEstado:         (data)     => api.post('/catalogos/estados', data),
  updateEstado:         (id, data) => api.put(`/catalogos/estados/${id}`, data),
  deleteEstado:         (id)       => api.delete(`/catalogos/estados/${id}`),
  createTipoMobiliario: (data)     => api.post('/catalogos/tipos-mobiliario', data),
  updateTipoMobiliario: (id, data) => api.put(`/catalogos/tipos-mobiliario/${id}`, data),
  deleteTipoMobiliario: (id)       => api.delete(`/catalogos/tipos-mobiliario/${id}`),
}

// ===== USUARIOS / RESPONSABLES =====
export const usuariosApi = {
  listResponsables:  (params) => api.get('/usuarios/responsables',     { params }),
  getResponsable:    (id)     => api.get(`/usuarios/responsable/${id}`),
  createResponsable: (data)   => api.post('/usuarios/responsables', data),
  updateResponsable: (id, data) => api.put(`/usuarios/responsables/${id}`, data),
  deleteResponsable: (id)     => api.delete(`/usuarios/responsables/${id}`),

  listAccesos:   (params)     => api.get('/usuarios/accesos',       { params }),
  getAcceso:     (id)         => api.get(`/usuarios/accesos/${id}`),
  createAcceso:  (data)       => api.post('/usuarios/accesos', data),
  updateAcceso:  (id, data)   => api.put(`/usuarios/accesos/${id}`, data),
  deleteAcceso:  (id)         => api.delete(`/usuarios/accesos/${id}`),

  listAccesosFiltro: () => api.get('/usuarios/accesos-filtro'),
}

// ===== HISTORIAL =====
export const historialApi = {
  list: (params) => api.get('/historial/', { params }),
  get:  (id)     => api.get(`/historial/${id}`),
}

export default api

// ===== VISTAS =====
export const vistasApi = {
  listEquipos:    (params) => api.get('/vistas/equipos-completo/',    { params, paramsSerializer }),
  getEquipos:     (id)     => api.get(`/vistas/equipo-completo/${id}`),

  listMobiliario: (params) => api.get('/vistas/mobiliarios-completo/', { params, paramsSerializer }),
  getMobiliario:  (id)     => api.get(`/vistas/mobiliario-completo/${id}`),

  listResponsables: (params) => api.get('/vistas/responsables-completo/', { params }),
  getResponsable:   (id)     => api.get(`/vistas/responsable-completo/${id}`),

  listAccesos: (params) => api.get('/vistas/accesos-completo/', { params }),
  getAcceso:   (id)     => api.get(`/vistas/acceso-completo/${id}`),

  listHistoriales:         (params = {}) => api.get('/historial/',                            { params }),
  getHistorial:            (id)          => api.get(`/historial/${id}`),
  getHistorialPorTabla:    (tabla, params = {}) => api.get(`/historial/tabla/${tabla}`,        { params }),
  getHistorialPorRegistro: (tabla, registroId)  => api.get(`/historial/registro/${tabla}/${registroId}`),
  getEstadisticasHistorial: ()            => api.get('/historial/estadisticas'),
}

export const concurrencyApi = {
  acquireLock:    (data)   => api.post('/concurrency/lock',         data),
  releaseLock:    (data)   => api.post('/concurrency/unlock',       data),
  checkLock:      (params) => api.get('/concurrency/check-lock',    { params }),
  getActiveLocks: ()       => api.get('/concurrency/active-locks'),
  getMyLocks:     ()       => api.get('/concurrency/my-locks'),
}