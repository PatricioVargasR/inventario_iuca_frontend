<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Historial de movimientos</h1>
        <p class="page-subtitle">Registro completo de cambios y auditoría del sistema</p>
      </div>
    </div>

    <!-- Filtros avanzados -->
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

    <!-- Timeline -->
    <div v-if="loading" style="text-align:center;padding:48px;"><span class="spinner" style="width:28px;height:28px;"></span></div>

    <div v-else-if="!grouped.length" class="card" style="padding:48px;text-align:center;color:var(--gray-400);">
      <div style="font-size:36px;margin-bottom:12px;"></div>
      <p>No se encontraron movimientos en el rango seleccionado.</p>
    </div>

    <div v-else>
      <div v-for="group in grouped" :key="group.date" class="timeline-date-group">
        <div class="timeline-date-header">
          <span class="timeline-date">{{ group.dateLabel }}</span>
          <span class="timeline-count">{{ group.items.length }} movimientos</span>
          <div style="flex:1;height:1px;background:var(--border);margin-left:4px;"></div>
        </div>
        <div class="timeline-item-enhanced" v-for="item in group.items" :key="item.id_historial" @click="openDetail(item)">
          <div class="timeline-left">
            <div class="timeline-time">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {{ formatTime(item.fecha) }}
            </div>
            <div class="timeline-desc-enhanced" v-html="buildDescWithColor(item)"></div>
          </div>
          <div class="timeline-right">
            <div class="timeline-user-enhanced">{{ item.realizado_por || 'Sistema' }}</div>
            <div class="timeline-area">{{ formatTableName(item.tabla) }}</div>
          </div>
        </div>
      </div>

      <div class="load-more">
        <button v-if="hasMore" class="btn btn-secondary" @click="loadMore">Cargar más movimientos ↓</button>
        <span v-else>— Fin del historial —</span>
      </div>
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
            <div class="detail-item"><label>Tipo de movimiento</label><span class="badge badge-primary" style="font-size:12px;">{{ formatOperation(selected.operacion) }}</span></div>
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
                  <span v-if="cambio.valor_anterior" style="background:var(--gray-100);padding:2px 8px;border-radius:4px;font-size:13px;font-style:italic;color:var(--gray-500);">
                    {{ cambio.valor_anterior }}
                  </span>
                  <span v-else style="color:var(--gray-400);font-size:13px;">–</span>
                </td>
                <td>
                  <span v-if="cambio.valor_nuevo" class="badge badge-success" style="font-size:12px;">
                    {{ cambio.valor_nuevo }}
                  </span>
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
import { vistasApi, catalogosApi } from '@/services/api'
import BaseModal from '@/components/ui/BaseModal.vue'
import { usuariosApi } from '../services/api'

const items = ref([])
const loading = ref(false)
const page = ref(1)
const hasMore = ref(false)
const showDetail = ref(false)
const selected = ref(null)
const usuarios = ref([])

const filters = reactive({
  search: '',
  tipo_registro: '',
  tipo_movimiento: '',
  fecha_desde: '',
  fecha_hasta: '',
  usuario_id: ''
})

const grouped = computed(() => {
  const map = {}
  items.value.forEach(item => {
    const d = item.fecha?.slice(0, 10)
    if (!map[d]) map[d] = []
    map[d].push(item)
  })
  return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0])).map(([date, items]) => ({
    date, dateLabel: formatDateLabel(date), items
  }))
})

function formatDateLabel(d) {
  if (!d) return '–'
  const dt = new Date(d + 'T12:00:00')
  return dt.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTime(d) {
  if (!d) return ''
  return new Date(d).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

function formatFull(d) {
  if (!d) return ''
  return new Date(d).toLocaleString('es-MX', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
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
  const nombres = {
    'INSERT': 'Creación',
    'UPDATE': 'Edición',
    'DELETE': 'Eliminación'
  }
  return nombres[operacion] || operacion
}

function buildDesc(item) {
  const operation = formatOperation(item.operacion)
  const tableName = formatTableName(item.tabla)

  if (item.operacion === 'INSERT') {
    return `Registro de nuevo ingreso al inventario: "${tableName} #${item.registro_id}"`
  }

  if (item.operacion === 'DELETE') {
    return `Se eliminó el registro: "${tableName} #${item.registro_id}"`
  }

  if (item.operacion === 'UPDATE' && item.cambios_detallados && item.cambios_detallados.length > 0) {
    const primerCambio = item.cambios_detallados[0]
    return `Se actualizó ${primerCambio.campo_legible} en "${tableName} #${item.registro_id}"`
  }

  return `${operation} en "${tableName} #${item.registro_id}"`
}

function buildDescWithColor(item) {
  const desc = buildDesc(item)
  // Reemplazar el texto entre comillas con un span azul
  return desc.replace(/"([^"]+)"/g, '<span style="color: var(--primary); font-weight: 700;">"$1"</span>')
}

let searchTimeout = null
function onSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    loadData()
  }, 400)
}


async function loadData() {
  loading.value = true
  page.value = 1

  try {
    const params = {
      ...filters,
      page: 1,
      per_page: 20
    }

    const res = await vistasApi.listHistoriales(params)

    items.value = res.data.movimientos || []
    hasMore.value = res.data.has_next || false
  } catch (error) {
    items.value = []
    hasMore.value = false
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  page.value++

  try {
    const params = {
      ...filters,
      page: page.value,
      per_page: 20
    }

    const res = await vistasApi.listHistoriales(params)

    items.value.push(...(res.data.movimientos || []))
    hasMore.value = res.data.has_next || false
  } catch (error) {
    hasMore.value = false
  }
}

async function openDetail(item) {
  try {
    const res = await vistasApi.getHistorial(item.id_historial)
    selected.value = res.data
  } catch (error) {
    selected.value = item
  }
  showDetail.value = true
}

onMounted(async () => {
  try {
    const res = await usuariosApi.listAccesos()
    usuarios.value = res.data
  } catch (error) {
    console.error('Error cargando usuarios:', error)
  }

  loadData()
})
</script>

<style scoped>
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

/* Enhanced timeline item with better spacing and alignment */
.timeline-item-enhanced {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
  background: white;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 12px;
  transition: border-color 0.15s;
  min-height: 90px;
  cursor: pointer;
}

.timeline-item-enhanced:hover {
  border-color: var(--gray-400);
}

.timeline-left {
  flex: 1;
  min-width: 0;
}

.timeline-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  min-width: 180px;
  margin-left: auto;
}

.timeline-desc-enhanced {
  font-size: 14px;
  color: var(--gray-700);
  line-height: 1.5;
  font-weight: 600;
  margin-top: 6px;
}

.timeline-user-enhanced {
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-900);
  text-align: right;
}

.timeline-area {
  font-size: 12px;
  color: var(--gray-500);
  text-align: right;
}

.timeline-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--gray-500);
  font-weight: 500;
}

@media (max-width: 768px) {
  .timeline-item-enhanced {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    min-height: auto;
  }

  .timeline-right {
    align-items: flex-start;
    width: 100%;
  }

  .timeline-user-enhanced,
  .timeline-area {
    text-align: left;
  }
}
</style>  