<template>
  <div class="page-container">

    <PageHeader title="Historial de movimientos" subtitle="Registro completo de cambios y auditoría del sistema">
    </PageHeader>

    <!-- Filtros -->
    <div class="card" style="padding:18px 20px;margin-bottom:20px;">
      <div class="filter-grid">
        <div class="filter-group search">
          <label>Búsqueda General</label>
          <div class="input-with-icon">
            <svg class="input-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input v-model="filters.search" class="form-input" placeholder="Buscar por usuario o ID de registro"
              @input="onSearch" />
          </div>
        </div>
        <div class="filter-group">
          <label>Tipo de registro</label>
          <select v-model="filters.tipo_registro" class="form-select" @change="loadData">
            <option value="">Todos los registros</option>
            <option value="computo">Equipos de cómputo</option>
            <option value="mobiliario">Mobiliario</option>
            <option value="usuario">Responsables</option>
            <option value="acceso">Accesos</option>
            <option value="cat_areas">Áreas</option>
            <option value="cat_estados">Estados</option>
            <option value="cat_tipos_activo">Tipos de activo</option>
            <option value="cat_tipos_mobiliario">Tipos de mobiliario</option>
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
            <option v-for="u in catalogos.accesos" :key="u.id_acceso" :value="u.id_acceso">{{ u.nombre_usuario }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div v-if="loading" style="text-align:center;padding:48px;">
      <span class="spinner" style="width:28px;height:28px;"></span>
    </div>

    <div v-else-if="!grouped.length" class="card" style="padding:48px;text-align:center;color:var(--gray-400);">
      <EmptyState text="No se encontraron movimientos" icon="🔍" />
    </div>

    <div v-else class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th @click="toggleSort('id_historial')" class="sorted">
              <span class="sort-btn">
                ID
                <span class="sort-icon" :class="getSortClass('id_historial')">
                  <span class="arr-up"></span>
                  <span class="arr-down"></span>
                </span>
              </span>
            </th>
            <th @click="toggleSort('operacion')" class="sorted">
              <span class="sort-btn">
                Movimiento
                <span class="sort-icon" :class="getSortClass('operacion')">
                  <span class="arr-up"></span>
                  <span class="arr-down"></span>
                </span>
              </span>
            </th>
            <th>Descripción</th>
            <th>Registro</th>
            <th>Usuario</th>
            <th @click="toggleSort('fecha')" class="sorted">
              <span class="sort-btn">
                Hora
                <span class="sort-icon" :class="getSortClass('fecha')">
                  <span class="arr-up"></span>
                  <span class="arr-down"></span>
                </span>
              </span>
            </th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="group in grouped" :key="group.date">
            <!-- Separador de fecha — sin sort-icon dentro -->
            <tr class="date-separator-row">
              <td colspan="7">
                <div class="date-separator">
                  <span class="date-label">{{ group.dateLabel }}</span>
                  <span class="date-count">
                    {{ group.items.length }} movimiento{{ group.items.length !== 1 ? 's' : '' }}
                  </span>
                  <div class="date-line"></div>
                </div>
              </td>
            </tr>
            <!-- Filas del grupo -->
            <tr v-for="item in group.items" :key="item.id_historial" class="data-row">
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
                <span class="row-desc" :title="buildDescPlain(item)" v-html="buildDescWithColor(item)"></span>
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
                <TableActions @view="openDetail(item)" />
              </td>
            </tr>
          </template>
        </tbody>
      </table>

      <Pagination :current="page" :total-pages="totalPages" :total="total" :from="from" :to="to" :per-page="perPage"
        @change="onPageChange" />
    </div>

    <!-- Detail Modal -->
    <BaseModal v-model="showDetail" :title="`Movimiento #${selected?.id_historial}`"
      :subtitle="selected ? formatFull(selected.fecha) : ''" size="lg">
      <template v-if="selected">

        <div class="section-title" style="margin-top:0">Información del movimiento</div>
        <div class="detail-grid" style="grid-template-columns:1fr 1fr 1fr;">
          <div class="detail-item"><label>Fecha y hora</label><strong>{{ formatFull(selected.fecha) }}</strong></div>
          <div class="detail-item"><label>Realizado por</label><strong>{{ selected.realizado_por || 'Sistema'
              }}</strong></div>
          <div class="detail-item"><label>ID movimiento</label><strong style="font-family:var(--font-mono)">{{
            selected.id_historial}}</strong></div>
          <div class="detail-item"><label>Tipo de registro</label><strong>{{ formatTableName(selected.tabla) }}</strong>
          </div>
          <div class="detail-item"><label>ID de registro</label><strong style="font-family:var(--font-mono)">#{{
            selected.registro_id }}</strong></div>
          <div class="detail-item"><label>Tipo de movimiento</label><span class="op-badge"
              :class="opClass(selected.operacion)" style="font-size:12px;">{{ formatOperation(selected.operacion)
              }}</span></div>
        </div>

        <div v-if="selected.cambios_detallados && selected.cambios_detallados.length > 0">
          <div class="section-title">Cambios realizados</div>
          <div style="overflow-x:auto;border:1px solid var(--border);border-radius:var(--radius);">
            <table class="data-table" style="table-layout:fixed;width:100%;min-width:480px;">
              <colgroup>
                <col style="width:30%">
                <col style="width:35%">
                <col style="width:35%">
              </colgroup>
              <thead>
                <tr>
                  <th>Campo</th>
                  <th>Valor anterior</th>
                  <th>Valor nuevo</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(cambio, idx) in selected.cambios_detallados" :key="idx">
                  <td style="font-weight:600;word-break:break-word;">{{ formatCampoLegible(cambio.campo_legible ||
                    cambio.campo) }}</td>
                  <td style="word-break:break-word;">
                    <span
                      v-if="cambio.valor_anterior !== null && cambio.valor_anterior !== undefined && String(cambio.valor_anterior).trim() !== '' && String(cambio.valor_anterior).trim() !== 'None'"
                      class="val-old">
                      {{ formatValor(cambio.valor_anterior) }}
                    </span>
                    <span v-else style="color:var(--gray-300);font-size:13px;font-style:italic;">Sin valor previo</span>
                  </td>
                  <td style="word-break:break-word;">
                    <span
                      v-if="cambio.valor_nuevo !== null && cambio.valor_nuevo !== undefined && String(cambio.valor_nuevo).trim() !== '' && String(cambio.valor_nuevo).trim() !== 'None'"
                      class="val-new">
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
        <div class="obs-box">
          <div style="font-weight:700;font-size:14px;margin-bottom:6px;">{{ formatTableName(selected.tabla) }} #{{
            selected.registro_id }}</div>
          <p style="font-size:13px;color:var(--gray-500);margin-bottom:0;">
            Este movimiento afectó el registro con ID <strong>{{ selected.registro_id }}</strong> en el módulo de
            <strong>{{ formatTableName(selected.tabla) }}</strong>.
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
import Pagination from '@/components/ui/Pagination.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { usePagination } from '@/composables/usePagination'
import { useToast } from '@/composables/useToast'
import { useCatalogos } from '@/composables/useCatalogos'
import { useSort } from '@/composables/useSort'
import TableActions from '@/components/ui/TableActions.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { formatTime, formatFull, formatDateLabel, initials } from '@/utils/formatters'
import {
  formatCampoLegible,
  formatValor,
  formatTableName,
  formatOperation,
  opClass,
  buildDescPlain,
  buildDescWithColor
} from '@/utils/historialFormatters'

