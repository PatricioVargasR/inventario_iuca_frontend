<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Historial de Movimientos</h1>
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
          <label>Tipo de Registro</label>
          <select v-model="filters.tipo_registro" class="form-select" @change="loadData">
            <option value="">Todos</option>
            <option value="computo">Equipo</option>
            <option value="mobiliario">Mobiliario</option>
            <option value="acceso">Acceso</option>
            <option value="usuario">Usuario</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Tipo de Movimiento</label>
          <select v-model="filters.tipo_movimiento" class="form-select" @change="loadData">
            <option value="">Todos</option>
            <option value="creacion">Creación</option>
            <option value="edicion">Edición</option>
            <option value="eliminacion">Eliminación</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Fecha Desde</label>
          <input v-model="filters.fecha_desde" type="date" class="form-input" @change="loadData" />
        </div>
        <div class="filter-group">
          <label>Fecha Hasta</label>
          <input v-model="filters.fecha_hasta" type="date" class="form-input" @change="loadData" />
        </div>
        <div class="filter-group">
          <label>Área</label>
          <select v-model="filters.area_id" class="form-select" @change="loadData">
            <option value="">Todas las áreas</option>
            <option v-for="a in areas" :key="a.id_area" :value="a.id_area">{{ a.nombre_area }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Timeline -->
    <div v-if="loading" style="text-align:center;padding:48px;"><span class="spinner" style="width:28px;height:28px;"></span></div>

    <div v-else-if="!grouped.length" class="card" style="padding:48px;text-align:center;color:var(--gray-400);">
      <div style="font-size:36px;margin-bottom:12px;">📋</div>
      <p>No se encontraron movimientos en el rango seleccionado.</p>
    </div>

    <div v-else>
      <div v-for="group in grouped" :key="group.date" class="timeline-date-group">
        <div class="timeline-date-header">
          <span class="timeline-date">{{ group.dateLabel }}</span>
          <span class="timeline-count">{{ group.items.length }} movimientos</span>
          <div style="flex:1;height:1px;background:var(--border);margin-left:4px;"></div>
        </div>
        <div class="timeline-item" v-for="item in group.items" :key="item.id_historial" @click="openDetail(item)" style="cursor:pointer;">
          <div>
            <div class="timeline-time">⏰ {{ formatTime(item.fecha) }}</div>
            <div class="timeline-desc">{{ buildDesc(item) }}</div>
          </div>
          <div>
            <div class="timeline-user">{{ item.realizado_por || 'Sistema' }}</div>
            <div class="timeline-area">{{ formatTableName(item.tabla) }}</div>
          </div>
          <a class="btn btn-ghost btn-sm" style="color:var(--primary);font-weight:600;white-space:nowrap;" @click.stop="openDetail(item)">
            Ver completo →
          </a>
        </div>
      </div>

      <div class="load-more">
        <button v-if="hasMore" class="btn btn-secondary" @click="loadMore">Cargar más movimientos ↓</button>
        <span v-else>— fin del historial —</span>
      </div>
    </div>

    <div class="info-banner">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
      <div><strong>Información del Sistema</strong>Utilice los filtros superiores para refinar su búsqueda por categorías específicas. El sistema actualiza automáticamente la vista de auditoría para el responsable asignado.</div>
    </div>

    <!-- Detail Modal -->
    <BaseModal v-model="showDetail" :title="`Detalles del Movimiento #${selected?.id_historial}`" :subtitle="selected ? formatFull(selected.fecha) : ''" size="lg">
      <template v-if="selected">
        <div class="section-title" style="margin-top:0">INFORMACIÓN DEL MOVIMIENTO</div>
        <div class="card" style="padding:14px 16px;margin-bottom:14px;">
          <div class="detail-grid" style="grid-template-columns:1fr 1fr 1fr;">
            <div class="detail-item"><label>Fecha y Hora</label><strong>{{ formatFull(selected.fecha) }}</strong></div>
            <div class="detail-item"><label>Realizado Por</label><strong>{{ selected.realizado_por || 'Sistema' }}</strong></div>
            <div class="detail-item"><label>ID Movimiento</label><strong style="font-family:var(--font-mono)">MOV-{{ String(selected.id_historial).padStart(4,'0') }}</strong></div>
            <div class="detail-item"><label>Tipo de Registro</label><strong>{{ formatTableName(selected.tabla) }}</strong></div>
            <div class="detail-item"><label>ID de Registro</label><strong style="font-family:var(--font-mono)">#{{ selected.registro_id }}</strong></div>
            <div class="detail-item"><label>Tipo de Movimiento</label><span class="badge badge-primary" style="font-size:12px;">{{ formatOperation(selected.operacion) }}</span></div>
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

const items = ref([])
const loading = ref(false)
const page = ref(1)
const hasMore = ref(false)
const showDetail = ref(false)
const selected = ref(null)
const areas = ref([])

const filters = reactive({
  search: '',
  tipo_registro: '',
  tipo_movimiento: '',
  fecha_desde: '',
  fecha_hasta: '',
  area_id: ''
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
    'equipos_computo': 'Equipo de Cómputo',
    'mobiliario': 'Mobiliario',
    'acceso': 'Acceso',
    'usuario': 'Usuario',
    'cat_areas': 'Área',
    'cat_estados': 'Estado',
    'cat_tipos_activo': 'Tipo de Activo',
    'cat_tipos_mobiliario': 'Tipo de Mobiliario',
    'especificaciones_equipo': 'Especificación'
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

let searchTimeout = null
function onSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    loadData()
  }, 400)
}

function clearFilters() {
  Object.assign(filters, {
    search: '',
    tipo_registro: '',
    tipo_movimiento: '',
    fecha_desde: '',
    fecha_hasta: '',
    area_id: ''
  })
  loadData()
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
    const res = await catalogosApi.getAreas()
    areas.value = res.data
  } catch (error) {
    console.error('Error loading areas:', error)
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

@media (max-width: 1100px) { .filter-grid { grid-template-columns: 1fr 1fr 1fr; } }
</style>