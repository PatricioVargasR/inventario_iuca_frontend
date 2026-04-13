// ─────────────────────────────────────────────────────────────
// catalogos.constants.js
// Definiciones estáticas y helpers puros (sin estado reactivo).
// ─────────────────────────────────────────────────────────────

export const TABS = [
  { key: 'area',            label: 'Áreas',               labelSingular: 'área',               placeholder: 'Ej: Dirección, Sistemas...' },
  { key: 'estado',          label: 'Estados',             labelSingular: 'estado',             placeholder: 'Ej: Bueno, Regular...'      },
  { key: 'tipo_activo',     label: 'Tipos de activo',     labelSingular: 'tipo de activo',     placeholder: 'Ej: Laptop, Escritorio...'  },
  { key: 'tipo_mobiliario', label: 'Tipos de mobiliario', labelSingular: 'tipo de mobiliario', placeholder: 'Ej: Silla, Mesa...'         },
]

/** Nombre de tabla en BD por tab key */
export const TABLA_MAP = {
  area:            'cat_areas',
  estado:          'cat_estados',
  tipo_activo:     'cat_tipos_activo',
  tipo_mobiliario: 'cat_tipos_mobiliario',
}

/** Clave del array dentro de la respuesta paginada del backend */
export const DATA_KEY = {
  area:            'areas',
  estado:          'estados',
  tipo_activo:     'tipos_activo',
  tipo_mobiliario: 'tipos_mobiliario',
}

/**
 * Traduce campos lógicos del sort ('id', 'nombre') al nombre
 * real de columna en BD según el tab activo.
 * Los campos genéricos (activo, fecha_creacion) se pasan directo.
 */
export const SORT_FIELD_MAP = {
  area:            { id: 'id_area',            nombre: 'nombre_area'   },
  estado:          { id: 'id_estado',          nombre: 'nombre_estado' },
  tipo_activo:     { id: 'id_tipo_activo',     nombre: 'nombre_tipo'   },
  tipo_mobiliario: { id: 'id_tipo_mobiliario', nombre: 'nombre_tipo'   },
}

/**
 * Métodos del API para cada operación CRUD por tab key.
 */
export const METODO_MAP = {
  area:            { getAll: 'getAreas',           getOne: 'getArea',           create: 'createArea',           update: 'updateArea',           delete: 'deleteArea'           },
  estado:          { getAll: 'getEstados',         getOne: 'getEstado',         create: 'createEstado',         update: 'updateEstado',         delete: 'deleteEstado'         },
  tipo_activo:     { getAll: 'getTiposActivo',     getOne: 'getActivo',         create: 'createTipoActivo',     update: 'updateTipoActivo',     delete: 'deleteTipoActivo'     },
  tipo_mobiliario: { getAll: 'getTiposMobiliario', getOne: 'getMobiliario',     create: 'createTipoMobiliario', update: 'updateTipoMobiliario', delete: 'deleteTipoMobiliario' },
}

/**
 * Campo de nombre real en BD para armar el payload de create/update.
 */
export const NOMBRE_FIELD = {
  area:            'nombre_area',
  estado:          'nombre_estado',
  tipo_activo:     'nombre_tipo',
  tipo_mobiliario: 'nombre_tipo',
}

// ── Helpers puros ────────────────────────────────────────────────

/** Devuelve el ID numérico del item sin importar qué tab es. */
export function getItemId(item) {
  return item?.id_area ?? item?.id_tipo_activo ?? item?.id_estado ?? item?.id_tipo_mobiliario
}

/** Devuelve el nombre del item sin importar qué tab es. */
export function getItemNombre(item) {
  return item?.nombre_area ?? item?.nombre_tipo ?? item?.nombre_estado ?? '–'
}

/** Resuelve el campo lógico de sort al nombre real de columna en BD. */
export function resolveField(logicalField, tabKey) {
  return SORT_FIELD_MAP[tabKey]?.[logicalField] ?? logicalField
}

/** Capitaliza la primera letra de un string. */
export function capitalize(str = '') {
  return str.charAt(0).toUpperCase() + str.slice(1)
}