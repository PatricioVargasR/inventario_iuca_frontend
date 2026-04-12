<template>
  <div class="page-container">


    <PageHeader
      title="Equipos de cómputo"
      subtitle="Gestión del inventario de equipos"
    >
      <template #actions>
        <button
          v-if="authStore.canDo('computo', 'puede_crear')"
          class="btn btn-primary"
          @click="handleOpenCreate"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo equipo
        </button>
      </template>
    </PageHeader>

    <!-- Filtros -->
    <FilterBar
      :modelValue="filters"
      @update:modelValue="val => Object.assign(filters, val)"
      :config="filterConfig"
      @search="onSearch"
      @change="loadData"
    />

    <!-- Tabla -->
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th @click="toggleSort('id_activo')" class="sorted">
              ID {{  getSortIcon('id_activo') }}
            </th>
            <th @click="toggleSort('tipo_activo')" class="sorted">
              Tipo {{ getSortIcon('tipo_activo') }}
            </th>
            <th>
              Nombre
            </th>
            <th>Marca</th>
            <th>Modelo</th><th>NO. Serie</th><th>Estado</th>
            <th>Responsable</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="loading-row"><td colspan="9"><span class="spinner"></span></td></tr>
          <tr v-else-if="!equipos.length">
            <td colspan="9">
              <EmptyState
                text="No se encontraron equipos"
                icon="💻"
              />
            </td>
          </tr>
          <tr v-else v-for="eq in equipos" :key="eq.id_activo">
            <td><span style="font-family:var(--font-mono);font-size:12px;color:var(--gray-500)">{{ eq.id_activo }}</span></td>
            <td>{{ eq.tipo_activo }}</td>
            <td style="font-weight:700;color:var(--gray-800)">
              {{ eq.nombre_activo }}
              <span v-if="eq.editado_por && eq.editado_por !== currentUserId" class="editing-badge">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
              </span>
            </td>
            <td>{{ eq.marca || '–' }}</td>
            <td>{{ eq.modelo || '–' }}</td>
            <td><span style="font-family:var(--font-mono);font-size:12px">{{ eq.numero_serie || '–' }}</span></td>
            <td><StatusBadge :estado="eq.estado" :color="eq.color_estado" /></td>
            <td>{{ eq.responsable || '–' }}</td>
            <td>
              <TableActions
                :show-edit="authStore.canDo('computo', 'puede_actualizar')"
                :show-delete="authStore.canDo('computo', 'puede_eliminar')"
                @view="handleOpenDetail(eq)"
                @edit="handleOpenEdit(eq)"
                @delete="confirmDelete(eq.id_activo, eq)"
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
        :per-page="20"
        @change="onPageChange"
      />
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
          <div class="detail-item"><label>Estado</label><StatusBadge :estado="selected.estado" :color="selected.color_estado" /></div>
          <div class="detail-item"><label>Marca</label><strong>{{ selected.marca || '–' }}</strong></div>
          <div class="detail-item"><label>Responsable</label><strong>{{ selected.responsable || '–' }}</strong></div>
        </div>
        <div v-if="selected.especificaciones" style="margin-top:16px;">
          <div class="section-title">Especificaciones</div>
          <div class="specs-box">
            <div v-for="(spec, i) in selected.especificaciones.split('|')" :key="i" class="spec-item">{{ spec.trim() }}</div>
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
    <BaseModal v-model="showForm" :title="editMode ? 'Actualizar Equipo' : 'Nuevo Equipo'" size="lg" @update:model-value="handleFormClose">

      <LockWarningBanner v-if="editMode" :message="lockWarning" />

      <form id="equipoForm" @submit.prevent="handleSave" novalidate>
        <div class="section-title" style="display:flex;align-items:center;gap:6px;">Información General</div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Tipo de Activo <span class="required">*</span></label>
            <select v-model="form.tipo_activo_id" class="form-select" :class="{ 'input-error': formErrors.tipo_activo_id }" required>
              <option value="">Seleccionar...</option>
              <option v-for="t in catalogos.tipos" :key="t.id_tipo_activo" :value="t.id_tipo_activo">{{ t.nombre_tipo }}</option>
            </select>
            <span v-if="formErrors.tipo_activo_id" class="field-error">{{ formErrors.tipo_activo_id }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Estado <span class="required">*</span></label>
            <select v-model="form.estado_id" class="form-select" :class="{ 'input-error': formErrors.estado_id }" required>
              <option value="">Seleccionar...</option>
              <option v-for="e in catalogos.estados" :key="e.id_estado" :value="e.id_estado">{{ e.nombre_estado }}</option>
            </select>
            <span v-if="formErrors.estado_id" class="field-error">{{ formErrors.estado_id }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Nombre del Activo <span class="required">*</span></label>
            <input v-model="form.nombre_activo" class="form-input" :class="{ 'input-error': formErrors.nombre_activo }" placeholder="Ej: ThinkPad X1" maxlength="50" />
            <span v-if="formErrors.nombre_activo" class="field-error">{{ formErrors.nombre_activo }}</span>
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
          <div class="form-group">
            <label class="form-label">Marca <span class="required">*</span></label>
            <input v-model="form.marca" class="form-input" :class="{ 'input-error': formErrors.marca }" placeholder="Ej: Lenovo" maxlength="50" />
            <span v-if="formErrors.marca" class="field-error">{{ formErrors.marca }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Modelo <span class="required">*</span></label>
            <input v-model="form.modelo" class="form-input" :class="{ 'input-error': formErrors.modelo }" placeholder="Ej: ThinkPad X1" maxlength="50" />
            <span v-if="formErrors.modelo" class="field-error">{{ formErrors.modelo }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Número de Serie <span class="required">*</span></label>
            <input v-model="form.numero_serie" class="form-input" :class="{ 'input-error': formErrors.numero_serie }" placeholder="Ej: ABC123XYZ456" maxlength="50" />
            <span v-if="formErrors.numero_serie" class="field-error">{{ formErrors.numero_serie }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Sucursal <span class="required">*</span></label>
            <input v-model="form.sucursal_nombre" class="form-input" :class="{ 'input-error': formErrors.sucursal_nombre }" maxlength="50" />
            <span v-if="formErrors.sucursal_nombre" class="field-error">{{ formErrors.sucursal_nombre }}</span>
          </div>
          <div class="form-group span-full">
            <label class="form-label">Observaciones</label>
            <textarea v-model="form.observaciones" class="form-textarea" placeholder="Observaciones relevantes..." maxlength="500"></textarea>
            <small style="color:var(--gray-400);font-size:11px;">{{ form.observaciones.length }} / 500</small>
          </div>
        </div>

        <div class="section-title" style="display:flex;align-items:center;justify-content:space-between;">
          Especificaciones
          <button type="button" class="btn btn-secondary btn-sm" @click="addSpec">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Agregar
          </button>
        </div>

        <div v-if="form.tipo_activo_id && specSuggestions.length" class="spec-quick-chips">
          <span class="spec-chips-label">Agregar rápido:</span>
          <button
            v-for="sug in specSuggestions"
            :key="sug.nombre"
            type="button"
            class="spec-chip-btn"
            :class="{ used: form.especificaciones.some(s => s.nombre_especificacion === sug.nombre) }"
            @click="!form.especificaciones.some(s => s.nombre_especificacion === sug.nombre) && (form.especificaciones.push({ nombre_especificacion: sug.nombre, valor_especificacion: '', _placeholder: sug.placeholder }))"
          >
            <svg v-if="form.especificaciones.some(s => s.nombre_especificacion === sug.nombre)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            <svg v-else width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {{ sug.nombre }}
          </button>
        </div>
        <div v-else-if="!form.tipo_activo_id" class="spec-hint">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Selecciona un tipo de equipo para ver sugerencias de especificaciones
        </div>

        <div
          v-for="(spec, i) in form.especificaciones"
          :key="i"
          class="spec-row"
          :class="`spec-row-${i}`"
        >
          <div class="spec-nombre-wrapper">
            <input
              v-model="spec.nombre_especificacion"
              class="form-input"
              :class="{ 'input-error': specErrors[i]?.nombre }"
              placeholder="RAM, Procesador..."
              @focus="openSuggestions(i)"
              @input="openSuggestions(i)"
              @blur="closeSuggestions"
            />
            <div v-if="activeSuggestionIndex === i && filteredSuggestions(i).length" class="spec-suggestions-dropdown">
              <button
                v-for="sug in filteredSuggestions(i)"
                :key="sug.nombre"
                type="button"
                class="spec-suggestion-item"
                :class="{ used: form.especificaciones.some((s, idx) => idx !== i && s.nombre_especificacion === sug.nombre) }"
                @mousedown.prevent="applySuggestion(i, sug)"
              >
                <span class="sug-nombre">{{ sug.nombre }}</span>
                <span class="sug-ejemplo">{{ sug.placeholder }}</span>
              </button>
            </div>
          </div>
          <div style="flex:1">
            <input
              v-model="spec.valor_especificacion"
              class="form-input spec-value-input"
              :class="{ 'input-error': specErrors[i]?.valor }"
              :placeholder="spec._placeholder || 'Valor...'"
            />
          </div>
          <button type="button" class="spec-delete" @click="removeSpec(i)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Error global de specs -->
        <p v-if="formErrors.especificaciones" class="field-error" style="margin-top:6px;">{{ formErrors.especificaciones }}</p>
      </form>

      <template #footer>
        <button class="btn btn-secondary" @click="handleFormClose">Cancelar</button>
        <button class="btn btn-primary" form="equipoForm" type="submit" :disabled="saving">
          <span v-if="saving" class="spinner" style="width:14px;height:14px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:white;"></span>
          <span v-else>{{ editMode ? 'Actualizar' : 'Guardar' }}</span>
        </button>
      </template>
    </BaseModal>

    <!-- Confirm Delete -->
    <ConfirmDialog
      v-model="showConfirm"
      title="Eliminar Equipo"
      :message="`¿Estás seguro de eliminar '${toDelete?.nombre_activo}'? Esta acción no se puede deshacer.`"
      :loading="deleting"
      @confirm="handleDoDelete"
      @cancel="handleCancelDelete_"
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

    <!-- Conflict Modal -->
    <ConflictModal
      v-model="showConflictModal"
      entity-label="este equipo"
      @reload="handleConflictReload"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onBeforeUnmount, nextTick } from 'vue'
import { equiposApi, vistasApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { useFormErrors } from '@/composables/useFormErrors'
import { usePagination } from '@/composables/usePagination'
import { useCrud } from '@/composables/useCrud'
import { useConcurrencyHandlers } from '@/composables/useConcurrencyHandlers'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import ConcurrencyAlert from '@/components/ui/ConcurrencyAlert.vue'
import Pagination from '@/components/ui/Pagination.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { useCatalogos } from '@/composables/useCatalogos'
import FilterBar from '@/components/ui/FilterBar.vue'
import { useSort } from '@/composables/useSort'
import ConflictModal from '@/components/ui/ConflictModal.vue'
import LockWarningBanner from '@/components/ui/LockWarningBanner.vue'
import TableActions from '@/components/ui/TableActions.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useSpecsEditor } from '@/composables/useSpecsEditor'
import { SPECS_MAP } from '@/constants/equiposMap'

// ── Composables base ─────────────────────────────────────────────
const { catalogos, loadCatalogos } = useCatalogos()
const { getSortIcon, toggleSort, applySortToParams } = useSort({
  onChange: loadData
})
const { page, total, totalPages, perPage, onSearch, onPageChange, setMeta, setLoadFn } = usePagination()
const { formErrors, clearErrors, setError } = useFormErrors()
const authStore = useAuthStore()
const { toast } = useToast()
const currentUserId = computed(() => authStore.user?.id_acceso)



// ── Estado local ─────────────────────────────────────────────────
const equipos = ref([])
const loading = ref(false)
const filters = reactive({ search: '', tipo_activo_id: '', estado_id: '', usuario_id: '' })
const specErrors = reactive({})

const form = reactive({
  _id: null,
  tipo_activo_id: '', estado_id: '', nombre_activo: '',
  usuario_asignado_id: '', marca: '', modelo: '',
  numero_serie: '', sucursal_nombre: 'Tulancingo',
  observaciones: '', especificaciones: [],
  version: null
})

const specSuggestions = computed(() => {
  const tipo = catalogos.tipos.find(t => t.id_tipo_activo === form.tipo_activo_id)
  if (!tipo) return SPECS_MAP['default']
  const key = tipo.nombre_tipo.toLowerCase()
  const match = Object.keys(SPECS_MAP).find(k => key.includes(k))
  return SPECS_MAP[match] || SPECS_MAP['default']
})


const {
  activeSuggestionIndex,
  openSuggestions,
  closeSuggestions,
  applySuggestion,
  filteredSuggestions,
  addSpec,
  removeSpec
} = useSpecsEditor(form, specErrors, specSuggestions)

// ── useCrud ──────────────────────────────────────────────────────
const {
  showForm, showConfirm, showConcurrencyAlert, showConflictModal,
  showDetail, selected,
  editMode, saving, deleting, toDelete, lockWarning,
  concurrencyAlert,
  openCreate, openEdit, openDetail,
  handleFormClose, save,
  confirmDelete, doDelete, handleCancelDelete, setOnSuccess, releaseOnUnmount
} = useCrud({
  tabla:        'equipos_computo',
  apiGet:       (id) => equiposApi.get(id),
  apiGetDetail: (id) => vistasApi.getEquipos(id),
  apiCreate:    (data) => equiposApi.create(data),
  apiUpdate:    (id, data) => equiposApi.update(id, data),
  apiDelete:    (id) => equiposApi.delete(id),
  clearErrors,
  applyFieldErrors
})

const filterConfig = computed(() => ({
  search: true,
  selects: [
    {
      key: "tipo_activo_id",
      label: "Tipo de Equipo",
      options: catalogos.tipos,
      optionLabel: "nombre_tipo",
      optionValue: "nombre_tipo",
      placeholder: "Todos los tipos"
    },
    {
      key: "estado_id",
      label: "Estado",
      options: catalogos.estados,
      optionLabel: "nombre_estado",
      optionValue: "nombre_estado",
      placeholder: "Cualquier estado"
    },
    {
      key: "usuario_id",
      label: "Responsable",
      options: catalogos.usuarios,
      optionLabel: "nombre_usuario",
      optionValue: "nombre_usuario",
      placeholder: "Todos los responsables"
    }
  ]
}))


// ── populate reutilizable ────────────────────────────────────────
function populateForm(d) {
  Object.assign(form, {
    _id:                 d.id_activo,
    tipo_activo_id:      d.tipo_activo_id,
    estado_id:           d.estado_id,
    nombre_activo:       d.nombre_activo,
    usuario_asignado_id: d.usuario_asignado_id || '',
    marca:               d.marca || '',
    modelo:              d.modelo || '',
    numero_serie:        d.numero_serie || '',
    sucursal_nombre:     d.sucursal_nombre || 'Tulancingo',
    observaciones:       d.observaciones || '',
    especificaciones:    d.especificaciones || [],
    version:             d.version
  })
}

// ── useConcurrencyHandlers ───────────────────────────────────────
const {
  handleConcurrencyCancel,
  handleConcurrencyRetry,
  handleConflictReload: reloadConflict
} = useConcurrencyHandlers({
  showConcurrencyAlert,
  showConflictModal,
  concurrencyAlert,
  items: equipos,
  idKey: 'id_activo',
  openEdit:      (eq) => handleOpenEdit(eq),
  confirmDelete: (eq) => confirmDelete(eq.id_activo, eq),
  apiGet:        (id) => equiposApi.get(id),
  clearErrors,
  toast
})

// ── Wrappers específicos del módulo ──────────────────────────────
function handleOpenCreate() {
  openCreate(() => {
    Object.assign(form, {
      _id: null,
      tipo_activo_id: '', estado_id: '', nombre_activo: '',
      usuario_asignado_id: '', marca: '', modelo: '',
      numero_serie: '', sucursal_nombre: 'Tulancingo',
      observaciones: '', especificaciones: [], version: null
    })
  })
}

async function handleOpenEdit(eq) {
  await openEdit(eq.id_activo, populateForm)
}

async function handleOpenDetail(eq) {
  await openDetail(eq.id_activo)
}

async function handleSave() {
  if (!validateForm()) {
    toast.warning('Revisa los campos marcados en el formulario')
    return
  }
  await save(form._id, { ...form })
}

async function handleDoDelete() {
  await doDelete(toDelete.value.id_activo)
}

async function handleCancelDelete_() {
  await handleCancelDelete()
}

async function handleConflictReload() {
  await reloadConflict(form._id, populateForm)
}

// ── Validación ───────────────────────────────────────────────────
function applyFieldErrors(campos) {
  if (!campos) return
  Object.entries(campos).forEach(([campo, mensaje]) => {
    if (campo.startsWith('especificaciones[')) {
      const match = campo.match(/\[(\d+)\]\.(.+)/)
      if (match) {
        const idx = parseInt(match[1])
        const sub = match[2]
        if (!specErrors[idx]) specErrors[idx] = {}
        specErrors[idx][sub] = mensaje
      }
    } else {
      formErrors[campo] = mensaje
    }
  })
}

function validateForm() {
  clearErrors()
  Object.keys(specErrors).forEach(k => delete specErrors[k])
  let valid = true

  if (!form.tipo_activo_id) {
    setError('tipo_activo_id', '"Tipo de activo es obligatorio"')
    // formErrors.tipo_activo_id = '"Tipo de activo" es obligatorio'
    valid = false
  }
  if (!form.estado_id) {
    setError('estado_id', '"Estado" es obligatorio')
    valid = false
  }
  if (!form.nombre_activo?.trim()) {
    setError('nombre_activo', '"Nombre del activo" es obligatorio')
    valid = false
  }
  if (!form.marca?.trim()) {
    setError('marca', '"Marca" es obligatoria')
    valid = false
  }
  if (!form.modelo?.trim()) {
    setError('modelo', '"Modelo es obligatorio"')
    valid = false
  }
  if (!form.numero_serie?.trim()) {
    setError('numero_serie', '"Número de serie" es obligatorio')
    valid = false
  }
  if (!form.sucursal_nombre?.trim()) {
    setError('sucursal_nombre', '"Sucursal" es obligatoria')
    valid = false
  }
  form.especificaciones.forEach((spec, i) => {
    if (!spec.nombre_especificacion?.trim()) {
      if (!specErrors[i]) specErrors[i] = {}
      specErrors[i].nombre = 'El nombre es obligatorio'
      valid = false
    }
    if (!spec.valor_especificacion?.trim()) {
      if (!specErrors[i]) specErrors[i] = {}
      specErrors[i].valor = 'El valor es obligatorio'
      valid = false
    }
  })
  return valid
}




// ── Datos ────────────────────────────────────────────────────────
async function loadData() {
  loading.value = true
  try {
    let params = { page: page.value, per_page: perPage }
    if (filters.search) params.search = filters.search
    if (filters.tipo_activo_id) params.tipo_activo_id = filters.tipo_activo_id
    if (filters.estado_id) params.estado_id = filters.estado_id
    if (filters.usuario_id) params.usuario_id = filters.usuario_id

    params = applySortToParams(params)
    const res = await vistasApi.listEquipos(params)
    equipos.value = res.data.equipos
    setMeta(res.data)
  } catch {
    toast.error('Error al cargar los equipos')
  } finally {
    loading.value = false
  }
}

// ── Lifecycle ────────────────────────────────────────────────────
onBeforeUnmount(async () => {
  await releaseOnUnmount()
})
setOnSuccess(loadData)
setLoadFn(loadData)
onMounted(() => { loadCatalogos(['tiposActivo', 'estados', 'usuarios']); loadData() })
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

/* ── Spec chips ── */
.spec-quick-chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  padding: 10px 12px;
  background: var(--gray-50);
  border: 1px dashed var(--gray-300);
  border-radius: 8px;
}
.spec-chips-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gray-400);
  margin-right: 4px;
  white-space: nowrap;
}
.spec-chip-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 14px;
  border: 1.5px solid var(--gray-300);
  background: white;
  color: var(--gray-600);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.spec-chip-btn:hover:not(.used) {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light, #eef2ff);
  transform: translateY(-1px);
}
.spec-chip-btn.used {
  background: #f0fdf4;
  border-color: #86efac;
  color: #16a34a;
  cursor: default;
  opacity: 0.75;
}
.spec-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--gray-400);
  margin-bottom: 10px;
  font-style: italic;
}
.spec-nombre-wrapper { position: relative; flex: 1; }
.spec-suggestions-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1.5px solid var(--gray-200);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  z-index: 100;
  overflow: hidden;
  max-height: 220px;
  overflow-y: auto;
}
.spec-suggestion-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.1s;
}
.spec-suggestion-item:hover:not(.used) { background: var(--gray-50); }
.spec-suggestion-item.used { opacity: 0.4; cursor: default; }
.sug-nombre { font-size: 13px; font-weight: 600; color: var(--gray-800); }
.sug-ejemplo { font-size: 11px; color: var(--gray-400); }

.action-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.sorted {
  cursor: pointer;
  user-select: none;
}

.sorted:hover {
  color: var(--primary);
}
</style>