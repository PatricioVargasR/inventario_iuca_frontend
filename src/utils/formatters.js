// ── Fechas ────────────────────────────────────────────────────────

/**
 * Fecha corta: "15/01/2024 10:30"
 * Usado en: AccesosView (último acceso), CatalogosView (fecha creación)
 */
export function formatDate(d) {
  if (!d) return '–'
  const dt = new Date(d)
  return (
    dt.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' +
    dt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  )
}

/**
 * Solo hora: "10:30"
 * Usado en: HistorialView (columna hora)
 */
export function formatTime(d) {
  if (!d) return ''
  return new Date(d).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Fecha larga completa: "15 de enero de 2024, 10:30:00"
 * Usado en: HistorialView (detalle del movimiento)
 */
export function formatFull(d) {
  if (!d) return ''
  return new Date(d).toLocaleString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

/**
 * Solo fecha: "15 ene. 2024"
 * Usado en: CatalogosView (columna creado), UsuariosView (fecha creación en detalle)
 */
export function formatDateShort(d) {
  if (!d) return '–'
  return new Date(d).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

/**
 * Etiqueta de fecha para agrupar: "lunes, 15 de enero de 2024"
 * Usado en: HistorialView (separadores de grupo por fecha)
 */
export function formatDateLabel(d) {
  if (!d) return '–'
  const dt = new Date(d + 'T12:00:00')
  return dt.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// ── Texto ─────────────────────────────────────────────────────────

/**
 * Capitaliza la primera letra y reemplaza snake_case / camelCase por espacios.
 * Usado en: HistorialView (fallback para nombres de campos y tablas)
 */
export function capitalizarFrase(texto) {
  if (!texto) return '—'
  return texto
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, c => c.toUpperCase())
}

/**
 * Iniciales de un nombre (máximo 2 palabras).
 * Usado en: HistorialView (avatar de usuario en tabla)
 */
export function initials(name) {
  if (!name || name === 'Sistema') return 'SYS'
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}