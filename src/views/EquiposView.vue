<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Equipos de Cómputo</h1>
        <p class="page-subtitle">Gestión del inventario de equipos</p>
      </div>
      <button v-if="authStore.canDo('computo', 'puede_crear')" class="btn btn-primary" @click="openCreate">
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
            <th>ID</th><th>Tipo</th><th>Nombre</th><th>Marca</th>
            <th>Modelo</th><th>NO. Serie</th><th>Estado</th>
            <th>Responsable</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="loading-row"><td colspan="9"><span class="spinner"></span></td></tr>
          <tr v-else-if="!equipos.length">
            <td colspan="9"><div class="empty-state"><div class="empty-icon">💻</div><p>No se encontraron equipos</p></div></td>
          </tr>
          <tr v-else v-for="eq in equipos" :key="eq.id_activo">
            <td><span style="font-family:var(--font-mono);font-size:12px;color:var(--gray-500)">{{ eq.id_activo }}</span></td>
            <td>{{ eq.tipo_activo }}</td>
            <td style="font-weight:700;color:var(--gray-800)">
              {{ eq.nombre_activo }}
              <!-- Indicador de edición activa -->
              <span v-if="eq.editado_por && eq.editado_por !== currentUserId" class="editing-badge" :title="`${eq.nombre_editor} está editando`">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              </span>
            </td>
            <td>{{ eq.marca || '–' }}</td>
            <td>{{ eq.modelo || '–' }}</td>
            <td><span style="font-family:var(--font-mono);font-size:12px">{{ eq.numero_serie || '–' }}</span></td>
            <td><StatusBadge :estado="eq.estado" :color="eq.color_estado" /></td>
            <td>{{ eq.responsable || '–' }} </td>
            <td>
              <div class="actions-cell">
                <button class="action-btn view" @click="openDetail(eq)" title="Ver detalle">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button
                  v-if="authStore.canDo('computo', 'puede_actualizar')"
                  class="action-btn edit"
                  @click="openEdit(eq)"
                  title="Editar"
                  :disabled="eq.editado_por && eq.editado_por !== currentUserId"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button v-if="authStore.canDo('computo', 'puede_eliminar')" class="action-btn delete" @click="confirmDelete(eq)" title="Eliminar">
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
    <BaseModal v-model="showForm" :title="editMode ? 'Actualizar Equipo' : 'Nuevo Equipo'" size="lg" @update:model-value="handleFormClose">
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

      <form id="equipoForm" @submit.prevent="saveEquipo">
        <div class="section-title" style="display:flex;align-items:center;gap:6px;">
          Información General
        </div>
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

        <div class="section-title" style="display:flex;align-items:center;gap:6px;">
          Detalles
        </div>
        <div class="form-grid">
          <div class="form-group"><label class="form-label">Marca <span class="required">*</span></label><input v-model="form.marca" class="form-input" placeholder="Ej: Lenovo" required/></div>
          <div class="form-group"><label class="form-label">Modelo <span class="required">*</span></label><input v-model="form.modelo" class="form-input" placeholder="Ej: ThinkPad X1" required /></div>
          <div class="form-group"><label class="form-label">Número de Serie <span class="required">*</span></label><input v-model="form.numero_serie" class="form-input" placeholder="Ej: ABC123XYZ456" required /></div>
          <div class="form-group"><label class="form-label">Sucursal <span class="required">*</span></label><input v-model="form.sucursal_nombre" class="form-input" required /></div>
          <div class="form-group span-full">
            <label class="form-label">Observaciones</label>
            <textarea v-model="form.observaciones" class="form-textarea" placeholder="Escriba cualquier observación relevante aquí..." maxlength="200"></textarea>
            <small style="color:var(--gray-400);font-size:11px;">{{ form.observaciones.length }} / 200 — Campo opcional para detalles</small>
          </div>
        </div>

        <div class="section-title" style="display:flex;align-items:center;justify-content:space-between;">
          Especificaciones
          <button type="button" class="btn btn-secondary btn-sm" @click="addSpec">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Agregar
          </button>
        </div>

        <!-- Chips de acceso rápido cuando no hay tipo seleccionado o hay sugerencias disponibles -->
        <div v-if="form.tipo_activo_id && specSuggestions.length" class="spec-quick-chips">
          <span class="spec-chips-label">Agregar rápido:</span>
          <button
            v-for="sug in specSuggestions"
            :key="sug.nombre"
            type="button"
            class="spec-chip-btn"
            :class="{ used: form.especificaciones.some(s => s.nombre_especificacion === sug.nombre) }"
            @click="!form.especificaciones.some(s => s.nombre_especificacion === sug.nombre) && (form.especificaciones.push({ nombre_especificacion: sug.nombre, valor_especificacion: '', _placeholder: sug.placeholder }))"
            :title="form.especificaciones.some(s => s.nombre_especificacion === sug.nombre) ? 'Ya agregado' : `Agregar: ${sug.nombre}`"
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
          <!-- Campo nombre con dropdown de sugerencias -->
          <div class="spec-nombre-wrapper">
            <input
              v-model="spec.nombre_especificacion"
              class="form-input"
              placeholder="RAM, Procesador..."
              @focus="openSuggestions(i)"
              @input="openSuggestions(i)"
              @blur="closeSuggestions"
            />
            <!-- Dropdown -->
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

          <!-- Campo valor con placeholder dinámico -->
          <input
            v-model="spec.valor_especificacion"
            class="form-input spec-value-input"
            :placeholder="spec._placeholder || 'Valor...'"
          />

          <button type="button" class="spec-delete" @click="removeSpec(i)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </form>
      <template #footer>
        <button class="btn btn-secondary" @click="handleFormClose">Cancelar</button>
        <button class="btn btn-primary" form="equipoForm" type="submit" :disabled="saving">
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
          <p>Mientras editabas, otro usuario guardó cambios en este equipo. Puedes:</p>
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
import { ref, reactive, onMounted, computed, onBeforeUnmount, nextTick } from 'vue'
import { equiposApi, catalogosApi, usuariosApi, vistasApi } from '@/services/api'
import { acquireLock, releaseLock } from '@/services/concurrency'
import { useAuthStore } from '@/stores/auth'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import ConcurrencyAlert from '@/components/ui/ConcurrencyAlert.vue'
import Pagination from '@/components/ui/Pagination.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const authStore = useAuthStore()
const currentUserId = computed(() => authStore.user?.id_acceso)

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
const showConcurrencyAlert = ref(false)
const showConflictModal = ref(false)

