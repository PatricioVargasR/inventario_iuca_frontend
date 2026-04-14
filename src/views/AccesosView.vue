<template>
  <div class="page-container">

    <PageHeader
      title="Accesos al sistema"
      subtitle="Usuarios con credenciales para acceder al sistema"
    >
      <template #actions>
        <button
          v-if="authStore.canDo('acceso', 'puede_crear')"
          class="btn btn-primary"
          @click="openCreate"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo acceso
        </button>
      </template>
    </PageHeader>

    <!-- Filtros Unificados -->
    <div class="filters-card">
      <div class="filters-row">
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

      <div class="filters-divider"></div>

      <!-- Módulos -->
      <div class="filter-chips-section">
        <label class="filter-label">Módulos</label>
        <div class="chips-group">
          <label v-for="(value, key) in MODULOS_DISPONIBLES" :key="key" class="chip-checkbox">
            <input type="checkbox" :value="key" v-model="filters.modulos" @change="onModuloChange" />
            <span class="chip-text">{{ value }}</span>
          </label>
        </div>
      </div>

      <!-- Permisos -->
      <div class="filter-chips-section" :class="{ disabled: filters.modulos.length === 0 }">
        <label class="filter-label">
          Permisos
          <span class="hint-text" v-if="filters.modulos.length === 0">Selecciona al menos un módulo</span>
        </label>
        <div class="chips-group">
          <label
            v-for="(value, key) in PERMISOS_DISPONIBLES"
            :key="key"
            class="chip-checkbox"
            :class="{ disabled: filters.modulos.length === 0 }"
          >
            <input type="checkbox" :value="key" v-model="filters.permisos" @change="loadData" :disabled="filters.modulos.length === 0" />
            <span class="chip-text">{{ value }}</span>
          </label>
        </div>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th @click="toggleSort('id_acceso')" class="sorted">
              <span class="sort-btn">
                ID
                <span class="sort-icon" :class="getSortClass('id_acceso')">
                  <span class="arr-up"></span>
                  <span class="arr-down"></span>
                </span>
              </span>
            </th>
            <th @click="toggleSort('nombre_acceso')" class="sorted">
              <span class="sort-btn">
                Nombre
                <span class="sort-icon" :class="getSortClass('nombre_acceso')">
                  <span class="arr-up"></span>
                  <span class="arr-down"></span>
                </span>
              </span>
            </th>
            <th>
              Correo
            </th>
            <th>
              Área
            </th>
            <th>
              Último acceso
            </th>
            <th>
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="loading-row"><td colspan="7"><span class="spinner"></span></td></tr>
          <tr v-else-if="!items.length">
            <td colspan="7">
              <EmptyState
                text="No se encontraron accesos"
                icon="🔑"
              />
            </td>
          </tr>
          <tr v-else v-for="acc in items" :key="acc.id_acceso">
            <td><span style="font-family:var(--font-mono);font-size:12px;color:var(--gray-500)">{{ acc.id_acceso }}</span></td>
            <td style="font-weight:700;">{{ acc.nombre_usuario }}</td>
            <td style="color:var(--gray-500);font-size:13px;">{{ acc.correo_electronico }}</td>
            <td>{{ acc.area || '–' }}</td>
            <td style="font-size:12px;color:var(--gray-400);font-family:var(--font-mono)">{{ formatDate(acc.ultimo_acceso) }}</td>
            <td>
              <TableActions
                :show-edit="authStore.canDo('acceso', 'puede_actualizar')"
                :show-delete="authStore.canDo('acceso', 'puede_eliminar')"
                :delete-hidden="acc.id_acceso === currentUserId"
                @view="openDetail(acc)"
                @edit="openEdit(acc)"
                @delete="confirmDelete(acc.id_acceso, acc)"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <Pagination
        :current="page"
        :total-pages="totalPages"
        :total="total"
        :from="from"
        :to="to"
        :per-page="perPage"
        @change="onPageChange"
      />
    </div>

    <!-- Detail Modal -->
    <BaseModal v-model="showDetail" title="Detalles del Acceso" size="lg">
      <template v-if="selected">
        <div class="section-title" style="margin-top:0;">Información personal</div>
        <div class="detail-grid">
          <div class="detail-item"><label>ID</label><strong>{{ selected.id_acceso }}</strong></div>
          <div class="detail-item"><label>Correo electrónico</label><strong>{{ selected.correo_electronico }}</strong></div>
          <div class="detail-item"><label>Nombre completo</label><strong>{{ selected.nombre_usuario }}</strong></div>
          <div class="detail-item"><label>Área asignada</label><strong>{{ selected.area || '–' }}</strong></div>
        </div>
        <div class="section-title">Información de acceso</div>
        <div class="detail-grid" style="grid-template-columns:1fr 1fr 1fr;">
          <div class="detail-item"><label>Último acceso</label><strong style="font-family:var(--font-mono);font-size:13px">{{ selected.ultimo_acceso || '–' }}</strong></div>
          <div class="detail-item"><label>Cuenta creada</label><strong>{{ selected.fecha_creacion?.slice(0,10) || '–' }}</strong></div>
        </div>
        <div class="section-title">Permisos de rol asignados</div>
        <table class="permissions-table">
          <thead><tr><th>Módulo</th><th>Leer</th><th>Crear</th><th>Editar</th><th>Eliminar</th></tr></thead>
          <tbody>
            <tr
              v-for="p in [...permisosDetalleComoArray(selected.permisos)].sort((a, b) => a.modulo.localeCompare(b.modulo))"
              :key="p.modulo"
            >
              <td><span style="text-transform: capitalize;">{{ p.modulo }}</span></td>
              <td><span class="perm-icon" :class="{ active: p.leer }"><svg v-if="p.leer" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg><svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span></td>
              <td><span v-if="p.modulo!=='historial'" class="perm-icon" :class="{ active: p.crear }"><svg v-if="p.crear" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg><svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span></td>
              <td><span v-if="p.modulo!=='historial'" class="perm-icon" :class="{ active: p.actualizar }"><svg v-if="p.actualizar" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg><svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span></td>
              <td><span v-if="p.modulo!=='historial'" class="perm-icon" :class="{ active: p.eliminar }"><svg v-if="p.eliminar" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg><svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span></td>
            </tr>
          </tbody>
        </table>
      </template>
      <template #footer>
        <button class="btn btn-primary" @click="showDetail = false">Cerrar</button>
      </template>
    </BaseModal>

    <!-- Form Modal -->
    <BaseModal v-model="showForm" :title="editMode ? 'Editar acceso' : 'Registro de acceso'" subtitle="Sistema de inventario IUCA" size="lg" @update:model-value="handleFormClose">

      <!-- Banner lock warning -->
      <LockWarningBanner v-if="editMode" :message="lockWarning" />

      <form id="accesosForm" @submit.prevent="saveItem" novalidate>
        <div class="section-title" style="margin-top:0;">Información personal</div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Nombre completo <span class="required">*</span></label>
            <input
              v-model="form.nombre_usuario"
              class="form-input"
              :class="{ 'input-error': formErrors.nombre_usuario }"
              placeholder="Ej. Juan Pérez"
            />
            <span v-if="formErrors.nombre_usuario" class="field-error">{{ formErrors.nombre_usuario }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Correo electrónico <span class="required">*</span></label>
            <input
              v-model="form.correo_electronico"
              class="form-input"
              :class="{ 'input-error': formErrors.correo_electronico }"
              type="email"
              placeholder="usuario@iuca.edu.mx"
              :disabled="editMode"
            />
            <span v-if="formErrors.correo_electronico" class="field-error">{{ formErrors.correo_electronico }}</span>
          </div>
        </div>

        <div class="section-title">Información de acceso</div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Contraseña <span v-if="!editMode" class="required">*</span></label>
            <div style="position:relative;">
              <input
                v-model="form.password"
                :type="showPass ? 'text' : 'password'"
                class="form-input"
                :class="{ 'input-error': formErrors.password }"
                placeholder="••••••••"
                style="padding-right:38px;"
                maxlength="10"
              />
              <button type="button" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--gray-400);" @click="showPass=!showPass">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
            <span v-if="formErrors.password" class="field-error">{{ formErrors.password }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Confirmar contraseña <span v-if="!editMode" class="required">*</span></label>
            <input
              v-model="form.confirm_password"
              :type="showPass ? 'text' : 'password'"
              class="form-input"
              :class="{ 'input-error': formErrors.confirm_password }"
              placeholder="••••••••"
              maxlength="10"
            />
            <span v-if="formErrors.confirm_password" class="field-error">{{ formErrors.confirm_password }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Área asignada <span class="required">*</span></label>
            <select
              v-model="form.area_id"
              class="form-select"
              :class="{ 'input-error': formErrors.area_id }"
              style="max-width:260px;"
            >
              <option value="">Seleccionar área</option>
              <option v-for="a in catalogos.areas" :key="a.id_area" :value="a.id_area">{{ a.nombre_area }}</option>
            </select>
            <span v-if="formErrors.area_id" class="field-error">{{ formErrors.area_id }}</span>
          </div>
        </div>

        <div style="margin-top:4px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:20px;margin-bottom:12px;">
            <div class="section-title" style="margin:0;">Permisos del rol asignado</div>
            <label class="select-all-label">
              <input
                type="checkbox"
                :checked="todosSeleccionados"
                :indeterminate.prop="algunosSeleccionados"
                @change="toggleTodos"
              />
              <span>Seleccionar todos</span>
            </label>
          </div>
          <table class="permissions-table">
            <thead>
              <tr><th>Módulo</th><th>Leer</th><th>Crear</th><th>Editar</th><th>Eliminar</th></tr>
            </thead>
            <tbody>
              <tr
                v-for="p in [...permisosComoArray()].sort((a, b) => a.modulo.localeCompare(b.modulo))"
                :key="p.modulo"
              >
                <td>{{ formatModuloNombre(p.modulo) }}</td>
                <td><span class="perm-icon" :class="{ active: p.puede_leer }" @click="togglePermiso(p, 'puede_leer')"><svg v-if="p.puede_leer" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg><svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span></td>
                <td><span v-if="p.modulo!=='historial'" class="perm-icon" :class="{ active: p.puede_crear }" @click="togglePermiso(p, 'puede_crear')"><svg v-if="p.puede_crear" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg><svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span></td>
                <td><span v-if="p.modulo!=='historial'" class="perm-icon" :class="{ active: p.puede_actualizar }" @click="togglePermiso(p, 'puede_actualizar')"><svg v-if="p.puede_actualizar" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg><svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span></td>
                <td><span v-if="p.modulo!=='historial'" class="perm-icon" :class="{ active: p.puede_eliminar }" @click="togglePermiso(p, 'puede_eliminar')"><svg v-if="p.puede_eliminar" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg><svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </form>
      <template #footer>
        <button class="btn btn-secondary" @click="handleFormClose">
          Cancelar
        </button>
        <button class="btn btn-primary" form="accesosForm" type="submit" :disabled="saving">
          <span v-if="saving" class="spinner" style="width:14px;height:14px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:white;"></span>
          <span v-else>{{ editMode ? 'Actualizar' : 'Guardar' }}</span>
        </button>
      </template>
    </BaseModal>

    <ConfirmDialog
      v-model="showConfirm"
      title="Eliminar acceso"
      :message="`¿Estás seguro de eliminar el acceso '${toDelete?.nombre_usuario}'? Esta acción no se puede deshacer.`"
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
    <ConflictModal
      v-model="showConflictModal"
      entity-label="este acceso"
      @reload="handleConflictReload"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
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
import ConflictModal from '@/components/ui/ConflictModal.vue'
import LockWarningBanner from '@/components/ui/LockWarningBanner.vue'
import TableActions from '@/components/ui/TableActions.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { formatDate } from '@/utils/formatters'
import { MODULOS_DISPONIBLES, PERMISOS_DISPONIBLES, DEFAULT_PERMISOS, NOMBRES_MODULOS } from '@/constants/accesos'
import { usePermisos } from '@/composables/usePermisos'

const authStore = useAuthStore()
const { toast } = useToast()
const currentUserId = computed(() => authStore.user?.id_acceso)
const { catalogos, loadCatalogos } = useCatalogos()
const { getSortClass, toggleSort, applySortToParams } = useSort({
  onChange: loadData
})
const { page, total, totalPages, perPage, from, to, onSearch, onPageChange, setMeta, setLoadFn } = usePagination()
const { formErrors, clearErrors, applyFieldErrors, setError } = useFormErrors()

const items = ref([])
const loading = ref(false)
const filters = reactive({
  search: '',
  modulos: [],
  permisos: [],
  area_id: ''
})

const showPass = ref(false)

const {
  showForm, showConfirm, showConcurrencyAlert, showConflictModal,
  showDetail, selected,
  editMode, saving, deleting, toDelete, lockWarning,
  concurrencyAlert,
  openCreate: crudOpenCreate, openDetail: crudOpenDetail,
  openEdit: crudOpenEdit,
  handleFormClose, save,
  confirmDelete, doDelete, handleCancelDelete,
  releaseOnUnmount, setOnSuccess
} = useCrud({
  tabla:        'acceso',
  apiGet:       (id) => usuariosApi.getAcceso(id),
  apiGetDetail: (id) => vistasApi.getAcceso(id),
  apiCreate:    (data) => usuariosApi.createAcceso(data),
  apiUpdate:    (id, data) => usuariosApi.updateAcceso(id, data),
  apiDelete:    (id) => usuariosApi.deleteAcceso(id),
  clearErrors,
  applyFieldErrors
})

const {
  handleConcurrencyCancel,
  handleConcurrencyRetry,
  handleConflictReload: reloadConflict
} = useConcurrencyHandlers({
  showConcurrencyAlert,
  showConflictModal,
  concurrencyAlert,
  items,
  idKey: 'id_acceso',
  openEdit:      (acc) => openEdit(acc),
  confirmDelete: (acc) => confirmDelete(acc.id_acceso, acc),
  apiGet:        (id) => usuariosApi.getAcceso(id),
  clearErrors,
  toast
})

// populate reutilizable
function populateForm(d) {
  Object.assign(form, {
    _id:               d.id_acceso,
    nombre_usuario:    d.nombre_usuario,
    correo_electronico: d.correo_electronico,
    area_id:           d.area_id || '',
    password:          '',
    confirm_password:  '',
    permisos:          d.permisos
                         ? JSON.parse(JSON.stringify(d.permisos))
                         : JSON.parse(JSON.stringify(DEFAULT_PERMISOS)),
    version:           d.version
  })
}

// Wrappers específicos del módulo
function openCreate() {
  crudOpenCreate(() => {
    Object.assign(form, {
      _id: null,
      nombre_usuario: '',
      correo_electronico: '',
      password: '',
      confirm_password: '',
      area_id: '',
      permisos: JSON.parse(JSON.stringify(DEFAULT_PERMISOS)),
      version: null
    }),
    resetPermisos()
  })
}

async function openEdit(acc) {
  await crudOpenEdit(acc.id_acceso, populateForm)
}

async function openDetail(acc) {
  await crudOpenDetail(acc.id_acceso)
}

async function handleConflictReload() {
  await reloadConflict(form._id, populateForm)
}

// ── Validación frontend ──────────────────────────────────────────
function validateForm() {
  clearErrors()
  let valid = true

  if (!form.nombre_usuario?.trim()) {
    setError('nombre_usuario', '"Nombre completo" es obligatorio')
    valid = false
  } else if (form.nombre_usuario.trim().length > 100) {
    setError('nombre_usuario', 'El nombre no puede superar 100 caracteres')
    valid = false
  }

  if (!editMode.value) {
    if (!form.correo_electronico?.trim()) {
      setError('correo_electronico', '"Correo electrónico", es obligatorio')
      valid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo_electronico)) {
      setError('correo_electronico', 'El correo electrónico no tienen un formato válido')
      valid = false
    }
  }

  if (!form.area_id) {
    setError('area_id', '"Área asignada" es obligatoria')
    formErrors.area_id = '"Área asignada" es obligatoria'
    valid = false
  }

  if (!editMode.value) {
    if (!form.password) {
      setError('password', '"Contraseña" es obligatoria')
      valid = false
    } else if (form.password.length !== 10) {
      setError('password', 'La contraseña debe tener exactamente 10 caracteres')
      formErrors.password = 'La contraseña debe tener exactamente 10 caracteres'
      valid = false
    }

    if (!form.confirm_password) {
      setError('confirm_password', 'Debes confirmar la contraseña')
      formErrors.confirm_password = 'Debes confirmar la contraseña'
      valid = false
    } else if (form.password && form.password !== form.confirm_password) {
      setError('confirm_password', 'Las contraseñas no coinciden')
      valid = false
    }
  } else {
    // En edición, la contraseña es opcional pero si se llena se valida
    if (form.password) {
      if (form.password.length !== 10) {
        setError('password', 'La contraseña debe tener exactamente 10 caracters')
        valid = false
      }
      if (!form.confirm_password) {
        setError('confirm_password', 'Debes confirmar la nueva contraseña')
        valid = false
      } else if (form.password !== form.confirm_password) {
        setError('confirm_password', 'las contraseñas no coinciden')
        valid = false
      }
    }
  }

  return valid
}

const form = reactive({
  _id: null,
  nombre_usuario: '',
  correo_electronico: '',
  password: '',
  confirm_password: '',
  area_id: '',
  permisos: JSON.parse(JSON.stringify(DEFAULT_PERMISOS)),
  version: null
})

const {
  permisosComoArray,
  permisosDetalleComoArray,
  togglePermiso,
  todosSeleccionados,
  algunosSeleccionados,
  toggleTodos,
  resetPermisos
} = usePermisos(form)

async function loadData() {
  loading.value = true
  try {
    let params = { page: page.value, per_page: perPage }
    if (filters.search) params.search = filters.search
    if (filters.area_id) params.area_id = filters.area_id

    params = applySortToParams(params)

    const permisosObj = Object.fromEntries(
      filters.modulos.map(m => [m, filters.permisos])
    )
    params.permisos = JSON.stringify(permisosObj)
    const res = await vistasApi.listAccesos(params)
    items.value = res.data.accesos
    setMeta(res.data)
  } catch {
    toast.error('Error al cargar los accesos')
  } finally {
    loading.value = false
  }
}

function onModuloChange() {
  if (filters.modulos.length === 0) filters.permisos = []
  loadData()
}

async function saveItem() {
  if (!validateForm()) {
    toast.warning('Revisa los campos marcados en el formulario')
    return
  }
  const payload = {
    nombre_usuario:    form.nombre_usuario,
    correo_electronico: form.correo_electronico,
    area_id:           form.area_id,
    permisos:          form.permisos,
    version:           form.version
  }
  if (form.password) payload.password = form.password
  await save(form._id, payload)
}

function formatModuloNombre(modulo) {
  return NOMBRES_MODULOS[modulo] || modulo
}

async function handleDoDelete() {
  await doDelete(toDelete.value.id_acceso)
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
/* ── Lock warning ── */
.lock-warning {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 8px;
  margin-bottom: 20px;
  color: #92400e;
}
.lock-warning svg { flex-shrink: 0; margin-top: 2px; }
.lock-warning strong { display: block; font-size: 13px; margin-bottom: 2px; }
.lock-warning span { font-size: 12px; }

/* ── Filtros ── */
.filters-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid var(--gray-200);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filters-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gray-500);
}

