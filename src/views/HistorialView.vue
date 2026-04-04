<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Historial de movimientos</h1>
        <p class="page-subtitle">Registro completo de cambios y auditoría del sistema</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="card" style="padding:18px 20px;margin-bottom:20px;">
      <div class="filter-grid">
        <div class="filter-group search">
          <label>Búsqueda General</label>
          <div class="input-with-icon">
            <svg class="input-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="filters.search" class="form-input" placeholder="Usuario, equipo, descripción..." @input="onSearch" />
          </div>
        </div>
        <div class="filter-group">
          <label>Tipo de registro</label>
          <select v-model="filters.tipo_registro" class="form-select" @change="loadData">
            <option value="">Todos</option>
            <option value="computo">Equipo</option>
            <option value="mobiliario">Mobiliario</option>
            <option value="acceso">Acceso</option>
            <option value="usuario">Usuario</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Tipo de movimiento</label>
          <select v-model="filters.tipo_movimiento" class="form-select" @change="loadData">
            <option value="">Todos</option>
            <option value="creacion">Creación</option>
            <option value="edicion">Edición</option>
            <option value="eliminacion">Eliminación</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Fecha desde</label>
          <input v-model="filters.fecha_desde" type="date" class="form-input" @change="loadData" />
        </div>
        <div class="filter-group">
          <label>Fecha hasta</label>
          <input v-model="filters.fecha_hasta" type="date" class="form-input" @change="loadData" />
        </div>
        <div class="filter-group">
          <label>Usuario</label>
          <select v-model="filters.usuario_id" class="form-select" @change="loadData">
            <option value="">Todos los usuarios</option>
            <option v-for="u in usuarios" :key="u.id_acceso" :value="u.id_acceso">{{ u.nombre_usuario }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div v-if="loading" style="text-align:center;padding:48px;">
      <span class="spinner" style="width:28px;height:28px;"></span>
    </div>

    <div v-else-if="!grouped.length" class="card" style="padding:48px;text-align:center;color:var(--gray-400);">
      <div style="font-size:36px;margin-bottom:12px;">🔍</div>
      <p>No se encontraron movimientos en el rango seleccionado.</p>
    </div>

    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Movimiento</th>
            <th>Descripción</th>
            <th>Registro</th>
            <th>Usuario</th>
            <th>Hora</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="group in grouped" :key="group.date">
            <!-- Separador de fecha -->
            <tr class="date-separator-row">
              <td colspan="7">
                <div class="date-separator">
                  <span class="date-label">{{ group.dateLabel }}</span>
                  <span class="date-count">{{ group.items.length }} movimiento{{ group.items.length !== 1 ? 's' : '' }}</span>
                  <div class="date-line"></div>
                </div>
              </td>
            </tr>
            <!-- Filas del grupo -->
            <tr
              v-for="item in group.items"
              :key="item.id_historial"
              class="data-row"
            >
              <td>
                <span style="font-family:var(--font-mono);font-size:12px;color:var(--gray-500)">
                  {{ item.id_historial }}
                </span>
              </td>
              <td>
                <span class="op-badge" :class="opClass(item.operacion)">
                  <span class="op-dot"></span>
                  {{ formatOperation(item.operacion) }}
                </span>
              </td>
              <td>
                <span
                  class="row-desc"
                  :title="buildDescPlain(item)"
                  v-html="buildDescWithColor(item)"
                ></span>
              </td>
              <td>
                <span class="tabla-badge">{{ formatTableName(item.tabla) }} #{{ item.registro_id }}</span>
              </td>
              <td>
                <div class="user-cell">
                  <div class="user-avatar">{{ initials(item.realizado_por) }}</div>
                  <span>{{ item.realizado_por || 'Sistema' }}</span>
                </div>
              </td>
              <td style="font-family:var(--font-mono);font-size:12px;color:var(--gray-500)">
                {{ formatTime(item.fecha) }}
              </td>
              <td>
                <div class="actions-cell">
                  <button class="action-btn view" @click="openDetail(item)" title="Ver detalle">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>

      <Pagination
        :current="page"
        :total-pages="totalPages"
        :total="total"
        :per-page="20"
        @change="onPageChange"
      />
    </div>

    <!-- Detail Modal -->
    <BaseModal v-model="showDetail" :title="`Detalles del movimiento #${selected?.id_historial}`" :subtitle="selected ? formatFull(selected.fecha) : ''" size="lg">
      <template v-if="selected">
        <div class="section-title" style="margin-top:0">Información del movimiento</div>
        <div class="card" style="padding:14px 16px;margin-bottom:14px;">
          <div class="detail-grid" style="grid-template-columns:1fr 1fr 1fr;">
            <div class="detail-item"><label>Fecha y hora</label><strong>{{ formatFull(selected.fecha) }}</strong></div>
            <div class="detail-item"><label>Realizado por</label><strong>{{ selected.realizado_por || 'Sistema' }}</strong></div>
            <div class="detail-item"><label>ID movimiento</label><strong style="font-family:var(--font-mono)">{{ selected.id_historial}}</strong></div>
            <div class="detail-item"><label>Tipo de registro</label><strong>{{ formatTableName(selected.tabla) }}</strong></div>
            <div class="detail-item"><label>ID de registro</label><strong style="font-family:var(--font-mono)">#{{ selected.registro_id }}</strong></div>
            <div class="detail-item"><label>Tipo de movimiento</label><span class="op-badge" :class="opClass(selected.operacion)" style="font-size:12px;">{{ formatOperation(selected.operacion) }}</span></div>
          </div>
        </div>

        <div v-if="selected.cambios_detallados && selected.cambios_detallados.length > 0" style="margin-bottom:14px;">
          <div class="section-title">Cambios realizados</div>
          <div style="overflow-x:auto;border:1px solid var(--border);border-radius:var(--radius);">
            <table class="data-table" style="table-layout:fixed;width:100%;min-width:480px;">
              <colgroup>
                <col style="width:30%">
                <col style="width:35%">
                <col style="width:35%">
              </colgroup>
              <thead>
                <tr><th>Campo</th><th>Valor anterior</th><th>Valor nuevo</th></tr>
              </thead>
              <tbody>
                <tr v-for="(cambio, idx) in selected.cambios_detallados" :key="idx">
                  <td style="font-weight:600;word-break:break-word;">{{ formatCampoLegible(cambio.campo_legible || cambio.campo) }}</td>
                  <td style="word-break:break-word;">
                    <span
                      v-if="cambio.valor_anterior !== null && cambio.valor_anterior !== undefined && String(cambio.valor_anterior).trim() !== '' && String(cambio.valor_anterior).trim() !== 'None'"
                      class="val-old"
                    >
                      {{ formatValor(cambio.valor_anterior) }}
                    </span>
                    <span v-else style="color:var(--gray-300);font-size:13px;font-style:italic;">Sin valor previo</span>
                  </td>
                  <td style="word-break:break-word;">
                    <span
                      v-if="cambio.valor_nuevo !== null && cambio.valor_nuevo !== undefined && String(cambio.valor_nuevo).trim() !== '' && String(cambio.valor_nuevo).trim() !== 'None'"
                      class="val-new"
                    >
                      {{ formatValor(cambio.valor_nuevo) }}
                    </span>
                    <span v-else style="color:var(--gray-300);font-size:13px;font-style:italic;">Sin valor</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="section-title">Registro afectado</div>
        <div class="card" style="padding:16px;">
          <div style="font-weight:700;font-size:14px;margin-bottom:8px;">{{ formatTableName(selected.tabla) }} #{{ selected.registro_id }}</div>
          <p style="font-size:13px;color:var(--gray-500);margin-bottom:0;">
            Este movimiento afectó el registro con ID <strong>{{ selected.registro_id }}</strong> en el módulo de <strong>{{ formatTableName(selected.tabla) }}</strong>.
          </p>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-primary" @click="showDetail = false">Cerrar</button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { vistasApi } from '@/services/api'
import { usuariosApi } from '@/services/api'
import Pagination from '@/components/ui/Pagination.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

const items    = ref([])
const loading  = ref(false)
const page     = ref(1)
const total     = ref(0)
const totalPages = ref(1)
const showDetail = ref(false)
const selected   = ref(null)
const usuarios   = ref([])

const filters = reactive({
  search: '',
  tipo_registro: '',
  tipo_movimiento: '',
  fecha_desde: '',
  fecha_hasta: '',
  usuario_id: ''
})

// ── Agrupado por fecha ──────────────────────────────────────────
const grouped = computed(() => {
  const map = {}
  items.value.forEach(item => {
    const d = item.fecha?.slice(0, 10)
    if (!map[d]) map[d] = []
    map[d].push(item)
  })
  return Object.entries(map)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, items]) => ({ date, dateLabel: formatDateLabel(date), items }))
})

