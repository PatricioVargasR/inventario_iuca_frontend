<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Responsables</h1>
        <p class="page-subtitle">Personas que pueden ser asignadas como responsables de activos</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">
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
          <tr><th>ID</th><th>NOMBRE</th><th>NÓMINA</th><th>PUESTO</th><th>ÁREA</th><th>ACCIONES</th></tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="loading-row"><td colspan="6"><span class="spinner"></span></td></tr>
          <tr v-else-if="!items.length"><td colspan="6"><div class="empty-state"><div class="empty-icon">👤</div><p>No se encontraron responsables</p></div></td></tr>
          <tr v-else v-for="u in items" :key="u.id_usuario">
            <td><span style="font-family:var(--font-mono);font-size:12px;color:var(--gray-500)">ACC-{{ String(u.id_usuario).padStart(3,'0') }}</span></td>
            <td style="font-weight:700;color:var(--gray-900)">{{ u.nombre_usuario }}</td>
            <td><span style="font-family:var(--font-mono);font-size:12.5px;">{{ u.numero_nomina || '–' }}</span></td>
            <td style="color:var(--gray-600)">{{ u.puesto || '–' }}</td>
            <td>{{ u.area || '–' }}</td>
            <td>
              <div class="actions-cell">
                <button class="action-btn view" @click="openDetail(u)" title="Ver detalle">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="action-btn edit" @click="openEdit(u)" title="Editar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="action-btn delete" @click="confirmDelete(u)" title="Eliminar">
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
          <div class="detail-item"><label>ID</label><strong style="color:var(--primary);font-family:var(--font-mono)">ACC-{{ String(selected.id_usuario).padStart(3,'0') }}</strong></div>
          <div class="detail-item"><label>Área de Adscripción</label><strong>{{ selected.area || '–' }}</strong></div>
          <div class="detail-item"><label>Puesto</label><strong>{{ selected.puesto || '–' }}</strong></div>
          <div class="detail-item"><label>Número de Nómina</label><strong style="font-family:var(--font-mono)">{{ selected.numero_nomina || '–' }}</strong></div>
          <div class="detail-item"><label>Nombre Completo</label><strong>{{ selected.nombre_usuario }}</strong></div>
          <div class="detail-item"><label>Fecha de Creación</label><strong>{{ selected.fecha_creacion?.slice(0,10) || '–' }}</strong></div>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-primary" @click="showDetail = false">Cerrar</button>
      </template>
    </BaseModal>

    <!-- Form Modal -->
    <BaseModal v-model="showForm" :title="editMode ? 'Actualizar responsable' : 'Nuevo responsable'" size="sm">
      <form id="usuariosForm" @submit.prevent="saveItem">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Número de nómina </label>
            <div style="position:relative;">
              <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--gray-400);font-weight:700;">#</span>
              <input v-model="form.numero_nomina" class="form-input" placeholder="Opcional - 4 dígitos" style="padding-left:26px;" maxlength="4" />
            </div>
            <small style="color:var(--gray-400);font-size:11px;">{{ form.numero_nomina.length }} / 04 — Campo opcional</small>
          </div>
          <div class="form-group">
            <label class="form-label">Área de adscripción <span class="required">*</span></label>
            <select v-model="form.area_id" class="form-select" required="">
              <option value="">Seleccionar área</option>
              <option v-for="a in catalogos.areas" :key="a.id_area" :value="a.id_area">{{ a.nombre_area }}</option>
            </select>
          </div>
          <div class="form-group span-full">
            <label class="form-label">Nombre completo <span class="required">*</span></label>
            <div style="position:relative;">
              <svg style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--gray-400);" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              <input v-model="form.nombre_usuario" class="form-input" placeholder="Nombre completo del responsable" required style="padding-left:30px;" />
            </div>
          </div>
          <div class="form-group span-full">
            <label class="form-label">Puesto <span class="required">*</span></label>
            <div style="position:relative;">
              <svg style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--gray-400);" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
              <input v-model="form.puesto" class="form-input" placeholder="Cargo que desempeña" style="padding-left:30px;" required />
            </div>
          </div>
        </div>
      </form>
      <template #footer>
        <button class="btn btn-secondary" @click="handleFormClose">Cancelar</button>
        <button class="btn btn-primary" type="submit" form="usuariosForm" :disabled="saving">
          <span v-if="saving" class="spinner" style="width:14px;height:14px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:white;"></span>
          <span v-else>{{ editMode ? 'Actualizar responsable' : 'Guardar responsable' }}</span>
        </button>
      </template>
    </BaseModal>

    <ConfirmDialog
      v-model="showConfirm"
      title="Eliminar responsable"
      :message="`¿Estás seguro de eliminar el responsable '${toDelete?.nombre_usuario}'? Esta acción no se puede deshacer.`"
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
          <p>Mientras editabas, otro usuario guardó cambios en este responsable. Puedes:</p>
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
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { usuariosApi, catalogosApi, vistasApi } from '@/services/api'
import { acquireLock, releaseLock } from '@/services/concurrency'
import { useAuthStore } from '@/stores/auth'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import ConcurrencyAlert from '@/components/ui/ConcurrencyAlert.vue'
import Pagination from '@/components/ui/Pagination.vue'

