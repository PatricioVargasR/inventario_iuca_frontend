<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Accesos al sistema</h1>
        <p class="page-subtitle">Usuarios con credenciales para acceder al sistema</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo acceso
      </button>
    </div>

    <!-- Filtros Unificados -->
    <div class="filters-card">
      <div class="filters-row">
        <!-- Búsqueda -->
        <div class="filter-group search">
          <label>Búsqueda General</label>
          <div class="input-with-icon">
            <svg class="input-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="filters.search" class="form-input" placeholder="Buscar por nombre, puesto..." @input="onSearch" />
          </div>
        </div>
        <!-- Área -->
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
        <label class="filter-label">
          Módulos
        </label>
        <div class="chips-group">
          <label
            v-for="(value, key) in modulos_disponibles"
            :key="key"
            class="chip-checkbox"
          >
            <input
              type="checkbox"
              :value="key"
              v-model="filters.modulos"
              @change="onModuloChange"
            />
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
            v-for="(value, key) in permisos_disponibles"
            :key="key"
            class="chip-checkbox"
            :class="{ disabled: filters.modulos.length === 0 }"
          >
            <input
              type="checkbox"
              :value="key"
              v-model="filters.permisos"
              @change="loadData"
              :disabled="filters.modulos.length === 0"
            />
            <span class="chip-text">{{ value }}</span>
          </label>
        </div>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr><th>ID</th><th>NOMBRE</th><th>CORREO</th><th>ÁREA</th><th>ÚLTIMO ACCESO</th><th>ACCIONES</th></tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="loading-row"><td colspan="7"><span class="spinner"></span></td></tr>
          <tr v-else-if="!items.length"><td colspan="7"><div class="empty-state"><div class="empty-icon">🔑</div><p>No hay accesos registrados</p></div></td></tr>
          <tr v-else v-for="acc in items" :key="acc.id_acceso">
            <td><span style="font-family:var(--font-mono);font-size:12px;color:var(--gray-500)">ACC-{{ String(acc.id_acceso).padStart(3,'0') }}</span></td>
            <td style="font-weight:700;">{{ acc.nombre_usuario }}</td>
            <td style="color:var(--gray-500);font-size:13px;">{{ acc.correo_electronico }}</td>
            <td>{{ acc.area || '–' }}</td>
            <td style="font-size:12px;color:var(--gray-400);font-family:var(--font-mono)">{{ formatDate(acc.ultimo_acceso) }}</td>
            <td>
              <div class="actions-cell">
                <button class="action-btn view" @click="openDetail(acc)" title="Ver detalle">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="action-btn edit" @click="openEdit(acc)" title="Editar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="action-btn delete" @click="confirmDelete(acc)" title="Eliminar">
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
    <BaseModal v-model="showDetail" title="Detalles del Acceso" size="lg">
      <template v-if="selected">
        <div class="section-title" style="margin-top:0;color:var(--primary)">INFORMACIÓN PERSONAL</div>
        <div class="detail-grid">
          <div class="detail-item"><label>ID</label><strong>{{ selected.id_acceso }}</strong></div>
          <div class="detail-item"><label>Correo Electrónico</label><strong>{{ selected.correo_electronico }}</strong></div>
          <div class="detail-item"><label>Nombre Completo</label><strong>{{ selected.nombre_usuario }}</strong></div>
          <div class="detail-item"><label>Área Asignada</label><strong>{{ selected.area || '–' }}</strong></div>
        </div>
        <div class="section-title" style="color:var(--primary)">INFORMACIÓN DE ACCESO</div>
        <div class="detail-grid" style="grid-template-columns:1fr 1fr 1fr;">
          <div class="detail-item"><label>Fecha de Registro</label><strong>{{ selected.fecha_registro || '–' }}</strong></div>
          <div class="detail-item"><label>Último Acceso</label><strong style="font-family:var(--font-mono);font-size:13px">{{ selected.ultimo_acceso || '–' }}</strong></div>
          <div class="detail-item"><label>Cuenta Creada</label><strong>{{ selected.fecha_creacion?.slice(0,10) || '–' }}</strong></div>
        </div>
        <div class="section-title" style="color:var(--primary)">PERMISOS DEL ROL ASIGNADO</div>
        <div style="font-size:12.5px;color:var(--gray-500);margin-bottom:8px;">{{ selected.rol }} – Nivel {{ selected.nivel_acceso }}</div>
        <table class="permissions-table">
          <thead><tr><th>MÓDULO</th><th>LEER</th><th>CREAR</th><th>EDITAR</th><th>ELIMINAR</th></tr></thead>
          <tbody>
            <tr v-for="p in selected.permisos" :key="p.modulo">
              <td><span style="text-transform: capitalize;">{{ p.modulo }}</span></td>