const { getSortClass, toggleSort, applySortToParams } = useSort({
  onChange: loadData
})
const { page, total, totalPages, perPage, onSearch, onPageChange, setMeta, setLoadFn } = usePagination()
const { toast } = useToast()

const { catalogos, loadCatalogos } = useCatalogos()

const items = ref([])
const loading = ref(false)
const showDetail = ref(false)
const selected = ref(null)

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

// ── Datos ───────────────────────────────────────────────────────
async function loadData() {
  loading.value = true
  try {
    let params = { ...filters, page: page.value, per_page: perPage }
    params = applySortToParams(params)
    const res = await vistasApi.listHistoriales(params)
    items.value = res.data.movimientos || []
    setMeta(res.data)
  } catch {
    toast.error('Error al cargar el historial')
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

setLoadFn(loadData)
onMounted(async () => {
  loadCatalogos(['accesos'])
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
.date-separator-row td {
  padding: 0;
}

.date-separator-row:hover td {
  background: transparent !important;
  cursor: default;
}

.date-separator {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 16px;
  background: var(--gray-50);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.date-separator-row:first-child .date-separator {
  border-top: none;
}

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
  flex-shrink: 0;
}

.date-line {
  flex: 1;
  height: 1px;
  background: var(--border);
}

/* ── Filas ── */
.data-row {
  cursor: default;
}

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

.op-insert {
  background: #EAF3DE;
  color: #3B6D11;
}

.op-update {
  background: #FAEEDA;
  color: #854F0B;
}

.op-delete {
  background: #FCEBEB;
  color: #A32D2D;
}

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

/* ── Descripción ── */
.row-desc {
  font-size: 13px;
  color: var(--gray-700);
  display: block;
  max-width: 480px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: default;
}

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

.sorted {
  cursor: pointer;
  user-select: none;
}

.sorted:hover {
  color: var(--primary);
}
</style>