// ── Formatters ──────────────────────────────────────────────────
function formatDateLabel(d) {
  if (!d) return '–'
  const dt = new Date(d + 'T12:00:00')
  return dt.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTime(d) {
  if (!d) return ''
  return new Date(d).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

function formatFull(d) {
  if (!d) return ''
  return new Date(d).toLocaleString('es-MX', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

// CORRECCIÓN 1: Mapa de campos técnicos → nombre legible en formato de oración.
// Las claves cubren tanto el nombre raw (snake_case) como la versión que ya
// puede llegar pre-transformada desde el backend (e.g. "Id Activo", "Tipo De Activo").
const CAMPOS_LEGIBLES = {
  // ── IDs propios de cada tabla ────────────────────────────────
  'id_activo':                  'ID del elemento',
  'id_mueble':                  'ID del elemento',
  'id_usuario':                 'ID del elemento',
  'id_acceso':                  'ID del elemento',
  'id_area':                    'ID del área',
  'id_estado':                  'ID del estado',
  'id_tipo_activo':             'ID del tipo de activo',
  'id_tipo_mobiliario':         'ID del tipo de mobiliario',
  'id_especificacion':          'ID de especificación',
  'id_permiso':                 'ID del permiso',
  // ── Claves foráneas (_id al final) ───────────────────────────
  'area_id':                    'Área',
  'estado_id':                  'Estado',
  'tipo_activo_id':             'Tipo de activo',
  'tipo_mobiliario_id':         'Tipo de mobiliario',
  'usuario_asignado_id':        'Responsable asignado',
  'acceso_id':                  'ID de acceso',
  'equipo_id':                  'ID del equipo',
  'nombre_activo':              'Nombre del activo',
  'nombre':                     'Nombre',
  'marca':                      'Marca',
  'modelo':                     'Modelo',
  'numero_serie':               'Número de serie',
  'número de serie':            'Número de serie',
  'estado_id':                  'Estado',
  'estado':                     'Estado',
  'observaciones':              'Observaciones',
  'sucursal_nombre':            'Sucursal',
  'sucursal nombre':            'Sucursal',
  'sucursal':                   'Sucursal',
  'usuario_asignado_id':        'Responsable asignado',
  'usuario asignado':           'Responsable asignado',
  'fecha_registro':             'Fecha de registro',
  'fecha de registro':          'Fecha de registro',
  'fecha_modificacion':         'Fecha de modificación',
  'fecha de modificacion':      'Fecha de modificación',
  'creado_por':                 'Creado por',
  'creado por':                 'Creado por',
  'modificado_por':             'Modificado por',
  'modificado por':             'Modificado por',
  // ── Mobiliario ───────────────────────────────────────────────
  'id_mueble':                  'ID del elemento',
  'id mueble':                  'ID del elemento',
  'tipo_mobiliario_id':         'Tipo de mobiliario',
  'tipo mobiliario':            'Tipo de mobiliario',
  'tipo de mobiliario':         'Tipo de mobiliario',
  'caracteristicas':            'Características',
  'color':                      'Color',
  'fecha_asignacion':           'Fecha de asignación',
  'fecha asignacion':           'Fecha de asignación',
  // ── Usuarios / responsables ──────────────────────────────────
  'id_usuario':                 'ID del elemento',
  'id usuario':                 'ID del elemento',
  'nombre_usuario':             'Nombre del usuario',
  'nombre usuario':             'Nombre del usuario',
  'correo_electronico':         'Correo electrónico',
  'correo electronico':         'Correo electrónico',
  'puesto':                     'Puesto',
  'numero_nomina':              'Número de nómina',
  'numero nomina':              'Número de nómina',
  'área':                       'Área',
  'area_id':                    'Área',
  'area':                       'Área',
  // ── Acceso ───────────────────────────────────────────────────
  'id_acceso':                  'ID del elemento',
  'id acceso':                  'ID del elemento',
  'contrasena_hash':            'Contraseña',
  'contrasena hash':            'Contraseña',
  'ultimo_acceso':              'Último acceso',
  'ultimo acceso':              'Último acceso',
  'fecha_creacion':             'Fecha de creación',
  'fecha creacion':             'Fecha de creación',
  'fecha de creacion':          'Fecha de creación',
  'token_sesion_activa':        'Token de sesión',
  'ip_sesion':                  'IP de sesión',
  'fecha_inicio_sesion':        'Inicio de sesión',
  // ── Catálogos ────────────────────────────────────────────────
  'nombre_area':                'Nombre del área',
  'nombre area':                'Nombre del área',
  'nombre_tipo':                'Nombre del tipo',
  'nombre tipo':                'Nombre del tipo',
  'nombre_estado':              'Nombre del estado',
  'nombre estado':              'Nombre del estado',
  'color_hex':                  'Color (HEX)',
  'color hex':                  'Color (HEX)',
  'activo':                     'Estado del catálogo',
  'descripcion':                'Descripción',
  // ── Permisos ─────────────────────────────────────────────────
  'puede_leer':                 'Permiso de lectura',
  'puede leer':                 'Permiso de lectura',
  'puede_crear':                'Permiso de creación',
  'puede crear':                'Permiso de creación',
  'puede_actualizar':           'Permiso de edición',
  'puede actualizar':           'Permiso de edición',
  'puede_eliminar':             'Permiso de eliminación',
  'puede eliminar':             'Permiso de eliminación',
  'modulo':                     'Módulo',
  // ── Variantes title-case generadas por el backend con .replace('_',' ').title() ──
  // El backend hace campo.replace('_',' ').title() antes de enviarlo,
  // por eso "numero_serie" llega como "Numero Serie", "fecha_registro" como "Fecha Registro", etc.
  'numero serie':               'Número de serie',
  'fecha registro':             'Fecha de registro',
  'fecha modificacion':         'Fecha de modificación',
  'fecha creacion':             'Fecha de creación',
  'fecha asignacion':           'Fecha de asignación',
  'fecha inicio sesion':        'Inicio de sesión',
  'tipo activo':                'Tipo de activo',
  'tipo mobiliario':            'Tipo de mobiliario',
  'nombre activo':              'Nombre del activo',
  'nombre usuario':             'Nombre del usuario',
  'nombre area':                'Nombre del área',
  'nombre tipo':                'Nombre del tipo',
  'nombre estado':              'Nombre del estado',
  'correo electronico':         'Correo electrónico',
  'numero nomina':              'Número de nómina',
  'usuario asignado':           'Responsable asignado',
  'creado por':                 'Creado por',
  'modificado por':             'Modificado por',
  'color hex':                  'Color (HEX)',
  'contrasena hash':            'Contraseña',
  'ultimo acceso':              'Último acceso',
  'token sesion activa':        'Token de sesión',
  'ip sesion':                  'IP de sesión',
  'editado por':                'Editado por',
  'editado desde':              'Editado desde',
  'id activo':                  'ID del elemento',
  'id mueble':                  'ID del elemento',
  'id usuario':                 'ID del elemento',
  'id acceso':                  'ID del elemento',
  'id area':                    'ID del área',
  'id estado':                  'ID del estado',
  'id tipo activo':             'ID del tipo de activo',
  'id tipo mobiliario':         'ID del tipo de mobiliario',
  'id especificacion':          'ID de especificación',
  'id permiso':                 'ID del permiso',
  'id bloqueo':                 'ID del bloqueo',
  'id historial':               'ID del historial',
  'area id':                    'Área',
  'estado id':                  'Estado',
  'tipo activo id':             'Tipo de activo',
  'tipo mobiliario id':         'Tipo de mobiliario',
  'usuario asignado id':        'Responsable asignado',
  'acceso id':                  'ID de acceso',
  'equipo id':                  'ID del equipo',
  'creado por':                 'Creado por',
  'editado_por':                'Editado por',
  'editado_desde':              'Editado desde',
}

function formatCampoLegible(campo) {
  if (!campo) return '—'
  // Normalizar: minúsculas, sin tildes para comparar, sin guiones bajos
  const normalizado = campo
    .toLowerCase()
    .replace(/_/g, ' ')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar tildes para buscar
    .trim()

  // Buscar primero con tildes (clave exacta en minúscula)
  const claveMin = campo.toLowerCase().replace(/_/g, ' ').trim()
  if (CAMPOS_LEGIBLES[claveMin]) return CAMPOS_LEGIBLES[claveMin]

  // Buscar sin tildes (cubre variantes del backend)
  if (CAMPOS_LEGIBLES[normalizado]) return CAMPOS_LEGIBLES[normalizado]

  // Buscar la clave original tal cual (snake_case)
  const snakeKey = campo.toLowerCase().trim()
  if (CAMPOS_LEGIBLES[snakeKey]) return CAMPOS_LEGIBLES[snakeKey]

  // Fallback: capitalizar la primera letra y reemplazar _ por espacios
  return capitalizarFrase(campo)
}

// Capitalizar primera letra de una frase y reemplazar snake_case por espacios
function capitalizarFrase(texto) {
  if (!texto) return '—'
  return texto
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase → palabras
    .replace(/^./, c => c.toUpperCase())
}

// CORRECCIÓN 2: Formatear valores especiales (True/False, null, fechas, etc.)
function formatValor(valor) {
  if (valor === null || valor === undefined || valor === '') return '—'

  const s = String(valor).trim()

  // Booleanos en cualquier forma
  if (s === 'True' || s === 'true' || s === '1') return 'Sí'
  if (s === 'False' || s === 'false' || s === '0') return 'No'

  // Fechas ISO (2024-01-15T10:30:00 o 2024-01-15)
  if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?/.test(s)) {
    try {
      const d = new Date(s)
      if (!isNaN(d.getTime())) {
        // Si tiene hora, mostrar fecha y hora; si no, solo fecha
        if (s.includes('T')) {
          return d.toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        }
        return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
      }
    } catch { /* devolver como texto */ }
  }

  return s
}

function formatTableName(tabla) {
  const nombres = {
    'equipos_computo':        'Equipo de cómputo',
    'mobiliario':             'Mobiliario',
    'acceso':                 'Acceso',
    'usuario':                'Responsable',
    'cat_areas':              'Área',
    'cat_estados':            'Estado',
    'cat_tipos_activo':       'Tipo de activo',
    'cat_tipos_mobiliario':   'Tipo de mobiliario',
    'especificaciones_equipo':'Especificación de equipo',
    'permisos':               'Permiso',
  }
  return nombres[tabla] || capitalizarFrase(tabla)
}

function formatOperation(operacion) {
  return { INSERT: 'Creación', UPDATE: 'Edición', DELETE: 'Eliminación' }[operacion] || operacion
}

function opClass(operacion) {
  return { INSERT: 'op-insert', UPDATE: 'op-update', DELETE: 'op-delete' }[operacion] || ''
}

function initials(name) {
  if (!name || name === 'Sistema') return 'SYS'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

// CORRECCIÓN 3: Texto de descripción estandarizado
// Patrón uniforme: Se [verbo] [detalle] en [Módulo] (registro #[id]).
function buildDescPlain(item) {
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
      // Convertir a minúscula para que quede fluido dentro de la oración
      const campoMin = campo.charAt(0).toLowerCase() + campo.slice(1)
      const total    = item.cambios_detallados.length

      if (total === 1) {
        return `Se actualizó ${campoMin} en ${tabla} (registro #${id}).`
      }
      return `Se actualizaron ${total} campos, incluyendo ${campoMin}, en ${tabla} (registro #${id}).`
    }
    return `Se realizaron cambios en ${tabla} (registro #${id}).`
  }

  return `Se registró un movimiento en ${tabla} (registro #${id}).`
}

// Versión con color para el HTML de la celda (resalta el nombre del módulo)
function buildDescWithColor(item) {
  return buildDescPlain(item).replace(
    /([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?: de [a-záéíóúñ]+)*)\s+#(\d+)/g,
    '<span style="color:var(--primary);font-weight:600;">$1 #$2</span>'
  )
}

// ── Datos ───────────────────────────────────────────────────────
let searchTimeout = null
function onSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    loadData()
  }, 400)
}