<td>
                  <span
                    class="perm-icon"
                    :class="{ active: p.leer }"
                  >
                    <svg v-if="p.leer" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>

                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </span>
                </td>
                <td>
                  <span
                    class="perm-icon"
                    :class="{ active: p.crear }"
                  >
                    <svg v-if="p.crear" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>

                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </span>
                </td>
                <td>
                  <span
                    class="perm-icon"
                    :class="{ active: p.actualizar }"
                  >
                    <svg v-if="p.actualizar" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>

                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </span>
                </td>
                <td>
                  <span
                    class="perm-icon"
                    :class="{ active: p.eliminar }"
                  >
                    <svg v-if="p.eliminar" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>

                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </span>
                </td>
            </tr>
          </tbody>
        </table>
      </template>
      <template #footer>
        <button class="btn btn-primary" @click="showDetail = false">Cerrar</button>
      </template>
    </BaseModal>

    <!-- Form Modal -->
    <BaseModal v-model="showForm" :title="editMode ? 'Editar Acceso' : 'Registro de Acceso'" subtitle="Sistema de Inventario IUCA" size="lg">
      <form id="accesosForm" @submit.prevent="saveItem">
        <div class="section-title" style="margin-top:0;color:var(--primary);display:flex;align-items:center;gap:6px;">
          INFORMACIÓN PERSONAL
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Nombre Completo <span class="required">*</span></label>
            <input v-model="form.nombre_usuario" class="form-input" placeholder="Ej. Juan Pérez" required />
          </div>
          <div class="form-group"><label class="form-label">Correo Electrónico <span class="required">*</span></label><input v-model="form.correo_electronico" class="form-input" type="email" placeholder="usuario@iuca.edu.mx" required :disabled="editMode" /></div>
        </div>
        <div class="section-title" style="color:var(--primary);display:flex;align-items:center;gap:6px;">
          INFORMACIÓN DE ACCESO
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Contraseña <span v-if="!editMode" class="required">*</span></label>
            <div style="position:relative;">
              <input v-model="form.password" :type="showPass ? 'text' : 'password'" class="form-input" placeholder="••••••••" :required="!editMode" style="padding-right:38px;" maxlength="10" minlength="10"/>
              <button type="button" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--gray-400);" @click="showPass=!showPass">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Confirmar Contraseña <span v-if="!editMode"  class="required">*</span></label>
            <input v-model="form.confirm_password" :type="showPass ? 'text' : 'password'" class="form-input" placeholder="••••••••" :required="!editMode" maxlength="10" minlength="10" />
          </div>
          <div class="form-group">
            <label class="form-label">Área Asignada <span class="required">*</span></label>
            <select v-model="form.area_id" class="form-select" style="max-width:260px;" required>
              <option value="">Seleccionar área</option>
              <option v-for="a in catalogos.areas" :key="a.id_area" :value="a.id_area">{{ a.nombre_area }}</option>
            </select>
          </div>
        </div>
        <div style="margin-top:4px;">
        <div class="section-title" style="color:var(--primary); margin-top: 20px;">PERMISOS DEL ROL ASIGNADO</div>
          <table class="permissions-table">
            <thead><tr><th>MÓDULO</th><th>LEER</th><th>CREAR</th><th>EDITAR</th><th>ELIMINAR</th></tr></thead>
            <tbody>
              <tr v-for="p in form.permisos" :key="p.modulo">
                <td>{{ p.modulo }}</td>
                <td>
                  <span
                    class="perm-icon"
                    :class="{ active: p.puede_leer }"
                    @click="p.puede_leer = !p.puede_leer"
                  >
                    <svg v-if="p.puede_leer" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>

                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </span>
                </td>
                <td>
                  <span
                    class="perm-icon"
                    :class="{ active: p.puede_crear }"
                    @click="p.puede_crear = !p.puede_crear"
                  >
                    <svg v-if="p.puede_crear" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>

                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </span>
                </td>
                <td>
                  <span
                    class="perm-icon"
                    :class="{ active: p.puede_actualizar }"
                    @click="p.puede_actualizar = !p.puede_actualizar"
                  >
                    <svg v-if="p.puede_actualizar" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>

                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </span>
                </td>
                <td>
                  <span
                    class="perm-icon"
                    :class="{ active: p.puede_eliminar }"
                    @click="p.puede_eliminar = !p.puede_eliminar"
                  >
                    <svg v-if="p.puede_eliminar" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>

                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </form>
      <template #footer>
        <button class="btn btn-secondary" @click="showForm = false">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Cancelar
        </button>
        <button class="btn btn-primary" form="accesosForm" type="submit" :disabled="saving">
          <span v-if="saving" class="spinner" style="width:14px;height:14px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:white;"></span>
          <span v-else>{{ editMode ? 'Actualizar Usuario' : 'Registrar Usuario' }}</span>
        </button>
      </template>
    </BaseModal>

    <ConfirmDialog v-model="showConfirm" title="Eliminar Acceso" :message="`¿Estás seguro de eliminar el acceso '${toDelete?.nombre_usuario}'? Esta acción no se puede deshacer.`" :loading="deleting" @confirm="doDelete" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { usuariosApi, catalogosApi } from '@/services/api'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import Pagination from '@/components/ui/Pagination.vue'
