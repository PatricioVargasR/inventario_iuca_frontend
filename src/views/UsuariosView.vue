<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Responsables</h1>
        <p class="page-subtitle">Personas que pueden ser asignadas como responsables de activos</p>
      </div>
      <button v-if="authStore.canDo('responsable', 'puede_crear')" class="btn btn-primary" @click="openCreate">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo responsable
      </button>
    </div>

    <div class="filter-bar">
      <div class="filter-group search">
        <label>Búsqueda general</label>
        <div class="input-with-icon">
          <svg class="input-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="filters.search" class="form-input" placeholder="Buscar por nombre, puesto..." @input="onSearch" />
        </div>
      </div>
      <div class="filter-group">
        <label>Áreas</label>
        <select v-model="filters.area_id" class="form-select" @change="loadData">
          <option value="">Todas las áreas</option>
          <option v-for="a in catalogos.areas" :key="a.nombre_area" :value="a.nombre_area">{{ a.nombre_area }}</option>
        </select>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th @click="toggleSort('id_usuario')" class="sorted">
              ID <span>{{ getSortIcon('id_usuario') }}</span>
            </th>
            <th @click="toggleSort('nombre_usuario')" class="sorted">
              Nombre <span>{{ getSortIcon('nombre_usuario') }}</span>
            </th>
            <th>Nómina</th>
            <th>Puesto</th>
            <th>Área</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="loading-row"><td colspan="6"><span class="spinner"></span></td></tr>
          <tr v-else-if="!items.length"><td colspan="6"><div class="empty-state"><div class="empty-icon">👤</div><p>No se encontraron responsables</p></div></td></tr>
          <tr v-else v-for="u in items" :key="u.id_usuario">
            <td><span style="font-family:var(--font-mono);font-size:12px;color:var(--gray-500)">{{ u.id_usuario }}</span></td>
            <td style="font-weight:700;color:var(--gray-900)">{{ u.nombre_usuario }}</td>
            <td><span style="font-family:var(--font-mono);font-size:12.5px;">{{ u.numero_nomina || '–' }}</span></td>
            <td style="color:var(--gray-600)">{{ u.puesto || '–' }}</td>
            <td>{{ u.area || '–' }}</td>
            <td>
              <div class="actions-cell">
                <button class="action-btn view" @click="openDetail(u)" title="Ver detalle">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button v-if="authStore.canDo('responsable', 'puede_actualizar')" class="action-btn edit" @click="openEdit(u)" title="Editar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button v-if="authStore.canDo('responsable', 'puede_eliminar')" class="action-btn delete" @click="confirmDelete(u.id_usuario, u)" title="Eliminar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <Pagination :current="page" :total-pages="totalPages" :total="total" :per-page="20" @change="onPageChange" />
    </div>

    <!-- Detail Modal -->
    <BaseModal v-model="showDetail" title="Detalles del responsable" size="sm">
      <template v-if="selected">
        <div class="detail-grid">
          <div class="detail-item"><label>ID</label><strong style="font-family:var(--font-mono)">{{ selected.id_usuario }}</strong></div>
          <div class="detail-item"><label>Área de adscripción</label><strong>{{ selected.area || '–' }}</strong></div>
          <div class="detail-item"><label>Puesto</label><strong>{{ selected.puesto || '–' }}</strong></div>
          <div class="detail-item"><label>Número de nómina</label><strong style="font-family:var(--font-mono)">{{ selected.numero_nomina || '–' }}</strong></div>
          <div class="detail-item"><label>Nombre completo</label><strong>{{ selected.nombre_usuario }}</strong></div>
          <div class="detail-item"><label>Fecha de creación</label><strong>{{ selected.fecha_creacion?.slice(0,10) || '–' }}</strong></div>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-primary" @click="showDetail = false">Cerrar</button>
      </template>
    </BaseModal>

    <!-- Form Modal -->
    <BaseModal v-model="showForm" :title="editMode ? 'Actualizar responsable' : 'Nuevo responsable'" size="sm" @update:model-value="handleFormClose">
      <form id="usuariosForm" @submit.prevent="saveItem" novalidate>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Número de nómina</label>
            <div style="position:relative;">
              <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--gray-400);font-weight:700;">#</span>
              <input
                v-model="form.numero_nomina"
                class="form-input"
                :class="{ 'input-error': formErrors.numero_nomina }"
                placeholder="Opcional - 4 dígitos"
                style="padding-left:26px;"
                maxlength="4"
              />
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:3px;">
              <span v-if="formErrors.numero_nomina" class="field-error">{{ formErrors.numero_nomina }}</span>
              <span v-else></span>
              <small style="color:var(--gray-400);font-size:11px;">{{ form.numero_nomina.length }} / 04 — Campo opcional</small>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Área de adscripción <span class="required">*</span></label>
            <select v-model="form.area_id" class="form-select" :class="{ 'input-error': formErrors.area_id }">
              <option value="">Seleccionar área</option>
              <option v-for="a in catalogos.areas" :key="a.id_area" :value="a.id_area">{{ a.nombre_area }}</option>
            </select>
            <span v-if="formErrors.area_id" class="field-error">{{ formErrors.area_id }}</span>
          </div>
          <div class="form-group span-full">
            <label class="form-label">Nombre completo <span class="required">*</span></label>
            <div style="position:relative;">
              <svg style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--gray-400);" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              <input
                v-model="form.nombre_usuario"
                class="form-input"
                :class="{ 'input-error': formErrors.nombre_usuario }"
                placeholder="Nombre completo del responsable"
                style="padding-left:30px;"
                maxlength="100"
              />
            </div>
            <span v-if="formErrors.nombre_usuario" class="field-error">{{ formErrors.nombre_usuario }}</span>
          </div>
          <div class="form-group span-full">
            <label class="form-label">Puesto <span class="required">*</span></label>
            <div style="position:relative;">
              <svg style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--gray-400);" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
              <input
                v-model="form.puesto"
                class="form-input"
                :class="{ 'input-error': formErrors.puesto }"
                placeholder="Cargo que desempeña"
                style="padding-left:30px;"
                maxlength="80"
              />
            </div>
            <span v-if="formErrors.puesto" class="field-error">{{ formErrors.puesto }}</span>
          </div>
        </div>
      </form>
      <template #footer>
        <button class="btn btn-secondary" @click="handleFormClose">Cancelar</button>
        <button class="btn btn-primary" type="submit" form="usuariosForm" :disabled="saving">
          <span v-if="saving" class="spinner" style="width:14px;height:14px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:white;"></span>
          <span v-else>{{ editMode ? 'Actualizar' : 'Guardar' }}</span>
        </button>
      </template>
    </BaseModal>

    <ConfirmDialog
      v-model="showConfirm"
      title="Eliminar responsable"
      :message="`¿Estás seguro de eliminar el responsable '${toDelete?.nombre_usuario}'? Esta acción no se puede deshacer.`"
      :loading="deleting"
      @confirm="handleDoDelete"
      @cancel="handleCancelDelete"
    />

    <!-- Concurrency Alert -->
    <ConcurrencyAlert
      v-model="showConcurrencyAlert"
      :title="concurrencyAlert.title"
      :message="concurrencyAlert.message"
      :lock-info="concurrencyAlert.lockInfo"
      :show-retry="concurrencyAlert.showRetry"
      @cancel="handleConcurrencyCancel"
      @retry="handleConcurrencyRetry"
    />

    <!-- Conflict Resolution Modal -->
    <BaseModal v-model="showConflictModal" title="Conflicto de Versión Detectado" size="lg">
      <div class="conflict-warning">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <div>
          <h4>El registro fue modificado por otro usuario</h4>
          <p>Mientras editabas, otro usuario guardó cambios en este responsable.</p>
        </div>
      </div>
      <div class="conflict-options">
        <div class="conflict-option">
          <strong>Recargar datos actuales</strong>
          <p>Descartar tus cambios y ver la versión más reciente del registro</p>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-secondary" @click="handleConflictReload">
          Recargar datos actuales
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { usuariosApi, vistasApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import ConcurrencyAlert from '@/components/ui/ConcurrencyAlert.vue'
import Pagination from '@/components/ui/Pagination.vue'
import { useFormErrors } from '@/composables/useFormErrors'
import { usePagination } from '@/composables/usePagination'
import { useCrud } from '@/composables/useCrud'
import { useConcurrencyHandlers } from '@/composables/useConcurrencyHandlers'
import { useCatalogos } from '@/composables/useCatalogos'
import { useSort } from '@/composables/useSort'

const { catalogos, loadCatalogos } = useCatalogos()
const { getSortIcon, toggleSort, applySortToParams } = useSort({
  onChange: loadData
})
const { page, total, totalPages, perPage, onSearch, onPageChange, setMeta, setLoadFn } = usePagination()
const { formErrors, clearErrors, applyFieldErrors, setError } = useFormErrors()
const authStore = useAuthStore()
const { toast } = useToast()

const items = ref([])
const loading = ref(false)
const filters = reactive({ search: '', area_id: '' })

const {
  showForm, showConfirm, showConcurrencyAlert, showConflictModal,
  showDetail, selected,
  editMode, saving, deleting, toDelete, lockWarning,
  concurrencyAlert,
  openCreate: crudOpenCreate, openDetail: crudOpenDetail,
  openEdit: crudOpenEdit,
  handleFormClose, save,
  confirmDelete, doDelete,
  handleCancelDelete,
  releaseOnUnmount, setOnSuccess
} = useCrud({
  tabla:        'usuario',
  apiGet:       (id) => usuariosApi.getResponsable(id),
  apiGetDetail: (id) => vistasApi.getResponsable(id),
  apiCreate:    (data) => usuariosApi.createResponsable(data),
  apiUpdate:    (id, data) => usuariosApi.updateResponsable(id, data),
  apiDelete:    (id) => usuariosApi.deleteResponsable(id),
  clearErrors,
  applyFieldErrors
})


const form = reactive({
  _id: null,
  nombre_usuario: '',
  numero_nomina: '',
  puesto: '',
  area_id: '',
  version: null
})


// populate reutilizable
function populateForm(d) {
  Object.assign(form, {
    _id:            d.id_usuario,
    nombre_usuario: d.nombre_usuario,
    numero_nomina:  d.numero_nomina || '',
    puesto:         d.puesto || '',
    area_id:        d.area_id || '',
    version:        d.version
  })
}

const {
  handleConcurrencyCancel,
  handleConcurrencyRetry,
  handleConflictReload: reloadConflict
} = useConcurrencyHandlers({
  showConcurrencyAlert,
  showConflictModal,
  concurrencyAlert,
  items,
  idKey: 'id_usuario',
  openEdit:      (u) => openEdit(u),
  confirmDelete: (u) => confirmDelete(u),
  apiGet:        (id) => usuariosApi.getResponsable(id),
  clearErrors,
  toast
})


// ── Validación frontend ──────────────────────────────────────────
function validateForm() {
  clearErrors()
  let valid = true

  if (!form.nombre_usuario?.trim()) {
    formErrors.nombre_usuario = '"Nombre completo" es obligatorio'
    valid = false
  }
  if (!form.puesto?.trim()) {
    formErrors.puesto = '"Puesto" es obligatorio'
    valid = false
  }
  if (!form.area_id) {
    formErrors.area_id = '"Área de adscripción" es obligatoria'
    valid = false
  }
  if (form.numero_nomina && !/^\d+$/.test(form.numero_nomina)) {
    formErrors.numero_nomina = 'Solo se permiten dígitos'
    valid = false
  }

  return valid
}

async function loadData() {
  loading.value = true
  try {
    let params = { page: page.value, per_page: perPage }
    if (filters.search) params.search = filters.search
    if (filters.area_id) params.area_id = filters.area_id

    params = applySortToParams(params)

    const res = await vistasApi.listResponsables(params)
    items.value = res.data.responsables
    setMeta(res.data)
  } catch {
    toast.error('Error al cargar los responsables')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  crudOpenCreate(() => {
    Object.assign(form, {
      _id: null,
      nombre_usuario: '', numero_nomina: '',
      puesto: '', area_id: '', version: null
    })
  })
}

async function openEdit(u) {
  await crudOpenEdit(u.id_usuario, populateForm)
}

async function openDetail(u) {
  await crudOpenDetail(u.id_usuario)
}

async function saveItem() {
  if (!validateForm()) {
    toast.warning('Revisa los campos marcados en el formulario')
    return
  }
  const payload = {
    nombre_usuario: form.nombre_usuario,
    numero_nomina:  form.numero_nomina || null,
    puesto:         form.puesto || null,
    area_id:        form.area_id || null,
    version:        form.version
  }
  await save(form._id, payload)
}

async function handleDoDelete() {
  await doDelete(toDelete.value.id_usuario)
}

async function handleConflictReload() {
  await reloadConflict(form._id, populateForm)
}

// Lifecycle
onBeforeUnmount(async () => {
  await releaseOnUnmount()
})

setOnSuccess(loadData)
setLoadFn(loadData)
onMounted(() => {
  loadCatalogos(['areas'])
  loadData()
})
</script>

<style scoped>
/* ── Errores de campo ── */
.input-error {
  border-color: var(--danger) !important;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
}

.field-error {
  display: block;
  font-size: 11.5px;
  color: var(--danger);
  margin-top: 4px;
  font-weight: 500;
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Conflict warning ── */
.conflict-warning {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #fef3c7;
  border-radius: 12px;
  margin-bottom: 20px;
}

.sorted {
  cursor: pointer;
  user-select: none;
}

.sorted:hover {
  color: var(--primary);
}

.conflict-warning svg { color: #d97706; flex-shrink: 0; }
.conflict-warning h4 { font-size: 16px; font-weight: 700; color: var(--gray-900); margin-bottom: 6px; }
.conflict-warning p { font-size: 13px; color: var(--gray-600); margin: 0; }
.conflict-options { display: flex; flex-direction: column; gap: 12px; }
.conflict-option { padding: 14px; background: var(--gray-50); border-radius: 8px; border: 1px solid var(--gray-200); }
.conflict-option strong { display: block; font-size: 14px; color: var(--gray-900); margin-bottom: 4px; }
.conflict-option p { font-size: 12px; color: var(--gray-600); margin: 0; }
</style>