const selected = ref(null)
const toDelete = ref(null)
const editMode = ref(false)
const saving = ref(false)
const deleting = ref(false)
const pendingDelete = ref(null) // Para manejar bloqueo de eliminación

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
  tipo_activo_id: '', estado_id: '', nombre_activo: '',
  usuario_asignado_id: '', marca: '', modelo: '',
  numero_serie: '', sucursal_nombre: 'Tulancingo',
  observaciones: '', especificaciones: [],
  version: null // NUEVO: Para control de versiones
})

// Mapa de especificaciones sugeridas por tipo de equipo
// La clave es el nombre_tipo tal como viene del catálogo (lowercase para comparar)
const SPECS_MAP = {
  'pc': [
    { nombre: 'Procesador',       placeholder: 'Ej: Intel Core i7-12700, 3.6GHz' },
    { nombre: 'Núcleos',          placeholder: 'Ej: 8' },
    { nombre: 'Memoria RAM',      placeholder: 'Ej: 16 GB' },
    { nombre: 'Disco Duro (HDD)', placeholder: 'Ej: 1 TB' },
    { nombre: 'SSD',              placeholder: 'Ej: 500 GB' },
    { nombre: 'Tarjeta de Video', placeholder: 'Ej: NVIDIA Quadro P1000' },
    { nombre: 'VRAM',             placeholder: 'Ej: 4 GB' },
    { nombre: 'Sistema Operativo',placeholder: 'Ej: Windows 10 Pro 64 bits' },
  ],
  'laptop': [
    { nombre: 'Procesador',       placeholder: 'Ej: Intel Core i7-4810MQ, 2.7GHz' },
    { nombre: 'Memoria RAM',      placeholder: 'Ej: 32 GB' },
    { nombre: 'SSD',              placeholder: 'Ej: 446 GB' },
    { nombre: 'Disco Duro (HDD)', placeholder: 'Ej: 500 GB' },
    { nombre: 'Tarjeta de Video', placeholder: 'Ej: NVIDIA Quadro K2100M' },
    { nombre: 'Sistema Operativo',placeholder: 'Ej: Windows 10 Enterprise 64 bits' },
    { nombre: 'Pantalla',         placeholder: 'Ej: 15.6" FHD' },
  ],
  'monitor': [
    { nombre: 'Tamaño',           placeholder: 'Ej: 24"' },
    { nombre: 'Resolución',       placeholder: 'Ej: 1920x1080' },
    { nombre: 'Panel',            placeholder: 'Ej: IPS, TN, VA' },
    { nombre: 'Frecuencia',       placeholder: 'Ej: 144 Hz' },
    { nombre: 'Tipo de conexión', placeholder: 'Ej: HDMI, DisplayPort' },
  ],
  'impresora': [
    { nombre: 'Tipo',             placeholder: 'Ej: Láser, Inyección de tinta' },
    { nombre: 'Tecnología',       placeholder: 'Ej: Monocromática, Color' },
    { nombre: 'Conectividad',     placeholder: 'Ej: USB, WiFi, Red' },
    { nombre: 'Velocidad',        placeholder: 'Ej: 30 ppm' },
  ],
  'teléfono': [
    { nombre: 'Memoria RAM',      placeholder: 'Ej: 3 GB' },
    { nombre: 'Almacenamiento',   placeholder: 'Ej: 64 GB' },
    { nombre: 'Sistema Operativo',placeholder: 'Ej: Android 11' },
    { nombre: 'IMEI',             placeholder: 'Ej: 867166067556000' },
  ],
  'default': [
    { nombre: 'Procesador',       placeholder: 'Ej: Intel Core i7' },
    { nombre: 'Memoria RAM',      placeholder: 'Ej: 16 GB' },
    { nombre: 'Almacenamiento',   placeholder: 'Ej: 500 GB' },
    { nombre: 'Sistema Operativo',placeholder: 'Ej: Windows 10' },
  ]
}