import { vistasApi } from '../services/api'

const items = ref([])
const loading = ref(false)
const page = ref(1)
const total = ref(0)
const totalPages = ref(1)
const filters = reactive({
  search: '',
  modulos: [],  // Cambio: ahora es un array
  permisos: [],
  area_id: ''
})
const catalogos = reactive({ areas: [] })
const showDetail = ref(false)
const showForm = ref(false)
const showConfirm = ref(false)
const selected = ref(null)
const toDelete = ref(null)
const editMode = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showPass = ref(false)

const modulos_disponibles = {
  'computo': 'Cómputo',
  'mobiliario': 'Mobiliario',
  'responsable': 'Responsable',
  'catalogos': 'Catálogos',
  'historial': 'Historial',
  'acceso': 'Acceso'
}

const permisos_disponibles = {
  'puede_leer': 'Leer',
  'puede_crear': 'Crear',
  'puede_actualizar': 'Actualizar',
  'puede_eliminar': 'Eliminar'
}

const defaultPermisos = [
  { modulo: 'computo', puede_leer: false, puede_crear: false, puede_actualizar: false, puede_eliminar: false },
  { modulo: 'mobiliario', puede_leer: false, puede_crear: false, puede_actualizar: false, puede_eliminar: false },
  { modulo: 'responsable', puede_leer: false, puede_crear: false, puede_actualizar: false, puede_eliminar: false },
  { modulo: 'catalogos', puede_leer: false, puede_crear: false, puede_actualizar: false, puede_eliminar: false },
  { modulo: 'historial', puede_leer: false, puede_crear: false, puede_actualizar: false, puede_eliminar: false },
  { modulo: 'acceso', puede_leer: false, puede_crear: false, puede_actualizar: false, puede_eliminar: false }
]
const form = reactive({
  nombre_usuario: '',
  correo_electronico: '',
  password: '',
  confirm_password: '',
  area_id: '',
  permisos: JSON.parse(JSON.stringify(defaultPermisos)) 
})

