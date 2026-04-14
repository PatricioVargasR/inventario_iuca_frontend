<template>
  <div class="page-container">

    <PageHeader title="Mobiliario" subtitle="Gestión del inventario de mobiliario">
      <template #actions>
        <button v-if="authStore.canDo('mobiliario', 'puede_crear')" class="btn btn-primary" @click="openCreate">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo mueble
        </button>
      </template>
    </PageHeader>

    <!-- Filtros -->
    <div class="filter-bar">
      <div class="filter-group search">
        <label>Búsqueda general</label>
        <div class="input-with-icon">
          <svg class="input-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input v-model="filters.search" class="form-input" placeholder="Buscar mueble..." @input="onSearch" />
        </div>
      </div>
      <div class="filter-group">
        <label>Tipo de mobiliario</label>
        <select v-model="filters.tipo_mobiliario_id" class="form-select" @change="loadData">
          <option value="">Todos los tipos</option>
          <option v-for="t in catalogos.tipos" :key="t.nombre_tipo" :value="t.nombre_tipo">{{ t.nombre_tipo }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Estado</label>
        <select v-model="filters.estado_id" class="form-select" @change="loadData">
          <option value="">Cualquier estado</option>
          <option v-for="e in catalogos.estados" :key="e.nombre_estado" :value="e.nombre_estado">{{ e.nombre_estado }}
          </option>
        </select>
      </div>
      <!-- Filtro multi-responsable -->
      <ResponsablesFilter v-model="filters.usuario_ids" :usuarios="catalogos.usuarios" label="Responsable"
        placeholder="Todos los responsables" @change="loadData" />
    </div>

    <!-- Tabla -->
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th @click="toggleSort('id_mueble')" class="sorted">
              <span class="sort-btn">
                ID
                <span class="sort-icon" :class="getSortClass('id_mueble')">
                  <span class="arr-up"></span>
                  <span class="arr-down"></span>
                </span>
              </span>
            </th>
            <th @click="toggleSort('tipo_mobiliario')" class="sorted">
              <span class="sort-btn">
                Tipo
                <span class="sort-icon" :class="getSortClass('tipo_mobiliario')">
                  <span class="arr-up"></span>
                  <span class="arr-down"></span>
                </span>
              </span>
            </th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Color</th>
            <th>Estado</th>
            <th>Responsables</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="loading-row">
            <td colspan="8"><span class="spinner"></span></td>
          </tr>
          <tr v-else-if="!mobiliario.length">
            <td colspan="8">
              <EmptyState text="No se encontraron muebles" icon="🪑" />
            </td>
          </tr>
          <tr v-else v-for="mueble in mobiliario" :key="mueble.id_mueble">
            <td><span style="font-family:var(--font-mono);font-size:12px;color:var(--gray-500)">{{ mueble.id_mueble
                }}</span></td>
            <td style="font-weight:600;color:var(--gray-800)">
              {{ mueble.tipo_mobiliario }}
              <span v-if="mueble.editado_por && mueble.editado_por !== currentUserId" class="editing-badge">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </span>
            </td>
            <td>{{ mueble.marca || '–' }}</td>
            <td>{{ mueble.modelo || '–' }}</td>
            <td>{{ mueble.color || '–' }}</td>
            <td>
              <StatusBadge :estado="mueble.estado" :color="mueble.color_estado" />
            </td>
            <td>
              <div class="responsables-cell">
                <template v-if="mueble.responsables && mueble.responsables.length > 0">
                  <span v-for="r in mueble.responsables.slice(0, 2)" :key="r.id_usuario" class="resp-mini-badge">
                    {{ r.nombre_usuario }}
                  </span>
                  <span v-if="mueble.responsables.length > 2" class="resp-more">+{{ mueble.responsables.length - 2
                    }}</span>
                </template>
                <span v-else style="color:var(--gray-400)">–</span>
              </div>
            </td>
            <td>
              <TableActions :show-edit="authStore.canDo('mobiliario', 'puede_actualizar')"
                :show-delete="authStore.canDo('mobiliario', 'puede_eliminar')" @view="openDetail(mueble)"
                @edit="openEdit(mueble)" @delete="confirmDelete(mueble.id_mueble, mueble)" />
            </td>
          </tr>
        </tbody>
      </table>
      <Pagination :current="page" :total-pages="totalPages" :total="total" :from="from" :to="to" :per-page="perPage"
        @change="onPageChange" />
    </div>

    <!-- Detail Modal -->
    <BaseModal v-model="showDetail" title="Detalles del Mobiliario" size="lg">
      <template v-if="selected">
        <div class="detail-grid">
          <div class="detail-item"><label>ID</label><strong style="font-family:var(--font-mono)">{{ selected.id_mueble
              }}</strong></div>
          <div class="detail-item"><label>Tipo</label><strong>{{ selected.tipo_mobiliario }}</strong></div>
          <div class="detail-item"><label>Marca</label><strong>{{ selected.marca || '–' }}</strong></div>
          <div class="detail-item"><label>Modelo</label><strong>{{ selected.modelo || '–' }}</strong></div>
          <div class="detail-item"><label>Color</label><strong>{{ selected.color || '–' }}</strong></div>
          <div class="detail-item"><label>Estado</label>
            <StatusBadge :estado="selected.estado" :color="selected.color_estado" />
          </div>
          <div class="detail-item span-full">
            <label>Responsables</label>
            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;">
              <template v-if="selected.responsables && selected.responsables.length">
                <span v-for="r in selected.responsables" :key="r.id_usuario" class="resp-detail-badge">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                  {{ r.nombre_usuario }}
                </span>
              </template>
              <span v-else style="color:var(--gray-400);font-size:13px">Sin responsables asignados</span>
            </div>
          </div>
        </div>
        <div v-if="selected.caracteristicas" style="margin-top:16px;">
          <div class="section-title">Características</div>
          <div class="obs-box" style="font-size:13.5px;color:var(--gray-700)">{{ selected.caracteristicas }}</div>
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
    <BaseModal v-model="showForm" :title="editMode ? 'Actualizar Mobiliario' : 'Nuevo Mobiliario'" size="lg"
      @update:model-value="handleFormClose">

      <LockWarningBanner v-if="editMode" :message="lockWarning" />

      <form id="mobiliarioForm" @submit.prevent="saveMobiliario" novalidate>
        <div class="section-title" style="display:flex;align-items:center;gap:6px;">Información general</div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Tipo de mobiliario <span class="required">*</span></label>
            <select v-model="form.tipo_mobiliario_id" class="form-select"
              :class="{ 'input-error': formErrors.tipo_mobiliario_id }">
              <option value="">Seleccionar...</option>
              <option v-for="t in catalogos.tipos" :key="t.id_tipo_mobiliario" :value="t.id_tipo_mobiliario">{{
                t.nombre_tipo }}</option>
            </select>
            <span v-if="formErrors.tipo_mobiliario_id" class="field-error">{{ formErrors.tipo_mobiliario_id }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Estado <span class="required">*</span></label>
            <select v-model="form.estado_id" class="form-select" :class="{ 'input-error': formErrors.estado_id }">
              <option value="">Seleccionar...</option>
              <option v-for="e in catalogos.estados" :key="e.id_estado" :value="e.id_estado">{{ e.nombre_estado }}
              </option>
            </select>
            <span v-if="formErrors.estado_id" class="field-error">{{ formErrors.estado_id }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Marca</label>
            <input v-model="form.marca" class="form-input" :class="{ 'input-error': formErrors.marca }"
              placeholder="Ej: IKEA" maxlength="50" />
            <span v-if="formErrors.marca" class="field-error">{{ formErrors.marca }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Modelo</label>
            <input v-model="form.modelo" class="form-input" :class="{ 'input-error': formErrors.modelo }"
              placeholder="Ej: KALLAX" maxlength="50" />
            <span v-if="formErrors.modelo" class="field-error">{{ formErrors.modelo }}</span>
          </div>
        </div>

        <div class="section-title">Detalles</div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Color</label>
            <input v-model="form.color" class="form-input" :class="{ 'input-error': formErrors.color }"
              placeholder="Ej: Negro" maxlength="20" />
            <span v-if="formErrors.color" class="field-error">{{ formErrors.color }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Sucursal <span class="required">*</span></label>
            <input v-model="form.sucursal_nombre" class="form-input"
              :class="{ 'input-error': formErrors.sucursal_nombre }" maxlength="50" />
            <span v-if="formErrors.sucursal_nombre" class="field-error">{{ formErrors.sucursal_nombre }}</span>
          </div>
          <div class="form-group span-full">
            <label class="form-label">Características</label>
            <textarea v-model="form.caracteristicas" class="form-textarea"
              :class="{ 'input-error': formErrors.caracteristicas }" placeholder="Descripción de características..."
              maxlength="500"></textarea>
            <small style="color:var(--gray-400);font-size:11px;">{{ form.caracteristicas.length }} / 500</small>
          </div>
          <div class="form-group span-full">
            <label class="form-label">Observaciones</label>
            <textarea v-model="form.observaciones" class="form-textarea"
              :class="{ 'input-error': formErrors.observaciones }" placeholder="Observaciones adicionales..."
              maxlength="500"></textarea>
            <small style="color:var(--gray-400);font-size:11px;">{{ form.observaciones.length }} / 500</small>
          </div>
        </div>

        <!-- Responsables múltiples -->
        <div class="section-title">Responsables</div>
        <div class="form-group">
          <label class="form-label">Personas responsables del mueble</label>
          <ResponsablesSelector v-model="form.responsables_ids" :usuarios="catalogos.usuarios" />
        </div>
      </form>

      <template #footer>
        <button class="btn btn-secondary" @click="handleFormClose">Cancelar</button>
        <button class="btn btn-primary" form="mobiliarioForm" type="submit" :disabled="saving">
          <span v-if="saving" class="spinner"
            style="width:14px;height:14px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:white;"></span>
          <span v-else>{{ editMode ? 'Actualizar' : 'Guardar' }}</span>
        </button>
      </template>
    </BaseModal>

    <ConfirmDialog v-model="showConfirm" title="Eliminar Mobiliario"
      :message="`¿Estás seguro de eliminar este mueble? Esta acción no se puede deshacer.`" :loading="deleting"
      @confirm="handleDoDelete" @cancel="handleCancelDelete" />

    <ConcurrencyAlert v-model="showConcurrencyAlert" :title="concurrencyAlert.title" :message="concurrencyAlert.message"
      :lock-info="concurrencyAlert.lockInfo" :show-retry="concurrencyAlert.showRetry" @cancel="handleConcurrencyCancel"
      @retry="handleConcurrencyRetry" />

    <ConflictModal v-model="showConflictModal" entity-label="este mueble" @reload="handleConflictReload" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onBeforeUnmount } from 'vue'
import { mobiliarioApi, vistasApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import ConcurrencyAlert from '@/components/ui/ConcurrencyAlert.vue'
import Pagination from '@/components/ui/Pagination.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { useFormErrors } from '@/composables/useFormErrors'
import { usePagination } from '@/composables/usePagination'
import { useCrud } from '@/composables/useCrud'
import { useConcurrencyHandlers } from '@/composables/useConcurrencyHandlers'
import { useCatalogos } from '@/composables/useCatalogos'
import { useSort } from '@/composables/useSort'
import ConflictModal from '@/components/ui/ConflictModal.vue'
import LockWarningBanner from '@/components/ui/LockWarningBanner.vue'
import TableActions from '@/components/ui/TableActions.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ResponsablesSelector from '@/components/ui/ResponsablesSelector.vue'
import ResponsablesFilter from '@/components/ui/ResponsablesFilter.vue'

const { getSortClass, toggleSort, applySortToParams } = useSort({ onChange: loadData })
const { page, total, totalPages, perPage, onSearch, onPageChange, setMeta, setLoadFn } = usePagination()
const { formErrors, clearErrors, applyFieldErrors, setError } = useFormErrors()
const { catalogos, loadCatalogos } = useCatalogos()
const authStore = useAuthStore()
const { toast } = useToast()
const currentUserId = computed(() => authStore.user?.id_acceso)

const mobiliario = ref([])
const loading = ref(false)
const filters = reactive({ search: '', tipo_mobiliario_id: '', estado_id: '', usuario_ids: [] })

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
  tabla: 'mobiliario',
  apiGet: (id) => mobiliarioApi.get(id),
  apiGetDetail: (id) => vistasApi.getMobiliario(id),
  apiCreate: (data) => mobiliarioApi.create(data),
  apiUpdate: (id, data) => mobiliarioApi.update(id, data),
  apiDelete: (id) => mobiliarioApi.delete(id),
  clearErrors,
  applyFieldErrors
})

const form = reactive({
  _id: null,
  tipo_mobiliario_id: '', marca: '', modelo: '', color: '',
  caracteristicas: '', observaciones: '', estado_id: '',
  responsables_ids: [],
  sucursal_nombre: 'Tulancingo',
  version: null
})

function populateForm(d) {
  Object.assign(form, {
    _id: d.id_mueble,
    tipo_mobiliario_id: d.tipo_mobiliario_id,
    marca: d.marca || '',
    modelo: d.modelo || '',
    color: d.color || '',
    caracteristicas: d.caracteristicas || '',
    observaciones: d.observaciones || '',
    estado_id: d.estado_id,
    responsables_ids: d.responsables_ids || [],
    sucursal_nombre: d.sucursal_nombre || 'Tulancingo',
    version: d.version
  })
}

const {
  handleConcurrencyCancel, handleConcurrencyRetry,
  handleConflictReload: reloadConflict
} = useConcurrencyHandlers({
  showConcurrencyAlert, showConflictModal, concurrencyAlert,
  items: mobiliario, idKey: 'id_mueble',
  openEdit: (mueble) => openEdit(mueble),
  confirmDelete: (mueble) => confirmDelete(mueble),
  apiGet: (id) => mobiliarioApi.get(id),
  clearErrors, toast
})

function validateForm() {
  clearErrors()
  let valid = true
  if (!form.tipo_mobiliario_id) { setError('tipo_mobiliario_id', '"Tipo de mobiliario" es obligatorio'); valid = false }
  if (!form.estado_id) { setError('estado_id', '"Estado" es obligatorio'); valid = false }
  if (!form.sucursal_nombre?.trim()) { setError('sucursal_nombre', '"Sucursal" es obligatoria'); valid = false }
  return valid
}

async function loadData() {
  loading.value = true
  try {
    let params = { page: page.value, per_page: perPage }
    if (filters.search) params.search = filters.search
    if (filters.tipo_mobiliario_id) params.tipo_mobiliario_id = filters.tipo_mobiliario_id
    if (filters.estado_id) params.estado_id = filters.estado_id
    if (filters.usuario_ids && filters.usuario_ids.length > 0) {
      params.usuario_id = filters.usuario_ids
    }
    params = applySortToParams(params)
    const res = await vistasApi.listMobiliario(params)
    mobiliario.value = res.data.mobiliario
    setMeta(res.data)
  } catch {
    toast.error('Error al cargar el mobiliario')
  } finally {
    loading.value = false
  }
}

function openCreate() {
  crudOpenCreate(() => {
    Object.assign(form, {
      _id: null, tipo_mobiliario_id: '', marca: '', modelo: '', color: '',
      caracteristicas: '', observaciones: '', estado_id: '',
      responsables_ids: [], sucursal_nombre: 'Tulancingo', version: null
    })
  })
}

async function openEdit(mueble) {
  await crudOpenEdit(mueble.id_mueble, populateForm)
}

async function openDetail(mueble) {
  await crudOpenDetail(mueble.id_mueble)
}

async function handleDoDelete() {
  await doDelete(toDelete.value.id_mueble)
}

async function saveMobiliario() {
  if (!validateForm()) {
    toast.warning('Revisa los campos marcados en el formulario')
    return
  }
  const payload = {
    tipo_mobiliario_id: form.tipo_mobiliario_id,
    marca: form.marca,
    modelo: form.modelo,
    color: form.color,
    caracteristicas: form.caracteristicas,
    observaciones: form.observaciones,
    estado_id: form.estado_id,
    responsables_ids: form.responsables_ids,
    sucursal_nombre: form.sucursal_nombre,
    version: form.version
  }
  await save(form._id, payload)
}

async function handleConflictReload() {
  await reloadConflict(form._id, populateForm)
}

onBeforeUnmount(async () => { await releaseOnUnmount() })
setOnSuccess(loadData)
setLoadFn(loadData)
onMounted(() => { loadCatalogos(['tiposMobiliario', 'estados', 'usuarios']); loadData() })
</script>

<style scoped>
.editing-badge {
  display: inline-flex;
  align-items: center;
  margin-left: 6px;
  color: #f59e0b;
  animation: pulse 2s infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

.responsables-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.resp-mini-badge {
  display: inline-block;
  padding: 2px 7px;
  background: var(--gray-100);
  color: var(--gray-600);
  border-radius: 10px;
  font-size: 11.5px;
  font-weight: 500;
  white-space: nowrap;
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.resp-more {
  display: inline-block;
  padding: 2px 6px;
  background: var(--primary-light);
  color: var(--primary);
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
}

.resp-detail-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: var(--primary-light);
  color: var(--primary);
  border-radius: 20px;
  font-size: 12.5px;
  font-weight: 600;
  border: 1px solid rgba(37, 99, 235, 0.2);
}

.sorted {
  cursor: pointer;
  user-select: none;
}

.sorted:hover {
  color: var(--primary);
}
</style>