function onPageChange(p) {
  page.value = p
  loadData()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function loadData() {
  loading.value = true
  try {
    const res = await vistasApi.listHistoriales({
      ...filters,
      page: page.value,
      per_page: 20
    })
    items.value    = res.data.movimientos || []
    total.value    = res.data.total       || 0
    totalPages.value = res.data.pages     || 1
  } catch {
    items.value    = []
    total.value    = 0
    totalPages.value = 1
  } finally {
    loading.value = false
  }
}

async function openDetail(item) {
  try {
    const res = await vistasApi.getHistorial(item.id_historial)
    selected.value = res.data
  } catch {
    selected.value = item
  }
  showDetail.value = true
}

onMounted(async () => {
  try {
    const res = await usuariosApi.listAccesos()
    usuarios.value = res.data
  } catch { console.error('Error cargando usuarios') }
  loadData()
})
</script>

<style scoped>
/* ── Filtros ── */
.filter-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
  gap: 12px;
  align-items: end;
}

@media (max-width: 1100px) {
  .filter-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
}
/* ── Separador de fecha ── */
.date-separator-row td { padding: 0; }
.date-separator-row:hover td { background: transparent !important; cursor: default; }
.date-separator {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 16px;
  background: var(--gray-50);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.date-separator-row:first-child .date-separator { border-top: none; }
.date-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gray-500);
  white-space: nowrap;
}
.date-count {
  font-size: 10px;
  color: var(--gray-400);
  background: var(--gray-100);
  border-radius: 10px;
  padding: 1px 7px;
  white-space: nowrap;
}
.date-line { flex: 1; height: 1px; background: var(--border); }

