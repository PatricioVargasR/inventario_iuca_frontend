<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Equipos de Cómputo</h1>
        <p class="page-subtitle">Gestión del inventario de equipos</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo Equipo
      </button>
    </div>

    <!-- Filtros -->
    <div class="filter-bar">
      <div class="filter-group search">
        <label>Búsqueda General</label>
        <div class="input-with-icon">
          <svg class="input-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="filters.search" class="form-input" placeholder="Buscar por marca, nombre..." @input="onSearch" />
        </div>
      </div>
      <div class="filter-group">
        <label>Tipo de Equipo</label>
        <select v-model="filters.tipo_activo_id" class="form-select" @change="loadData">
          <option value="">Todos los tipos</option>
          <option v-for="t in catalogos.tipos" :key="t.nombre_activo" :value="t.nombre_tipo">{{ t.nombre_tipo }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Estado</label>
        <select v-model="filters.estado_id" class="form-select" @change="loadData">
          <option value="">Cualquier estado</option>
          <option v-for="e in catalogos.estados" :key="e.nombre_estado" :value="e.nombre_estado">{{ e.nombre_estado }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Responsable</label>
        <select v-model="filters.usuario_id" class="form-select" @change="loadData">
          <option value="">Todos los responsables</option>
          <option v-for="u in catalogos.usuarios" :key="u.nombre_usuario" :value="u.nombre_usuario">{{ u.nombre_usuario }}</option>
        </select>
      </div>
    </div>

    <!-- Tabla -->
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th><th>TIPO</th><th>NOMBRE</th><th>MARCA</th>
            <th>MODELO</th><th>NO. SERIE</th><th>ESTADO</th>
            <th>RESPONSABLE</th><th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="loading-row"><td colspan="9"><span class="spinner"></span></td></tr>
          <tr v-else-if="!equipos.length">
            <td colspan="9"><div class="empty-state"><div class="empty-icon">💻</div><p>No se encontraron equipos</p></div></td>
          </tr>
          <tr v-else v-for="eq in equipos" :key="eq.id_activo">
            <td><span style="font-family:var(--font-mono);font-size:12px;color:var(--gray-500)">EQ{{ String(eq.id_activo).padStart(3,'0') }}</span></td>
            <td>{{ eq.tipo_activo }}</td>
            <td style="font-weight:600;color:var(--gray-800)">{{ eq.nombre_activo }}</td>
            <td>{{ eq.marca || '–' }}</td>
            <td>{{ eq.modelo || '–' }}</td>
            <td><span style="font-family:var(--font-mono);font-size:12px">{{ eq.numero_serie || '–' }}</span></td>
            <td><StatusBadge :estado="eq.estado" /></td>
            <td>{{ eq.responsable || '–' }}</td>
            <td>
              <div class="actions-cell">
                <button class="action-btn view" @click="openDetail(eq)" title="Ver detalle">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="action-btn edit" @click="openEdit(eq)" title="Editar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="action-btn delete" @click="confirmDelete(eq)" title="Eliminar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <Pagination :current="page" :total-pages="totalPages" :total="total" :per-page="20" @change="onPageChange" />
    </div>

    <div class="info-banner">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
      <div><strong>Información del Sistema</strong>Utilice los filtros superiores para refinar su búsqueda por categorías específicas.</div>
    </div>

    <!-- Detail Modal -->
    <BaseModal v-model="showDetail" title="Detalles del Equipo" size="lg">
      <template v-if="selected">
        <div class="detail-grid">
          <div class="detail-item"><label>ID</label><strong style="font-family:var(--font-mono)">{{ selected.id_activo }}</strong></div>
          <div class="detail-item"><label>Modelo</label><strong>{{ selected.modelo || '–' }}</strong></div>
          <div class="detail-item"><label>Tipo</label><strong>{{ selected.tipo_activo }}</strong></div>
          <div class="detail-item"><label>Número de Serie</label><strong style="font-family:var(--font-mono)">{{ selected.numero_serie || '–' }}</strong></div>
          <div class="detail-item"><label>Nombre</label><strong>{{ selected.nombre_activo }}</strong></div>
          <div class="detail-item"><label>Estado</label><StatusBadge :estado="selected.estado" /></div>
          <div class="detail-item"><label>Marca</label><strong>{{ selected.marca || '–' }}</strong></div>
          <div class="detail-item"><label>Responsable</label><strong>{{ selected.responsable || '–' }}</strong></div>
        </div>
        <div v-if="selected.especificaciones" style="margin-top:16px;">
          <div class="section-title">Especificaciones</div>
          <div class="specs-box">
            <div 
              v-for="(spec, i) in selected.especificaciones.split('|')" 
              :key="i"
              class="spec-item"
            >
              {{ spec.trim() }}
            </div>
          </div>
        </div>
        <div v-if="selected.observaciones" style="margin-top:14px;">
          <div class="section-title">Observaciones</div>
          <div class="obs-box" style="font-size:13.5px;color:var(--gray-700)">{{ selected.observaciones }}</div>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-primary" @click="showDetail = false">Cerrar</button>
      </template>
    </BaseModal>

    <!-- Create/Edit Modal -->
    <BaseModal v-model="showForm" :title="editMode ? 'Actualizar Equipo' : 'Nuevo Equipo'" size="lg">
      <form @submit.prevent="saveEquipo">
        <div class="section-title">Información General</div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Tipo de Activo <span class="required">*</span></label>
            <select v-model="form.tipo_activo_id" class="form-select" required>
              <option value="">Seleccionar...</option>
              <option v-for="t in catalogos.tipos" :key="t.id_tipo_activo" :value="t.id_tipo_activo">{{ t.nombre_tipo }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Estado <span class="required">*</span></label>
            <select v-model="form.estado_id" class="form-select" required>
              <option value="">Seleccionar...</option>
              <option v-for="e in catalogos.estados" :key="e.id_estado" :value="e.id_estado">{{ e.nombre_estado }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Nombre del Activo <span class="required">*</span></label>
            <input v-model="form.nombre_activo" class="form-input" placeholder="Ej: ThinkPad X1" required />
          </div>
          <div class="form-group">
            <label class="form-label">Responsable</label>
            <select v-model="form.usuario_asignado_id" class="form-select">
              <option value="">Sin asignar</option>
              <option v-for="u in catalogos.usuarios" :key="u.id_usuario" :value="u.id_usuario">{{ u.nombre_usuario }}</option>
            </select>
          </div>
        </div>

        <div class="section-title">Detalles</div>
        <div class="form-grid">
          <div class="form-group"><label class="form-label">Marca</label><input v-model="form.marca" class="form-input" placeholder="Ej: Lenovo" /></div>
          <div class="form-group"><label class="form-label">Modelo</label><input v-model="form.modelo" class="form-input" placeholder="Ej: ThinkPad X1" /></div>
          <div class="form-group"><label class="form-label">Número de Serie</label><input v-model="form.numero_serie" class="form-input" placeholder="Ej: ABC123XYZ456" /></div>
          <div class="form-group"><label class="form-label">Sucursal</label><input v-model="form.sucursal_nombre" class="form-input" /></div>
          <div class="form-group span-full"><label class="form-label">Observaciones</label><textarea v-model="form.observaciones" class="form-textarea" placeholder="Escriba cualquier observación relevante aquí..."></textarea></div>
        </div>

        <div class="section-title" style="display:flex;align-items:center;justify-content:space-between;">
          Especificaciones
          <button type="button" class="btn btn-secondary btn-sm" @click="addSpec">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Agregar
          </button>
        </div>
        <div v-for="(spec, i) in form.especificaciones" :key="i" class="spec-row">
          <input v-model="spec.nombre_especificacion" class="form-input" placeholder="RAM, Procesador..." />
          <input v-model="spec.valor_especificacion" class="form-input" placeholder="16GB, Intel i7..." />
          <button type="button" class="spec-delete" @click="removeSpec(i)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </form>
      <template #footer>
        <button class="btn btn-secondary" @click="showForm = false">Cancelar</button>
        <button class="btn btn-primary" @click="saveEquipo" :disabled="saving">
          <span v-if="saving" class="spinner" style="width:14px;height:14px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:white;"></span>
          <span v-else>{{ editMode ? 'Actualizar Equipo' : 'Crear' }}</span>
        </button>
      </template>
    </BaseModal>

    <!-- Confirm Delete -->
    <ConfirmDialog
      v-model="showConfirm"
      :title="`Eliminar Equipo`"
      :message="`¿Estás seguro de eliminar el equipo '${toDelete?.nombre_activo}'? Esta acción no se puede deshacer.`"
      :loading="deleting"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { equiposApi, catalogosApi, usuariosApi, vistasApi } from '@/services/api'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import Pagination from '@/components/ui/Pagination.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const equipos = ref([])
const loading = ref(false)
const page = ref(1)
const total = ref(0)
const totalPages = ref(1)

const filters = reactive({ search: '', tipo_activo_id: '', estado_id: '', usuario_id: '' })
const catalogos = reactive({ tipos: [], estados: [], usuarios: [] })

const showDetail = ref(false)
const showForm = ref(false)
const showConfirm = ref(false)
const selected = ref(null)
const toDelete = ref(null)
const editMode = ref(false)
const saving = ref(false)
const deleting = ref(false)

const form = reactive({
  tipo_activo_id: '', estado_id: '', nombre_activo: '',
  usuario_asignado_id: '', marca: '', modelo: '',
  numero_serie: '', sucursal_nombre: 'Tulancingo',
  observaciones: '', especificaciones: []
})

let searchTimeout = null

async function loadCatalogos() {
  const [tipos, estados, usuarios] = await Promise.all([
    catalogosApi.getTiposActivo(),
    catalogosApi.getEstados(),
    usuariosApi.listResponsables()
  ])
  catalogos.tipos = tipos.data
  catalogos.estados = estados.data
  catalogos.usuarios = usuarios.data
}

async function loadData() {
  loading.value = true
  try {
    const params = { page: page.value, per_page: 20 }
    if (filters.search) params.search = filters.search
    if (filters.tipo_activo_id) params.tipo_activo_id = filters.tipo_activo_id
    if (filters.estado_id) params.estado_id = filters.estado_id
    if (filters.usuario_id) params.usuario_id = filters.usuario_id
    const res = await vistasApi.list(params)
    equipos.value = res.data.equipos
    total.value = res.data.total
    totalPages.value = res.data.pages
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

function onSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => { page.value = 1; loadData() }, 400)
}

function onPageChange(p) { page.value = p; loadData() }

async function openDetail(eq) {
  const res = await vistasApi.get(eq.id_activo)
  selected.value = res.data
  showDetail.value = true
}

function openCreate() {
  editMode.value = false
  Object.assign(form, { tipo_activo_id: '', estado_id: '', nombre_activo: '', usuario_asignado_id: '', marca: '', modelo: '', numero_serie: '', sucursal_nombre: 'Tulancingo', observaciones: '', especificaciones: [] })
  showForm.value = true
}

async function openEdit(eq) {
  editMode.value = true
  const res = await equiposApi.get(eq.id_activo)
  const d = res.data
  Object.assign(form, {
    tipo_activo_id: d.tipo_activo_id, estado_id: d.estado_id,
    nombre_activo: d.nombre_activo, usuario_asignado_id: d.usuario_asignado_id || '',
    marca: d.marca || '', modelo: d.modelo || '', numero_serie: d.numero_serie || '',
    sucursal_nombre: d.sucursal_nombre || 'Tulancingo', observaciones: d.observaciones || '',
    especificaciones: d.especificaciones || []
  })
  form._id = d.id_activo
  showForm.value = true
}

function addSpec() { form.especificaciones.push({ nombre_especificacion: '', valor_especificacion: '' }) }
function removeSpec(i) { form.especificaciones.splice(i, 1) }

async function saveEquipo() {
  saving.value = true
  try {
    if (editMode.value) {
      await equiposApi.update(form._id, { ...form })
    } else {
      await equiposApi.create({ ...form })
    }
    showForm.value = false
    loadData()
  } catch (e) { alert(e.response?.data?.error || 'Error al guardar') }
  finally { saving.value = false }
}

function confirmDelete(eq) { toDelete.value = eq; showConfirm.value = true }

async function doDelete() {
  deleting.value = true
  try {
    await equiposApi.delete(toDelete.value.id_activo)
    showConfirm.value = false
    toDelete.value = null
    loadData()
  } catch (e) { alert(e.response?.data?.error || 'Error al eliminar') }
  finally { deleting.value = false }
}

onMounted(() => { loadCatalogos(); loadData() })
</script>