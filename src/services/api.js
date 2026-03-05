import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor → add JWT token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor → handle 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ===== AUTH =====
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
}

// ===== EQUIPOS =====
export const equiposApi = {
  list: (params) => api.get('/equipos/', { params }),
  get: (id) => api.get(`/equipos/${id}`),
  create: (data) => api.post('/equipos/', data),
  update: (id, data) => api.put(`/equipos/${id}`, data),
  delete: (id) => api.delete(`/equipos/${id}`)
}

// ===== MOBILIARIO =====
export const mobiliarioApi = {
  list: (params) => api.get('/mobiliario/', { params }),
  get: (id) => api.get(`/mobiliario/${id}`),
  create: (data) => api.post('/mobiliario/', data),
  update: (id, data) => api.put(`/mobiliario/${id}`, data),
  delete: (id) => api.delete(`/mobiliario/${id}`)
}

// ===== CATÁLOGOS =====
export const catalogosApi = {
  // GET (ya existentes)
  getAreas: () => api.get('/catalogos/areas'),
  getArea: (id) => api.get(`/catalogos/areas/${id}`),

  getTiposActivo: () => api.get('/catalogos/tipos-activo'),
  getActivo: (id) => api.get(`/catalogos/activo/${id}`),

  getEstados: () => api.get('/catalogos/estados'),
  getEstado: (id) => api.get(`/catalogos/estados/${id}`),

  getTiposMobiliario: () => api.get('/catalogos/tipos-mobiliario'),
  getMobiliario: (id) => api.get(`/catalogos/mobiliario /${id}`),

  // CRUD Areas (endpoints faltantes)
  createArea: (data) => api.post('/catalogos/areas', data),
  updateArea: (id, data) => api.put(`/catalogos/areas/${id}`, data),
  deleteArea: (id) => api.delete(`/catalogos/areas/${id}`),

  // CRUD Tipos Activo
  createTipoActivo: (data) => api.post('/catalogos/tipos-activo', data),
  updateTipoActivo: (id, data) => api.put(`/catalogos/tipos-activo/${id}`, data),
  deleteTipoActivo: (id) => api.delete(`/catalogos/tipos-activo/${id}`),

  // CRUD Estados
  createEstado: (data) => api.post('/catalogos/estados', data),
  updateEstado: (id, data) => api.put(`/catalogos/estados/${id}`, data),
  deleteEstado: (id) => api.delete(`/catalogos/estados/${id}`),

  // CRUD Tipos Mobiliario
  createTipoMobiliario: (data) => api.post('/catalogos/tipos-mobiliario', data),
  updateTipoMobiliario: (id, data) => api.put(`/catalogos/tipos-mobiliario/${id}`, data),
  deleteTipoMobiliario: (id) => api.delete(`/catalogos/tipos-mobiliario/${id}`),
}

// ===== USUARIOS / RESPONSABLES =====
export const usuariosApi = {
  // Responsables
  listResponsables: (params) => api.get('/usuarios/responsables', { params }),
  getResponsable: (id) => api.get(`/usuarios/responsables/${id}`),       // FALTANTE
  createResponsable: (data) => api.post('/usuarios/responsables', data),
  updateResponsable: (id, data) => api.put(`/usuarios/responsables/${id}`, data),  // FALTANTE
  deleteResponsable: (id) => api.delete(`/usuarios/responsables/${id}`), // FALTANTE

  // Accesos
  listAccesos: (params) => api.get('/usuarios/accesos', { params }),
  getAcceso: (id) => api.get(`/usuarios/accesos/${id}`),                 // FALTANTE
  createAcceso: (data) => api.post('/usuarios/accesos', data),
  updateAcceso: (id, data) => api.put(`/usuarios/accesos/${id}`, data),  // FALTANTE
  deleteAcceso: (id) => api.delete(`/usuarios/accesos/${id}`),           // FALTANTE
}

// ===== HISTORIAL (todos los endpoints son FALTANTES) =====
export const historialApi = {
  list: (params) => api.get('/historial/', { params }),  // FALTANTE
  get: (id) => api.get(`/historial/${id}`)               // FALTANTE
}

export default api

// ===== VISTAS =====
export const vistasApi = {
  listEquipos: (params) => api.get('/vistas/equipos-completo/', { params }),
  getEquipos: (id) => api.get(`/vistas/equipo-completo/${id}`),

  listMobiliario: (params) => api.get('/vistas/mobiliarios-completo/', { params }),
  getMobiliario: (id) => api.get(`/vistas/mobiliario-completo/${id}`),

  listResponsables: (params) => api.get('/vistas/responsables-completo/', { params }),
  getResponsables: (id) => api.get(`/vistas/responsable-completo/${id}`),

  listAccesos: (params) => api.get('/vistas/accesos-completo/', { params }),
  getAccesos: (id) => api.get(`/vistas/acceso-completo/${id}`)
}