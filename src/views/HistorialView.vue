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
      <div style="display:flex;align-items:center;gap:7px;margin-bottom:14px;font-size:13px;font-weight:700;color:var(--primary);">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        Filtros Avanzados
      </div>
      <div class="filter-grid">
        <div class="filter-group">
          <label>Búsqueda Rápida</label>
          <div class="input-with-icon">
            <svg class="input-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="filters.search" class="form-input" placeholder="Usuario, equipo, descripción..." @input="onSearch" />
          </div>
        </div>
        <div class="filter-group">
          <label>Tipo de Registro</label>
          <select v-model="filters.tipo_registro" class="form-select" @change="loadData">
            <option value="">Todos</option>
            <option value="equipo">Equipo</option>
            <option value="mobiliario">Mobiliario</option>
            <option value="acceso">Acceso</option>
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
      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:14px;align-items:center;">
        <a href="#" style="font-size:13px;color:var(--primary);" @click.prevent="clearFilters">Limpiar Filtros</a>
        <button class="btn btn-primary btn-sm" @click="loadData">Aplicar Filtros</button>
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
        <div class="timeline-item" v-for="item in group.items" :key="item.id_movimiento" @click="openDetail(item)" style="cursor:pointer;">
          <div>
            <div class="timeline-time">⏰ {{ formatTime(item.fecha_movimiento) }}</div>
            <div class="timeline-desc">{{ item.descripcion || buildDesc(item) }}</div>
          </div>
          <div>
            <div class="timeline-user">{{ item.realizado_por_nombre || 'Sistema' }}</div>
            <div class="timeline-area">🏢 {{ item.area || '–' }}</div>
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
    <BaseModal v-model="showDetail" :title="`Detalles del Movimiento #${selected?.id_movimiento}`" :subtitle="selected ? formatFull(selected.fecha_movimiento) : ''" size="lg">
      <template v-if="selected">
        <div class="section-title" style="margin-top:0">INFORMACIÓN DEL MOVIMIENTO</div>
        <div class="card" style="padding:14px 16px;margin-bottom:14px;">
          <div class="detail-grid" style="grid-template-columns:1fr 1fr 1fr;">
            <div class="detail-item"><label>Fecha y Hora</label><strong>{{ formatFull(selected.fecha_movimiento) }}</strong></div>
            <div class="detail-item"><label>Realizado Por</label><strong>{{ selected.realizado_por_nombre || '–' }}</strong></div>
            <div></div>
            <div class="detail-item"><label>Tipo de Registro</label><strong>{{ selected.tipo_registro }}</strong></div>
            <div class="detail-item"><label>Área / Ubicación</label><strong>{{ selected.area || '–' }}</strong></div>
            <div class="detail-item"><label>Tipo de Movimiento</label><span class="badge badge-primary" style="font-size:12px;">{{ selected.tipo_movimiento }}</span></div>
          </div>
        </div>

        <div v-if="selected.campo_modificado" style="margin-bottom:14px;">
          <div class="section-title">CAMBIOS DETALLADOS</div>
          <table class="data-table" style="border:1px solid var(--border);border-radius:var(--radius);">
            <thead>
              <tr><th>CAMPO</th><th>VALOR ANTERIOR</th><th>VALOR NUEVO</th></tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-weight:600">{{ selected.campo_modificado }}</td>
                <td><span style="background:var(--gray-100);padding:2px 8px;border-radius:4px;font-size:13px;font-style:italic;color:var(--gray-500);">{{ selected.valor_anterior || '–' }}</span></td>
                <td><span class="badge badge-success" style="font-size:12px;">{{ selected.valor_nuevo || '–' }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="section-title">INFORMACIÓN DEL REGISTRO AFECTADO</div>
        <div class="card" style="padding:16px;">
          <div style="font-weight:700;font-size:14px;margin-bottom:12px;">{{ selected.tipo_registro }} #{{ selected.id_registro }}</div>
          <button class="btn btn-secondary btn-block" style="font-size:13px;color:var(--primary);border-color:var(--primary-light);">
            Ver registro completo →
          </button>
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
import { historialApi, catalogosApi } from '@/services/api'
import BaseModal from '@/components/ui/BaseModal.vue'

const items = ref([])
const loading = ref(false)
const page = ref(1)
const hasMore = ref(false)
const showDetail = ref(false)
const selected = ref(null)
const areas = ref([])

const filters = reactive({
  search: '', tipo_registro: '', tipo_movimiento: '',
  fecha_desde: '', fecha_hasta: '', area_id: ''
})

// Mock data for when historial endpoint is not available
const mockData = [
  { id_movimiento: 1247, tipo_registro: 'Equipo de Cómputo #245', id_registro: 245, tipo_movimiento: 'Edición', campo_modificado: 'Estado', valor_anterior: 'Bueno', valor_nuevo: 'Nuevo', realizado_por_nombre: 'Pérez Olmedo Adriana', area: 'Dirección de organizaciones', fecha_movimiento: '2025-02-11T14:32:00', observaciones: '' },
  { id_movimiento: 1246, tipo_registro: 'MacBook Air M2', id_registro: 442, tipo_movimiento: 'Creación', campo_modificado: null, valor_anterior: null, valor_nuevo: null, realizado_por_nombre: 'Marta Sánchez', area: 'Recursos Humanos', fecha_movimiento: '2025-02-11T11:15:00', observaciones: '' },
  { id_movimiento: 1245, tipo_registro: 'Escritorio Ergonómico', id_registro: 100, tipo_movimiento: 'Edición', campo_modificado: 'Estado', valor_anterior: 'Regular', valor_nuevo: 'Bueno', realizado_por_nombre: 'Juan Pérez', area: 'Administración', fecha_movimiento: '2025-02-11T09:45:00', observaciones: '' },
  { id_movimiento: 1244, tipo_registro: 'Servidor Local Legacy-2018', id_registro: 50, tipo_movimiento: 'Eliminación', campo_modificado: null, valor_anterior: null, valor_nuevo: null, realizado_por_nombre: 'Admin Sistema', area: 'Seguridad', fecha_movimiento: '2025-02-10T17:50:00', observaciones: '' },
  { id_movimiento: 1243, tipo_registro: 'iPhone 15 Pro Max', id_registro: 600, tipo_movimiento: 'Creación', campo_modificado: null, valor_anterior: null, valor_nuevo: null, realizado_por_nombre: 'Carlos Ruiz', area: 'IT y Sistemas', fecha_movimiento: '2025-02-10T16:20:00', observaciones: '' },
  { id_movimiento: 1242, tipo_registro: 'Impresora Láser HP Color-JET', id_registro: 200, tipo_movimiento: 'Edición', campo_modificado: 'Responsable', valor_anterior: 'Juan', valor_nuevo: 'Marta Sánchez', realizado_por_nombre: 'Marta Sánchez', area: 'Recursos Humanos', fecha_movimiento: '2025-02-10T10:05:00', observaciones: '' },
]

const grouped = computed(() => {
  const map = {}
  items.value.forEach(item => {
    const d = item.fecha_movimiento?.slice(0, 10)
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

function buildDesc(item) {
  const type = item.tipo_movimiento?.toLowerCase()
  if (type === 'creación' || type === 'creacion') return `Registro de nuevo ingreso al inventario: "${item.tipo_registro}"`
  if (type === 'eliminación' || type === 'eliminacion') return `Se eliminó el registro de acceso obsoleto para "${item.tipo_registro}"`
  if (item.campo_modificado) return `Se actualizó ${item.campo_modificado} en "${item.tipo_registro}"`
  return `Movimiento en "${item.tipo_registro}"`
}

let searchTimeout = null
function onSearch() { clearTimeout(searchTimeout); searchTimeout = setTimeout(loadData, 400) }
function clearFilters() { Object.assign(filters, { search: '', tipo_registro: '', tipo_movimiento: '', fecha_desde: '', fecha_hasta: '', area_id: '' }); loadData() }

async function loadData() {
  loading.value = true; page.value = 1
  try {
    const res = await historialApi.list({ ...filters, page: 1, per_page: 20 })
    items.value = res.data.movimientos || res.data
    hasMore.value = res.data.pages > 1
  } catch {
    // Use mock data when endpoint is not available
    items.value = mockData
    hasMore.value = false
  } finally { loading.value = false }
}

async function loadMore() {
  page.value++
  try {
    const res = await historialApi.list({ ...filters, page: page.value, per_page: 20 })
    items.value.push(...(res.data.movimientos || res.data))
    hasMore.value = res.data.pages > page.value
  } catch { hasMore.value = false }
}

async function openDetail(item) {
  try {
    const res = await historialApi.get(item.id_movimiento)
    selected.value = res.data
  } catch { selected.value = item }
  showDetail.value = true
}

onMounted(async () => {
  const res = await catalogosApi.getAreas()
  areas.value = res.data
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