let searchTimeout = null

function formatDate(d) {
  if (!d) return '–'
  const dt = new Date(d)
  return dt.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + dt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

async function loadCatalogos() {
  const areas = await catalogosApi.getAreas()
  catalogos.areas = areas.data
}

async function loadData() {
  loading.value = true
  try {
    const params = { page: page.value, per_page: 20 }

    if (filters.search) params.search = filters.search
    if (filters.area_id) params.area_id = filters.area_id

    const permisosObj = Object.fromEntries(
      filters.modulos.map(m => [m, filters.permisos])
    )

    params.permisos = JSON.stringify(permisosObj)


    const res = await vistasApi.listAccesos(params)
    items.value = res.data.accesos
    total.value = res.data.total
    totalPages.value = res.data.pages
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function onSearch() { 
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(loadData, 400) 
}

function onPageChange(p) { 
  page.value = p
  loadData() 
}

async function openDetail(acc) {
  try {
    const res = await vistasApi.getAcceso(acc.id_acceso)
    selected.value = res.data
  } catch { 
    selected.value = acc 
  }
  showDetail.value = true
}

function openCreate() {
  editMode.value = false
  Object.assign(form, { 
    nombre_usuario: '', 
    correo_electronico: '', 
    password: '', 
    confirm_password: '', 
    area_id: '', 
    permisos: JSON.parse(JSON.stringify(defaultPermisos))
  })
  showForm.value = true
}

async function openEdit(acc) {
  editMode.value = true
  const res = await usuariosApi.getAcceso(acc.id_acceso)
  const d = res.data
  Object.assign(form, { 
    nombre_usuario: d.nombre_usuario, 
    correo_electronico: d.correo_electronico, 
    area_id: d.area_id || '', 
    password: '', 
    confirm_password: '', 
    permisos: d.permisos 
  })
  form._id = acc.id_acceso
  showForm.value = true
}

async function saveItem() {
  if (form.password && form.password !== form.confirm_password) {
    alert('Las contraseñas no coinciden')
    return
  }
  saving.value = true
  try {
    const payload = {
      nombre_usuario: form.nombre_usuario,
      correo_electronico: form.correo_electronico,
      area_id: form.area_id,
      permisos: form.permisos
    }
    if (form.password) payload.password = form.password

    if (editMode.value) {
      await usuariosApi.updateAcceso(form._id, payload)
    } else {
      await usuariosApi.createAcceso(payload)
    }

    showForm.value = false
    loadData()
  } catch (e) {
    alert(e.response?.data?.error || 'Error al guardar') 
  } finally {
    saving.value = false
  }
}

function confirmDelete(acc) { 
  toDelete.value = acc
  showConfirm.value = true 
}

async function doDelete() {
  deleting.value = true
  try { 
    await usuariosApi.deleteAcceso(toDelete.value.id_acceso)
    showConfirm.value = false
    toDelete.value = null
    loadData() 
  } catch (e) { 
    alert(e.response?.data?.error || 'Error') 
  } finally { 
    deleting.value = false 
  }
}

function clearFilters() {
  filters.search = ''
  filters.area_id = ''
  filters.modulos = []
  filters.permisos = []
  loadData()
}

function onModuloChange() {
  // Si no hay módulos seleccionados, limpiar permisos
  if (filters.modulos.length === 0) {
    filters.permisos = []
  }
  loadData()
}

function formatModuloNombre(modulo) {
  const nombres = {
    'computo': 'Cómputo',
    'mobiliario': 'Mobiliario',
    'responsable': 'Responsables',
    'catalogos': 'Catálogos',
    'historial': 'Historial',
    'acceso': 'Accesos'
  }
  return nombres[modulo] || modulo
}

onMounted(() => { 
  loadCatalogos()
  loadData() 
})
</script>

<style>
/* ===== FILTROS UNIFICADOS - DISEÑO INTEGRADO ===== */
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

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-item.search-filter {
  flex: 1;
  min-width: 240px;
}

.filter-item.clear-action {
  justify-content: flex-end;
  padding-bottom: 2px;
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

.form-input.compact,
.form-select.compact {
  padding: 8px 12px;
  font-size: 13px;
  border-radius: 8px;
  border: 1.5px solid var(--gray-200);
  transition: all 0.2s ease;
}

.form-input.compact:focus,
.form-select.compact:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.input-with-icon {
  position: relative;
}

.input-with-icon .input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
  pointer-events: none;
}

.input-with-icon .form-input {
  padding-left: 36px;
}

.btn-clear-compact {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: white;
  border: 1.5px solid var(--gray-300);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-600);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-clear-compact:hover {
  background: var(--gray-50);
  border-color: var(--danger);
  color: var(--danger);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.1);
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

.filter-chips-section:last-child {
  margin-bottom: 0;
}

.filter-chips-section.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.chips-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip-checkbox {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  position: relative;
}

.chip-checkbox input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

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
  box-shadow: 0 2px 6px rgba(79, 70, 229, 0.25);
}

.chip-checkbox.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.chip-checkbox.disabled .chip-text {
  background: var(--gray-50);
  color: var(--gray-400);
}

/* Responsive */
@media (max-width: 768px) {
  .filters-card {
    padding: 16px;
  }

  .filters-row {
    gap: 12px;
  }

  .filter-item.search-filter {
    min-width: 100%;
  }

  .chip-text {
    padding: 5px 12px;
    font-size: 12px;
  }

  .filter-label {
    font-size: 11px;
  }
}

/* ===== PERMISOS GRID EN TABLA ===== */
.permisos-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 280px;
}

.permiso-modulo-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.modulo-nombre {
  font-size: 11px;
  font-weight: 700;
  color: var(--gray-600);
  min-width: 75px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.permisos-badges {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.permiso-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.02em;
  transition: all 0.15s ease;
}

.permiso-badge svg {
  flex-shrink: 0;
}

.permiso-crear {
  background: #dcfce7;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.permiso-leer {
  background: #dbeafe;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}

.permiso-actualizar {
  background: #fef3c7;
  color: #d97706;
  border: 1px solid #fde68a;
}

.permiso-eliminar {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.permiso-ninguno {
  background: var(--gray-100);
  color: var(--gray-400);
  border: 1px solid var(--gray-200);
  font-style: italic;
  font-weight: 500;
}

/* Hover effects */
.permiso-crear:hover {
  background: #bbf7d0;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(22, 163, 74, 0.15);
}

.permiso-leer:hover {
  background: #bfdbfe;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.15);
}

.permiso-actualizar:hover {
  background: #fde68a;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(217, 119, 6, 0.15);
}

.permiso-eliminar:hover {
  background: #fecaca;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.15);
}

/* Responsive - para pantallas pequeñas */
@media (max-width: 1400px) {
  .permisos-grid {
    max-width: 240px;
  }
  .modulo-nombre {
    min-width: 65px;
    font-size: 10px;
  }
  .permiso-badge {
    font-size: 9px;
    padding: 2px 5px;
  }
  .permiso-badge svg {
    width: 8px;
    height: 8px;
  }
}

@media (max-width: 768px) {
  .advanced-filters {
    padding: 16px;
  }
  
  .checkbox-group {
    gap: 8px;
  }
  
  .checkbox-label {
    padding: 6px 10px;
    font-size: 12px;
  }
  
  .filter-section-header {
    font-size: 12px;
  }
}
</style>