// Devuelve la lista de sugerencias según el tipo de activo seleccionado en el form
const specSuggestions = computed(() => {
  const tipo = catalogos.tipos.find(t => t.id_tipo_activo === form.tipo_activo_id)
  if (!tipo) return SPECS_MAP['default']
  const key = tipo.nombre_tipo.toLowerCase()
  // Buscar coincidencia parcial en las claves del mapa
  const match = Object.keys(SPECS_MAP).find(k => key.includes(k))
  return SPECS_MAP[match] || SPECS_MAP['default']
})

// Estado del dropdown de sugerencias
const activeSuggestionIndex = ref(null) // índice de la fila de spec que tiene el dropdown abierto
const suggestionFilter = ref('')        // texto del input para filtrar sugerencias

function openSuggestions(i) {
  activeSuggestionIndex.value = i
  suggestionFilter.value = form.especificaciones[i].nombre_especificacion
}

function closeSuggestions() {
  // Pequeño delay para que el click en la sugerencia alcance a dispararse
  setTimeout(() => { activeSuggestionIndex.value = null }, 150)
}

function applySuggestion(i, sugerencia) {
  form.especificaciones[i].nombre_especificacion = sugerencia.nombre
  form.especificaciones[i]._placeholder = sugerencia.placeholder
  activeSuggestionIndex.value = null
  // Enfocar el campo de valor para que el usuario pueda escribir de inmediato
  nextTick(() => {
    const inputs = document.querySelectorAll(`.spec-row-${i} .spec-value-input`)
    if (inputs[0]) inputs[0].focus()
  })
}

// Sugerencias filtradas por lo que el usuario ya escribió
function filteredSuggestions(i) {
  const texto = (form.especificaciones[i].nombre_especificacion || '').toLowerCase()
  return specSuggestions.value.filter(s =>
    s.nombre.toLowerCase().includes(texto)
  )
}

let searchTimeout = null

async function loadCatalogos() {
  const [tipos, estados, usuarios] = await Promise.all([
    catalogosApi.getTiposActivoCompleto(),
    catalogosApi.getEstadosCompleto(),
    usuariosApi.listResponsables()
  ])
  catalogos.tipos = tipos.data
  catalogos.estados = estados.data
  catalogos.usuarios = usuarios.data
}