const authStore = useAuthStore()
const currentUserId = computed(() => authStore.user?.id_acceso)

const items = ref([])
const catalogos = reactive({ areas: [] })
const loading = ref(false)
const page = ref(1)
const total = ref(0)
const totalPages = ref(1)
const filters = reactive({ search: '', area_id: '' })

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
const conflictData = ref(null)

const concurrencyAlert = reactive({
  title: '',
  message: '',
  lockInfo: null,
  showRetry: false,
})

const form = reactive({
  nombre_usuario: '',
  numero_nomina: '',
  puesto: '',
  area_id: '',
  version: null
})

let searchTimeout = null

async function loadAreas() {
  const areas = await catalogosApi.getAreas()
  catalogos.areas = areas.data
}

async function loadData() {
  loading.value = true
  try {
    const params = { page: page.value, per_page: 20 }
    if (filters.search) params.search = filters.search
    if (filters.area_id) params.area_id = filters.area_id
    const res = await vistasApi.listResponsables(params)
    items.value = res.data.responsables
    total.value = res.data.total
    totalPages.value = res.data.pages
  } catch (e) { console.error(e) } finally { loading.value = false }
}

function onSearch() { clearTimeout(searchTimeout); searchTimeout = setTimeout(() => { page.value = 1; loadData() }, 400) }
function onPageChange(p) { page.value = p; loadData() }

async function openDetail(u) {
  try {
    const res = await vistasApi.getResponsable(u.id_usuario)
    selected.value = res.data
  } catch {
    selected.value = u
  }
  showDetail.value = true
}

function openCreate() {
  editMode.value = false
  lockWarning.value = null
  Object.assign(form, { nombre_usuario: '', numero_nomina: '', puesto: '', area_id: '', version: null })
  showForm.value = true
}

async function openEdit(u) {
  editMode.value = true
  lockWarning.value = null

  const lockResult = await acquireLock('usuario', u.id_usuario, 10, 'edicion')

  if (!lockResult.success) {
    if (lockResult.locked) {
      concurrencyAlert.title = 'Registro en Uso'
      concurrencyAlert.message = lockResult.lockInfo.tipo_bloqueo === 'edicion'
        ? `${lockResult.lockInfo.nombre_usuario} está editando este responsable`
        : `No puedes editar este responsable porque ${lockResult.lockInfo.nombre_usuario} lo está eliminando`
      concurrencyAlert.lockInfo = lockResult.lockInfo
      concurrencyAlert.showRetry = true
      showConcurrencyAlert.value = true
    } else {
      alert(lockResult.error || 'Error al adquirir bloqueo')
    }
    return
  }

  currentLock.value = lockResult.bloqueo

  const res = await usuariosApi.getResponsable(u.id_usuario)
  const d = res.data

  if (d.editado_por && d.editado_por !== currentUserId.value) {
    lockWarning.value = `${d.nombre_editor} estaba editando este registro`
  }

  Object.assign(form, {
    nombre_usuario: d.nombre_usuario,
    numero_nomina: d.numero_nomina || '',
    puesto: d.puesto || '',
    area_id: d.area_id || '',
    version: d.version,
    _id: d.id_usuario
  })

  showForm.value = true
}

