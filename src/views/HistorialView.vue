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
            <th>MOVIMIENTO</th>
            <th>DESCRIPCIÓN</th>
            <th>REGISTRO</th>
            <th>USUARIO</th>
            <th>HORA</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="group in grouped" :key="group.date">
            <!-- Separador de fecha -->
            <tr class="date-separator-row">
              <td colspan="6">
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
              @click="openDetail(item)"
            >
              <td>
                <span style="font-family:var(--font-mono);font-size:12px;color:var(--gray-500)">
                  MOV-{{ String(item.id_historial).padStart(4,'0') }}
                </span>
              </td>
              <td>
                <span class="op-badge" :class="opClass(item.operacion)">
                  <span class="op-dot"></span>
                  {{ formatOperation(item.operacion) }}
                </span>
              </td>
              <td>
                <span class="row-desc" v-html="buildDescWithColor(item)"></span>
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
            </tr>
          </template>
        </tbody>
      </table>

      <!-- Cargar más -->
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
        <div class="section-title" style="margin-top:0">INFORMACIÓN DEL MOVIMIENTO</div>
        <div class="card" style="padding:14px 16px;margin-bottom:14px;">
          <div class="detail-grid" style="grid-template-columns:1fr 1fr 1fr;">
            <div class="detail-item"><label>Fecha y hora</label><strong>{{ formatFull(selected.fecha) }}</strong></div>
            <div class="detail-item"><label>Realizado por</label><strong>{{ selected.realizado_por || 'Sistema' }}</strong></div>
            <div class="detail-item"><label>ID movimiento</label><strong style="font-family:var(--font-mono)">MOV-{{ String(selected.id_historial).padStart(4,'0') }}</strong></div>
            <div class="detail-item"><label>Tipo de registro</label><strong>{{ formatTableName(selected.tabla) }}</strong></div>
            <div class="detail-item"><label>ID de registro</label><strong style="font-family:var(--font-mono)">#{{ selected.registro_id }}</strong></div>
            <div class="detail-item"><label>Tipo de movimiento</label><span class="op-badge" :class="opClass(selected.operacion)" style="font-size:12px;">{{ formatOperation(selected.operacion) }}</span></div>
          </div>
        </div>

        <div v-if="selected.cambios_detallados && selected.cambios_detallados.length > 0" style="margin-bottom:14px;">
          <div class="section-title">CAMBIOS DETALLADOS</div>
          <table class="data-table" style="border:1px solid var(--border);border-radius:var(--radius);">
            <thead>
              <tr><th>CAMPO</th><th>VALOR ANTERIOR</th><th>VALOR NUEVO</th></tr>
            </thead>
            <tbody>
              <tr v-for="(cambio, idx) in selected.cambios_detallados" :key="idx">
                <td style="font-weight:600">{{ cambio.campo_legible }}</td>
                <td>
                  <span v-if="cambio.valor_anterior" class="val-old">{{ cambio.valor_anterior }}</span>
                  <span v-else style="color:var(--gray-400);font-size:13px;">–</span>
                </td>
                <td>
                  <span v-if="cambio.valor_nuevo" class="val-new">{{ cambio.valor_nuevo }}</span>
                  <span v-else style="color:var(--gray-400);font-size:13px;">–</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="section-title">INFORMACIÓN DEL REGISTRO AFECTADO</div>
        <div class="card" style="padding:16px;">
          <div style="font-weight:700;font-size:14px;margin-bottom:8px;">{{ formatTableName(selected.tabla) }} #{{ selected.registro_id }}</div>
          <p style="font-size:13px;color:var(--gray-500);margin-bottom:12px;">
            Este movimiento afectó el registro identificado con el ID <strong>{{ selected.registro_id }}</strong>
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

function formatTableName(tabla) {
  const nombres = {
    'equipos_computo': 'Equipo de cómputo',
    'mobiliario': 'Mobiliario',
    'acceso': 'Acceso',
    'usuario': 'Usuario',
    'cat_areas': 'Área',
    'cat_estados': 'Estado',
    'cat_tipos_activo': 'Tipo de activo',
    'cat_tipos_mobiliario': 'Tipo de mobiliario',
    'especificaciones_equipo': 'Especificación',
    'permisos': 'Permiso'
  }
  return nombres[tabla] || tabla
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

function buildDesc(item) {
  const tableName = formatTableName(item.tabla)
  if (item.operacion === 'INSERT')
    return `Registro de nuevo ingreso al inventario: "${tableName} #${item.registro_id}"`
  if (item.operacion === 'DELETE')
    return `Se eliminó el registro: "${tableName} #${item.registro_id}"`
  if (item.operacion === 'UPDATE' && item.cambios_detallados?.length > 0)
    return `Se actualizó ${item.cambios_detallados[0].campo_legible} en "${tableName} #${item.registro_id}"`
  return `${formatOperation(item.operacion)} en "${tableName} #${item.registro_id}"`
}

function buildDescWithColor(item) {
  return buildDesc(item).replace(/"([^"]+)"/g, '<span style="color:var(--primary);font-weight:600;">"$1"</span>')
}

// ── Datos ───────────────────────────────────────────────────────
let searchTimeout = null
function onSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1   // resetear a primera página al buscar
    loadData()
  }, 400)
}

function onPageChange(p) {
  page.value = p
  loadData()
  // Scroll al inicio de la tabla
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
@media (max-width: 1100px) { .filter-grid { grid-template-columns: 1fr 1fr 1fr; } }

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

/* ── Filas clickeables ── */
.data-row { cursor: pointer; }

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

/* ── Descripción truncada ── */
.row-desc {
  font-size: 13px;
  color: var(--gray-700);
  display: block;
  max-width: 340px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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