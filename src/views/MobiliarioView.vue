<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Mobiliario</h1>
        <p class="page-subtitle">Gestión del inventario de mobiliario</p>
      </div>
      <button v-if="authStore.canDo('mobiliario', 'puede_crear')" class="btn btn-primary" @click="openCreate">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Nuevo mueble
      </button>
    </div>

    <!-- Filtros -->
    <div class="filter-bar">
      <div class="filter-group search">
        <label>Búsqueda general</label>
        <div class="input-with-icon">
          <svg class="input-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="filters.search" class="form-input" placeholder="Buscar por marca, tipo..." @input="onSearch" />
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
            <th>ID</th><th>Tipo</th><th>Marca</th><th>Modelo</th>
            <th>Color</th><th>Estado</th><th>Responsable</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="loading-row">
            <td colspan="8"><span class="spinner"></span></td>
          </tr>
          <tr v-else-if="!mobiliario.length">
            <td colspan="8">
              <div class="empty-state">
                <div class="empty-icon">🪑</div>
                <p>No se encontró mobiliario</p>
              </div>
            </td>
          </tr>
          <tr v-else v-for="mueble in mobiliario" :key="mueble.id_mueble">
            <td>
              <span style="font-family:var(--font-mono);font-size:12px;color:var(--gray-500)">
                {{ mueble.id_mueble }}
              </span>
            </td>
            <td style="font-weight:600;color:var(--gray-800)">
              {{ mueble.tipo_mobiliario }}
              <span v-if="mueble.editado_por && mueble.editado_por !== currentUserId" class="editing-badge" :title="`${mueble.nombre_editor} está editando`">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </span>
            </td>
            <td>{{ mueble.marca || '–' }}</td>
            <td>{{ mueble.modelo || '–' }}</td>
            <td>{{ mueble.color || '–' }}</td>
            <td><StatusBadge :estado="mueble.estado" :color="mueble.color_estado" /></td>
            <td>{{ mueble.responsable || '–' }}</td>
            <td>
              <div class="actions-cell">
                <button class="action-btn view" @click="openDetail(mueble)" title="Ver detalle">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
                <button
                  v-if="authStore.canDo('mobiliario', 'puede_actualizar')"
                  class="action-btn edit"
                  @click="openEdit(mueble)"
                  title="Editar"
                  :disabled="mueble.editado_por && mueble.editado_por !== currentUserId"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button
                  v-if="authStore.canDo('mobiliario', 'puede_eliminar')"
                  class="action-btn delete"
                  @click="confirmDelete(mueble)"
                  title="Eliminar"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <Pagination :current="page" :total-pages="totalPages" :total="total" :per-page="20" @change="onPageChange" />
    </div>

    <!-- Detail Modal -->
    <BaseModal v-model="showDetail" title="Detalles del Mobiliario" size="lg">
      <template v-if="selected">
        <div class="detail-grid">
          <div class="detail-item"><label>ID</label><strong style="font-family:var(--font-mono)">{{ selected.id_mueble }}</strong></div>
          <div class="detail-item"><label>Tipo</label><strong>{{ selected.tipo_mobiliario }}</strong></div>
          <div class="detail-item"><label>Marca</label><strong>{{ selected.marca || '–' }}</strong></div>
          <div class="detail-item"><label>Modelo</label><strong>{{ selected.modelo || '–' }}</strong></div>
          <div class="detail-item"><label>Color</label><strong>{{ selected.color || '–' }}</strong></div>
          <div class="detail-item"><label>Estado</label><StatusBadge :estado="selected.estado" :color="selected.color_estado" /></div>
          <div class="detail-item"><label>Responsable</label><strong>{{ selected.responsable || '–' }}</strong></div>
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
    <BaseModal v-model="showForm" :title="editMode ? 'Actualizar Mobiliario' : 'Nuevo Mobiliario'" size="lg" @update:model-value="handleFormClose">
      <!-- Banner de advertencia si alguien más está editando -->
      <div v-if="editMode && lockWarning" class="lock-warning">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <div>
          <strong>Advertencia:</strong>
          <span>{{ lockWarning }}</span>
        </div>
      </div>

      <form id="mobiliarioForm" @submit.prevent="saveMobiliario" novalidate>
        <div class="section-title" style="display:flex;align-items:center;gap:6px;">
          Información general
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Tipo de mobiliario <span class="required">*</span></label>
            <select v-model="form.tipo_mobiliario_id" class="form-select" :class="{ 'input-error': formErrors.tipo_mobiliario_id }">
              <option value="">Seleccionar...</option>
              <option v-for="t in catalogos.tipos" :key="t.id_tipo_mobiliario" :value="t.id_tipo_mobiliario">
                {{ t.nombre_tipo }}
              </option>
            </select>
            <span v-if="formErrors.tipo_mobiliario_id" class="field-error">{{ formErrors.tipo_mobiliario_id }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Estado <span class="required">*</span></label>
            <select v-model="form.estado_id" class="form-select" :class="{ 'input-error': formErrors.estado_id }">
              <option value="">Seleccionar...</option>
              <option v-for="e in catalogos.estados" :key="e.id_estado" :value="e.id_estado">
                {{ e.nombre_estado }}
              </option>
            </select>
            <span v-if="formErrors.estado_id" class="field-error">{{ formErrors.estado_id }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Marca</label>
            <input v-model="form.marca" class="form-input" :class="{ 'input-error': formErrors.marca }" placeholder="Ej: IKEA" maxlength="50" />
            <span v-if="formErrors.marca" class="field-error">{{ formErrors.marca }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Modelo</label>
            <input v-model="form.modelo" class="form-input" :class="{ 'input-error': formErrors.modelo }" placeholder="Ej: KALLAX" maxlength="50" />
            <span v-if="formErrors.modelo" class="field-error">{{ formErrors.modelo }}</span>
          </div>
        </div>

        <div class="section-title" style="display:flex;align-items:center;gap:6px;">
          Detalles
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Color</label>
            <input v-model="form.color" class="form-input" :class="{ 'input-error': formErrors.color }" placeholder="Ej: Negro" maxlength="20" />
            <span v-if="formErrors.color" class="field-error">{{ formErrors.color }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Responsable</label>
            <select v-model="form.usuario_asignado_id" class="form-select">
              <option value="">Sin asignar</option>
              <option v-for="u in catalogos.usuarios" :key="u.id_usuario" :value="u.id_usuario">
                {{ u.nombre_usuario }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Sucursal <span class="required">*</span></label>
            <input v-model="form.sucursal_nombre" class="form-input" :class="{ 'input-error': formErrors.sucursal_nombre }" maxlength="50" />
            <span v-if="formErrors.sucursal_nombre" class="field-error">{{ formErrors.sucursal_nombre }}</span>
          </div>
          <div class="form-group span-full">
            <label class="form-label">Características</label>
            <textarea
              v-model="form.caracteristicas"
              class="form-textarea"
              :class="{ 'input-error': formErrors.caracteristicas }"
              placeholder="Descripción de características del mobiliario..."
              maxlength="500"
            ></textarea>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:3px;">
              <span v-if="formErrors.caracteristicas" class="field-error">{{ formErrors.caracteristicas }}</span>
              <span v-else></span>
              <small style="color:var(--gray-400);font-size:11px;">{{ form.caracteristicas.length }} / 500</small>
            </div>
          </div>
          <div class="form-group span-full">
            <label class="form-label">Observaciones</label>
            <textarea
              v-model="form.observaciones"
              class="form-textarea"
              :class="{ 'input-error': formErrors.observaciones }"
              placeholder="Observaciones adicionales..."
              maxlength="500"
            ></textarea>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:3px;">
              <span v-if="formErrors.observaciones" class="field-error">{{ formErrors.observaciones }}</span>
              <span v-else></span>
              <small style="color:var(--gray-400);font-size:11px;">{{ form.observaciones.length }} / 500</small>
            </div>
          </div>
        </div>
      </form>

      <template #footer>
        <button class="btn btn-secondary" @click="handleFormClose">Cancelar</button>
        <button class="btn btn-primary" form="mobiliarioForm" type="submit" :disabled="saving">
          <span v-if="saving" class="spinner" style="width:14px;height:14px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:white;"></span>
          <span v-else>{{ editMode ? 'Actualizar' : 'Crear' }}</span>
        </button>
      </template>
    </BaseModal>

    <!-- Confirm Delete -->
    <ConfirmDialog
      v-model="showConfirm"
      title="Eliminar Mobiliario"
      :message="`¿Estás seguro de eliminar '${toDelete?.tipo_mobiliario}'? Esta acción no se puede deshacer.`"
      :loading="deleting"
      @confirm="doDelete"
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
          <p>Mientras editabas, otro usuario guardó cambios en este mobiliario.</p>
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
import { ref, reactive, onMounted, computed, onBeforeUnmount } from 'vue'
import { mobiliarioApi, catalogosApi, usuariosApi, vistasApi } from '@/services/api'
import { acquireLock, releaseLock } from '@/services/concurrency'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import ConcurrencyAlert from '@/components/ui/ConcurrencyAlert.vue'
import Pagination from '@/components/ui/Pagination.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { useFormErrors } from '@/composables/useFormErrors'
import { usePagination } from '@/composables/usePagination'

const { page, total, totalPages, perPage, onSearch, onPageChange, setMeta, setLoadFn } = usePagination()
const { formErrors, clearErrors, applyFieldErrors, setError } = useFormErrors()
const authStore = useAuthStore()
const { toast } = useToast()
const currentUserId = computed(() => authStore.user?.id_acceso)

const mobiliario = ref([])
const loading = ref(false)

const filters = reactive({ search: '', tipo_mobiliario_id: '', estado_id: '', usuario_id: '' })
const catalogos = reactive({ tipos: [], estados: [], usuarios: [] })

const showDetail = ref(false)
const showForm = ref(false)
const showConfirm = ref(false)
const showConcurrencyAlert = ref(false)
const showConflictModal = ref(false)

const selected = ref(null)
const toDelete = ref(null)
const editMode = ref(false)
const saving = ref(false)
const deleting = ref(false)
const pendingDelete = ref(null)

const lockWarning = ref(null)
const currentLock = ref(null)

// ── Validación frontend ──────────────────────────────────────────
function validateForm() {
  clearErrors()
  let valid = true

  if (!form.tipo_mobiliario_id) {
    formErrors.tipo_mobiliario_id = '"Tipo de mobiliario" es obligatorio'
    valid = false
  }
  if (!form.estado_id) {
    formErrors.estado_id = '"Estado" es obligatorio'
    valid = false
  }
  if (!form.sucursal_nombre?.trim()) {
    formErrors.sucursal_nombre = '"Sucursal" es obligatoria'
    valid = false
  }

  return valid
}

const concurrencyAlert = reactive({
  title: '',
  message: '',
  lockInfo: null,
  showRetry: false,
})

const form = reactive({
  tipo_mobiliario_id: '',
  marca: '',
  modelo: '',
  color: '',
  caracteristicas: '',
  observaciones: '',
  estado_id: '',
  usuario_asignado_id: '',
  sucursal_nombre: 'Tulancingo',
  version: null
})

async function loadCatalogos() {
  try {
    const [tipos, estados, usuarios] = await Promise.all([
      catalogosApi.getMobiliarioCompleto(),
      catalogosApi.getEstadosCompleto(),
      usuariosApi.listResponsables()
    ])
    catalogos.tipos = tipos.data
    catalogos.estados = estados.data
    catalogos.usuarios = usuarios.data
  } catch {
    toast.error('No se pudieron cargar los catálogos')
  }
}

async function loadData() {
  loading.value = true
  try {
    const params = { page: page.value, per_page: perPage }
    if (filters.search) params.search = filters.search
    if (filters.tipo_mobiliario_id) params.tipo_mobiliario_id = filters.tipo_mobiliario_id
    if (filters.estado_id) params.estado_id = filters.estado_id
    if (filters.usuario_id) params.usuario_id = filters.usuario_id
    const res = await vistasApi.listMobiliario(params)
    mobiliario.value = res.data.mobiliario
    setMeta(res.data)
  } catch {
    toast.error('Error al cargar el mobiliario')
  } finally {
    loading.value = false
  }
}

async function openDetail(mueble) {
  try {
    const res = await vistasApi.getMobiliario(mueble.id_mueble)
    selected.value = res.data
    showDetail.value = true
  } catch {
    toast.error('No se pudo cargar el detalle del mobiliario')
  }
}

function openCreate() {
  editMode.value = false
  lockWarning.value = null
  clearErrors()
  Object.assign(form, {
    tipo_mobiliario_id: '',
    marca: '',
    modelo: '',
    color: '',
    caracteristicas: '',
    observaciones: '',
    estado_id: '',
    usuario_asignado_id: '',
    sucursal_nombre: 'Tulancingo',
    version: null
  })
  showForm.value = true
}

async function openEdit(mueble) {
  editMode.value = true
  lockWarning.value = null
  clearErrors()

  const lockResult = await acquireLock('mobiliario', mueble.id_mueble, 10, 'edicion')

  if (!lockResult.success) {
    if (lockResult.locked) {
      concurrencyAlert.title = 'Registro en Uso'
      concurrencyAlert.message = lockResult.lockInfo.tipo_bloqueo === 'edicion'
        ? `${lockResult.lockInfo.nombre_usuario} está editando este mobiliario`
        : `No puedes editar este mobiliario porque ${lockResult.lockInfo.nombre_usuario} lo está eliminando`
      concurrencyAlert.lockInfo = lockResult.lockInfo
      concurrencyAlert.showRetry = true
      showConcurrencyAlert.value = true
    } else {
      toast.error(lockResult.error || 'Error al adquirir bloqueo')
    }
    return
  }

  currentLock.value = lockResult.bloqueo

  try {
    const res = await mobiliarioApi.get(mueble.id_mueble)
    const d = res.data

    if (d.editado_por && d.editado_por !== currentUserId.value) {
      lockWarning.value = `${d.nombre_editor} estaba editando este registro`
    }

    Object.assign(form, {
      tipo_mobiliario_id: d.tipo_mobiliario_id,
      marca: d.marca || '',
      modelo: d.modelo || '',
      color: d.color || '',
      caracteristicas: d.caracteristicas || '',
      observaciones: d.observaciones || '',
      estado_id: d.estado_id,
      usuario_asignado_id: d.usuario_asignado_id || '',
      sucursal_nombre: d.sucursal_nombre || 'Tulancingo',
      version: d.version
    })
    form._id = d.id_mueble
    showForm.value = true
  } catch {
    toast.error('No se pudieron cargar los datos del mobiliario')
    await releaseLock('mobiliario', mueble.id_mueble)
    currentLock.value = null
  }
}

async function saveMobiliario() {
  // Validación frontend primero
  if (!validateForm()) {
    toast.warning('Revisa los campos marcados en el formulario')
    return
  }

  saving.value = true
  try {
    const payload = { ...form, version: form.version }

    if (editMode.value) {
      await mobiliarioApi.update(form._id, payload)
      toast.success('Mobiliario actualizado correctamente', 'Actualización exitosa')
    } else {
      await mobiliarioApi.create(payload)
      toast.success('Mobiliario registrado correctamente', 'Registro exitoso')
    }

    await handleFormClose(true)
    loadData()

  } catch (e) {
    const errorData = e.response?.data

    if (errorData?.error === 'conflict') {
      showConflictModal.value = true
      saving.value = false
      return
    }

    // Si el backend devuelve errores de campo, mostrarlos inline
    if (errorData?.campos) {
      applyFieldErrors(errorData.campos)
      toast.warning(errorData.error || 'Revisa los campos del formulario')
    } else {
      toast.fromError(errorData)
    }
  } finally {
    saving.value = false
  }
}

async function handleFormClose(shouldClose = true) {
  if (currentLock.value && editMode.value) {
    await releaseLock('mobiliario', form._id)
    currentLock.value = null
  }
  lockWarning.value = null
  if (shouldClose) {
    showForm.value = false
    clearErrors()
  }
}

async function confirmDelete(mueble) {
  const lockResult = await acquireLock('mobiliario', mueble.id_mueble, 2, 'eliminacion')

  if (!lockResult.success) {
    if (lockResult.locked) {
      concurrencyAlert.title = 'No se puede eliminar'
      concurrencyAlert.message = lockResult.lockInfo.tipo_bloqueo === 'edicion'
        ? `No puedes eliminar este mobiliario porque ${lockResult.lockInfo.nombre_usuario} lo está editando`
        : `${lockResult.lockInfo.nombre_usuario} ya está eliminando este mobiliario`
      concurrencyAlert.lockInfo = lockResult.lockInfo
      concurrencyAlert.showRetry = true
      showConcurrencyAlert.value = true
    } else {
      toast.error(lockResult.error || 'Error al adquirir bloqueo')
    }
    return
  }

  pendingDelete.value = lockResult.bloqueo
  toDelete.value = mueble
  showConfirm.value = true
}

async function doDelete() {
  deleting.value = true
  try {
    await mobiliarioApi.delete(toDelete.value.id_mueble)
    if (pendingDelete.value) {
      await releaseLock('mobiliario', toDelete.value.id_mueble)
      pendingDelete.value = null
    }
    toast.success(`"${toDelete.value.tipo_mobiliario}" fue eliminado`, 'Eliminado')
    showConfirm.value = false
    toDelete.value = null
    loadData()
  } catch (e) {
    if (pendingDelete.value) {
      await releaseLock('mobiliario', toDelete.value.id_mueble)
      pendingDelete.value = null
    }
    toast.fromError(e.response?.data)
  } finally {
    deleting.value = false
  }
}

async function handleCancelDelete() {
  if (pendingDelete.value && toDelete.value) {
    await releaseLock('mobiliario', toDelete.value.id_mueble)
    pendingDelete.value = null
  }
  toDelete.value = null
  showConfirm.value = false
}

function handleConcurrencyCancel() {
  showConcurrencyAlert.value = false
}

async function handleConcurrencyRetry() {
  showConcurrencyAlert.value = false
  setTimeout(() => {
    const registroId = concurrencyAlert.lockInfo?.registro_id
    const mueble = mobiliario.value.find(m => m.id_mueble === registroId)
    if (mueble) {
      if (concurrencyAlert.title === 'No se puede eliminar') confirmDelete(mueble)
      else openEdit(mueble)
    }
  }, 1000)
}

async function handleConflictReload() {
  try {
    const res = await mobiliarioApi.get(form._id)
    const d = res.data
    Object.assign(form, {
      tipo_mobiliario_id: d.tipo_mobiliario_id,
      marca: d.marca || '',
      modelo: d.modelo || '',
      color: d.color || '',
      caracteristicas: d.caracteristicas || '',
      observaciones: d.observaciones || '',
      estado_id: d.estado_id,
      usuario_asignado_id: d.usuario_asignado_id || '',
      sucursal_nombre: d.sucursal_nombre || 'Tulancingo',
      version: d.version
    })
    showConflictModal.value = false
    clearErrors()
    toast.info('Datos recargados. Verifica los cambios antes de guardar.')
  } catch {
    toast.error('No se pudieron recargar los datos')
  }
}

onBeforeUnmount(async () => {
  if (currentLock.value && form._id) {
    await releaseLock('mobiliario', form._id)
  }
})

setLoadFn(loadData)
onMounted(() => {
  loadCatalogos()
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

/* ── Badge edición activa ── */
.editing-badge {
  display: inline-flex;
  align-items: center;
  margin-left: 6px;
  color: #f59e0b;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

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

/* ── Conflict warning ── */
.conflict-warning {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #fef3c7;
  border-radius: 12px;
  margin-bottom: 20px;
}
.conflict-warning svg { color: #d97706; flex-shrink: 0; }
.conflict-warning h4 { font-size: 16px; font-weight: 700; color: var(--gray-900); margin-bottom: 6px; }
.conflict-warning p { font-size: 13px; color: var(--gray-600); margin: 0; }
.conflict-options { display: flex; flex-direction: column; gap: 12px; }
.conflict-option { padding: 14px; background: var(--gray-50); border-radius: 8px; border: 1px solid var(--gray-200); }
.conflict-option strong { display: block; font-size: 14px; color: var(--gray-900); margin-bottom: 4px; }
.conflict-option p { font-size: 12px; color: var(--gray-600); margin: 0; }

.action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>