/**
 * Mapeo de nombres técnicos de campos (snake_case, title-case del backend,
 * y variantes con/sin tildes) a nombres legibles en español.
 *
 * El backend a veces envía campo.replace('_',' ').title(), por eso hay entradas
 * duplicadas como 'numero_serie' y 'numero serie'.
 */
export const CAMPOS_LEGIBLES = {
  // ── IDs ──────────────────────────────────────────────────────────
  'id_activo':             'ID del elemento',
  'id_mueble':             'ID del elemento',
  'id_usuario':            'ID del elemento',
  'id_acceso':             'ID del elemento',
  'id_area':               'ID del área',
  'id_estado':             'ID del estado',
  'id_tipo_activo':        'ID del tipo de activo',
  'id_tipo_mobiliario':    'ID del tipo de mobiliario',
  'id_especificacion':     'ID de especificación',
  'id_permiso':            'ID del permiso',
  // variantes title-case del backend
  'id activo':             'ID del elemento',
  'id mueble':             'ID del elemento',
  'id usuario':            'ID del elemento',
  'id acceso':             'ID del elemento',
  'id area':               'ID del área',
  'id estado':             'ID del estado',
  'id tipo activo':        'ID del tipo de activo',
  'id tipo mobiliario':    'ID del tipo de mobiliario',
  'id especificacion':     'ID de especificación',
  'id permiso':            'ID del permiso',

  // ── Claves foráneas ───────────────────────────────────────────────
  'area_id':               'Área',
  'estado_id':             'Estado',
  'tipo_activo_id':        'Tipo de activo',
  'tipo_mobiliario_id':    'Tipo de mobiliario',
  'usuario_asignado_id':   'Responsable asignado',
  'acceso_id':             'ID de acceso',
  'equipo_id':             'ID del equipo',
  // variantes title-case
  'area id':               'Área',
  'estado id':             'Estado',
  'tipo activo id':        'Tipo de activo',
  'tipo mobiliario id':    'Tipo de mobiliario',
  'usuario asignado id':   'Responsable asignado',
  'acceso id':             'ID de acceso',
  'equipo id':             'ID del equipo',

  // ── Equipos de cómputo ────────────────────────────────────────────
  'nombre_activo':         'Nombre del activo',
  'marca':                 'Marca',
  'modelo':                'Modelo',
  'numero_serie':          'Número de serie',
  'observaciones':         'Observaciones',
  'sucursal_nombre':       'Sucursal',
  'sucursal':              'Sucursal',
  // variantes title-case
  'nombre activo':         'Nombre del activo',
  'numero serie':          'Número de serie',
  'sucursal nombre':       'Sucursal',

  // ── Mobiliario ────────────────────────────────────────────────────
  'caracteristicas':       'Características',
  'color':                 'Color',
  'fecha_asignacion':      'Fecha de asignación',
  'fecha asignacion':      'Fecha de asignación',

  // ── Usuarios / responsables ───────────────────────────────────────
  'nombre_usuario':        'Nombre del usuario',
  'correo_electronico':    'Correo electrónico',
  'puesto':                'Puesto',
  'numero_nomina':         'Número de nómina',
  'area':                  'Área',
  // variantes title-case
  'nombre usuario':        'Nombre del usuario',
  'correo electronico':    'Correo electrónico',
  'numero nomina':         'Número de nómina',

  // ── Acceso ────────────────────────────────────────────────────────
  'contrasena_hash':       'Contraseña',
  'ultimo_acceso':         'Último acceso',
  'fecha_creacion':        'Fecha de creación',
  'token_sesion_activa':   'Token de sesión',
  'ip_sesion':             'IP de sesión',
  'fecha_inicio_sesion':   'Inicio de sesión',
  // variantes title-case
  'contrasena hash':       'Contraseña',
  'ultimo acceso':         'Último acceso',
  'fecha creacion':        'Fecha de creación',
  'fecha de creacion':     'Fecha de creación',
  'token sesion activa':   'Token de sesión',
  'ip sesion':             'IP de sesión',
  'fecha inicio sesion':   'Inicio de sesión',

  // ── Catálogos ─────────────────────────────────────────────────────
  'nombre_area':           'Nombre del área',
  'nombre_tipo':           'Nombre del tipo',
  'nombre_estado':         'Nombre del estado',
  'color_hex':             'Color (HEX)',
  'activo':                'Estado del catálogo',
  'descripcion':           'Descripción',
  // variantes title-case
  'nombre area':           'Nombre del área',
  'nombre tipo':           'Nombre del tipo',
  'nombre estado':         'Nombre del estado',
  'color hex':             'Color (HEX)',

  // ── Permisos ──────────────────────────────────────────────────────
  'puede_leer':            'Permiso de lectura',
  'puede_crear':           'Permiso de creación',
  'puede_actualizar':      'Permiso de edición',
  'puede_eliminar':        'Permiso de eliminación',
  'modulo':                'Módulo',
  // variantes title-case
  'puede leer':            'Permiso de lectura',
  'puede crear':           'Permiso de creación',
  'puede actualizar':      'Permiso de edición',
  'puede eliminar':        'Permiso de eliminación',

  // ── Campos de auditoría ───────────────────────────────────────────
  'fecha_registro':        'Fecha de registro',
  'fecha_modificacion':    'Fecha de modificación',
  'creado_por':            'Creado por',
  'modificado_por':        'Modificado por',
  'editado_por':           'Editado por',
  'editado_desde':         'Editado desde',
  // variantes title-case
  'fecha registro':        'Fecha de registro',
  'fecha modificacion':    'Fecha de modificación',
  'creado por':            'Creado por',
  'modificado por':        'Modificado por',
  'editado por':           'Editado por',
  'editado desde':         'Editado desde',
}

/**
 * Mapeo de nombres de tablas internas a etiquetas legibles en español.
 */
export const NOMBRES_TABLAS = {
  'equipos_computo':         'Equipo de cómputo',
  'mobiliario':              'Mobiliario',
  'acceso':                  'Acceso',
  'usuario':                 'Responsable',
  'cat_areas':               'Área',
  'cat_estados':             'Estado',
  'cat_tipos_activo':        'Tipo de activo',
  'cat_tipos_mobiliario':    'Tipo de mobiliario',
  'especificaciones_equipo': 'Especificación de equipo',
  'permisos':                'Permiso',
}

/**
 * Mapeo de operaciones SQL a etiquetas legibles.
 */
export const NOMBRES_OPERACIONES = {
  INSERT: 'Creación',
  UPDATE: 'Edición',
  DELETE: 'Eliminación',
}

/**
 * Clases CSS para cada tipo de operación (badge de color).
 */
export const CLASES_OPERACION = {
  INSERT: 'op-insert',
  UPDATE: 'op-update',
  DELETE: 'op-delete',
}