.hint-text {
  font-size: 10px;
  font-weight: 500;
  color: var(--gray-400);
  text-transform: none;
  letter-spacing: normal;
  margin-left: 4px;
  font-style: italic;
}

.filters-divider {
  height: 1px;
  background: var(--gray-200);
  margin: 16px 0;
}

.filter-chips-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
  transition: opacity 0.2s ease;
}
.filter-chips-section:last-child { margin-bottom: 0; }
.filter-chips-section.disabled { opacity: 0.5; pointer-events: none; }

.chips-group { display: flex; flex-wrap: wrap; gap: 8px; }

.chip-checkbox {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  position: relative;
}
.chip-checkbox input[type="checkbox"] { position: absolute; opacity: 0; width: 0; height: 0; }

.chip-text {
  display: inline-block;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-600);
  background: var(--gray-50);
  border: 1.5px solid var(--gray-200);
  border-radius: 20px;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.chip-checkbox:hover:not(.disabled) .chip-text {
  background: var(--gray-100);
  border-color: var(--primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}
.chip-checkbox input[type="checkbox"]:checked + .chip-text {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
}
.chip-checkbox.disabled { cursor: not-allowed; opacity: 0.5; }

/* ── Permisos select all ── */
.select-all-label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-600);
  cursor: pointer;
  user-select: none;
}
.select-all-label input[type="checkbox"] {
  width: 15px;
  height: 15px;
  cursor: pointer;
  accent-color: var(--primary);
}
.select-all-label:hover { color: var(--primary); }

.sorted {
  cursor: pointer;
  user-select: none;
}

.sorted:hover {
  color: var(--primary);
}
</style>