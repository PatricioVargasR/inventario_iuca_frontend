import { CAMPOS_LEGIBLES, NOMBRES_TABLAS, NOMBRES_OPERACIONES, CLASES_OPERACION } from '@/constants/historial'
import { capitalizarFrase } from '@/utils/formatters'

/**
 * Convierte un nombre técnico de campo en su versión legible en español.
 * Intenta varias normalizaciones antes de caer en el fallback.
 */
export function formatCampoLegible(campo) {
  if (!campo) return '—'

  // 1. Clave exacta en minúscula con espacios (reemplaza _)
  const claveMin = campo.toLowerCase().replace(/_/g, ' ').trim()
  if (CAMPOS_LEGIBLES[claveMin]) return CAMPOS_LEGIBLES[claveMin]

  // 2. Sin tildes (cubre variantes que el backend ya transformó)
  const normalizado = claveMin
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  if (CAMPOS_LEGIBLES[normalizado]) return CAMPOS_LEGIBLES[normalizado]

  // 3. Snake_case original tal cual
  const snakeKey = campo.toLowerCase().trim()
  if (CAMPOS_LEGIBLES[snakeKey]) return CAMPOS_LEGIBLES[snakeKey]

  // 4. Fallback genérico
  return capitalizarFrase(campo)
}

/**
 * Formatea un valor crudo del historial a texto legible.
 * Maneja booleanos (True/False), fechas ISO y valores vacíos.
 */
export function formatValor(valor) {
  if (valor === null || valor === undefined || valor === '') return '—'

  const s = String(valor).trim()

  if (s === 'True' || s === 'true' || s === '1') return 'Sí'
  if (s === 'False' || s === 'false' || s === '0') return 'No'

  // Fecha ISO con o sin hora
  if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?/.test(s)) {
    try {
      const d = new Date(s)
      if (!isNaN(d.getTime())) {
        if (s.includes('T')) {
          return d.toLocaleString('es-MX', {
            day: '2-digit', month: 'short',
            year: 'numeric', hour: '2-digit', minute: '2-digit'
          })
        }
        return d.toLocaleDateString('es-MX', {
          day: '2-digit', month: 'long', year: 'numeric'
        })
      }
    } catch { /* devolver como texto */ }
  }

  return s
}

/**
 * Convierte el nombre interno de una tabla a su etiqueta legible.
 */
export function formatTableName(tabla) {
  return NOMBRES_TABLAS[tabla] || capitalizarFrase(tabla)
}

/**
 * Convierte una operación SQL (INSERT/UPDATE/DELETE) a su etiqueta legible.
 */
export function formatOperation(operacion) {
  return NOMBRES_OPERACIONES[operacion] || operacion
}

/**
 * Devuelve la clase CSS para el badge de color de una operación.
 */
export function opClass(operacion) {
  return CLASES_OPERACION[operacion] || ''
}

/**
 * Genera el texto plano de descripción de un movimiento del historial.
 * Patrón: "Se [verbo] [detalle] en [Módulo] (registro #[id])."
 */
export function buildDescPlain(item) {
  const tabla = formatTableName(item.tabla)
  const id    = item.registro_id
  const op    = item.operacion

  if (op === 'INSERT') {
    return `Se registró un nuevo elemento en ${tabla} (registro #${id}).`
  }

  if (op === 'DELETE') {
    return `Se eliminó el elemento de ${tabla} (registro #${id}).`
  }

  if (op === 'UPDATE') {
    if (item.cambios_detallados?.length > 0) {
      const campoRaw = item.cambios_detallados[0].campo_legible || item.cambios_detallados[0].campo
      const campo    = formatCampoLegible(campoRaw)
      const campoMin = campo.charAt(0).toLowerCase() + campo.slice(1)
      const total    = item.cambios_detallados.length

      return total === 1
        ? `Se actualizó ${campoMin} en ${tabla} (registro #${id}).`
        : `Se actualizaron ${total} campos, incluyendo ${campoMin}, en ${tabla} (registro #${id}).`
    }
    return `Se realizaron cambios en ${tabla} (registro #${id}).`
  }

  return `Se registró un movimiento en ${tabla} (registro #${id}).`
}

/**
 * Versión con HTML coloreado para mostrar en la tabla.
 * Resalta "Módulo #id" en color primario.
 */
export function buildDescWithColor(item) {
  return buildDescPlain(item).replace(
    /([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?: de [a-záéíóúñ]+)*)\s+#(\d+)/g,
    '<span style="color:var(--primary);font-weight:600;">$1 #$2</span>'
  )
}