/* ── Filas ── */
.data-row { cursor: default; }

/* ── Badge de operación ── */
.op-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
.op-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}
.op-insert { background: #EAF3DE; color: #3B6D11; }
.op-update  { background: #FAEEDA; color: #854F0B; }
.op-delete  { background: #FCEBEB; color: #A32D2D; }

/* ── Badge de tabla ── */
.tabla-badge {
  display: inline-block;
  background: var(--gray-100);
  color: var(--gray-600);
  border: 1px solid var(--border);
  font-size: 12px;
  font-family: var(--font-mono);
  padding: 2px 7px;
  border-radius: 4px;
  white-space: nowrap;
}

/* CORRECCIÓN 4: Descripción — se ajusta el ancho y se agrega tooltip nativo */
.row-desc {
  font-size: 13px;
  color: var(--gray-700);
  display: block;
  /* Ampliamos el espacio visible antes de truncar */
  max-width: 480px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* Cursor de texto para indicar que hay más contenido */
  cursor: default;
}

/* Hover: mostrar texto completo sin truncar (el title del navegador ya hace el tooltip,
   pero además hacemos que el texto fluya al hacer hover para pantallas grandes) */
.data-row:hover .row-desc {
  white-space: normal;
  overflow: visible;
  max-width: 480px;
}

/* ── Usuario ── */
.user-cell {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: var(--gray-600);
}
.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--primary-50, #EEF2FF);
  color: var(--primary);
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ── Valores en modal de cambios ── */
.val-old {
  background: var(--gray-100);
  color: var(--gray-500);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
  font-style: italic;
}
.val-new {
  background: #EAF3DE;
  color: #3B6D11;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}
</style>