async function saveItem() {
  saving.value = true
  try {
    const payload = {
      nombre_usuario: form.nombre_usuario,
      numero_nomina: form.numero_nomina || null,
      puesto: form.puesto || null,
      area_id: form.area_id || null,
      version: form.version
    }

    if (editMode.value) {
      await usuariosApi.updateResponsable(form._id, payload)
    } else {
      await usuariosApi.createResponsable(payload)
    }

    await handleFormClose(true)
    loadData()
  } catch (e) {
    const errorData = e.response?.data
    if (errorData?.error === 'conflict') {
      conflictData.value = errorData
      showConflictModal.value = true
      saving.value = false
      return
    }
    alert(errorData?.error || 'Error al guardar')
  } finally {
    saving.value = false
  }
}

async function handleFormClose(shouldClose = true) {
  if (currentLock.value && editMode.value) {
    await releaseLock('usuario', form._id)
    currentLock.value = null
  }
  lockWarning.value = null
  if (shouldClose) showForm.value = false
}

async function confirmDelete(u) {
  const lockResult = await acquireLock('usuario', u.id_usuario, 2, 'eliminacion')

  if (!lockResult.success) {
    if (lockResult.locked) {
      concurrencyAlert.title = 'No se puede eliminar'
      concurrencyAlert.message = lockResult.lockInfo.tipo_bloqueo === 'edicion'
        ? `No puedes eliminar este responsable porque ${lockResult.lockInfo.nombre_usuario} lo está editando`
        : `${lockResult.lockInfo.nombre_usuario} ya está eliminando este responsable`
      concurrencyAlert.lockInfo = lockResult.lockInfo
      concurrencyAlert.showRetry = true
      showConcurrencyAlert.value = true
    } else {
      alert(lockResult.error || 'Error al adquirir bloqueo')
    }
    return
  }

  pendingDelete.value = lockResult.bloqueo
  toDelete.value = u
  showConfirm.value = true
}

async function doDelete() {
  deleting.value = true
  try {
    await usuariosApi.deleteResponsable(toDelete.value.id_usuario)
    if (pendingDelete.value) {
      await releaseLock('usuario', toDelete.value.id_usuario)
      pendingDelete.value = null
    }
    showConfirm.value = false
    toDelete.value = null
    loadData()
  } catch (e) {
    if (pendingDelete.value) {
      await releaseLock('usuario', toDelete.value.id_usuario)
      pendingDelete.value = null
    }
    alert(e.response?.data?.error || 'Error al eliminar')
  } finally {
    deleting.value = false
  }
}

async function handleCancelDelete() {
  if (pendingDelete.value && toDelete.value) {
    await releaseLock('usuario', toDelete.value.id_usuario)
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
    const u = items.value.find(i => i.id_usuario === registroId)
    if (u) {
      if (concurrencyAlert.title === 'No se puede eliminar') confirmDelete(u)
      else openEdit(u)
    }
  }, 1000)
}

async function handleConflictReload() {
  const res = await usuariosApi.getResponsable(form._id)
  const d = res.data
  Object.assign(form, {
    nombre_usuario: d.nombre_usuario,
    numero_nomina: d.numero_nomina || '',
    puesto: d.puesto || '',
    area_id: d.area_id || '',
    version: d.version
  })
  showConflictModal.value = false
  alert('Datos recargados. Por favor verifica los cambios antes de guardar.')
}

onBeforeUnmount(async () => {
  if (currentLock.value && form._id) {
    await releaseLock('usuario', form._id)
  }
})

onMounted(() => {
  loadAreas()
  loadData()
})
</script>