async function loadData() {
  loading.value = true
  try {
    const params = { page: page.value, per_page: 5 }
    if (filters.search) params.search = filters.search
    if (filters.tipo_activo_id) params.tipo_activo_id = filters.tipo_activo_id
    if (filters.estado_id) params.estado_id = filters.estado_id
    if (filters.usuario_id) params.usuario_id = filters.usuario_id
    const res = await vistasApi.listEquipos(params)
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
  const res = await vistasApi.getEquipos(eq.id_activo)
  selected.value = res.data
  showDetail.value = true
}

function openCreate() {
  editMode.value = false
  lockWarning.value = null
  Object.assign(form, {
    tipo_activo_id: '', estado_id: '', nombre_activo: '',
    usuario_asignado_id: '', marca: '', modelo: '',
    numero_serie: '', sucursal_nombre: 'Tulancingo',
    observaciones: '', especificaciones: [],
    version: null
  })
  showForm.value = true
}

async function openEdit(eq) {
  editMode.value = true
  lockWarning.value = null

  // Intentar adquirir bloqueo de edición
  const lockResult = await acquireLock('equipos_computo', eq.id_activo, 10, 'edicion')

  if (!lockResult.success) {
    // Mostrar alerta si está bloqueado
    if (lockResult.locked) {
      const tipoAccion = lockResult.lockInfo.tipo_bloqueo === 'edicion' ? 'editando' : 'eliminando'
      concurrencyAlert.title = 'Registro en Uso'
      concurrencyAlert.message = `${lockResult.lockInfo.nombre_usuario} está ${tipoAccion} este equipo`
      concurrencyAlert.lockInfo = lockResult.lockInfo
      concurrencyAlert.showRetry = true
      showConcurrencyAlert.value = true
    } else {
      alert(lockResult.error || 'Error al adquirir bloqueo')
    }
    return
  }

  // Bloqueo adquirido exitosamente
  currentLock.value = lockResult.bloqueo

  // Cargar datos del equipo
  const res = await equiposApi.get(eq.id_activo)
  const d = res.data

  // Verificar si alguien más estaba editando antes
  if (d.editado_por && d.editado_por !== currentUserId.value) {
    lockWarning.value = `${d.nombre_editor} estaba editando este registro`
  }

  // Llenar formulario
  Object.assign(form, {
    tipo_activo_id: d.tipo_activo_id,
    estado_id: d.estado_id,
    nombre_activo: d.nombre_activo,
    usuario_asignado_id: d.usuario_asignado_id || '',
    marca: d.marca || '',
    modelo: d.modelo || '',
    numero_serie: d.numero_serie || '',
    sucursal_nombre: d.sucursal_nombre || 'Tulancingo',
    observaciones: d.observaciones || '',
    especificaciones: d.especificaciones || [],
    version: d.version
  })
  form._id = d.id_activo
  showForm.value = true
}

function addSpec() { form.especificaciones.push({ nombre_especificacion: '', valor_especificacion: '' }) }
function removeSpec(i) { form.especificaciones.splice(i, 1) }

async function saveEquipo() {
  saving.value = true
  try {
    const payload = {
      ...form,
      version: form.version // Enviar versión para validación
    }

    if (editMode.value) {
      await equiposApi.update(form._id, payload)
    } else {
      await equiposApi.create(payload)
    }

    await handleFormClose(true)
    loadData()
  } catch (e) {
    const errorData = e.response?.data

    // Conflicto de versión
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
  // Liberar bloqueo si existe
  if (currentLock.value && editMode.value) {
    await releaseLock('equipos_computo', form._id)
    currentLock.value = null
  }

  lockWarning.value = null

  if (shouldClose) {
    showForm.value = false
  }
}

async function confirmDelete(eq) {
  //
  const lockResult = await acquireLock('equipos_computo', eq.id_activo, 0.5, 'eliminacion')

  if (!lockResult.success) {
    if (lockResult.locked) {

      const tipoAccion = lockResult.lockInfo.tipo_bloqueo === 'edicion' ? 'editando' : 'eliminando'

      concurrencyAlert.title = 'No se puede eliminar'
      concurrencyAlert.message = `${lockResult.lockInfo.nombre_usuario} está ${tipoAccion} este equipo`
      concurrencyAlert.lockInfo = lockResult.lockInfo
      concurrencyAlert.showRetry = true
      showConcurrencyAlert.value = true
    } else {
      alert(lockResult.error || 'Error al adquirir bloqueo')
    }
    return
  }

  pendingDelete.value = lockResult.bloqueo
  toDelete.value = eq
  showConfirm.value = true
}

async function doDelete() {
  deleting.value = true
  try {
    // El bloqueo ya fue adquirido en confirmDelete
    await equiposApi.delete(toDelete.value.id_activo)

    // Liberar bloqueo después de eliminar
    if (pendingDelete.value) {
      await releaseLock('equipos_computo', toDelete.value.id_activo)
      pendingDelete.value = null
    }

    showConfirm.value = false
    toDelete.value = null
    loadData()
  } catch (e) {
    // Liberar bloqueo en caso de error
    if (pendingDelete.value) {
      await releaseLock('equipos_computo', toDelete.value.id_activo)
      pendingDelete.value = null
    }
    alert(e.response?.data?.error || 'Error al eliminar')
  } finally {
    deleting.value = false
  }
}

// Handlers de concurrencia
function handleConcurrencyCancel() {
  showConcurrencyAlert.value = false
}

async function handleConcurrencyRetry() {
  showConcurrencyAlert.value = false

  // Esperar un momento y reintentar
  setTimeout(() => {
    const registroId = concurrencyAlert.lockInfo?.registro_id
    const eq = equipos.value.find(e => e.id_activo === registroId)

    if (eq) {
      // Si el alerta venía de un intento de eliminación
      if (concurrencyAlert.title === 'No se puede eliminar') {
        confirmDelete(eq)
      } else {
        // Si venía de edición
        openEdit(eq)
      }
    }
  }, 1000)
}

// Handlers de conflicto
async function handleConflictReload() {
  // Recargar datos actuales
  const res = await equiposApi.get(form._id)
  const d = res.data

  Object.assign(form, {
    tipo_activo_id: d.tipo_activo_id, estado_id: d.estado_id,
    nombre_activo: d.nombre_activo, usuario_asignado_id: d.usuario_asignado_id || '',
    marca: d.marca || '', modelo: d.modelo || '', numero_serie: d.numero_serie || '',
    sucursal_nombre: d.sucursal_nombre || 'Tulancingo', observaciones: d.observaciones || '',
    especificaciones: d.especificaciones || [],
    version: d.version // Actualizar versión
  })

  showConflictModal.value = false
  alert('Datos recargados. Por favor verifica los cambios antes de guardar.')
}

// Limpiar bloqueos al salir
onBeforeUnmount(async () => {
  if (currentLock.value && form._id) {
    await releaseLock('equipos_computo', form._id)
  }
})

async function handleCancelDelete() {
  if (pendingDelete.value && toDelete.value) {
    await releaseLock('equipos_computo', toDelete.value.id_activo)
    pendingDelete.value = null
  }
  toDelete.value = null
  showConfirm.value = false
}

onMounted(() => { loadCatalogos(); loadData() })
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
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

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

.lock-warning svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.lock-warning strong {
  display: block;
  font-size: 13px;
  margin-bottom: 2px;
}

.lock-warning span {
  font-size: 12px;
}

.conflict-warning {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #fef3c7;
  border-radius: 12px;
  margin-bottom: 20px;
}

.conflict-warning svg {
  color: #d97706;
  flex-shrink: 0;
}

.conflict-warning h4 {
  font-size: 16px;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 6px;
}

.conflict-warning p {
  font-size: 13px;
  color: var(--gray-600);
  margin: 0;
}

.conflict-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.conflict-option {
  padding: 14px;
  background: var(--gray-50);
  border-radius: 8px;
  border: 1px solid var(--gray-200);
}

.conflict-option strong {
  display: block;
  font-size: 14px;
  color: var(--gray-900);
  margin-bottom: 4px;
}

.conflict-option p {
  font-size: 12px;
  color: var(--gray-600);
  margin: 0;
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Chips de acceso rápido */
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

/* Hint sin tipo seleccionado */
.spec-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--gray-400);
  margin-bottom: 10px;
  font-style: italic;
}

/* Wrapper con posición relativa para el dropdown */
.spec-nombre-wrapper {
  position: relative;
  flex: 1;
}

/* Dropdown de sugerencias */
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

.spec-suggestion-item:hover:not(.used) {
  background: var(--gray-50);
}

.spec-suggestion-item.used {
  opacity: 0.4;
  cursor: default;
}

.sug-nombre {
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-800);
}

.sug-ejemplo {
  font-size: 11px;
  color: var(--gray-400);
}
</style>