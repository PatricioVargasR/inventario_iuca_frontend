<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Catálogos del sistema</h1>
        <p class="page-subtitle">Administración de catálogos y configuraciones</p>
      </div>
      <button v-if="authStore.canDo('catalogos', 'puede_crear')" class="btn btn-primary" @click="openCreate(activeTab)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo {{ tabActual.labelSingular }}
      </button>
    </div>

    <!-- Tabs + búsqueda — un solo contenedor integrado -->
    <div class="card" style="padding:0;margin-bottom:20px;overflow:hidden;">

      <!-- Tabs -->
      <div class="tabs-bar" style="padding:0 16px;border-bottom:1px solid var(--border);">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          {{ tab.label }}
          <span class="tab-count" :class="{ active: activeTab === tab.key }">
            {{ tabCounts[tab.key] }}
          </span>
        </button>
      </div>

      <!-- Búsqueda dentro del mismo card -->
      <div style="padding:16px 20px;">
        <div class="filter-group search">
          <label>Búsqueda general</label>
          <div class="input-with-icon">
            <svg class="input-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              v-model="search"
              class="form-input"
              :placeholder="`Buscar ${tabActual.labelSingular.toLowerCase()}...`"
              @input="onSearch"
            />
          </div>
        </div>
      </div>

    </div>

    <!-- Tabla — contenedor independiente con bordes completos -->
    <div class="table-wrapper">

      <!-- Spinner -->
      <div v-if="loading" style="text-align:center;padding:48px;">
        <span class="spinner" style="width:24px;height:24px;"></span>
      </div>

      <!-- Tabla -->
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th v-if="activeTab === 'estado'">Color</th>
            <th>Estado</th>
            <th>Creado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!itemsFiltrados.length">
            <td :colspan="activeTab === 'estado' ? 7 : 6">
              <div class="empty-state">
                <div class="empty-icon">📋</div>
                <p>No se encontraron {{ tabActual.label.toLowerCase() }}</p>
              </div>
            </td>
          </tr>
          <tr v-else v-for="item in itemsPaginados" :key="getItemId(item)">
            <!-- ID -->
            <td>
              <span style="font-family:var(--font-mono);font-size:12px;color:var(--gray-500)">
                CAT-{{ String(getItemId(item)).padStart(3,'0') }}
              </span>
            </td>

            <!-- Nombre — igual que nombre en responsables/accesos -->
            <td style="font-weight:700;color:var(--gray-900)">{{ getItemNombre(item) }}</td>

            <!-- Descripción -->
            <td style="color:var(--gray-500);font-size:13px;max-width:260px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              {{ item.descripcion || '–' }}
            </td>

            <!-- Color (solo estados) -->
            <td v-if="activeTab === 'estado'">
              <div style="display:flex;align-items:center;gap:8px;">
                <span
                  style="width:14px;height:14px;border-radius:50%;display:inline-block;border:1px solid var(--border);"
                  :style="{ background: item.color_hex || '#ccc' }"
                ></span>
                <span style="font-family:var(--font-mono);font-size:12px;color:var(--gray-500)">
                  {{ item.color_hex || '–' }}
                </span>
              </div>
            </td>

            <!-- Estado -->
            <td>
              <span class="badge" :class="item.activo ? 'badge-success' : 'badge-danger'">
                {{ item.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>

            <!-- Fecha -->
            <td style="font-size:12px;color:var(--gray-400);font-family:var(--font-mono)">
              {{ formatDate(item.fecha_creacion) }}
            </td>
            <td>
              <div class="actions-cell">
                <button class="action-btn view" @click="openDetail(activeTab, item)" title="Ver detalle">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button v-if="authStore.canDo('catalogos', 'puede_actualizar')" class="action-btn edit" @click="openEdit(activeTab, item)" title="Editar">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button v-if="authStore.canDo('catalogos', 'puede_eliminar')" class="action-btn delete" @click="confirmDelete(activeTab, item)" title="Eliminar">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginación -->
      <Pagination
        v-if="!loading && itemsFiltrados.length > 0"
        :current="page"
        :total-pages="totalPages"
        :total="itemsFiltrados.length"
        :per-page="perPage"
        @change="onPageChange"
      />
    </div>

    <!-- Create/Edit Modal -->
    <BaseModal
      v-model="showForm"
      :title="editMode ? `Actualizar ${tabActual.labelSingular.toLowerCase()}` : 'Nuevo catálogo'"
      size="md"
      @update:model-value="handleFormClose"
    >
      <form id="catalogoForm" @submit.prevent="saveItem" class="form-grid">

        <!-- Selector de tipo solo al crear -->
        <div v-if="!editMode" class="form-group span-full">
          <label class="form-label">Tipo de catálogo <span class="required">*</span></label>
          <div class="catalog-type-selector">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              type="button"
              class="catalog-type-btn"
              :class="{ active: formTab === tab.key }"
              @click="formTab = tab.key"
            >
              {{ tab.labelSingular }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Nombre <span class="required">*</span></label>
          <input v-model="form.nombre" class="form-input" :placeholder="tabActual.placeholder" required maxlength="50" />
        </div>
        <div class="form-group">
          <label class="form-label">Estado <span class="required">*</span></label>
          <select v-model="form.estado_catalogo" class="form-select">
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
        <div v-if="(editMode && activeTab === 'estado') || (!editMode && formTab === 'estado')" class="form-group span-full">
          <label class="form-label">Color <span class="required">*</span></label>
          <div style="display:flex;gap:10px;align-items:center;">
            <input type="text" v-model="form.color_hex" class="form-input" placeholder="#000000" maxlength="7" style="max-width:120px;" />
            <input type="color" v-model="form.color_hex" style="width:50px;height:40px;padding:0;border:none;background:none;cursor:pointer;" />
          </div>
          <small style="color:var(--gray-400);font-size:11px;">Puedes elegir el color o escribir el código HEX manualmente.</small>
        </div>
        <div class="form-group span-full">
          <label class="form-label">Descripción</label>
          <textarea v-model="form.descripcion" class="form-textarea" placeholder="Descripción opcional..." maxlength="200"></textarea>
          <small style="color:var(--gray-400);font-size:11px;">{{ form.descripcion.length }} / 200</small>
        </div>

      </form>
      <template #footer>
        <button class="btn btn-secondary" @click="handleFormClose">Cancelar</button>
        <button class="btn btn-primary" form="catalogoForm" type="submit" :disabled="saving">
          <span v-if="saving" class="spinner" style="width:14px;height:14px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:white;"></span>
          <span v-else>{{ editMode ? 'Actualizar' : 'Guardar' }}</span>
        </button>
      </template>
    </BaseModal>

    <!-- Detail Modal -->
    <BaseModal v-model="showDetail" :title="`Detalles — ${tabActual.labelSingular}`" size="sm">
      <template v-if="selected">
        <div class="detail-grid">
          <div class="detail-item">
            <label>ID</label>
            <strong style="font-family:var(--font-mono);color:var(--primary)">{{ getItemId(selected) }}</strong>
          </div>
          <div class="detail-item">
            <label>Estado</label>
            <span class="badge" :class="selected.activo ? 'badge-success' : 'badge-danger'">
              {{ selected.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
          <div class="detail-item span-full">
            <label>Nombre</label>
            <strong>{{ getItemNombre(selected) }}</strong>
          </div>
          <div v-if="activeTab === 'estado'" class="detail-item span-full">
            <label>Color</label>
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="width:20px;height:20px;border-radius:50%;border:1px solid var(--border);display:inline-block;" :style="{ background: selected.color_hex }"></span>
              <strong style="font-family:var(--font-mono)">{{ selected.color_hex }}</strong>
            </div>
          </div>
          <div class="detail-item span-full">
            <label>Descripción</label>
            <strong>{{ selected.descripcion || 'Sin descripción' }}</strong>
          </div>
          <div class="detail-item">
            <label>Fecha de creación</label>
            <strong>{{ formatDate(selected.fecha_creacion) }}</strong>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-primary" @click="showDetail = false">Cerrar</button>
      </template>
    </BaseModal>

    <ConfirmDialog
      v-model="showConfirm"
      :title="`Eliminar ${tabActual.labelSingular.toLowerCase()}`"
      :message="`¿Estás seguro de eliminar '${toDelete?.nombre}'? Esta acción no se puede deshacer.`"
      :loading="deleting"
      @confirm="doDelete"
      @cancel="handleCancelDelete"
    />

    <ConcurrencyAlert
      v-model="showConcurrencyAlert"
      :title="concurrencyAlert.title"
      :message="concurrencyAlert.message"
      :lock-info="concurrencyAlert.lockInfo"
      :show-retry="concurrencyAlert.showRetry"
      @cancel="handleConcurrencyCancel"
      @retry="handleConcurrencyRetry"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { catalogosApi } from '@/services/api'
import { acquireLock, releaseLock } from '@/services/concurrency'
import { useAuthStore } from '@/stores/auth'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import ConcurrencyAlert from '@/components/ui/ConcurrencyAlert.vue'
import Pagination from '@/components/ui/Pagination.vue'

const authStore = useAuthStore()

const tabs = [
  { key: 'area',            label: 'Áreas',               labelSingular: 'Área',               placeholder: 'Ej: Dirección, Sistemas...'  },
  { key: 'estado',          label: 'Estados',             labelSingular: 'Estado',             placeholder: 'Ej: Bueno, Regular...'       },
  { key: 'tipo_activo',     label: 'Tipos de activo',     labelSingular: 'Tipo de activo',     placeholder: 'Ej: Laptop, Escritorio...'   },
  { key: 'tipo_mobiliario', label: 'Tipos de mobiliario', labelSingular: 'Tipo de mobiliario', placeholder: 'Ej: Silla, Mesa...'          },
]

const TABLA_MAP = {
  area:            'cat_areas',
  estado:          'cat_estados',
  tipo_activo:     'cat_tipos_activo',
  tipo_mobiliario: 'cat_tipos_mobiliario',
}

// Mapa: key del tab → key de la respuesta del backend
const DATA_KEY = {
  area:            'areas',
  estado:          'estados',
  tipo_activo:     'tipos_activo',
  tipo_mobiliario: 'tipos_mobiliario',
}

// ── Estado ──────────────────────────────────────────────────────
const activeTab  = ref('area')
const loading    = ref(false)
const search     = ref('')
const page       = ref(1)
const total      = ref(0)
const totalPages = ref(1)
const perPage    = 10
const formTab = ref('area')

// Items del tab activo (solo la página actual)
const items = ref([])

// Contadores por tab (se cargan una vez y se actualizan tras CRUD)
const tabCounts = reactive({
  area: 0, tipo_activo: 0, estado: 0, tipo_mobiliario: 0,
})

const showForm             = ref(false)
const showDetail           = ref(false)
const showConfirm          = ref(false)
const showConcurrencyAlert = ref(false)

const selected      = ref(null)
const toDelete      = ref(null)
const editMode      = ref(false)
const saving        = ref(false)
const deleting      = ref(false)
const pendingDelete = ref(null)
const currentLock   = ref(null)

const concurrencyAlert = reactive({
  title: '', message: '', lockInfo: null, showRetry: false,
})

const form = reactive({
  nombre: '', descripcion: '', estado_catalogo: 'activo', color_hex: '', version: null, _id: null
})

// ── Computeds ───────────────────────────────────────────────────
const tabActual = computed(() => tabs.find(t => t.key === activeTab.value))

// itemsFiltrados y itemsPaginados ya no se necesitan —
// el servidor devuelve directamente la página filtrada
const itemsFiltrados = computed(() => items.value)
const itemsPaginados = computed(() => items.value)

// ── Helpers ─────────────────────────────────────────────────────
function getItemId(item) {
  return item?.id_area ?? item?.id_tipo_activo ?? item?.id_estado ?? item?.id_tipo_mobiliario
}

function getItemNombre(item) {
  return item?.nombre_area ?? item?.nombre_tipo ?? item?.nombre_estado ?? '–'
}

function formatDate(d) {
  if (!d) return '–'
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Carga de datos ──────────────────────────────────────────────
let searchTimeout = null

async function loadTab(resetPage = false) {
  if (resetPage) page.value = 1
  loading.value = true
  try {
    const params = { page: page.value, per_page: perPage, search: search.value || undefined }
    let res

    switch (activeTab.value) {
      case 'area':            res = await catalogosApi.getAreas(params); break
      case 'tipo_activo':     res = await catalogosApi.getTiposActivo(params); break
      case 'estado':          res = await catalogosApi.getEstados(params); break
      case 'tipo_mobiliario': res = await catalogosApi.getTiposMobiliario(params); break
    }

    const key = DATA_KEY[activeTab.value]
    items.value      = res.data[key] || []
    total.value      = res.data.total || 0
    totalPages.value = res.data.pages || 1

    // Actualizar contador del tab activo con el total sin filtro
    // Solo cuando no hay búsqueda activa para no distorsionar el badge
    if (!search.value) {
      tabCounts[activeTab.value] = res.data.total || 0
    }
  } catch (e) {
    console.error(e)
    items.value = []
  } finally {
    loading.value = false
  }
}

// Carga inicial: todos los tabs para tener los contadores
async function loadAllCounts() {
  try {
    const [a, t, e, m] = await Promise.all([
      catalogosApi.getAreas({ page: 1, per_page: 1 }),
      catalogosApi.getTiposActivo({ page: 1, per_page: 1 }),
      catalogosApi.getEstados({ page: 1, per_page: 1 }),
      catalogosApi.getTiposMobiliario({ page: 1, per_page: 1 }),
    ])
    tabCounts.area            = a.data.total || 0
    tabCounts.tipo_activo     = t.data.total || 0
    tabCounts.estado          = e.data.total || 0
    tabCounts.tipo_mobiliario = m.data.total || 0
  } catch (e) {
    console.error(e)
  }
}

// ── Navegación ──────────────────────────────────────────────────
function switchTab(key) {
  activeTab.value = key
  search.value    = ''
  page.value      = 1
  loadTab()
}

function onSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => loadTab(true), 400)
}

function onPageChange(p) {
  page.value = p
  loadTab()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ── CRUD ────────────────────────────────────────────────────────
function openCreate() {
  editMode.value = false
  formTab.value  = activeTab.value
  Object.assign(form, { nombre: '', descripcion: '', estado_catalogo: 'activo', color_hex: '', version: null, _id: null })
  showForm.value = true
}

async function openEdit(type, item) {
  const id    = getItemId(item)
  const tabla = TABLA_MAP[type]

  const lockResult = await acquireLock(tabla, id, 10, 'edicion')
  if (!lockResult.success) {
    if (lockResult.locked) {
      concurrencyAlert.title   = 'Registro en uso'
      concurrencyAlert.message = lockResult.lockInfo.tipo_bloqueo === 'edicion'
        ? `${lockResult.lockInfo.nombre_usuario} está editando este registro`
        : `No puedes editar porque ${lockResult.lockInfo.nombre_usuario} lo está eliminando`
      concurrencyAlert.lockInfo  = lockResult.lockInfo
      concurrencyAlert.showRetry = true
      showConcurrencyAlert.value = true
    } else {
      alert(lockResult.error || 'Error al adquirir bloqueo')
    }
    return
  }

  currentLock.value = { tabla, id }
  editMode.value    = true

  let res
  switch (type) {
    case 'area':            res = await catalogosApi.getArea(item.id_area); break
    case 'tipo_activo':     res = await catalogosApi.getActivo(item.id_tipo_activo); break
    case 'estado':          res = await catalogosApi.getEstado(item.id_estado); break
    case 'tipo_mobiliario': res = await catalogosApi.getMobiliario(item.id_tipo_mobiliario); break
  }

  const d = res.data
  Object.assign(form, {
    nombre:          d.nombre_area ?? d.nombre_tipo ?? d.nombre_estado ?? '',
    descripcion:     d.descripcion || '',
    estado_catalogo: d.activo ? 'activo' : 'inactivo',
    color_hex:       d.color_hex || '',
    version:         d.version ?? null,
    _id:             id,
  })
  showForm.value = true
}

async function openDetail(type, item) {
  try {
    let res
    switch (type) {
      case 'area':            res = await catalogosApi.getArea(item.id_area); break
      case 'tipo_activo':     res = await catalogosApi.getActivo(item.id_tipo_activo); break
      case 'estado':          res = await catalogosApi.getEstado(item.id_estado); break
      case 'tipo_mobiliario': res = await catalogosApi.getMobiliario(item.id_tipo_mobiliario); break
    }
    selected.value = res.data
  } catch {
    selected.value = item
  }
  showDetail.value = true
}

async function handleFormClose(shouldClose = true) {
  if (currentLock.value && editMode.value) {
    await releaseLock(currentLock.value.tabla, currentLock.value.id)
    currentLock.value = null
  }
  if (shouldClose) showForm.value = false
}

async function saveItem() {
  const tipo = editMode.value ? activeTab.value : formTab.value

  saving.value = true
  const accion  = editMode.value ? 'update' : 'create'
  const payload = {
    descripcion: form.descripcion,
    activo:      form.estado_catalogo === 'activo',
    ...(form.version != null && { version: form.version }),
  }

  if (tipo === 'estado') payload.color_hex = form.color_hex

  const campoNombre = tipo === 'area'  ? 'nombre_area'
    : tipo === 'estado'                ? 'nombre_estado'
    : 'nombre_tipo'
  payload[campoNombre] = form.nombre

  const metodoMap = {
    area:            { create: 'createArea',           update: 'updateArea'           },
    estado:          { create: 'createEstado',         update: 'updateEstado'         },
    tipo_activo:     { create: 'createTipoActivo',     update: 'updateTipoActivo'     },
    tipo_mobiliario: { create: 'createTipoMobiliario', update: 'updateTipoMobiliario' },
  }

  try {
    const metodo = metodoMap[tipo][accion]
    if (editMode.value) {
      await catalogosApi[metodo](form._id, payload)
    } else {
      await catalogosApi[metodo](payload)
    }
    await handleFormClose(true)
    loadAllCounts()
    loadTab()
  } catch (e) {
    const errorData = e.response?.data
    if (errorData?.error === 'conflict') {
      alert('El registro fue modificado por otro usuario. Recarga e intenta de nuevo.')
    } else {
      alert(errorData?.error || 'Error al guardar')
    }
  } finally {
    saving.value = false
  }
}

async function confirmDelete(type, item) {
  const id    = getItemId(item)
  const tabla = TABLA_MAP[type]

  const lockResult = await acquireLock(tabla, id, 2, 'eliminacion')
  if (!lockResult.success) {
    if (lockResult.locked) {
      concurrencyAlert.title   = 'No se puede eliminar'
      concurrencyAlert.message = lockResult.lockInfo.tipo_bloqueo === 'edicion'
        ? `No puedes eliminar porque ${lockResult.lockInfo.nombre_usuario} lo está editando`
        : `${lockResult.lockInfo.nombre_usuario} ya está eliminando este registro`
      concurrencyAlert.lockInfo  = lockResult.lockInfo
      concurrencyAlert.showRetry = true
      showConcurrencyAlert.value = true
    } else {
      alert(lockResult.error || 'Error al adquirir bloqueo')
    }
    return
  }

  pendingDelete.value = { tabla, id }
  toDelete.value = { ...item, nombre: getItemNombre(item) }
  showConfirm.value = true
}

async function doDelete() {
  deleting.value = true
  try {
    const id = getItemId(toDelete.value)
    switch (activeTab.value) {
      case 'area':            await catalogosApi.deleteArea(id); break
      case 'tipo_activo':     await catalogosApi.deleteTipoActivo(id); break
      case 'estado':          await catalogosApi.deleteEstado(id); break
      case 'tipo_mobiliario': await catalogosApi.deleteTipoMobiliario(id); break
    }
    if (pendingDelete.value) {
      await releaseLock(pendingDelete.value.tabla, pendingDelete.value.id)
      pendingDelete.value = null
    }
    showConfirm.value = false
    toDelete.value    = null
    loadAllCounts()
    loadTab()
  } catch (e) {
    if (pendingDelete.value) {
      await releaseLock(pendingDelete.value.tabla, pendingDelete.value.id)
      pendingDelete.value = null
    }
    alert(e.response?.data?.error || 'Error al eliminar')
  } finally {
    deleting.value = false
  }
}

async function handleCancelDelete() {
  if (pendingDelete.value) {
    await releaseLock(pendingDelete.value.tabla, pendingDelete.value.id)
    pendingDelete.value = null
  }
  toDelete.value    = null
  showConfirm.value = false
}

function handleConcurrencyCancel() { showConcurrencyAlert.value = false }
function handleConcurrencyRetry()  { showConcurrencyAlert.value = false }

onBeforeUnmount(async () => {
  if (currentLock.value) {
    await releaseLock(currentLock.value.tabla, currentLock.value.id)
  }
})

onMounted(async () => {
  await loadAllCounts()
  loadTab()
})
</script>

<style scoped>
/* ── Tabs ── */
.tabs-bar {
  display: flex;
  padding: 0 16px;
  gap: 2px;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 11px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-family: var(--font-body);
  font-size: 13.5px;
  font-weight: 500;
  color: var(--gray-500);
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: -1px;
  white-space: nowrap;
}
.tab-btn:hover  { color: var(--gray-800); }
.tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); }

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  background: var(--gray-100);
  color: var(--gray-500);
  transition: all 0.15s;
}
.tab-count.active {
  background: var(--primary-light);
  color: var(--primary);
}
.catalog-type-selector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.catalog-type-btn {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1.5px solid var(--gray-200);
  background: var(--gray-50);
  color: var(--gray-600);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.catalog-type-btn:hover {
  border-color: var(--primary);
  background: var(--gray-100);
}

.catalog-type-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  box-shadow: 0 2px 6px rgba(79, 70, 229, 0.25);
}
</style>