<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Accesos al Sistema</h1>
        <p class="page-subtitle">Usuarios con credenciales para acceder al sistema</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo Acceso
      </button>
    </div>

    <div class="filter-bar">
      <div class="filter-group search">
        <label>Búsqueda General</label>
        <div class="input-with-icon">
          <svg class="input-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="filters.search" class="form-input" placeholder="Buscar por nombre, correo..." @input="onSearch" />
        </div>
      </div>
      <div class="filter-group">
        <label>Tipo de permisos</label>
        <select v-model="filters.rol_id" class="form-select" @change="loadData">
          <option value="">Todos los tipos</option>
          <option v-for="r in catalogos.roles" :key="r.id_rol" :value="r.id_rol">{{ r.nombre_rol }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Áreas</label>
        <select v-model="filters.area_id" class="form-select" @change="loadData">
          <option value="">Todas las áreas</option>
          <option v-for="a in catalogos.areas" :key="a.id_area" :value="a.id_area">{{ a.nombre_area }}</option>
        </select>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr><th>ID</th><th>NOMBRE ↕</th><th>CORREO</th><th>PERMISOS</th><th>ÁREA</th><th>ÚLTIMO ACCESO</th><th>ACCIONES</th></tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="loading-row"><td colspan="7"><span class="spinner"></span></td></tr>
          <tr v-else-if="!items.length"><td colspan="7"><div class="empty-state"><div class="empty-icon">🔑</div><p>No hay accesos registrados</p></div></td></tr>
          <tr v-else v-for="acc in items" :key="acc.id_acceso">
            <td><span style="font-family:var(--font-mono);font-size:12px;color:var(--gray-500)">ACC-{{ String(acc.id_acceso).padStart(3,'0') }}</span></td>
            <td style="font-weight:700;">{{ acc.nombre_usuario }}</td>
            <td style="color:var(--gray-500);font-size:13px;">{{ acc.correo_electronico }}</td>
            <td>
              <span class="badge badge-primary" style="font-size:11.5px;">{{ acc.rol || 'Sin rol' }}</span>
            </td>
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

    <div class="info-banner">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
      <div><strong>Información del Sistema</strong>Utilice los filtros superiores para refinar su búsqueda por categorías específicas. El sistema actualiza automáticamente la vista de auditoría para el responsable asignado.</div>
    </div>

    <!-- Detail Modal -->
    <BaseModal v-model="showDetail" title="Detalles del Acceso" size="lg">
      <template v-if="selected">
        <div class="section-title" style="margin-top:0;color:var(--primary)">INFORMACIÓN PERSONAL</div>
        <div class="detail-grid">
          <div class="detail-item"><label>ID</label><strong>{{ selected.id_acceso }}</strong></div>
          <div class="detail-item"><label>Correo Electrónico</label><strong>{{ selected.correo_electronico }}</strong></div>
          <div class="detail-item"><label>Nombre Completo</label><strong>{{ selected.nombre_usuario }}</strong></div>
          <div class="detail-item"><label>Número de Nómina</label><strong>{{ selected.numero_nomina || '–' }}</strong></div>
          <div class="detail-item"><label>Área Asignada</label><strong>{{ selected.area || '–' }}</strong></div>
          <div class="detail-item"><label>Puesto</label><strong>{{ selected.puesto || '–' }}</strong></div>
        </div>
        <div class="section-title" style="color:var(--primary)">INFORMACIÓN DE ACCESO</div>
        <div class="detail-grid" style="grid-template-columns:1fr 1fr 1fr;">
          <div class="detail-item"><label>Fecha de Registro</label><strong>{{ selected.fecha_registro || '–' }}</strong></div>
          <div class="detail-item"><label>Último Acceso</label><strong style="font-family:var(--font-mono);font-size:13px">{{ selected.ultimo_acceso || '–' }}</strong></div>
          <div class="detail-item"><label>Cuenta Creada</label><strong>{{ selected.fecha_creacion?.slice(0,10) || '–' }}</strong></div>
        </div>
        <div class="section-title">Permisos del Rol</div>
        <div style="font-size:12.5px;color:var(--gray-500);margin-bottom:8px;">{{ selected.rol }} – Nivel {{ selected.nivel_acceso }}</div>
        <table class="permissions-table">
          <thead><tr><th>MÓDULO</th><th>LEER</th><th>CREAR</th><th>EDITAR</th><th>ELIMINAR</th><th>EXPORTAR</th></tr></thead>
          <tbody>
            <tr v-for="p in selected.permisos" :key="p.modulo">
              <td>{{ p.modulo }}</td>
              <td><span :class="p.puede_leer ? 'perm-check' : 'perm-cross'">{{ p.puede_leer ? '✓' : '✕' }}</span></td>
              <td><span :class="p.puede_crear ? 'perm-check' : 'perm-cross'">{{ p.puede_crear ? '✓' : '✕' }}</span></td>
              <td><span :class="p.puede_actualizar ? 'perm-check' : 'perm-cross'">{{ p.puede_actualizar ? '✓' : '✕' }}</span></td>
              <td><span :class="p.puede_eliminar ? 'perm-check' : 'perm-cross'">{{ p.puede_eliminar ? '✓' : '✕' }}</span></td>
              <td><span :class="p.puede_exportar ? 'perm-check' : 'perm-cross'">{{ p.puede_exportar ? '✓' : '✕' }}</span></td>
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
      <form @submit.prevent="saveItem">
        <div class="section-title" style="margin-top:0;color:var(--primary);display:flex;align-items:center;gap:6px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          INFORMACIÓN PERSONAL
        </div>
        <div class="form-grid">
          <div class="form-group"><label class="form-label">Nombre Completo <span class="required">*</span></label><input v-model="form.nombre_usuario" class="form-input" placeholder="Ej. Juan Pérez" required /></div>
          <div class="form-group"><label class="form-label">Número de Nómina</label><input v-model="form.numero_nomina" class="form-input" placeholder="000000" /></div>
          <div class="form-group"><label class="form-label">Correo Electrónico <span class="required">*</span></label><input v-model="form.correo_electronico" class="form-input" type="email" placeholder="usuario@iuca.edu.mx" required :disabled="editMode" /></div>
          <div class="form-group"><label class="form-label">Puesto</label><input v-model="form.puesto" class="form-input" placeholder="Ej. Analista TI" /></div>
        </div>
        <div class="section-title" style="color:var(--primary);display:flex;align-items:center;gap:6px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          INFORMACIÓN DE ACCESO
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Contraseña <span class="required">*</span></label>
            <div style="position:relative;">
              <input v-model="form.password" :type="showPass ? 'text' : 'password'" class="form-input" placeholder="••••••••" :required="!editMode" style="padding-right:38px;" />
              <button type="button" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--gray-400);" @click="showPass=!showPass">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
          <div class="form-group"><label class="form-label">Confirmar Contraseña <span class="required">*</span></label><input v-model="form.confirm_password" :type="showPass ? 'text' : 'password'" class="form-input" placeholder="••••••••" :required="!editMode" /></div>
          <div class="form-group span-full">
            <label class="form-label">Área Asignada</label>
            <select v-model="form.area_id" class="form-select" style="max-width:260px;" @change="loadRolPermisos">
              <option value="">Seleccionar área</option>
              <option v-for="a in catalogos.areas" :key="a.id_area" :value="a.id_area">{{ a.nombre_area }}</option>
            </select>
          </div>
        </div>
        <div v-if="rolPermisos.length" style="margin-top:4px;">
          <div style="font-size:13px;font-weight:600;color:var(--gray-700);margin-bottom:8px;">Permisos del Rol Seleccionado</div>
          <table class="permissions-table">
            <thead><tr><th>MÓDULO</th><th>LEER</th><th>CREAR</th><th>EDITAR</th><th>ELIMINAR</th></tr></thead>
            <tbody>
              <tr v-for="p in rolPermisos" :key="p.modulo">
                <td>{{ p.modulo }}</td>
                <td><span :class="p.puede_leer ? 'perm-check' : 'perm-cross'">{{ p.puede_leer ? '✓' : '✕' }}</span></td>
                <td><span :class="p.puede_crear ? 'perm-check' : 'perm-cross'">{{ p.puede_crear ? '✓' : '✕' }}</span></td>
                <td><span :class="p.puede_actualizar ? 'perm-check' : 'perm-cross'">{{ p.puede_actualizar ? '✓' : '✕' }}</span></td>
                <td><span :class="p.puede_eliminar ? 'perm-check' : 'perm-cross'">{{ p.puede_eliminar ? '✓' : '✕' }}</span></td>
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
        <button class="btn btn-primary" @click="saveItem" :disabled="saving">
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
import StatusBadge from '@/components/ui/StatusBadge.vue'

const items = ref([])
const loading = ref(false)
const page = ref(1)
const total = ref(0)
const totalPages = ref(1)
const filters = reactive({ search: '', rol_id: '', area_id: '' })
const catalogos = reactive({ areas: [], roles: [] })
const showDetail = ref(false)
const showForm = ref(false)
const showConfirm = ref(false)
const selected = ref(null)
const toDelete = ref(null)
const editMode = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showPass = ref(false)
const rolPermisos = ref([])
const form = reactive({ nombre_usuario: '', numero_nomina: '', correo_electronico: '', puesto: '', password: '', confirm_password: '', area_id: '', rol_id: '' })

let searchTimeout = null

function formatDate(d) {
  if (!d) return '–'
  const dt = new Date(d)
  return dt.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + dt.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

async function loadCatalogos() {
  const [areas, roles] = await Promise.all([catalogosApi.getAreas(), catalogosApi.getRoles()])
  catalogos.areas = areas.data; catalogos.roles = roles.data
}

async function loadData() {
  loading.value = true
  try {
    const res = await usuariosApi.listAccesos({ page: page.value, per_page: 20 })
    items.value = res.data
    total.value = res.data.length
    totalPages.value = 1
  } catch (e) { console.error(e) } finally { loading.value = false }
}

function onSearch() { clearTimeout(searchTimeout); searchTimeout = setTimeout(loadData, 400) }
function onPageChange(p) { page.value = p; loadData() }

async function loadRolPermisos() {
  // This would call GET /api/usuarios/permisos/{rol_id} - endpoint faltante
  // For now just show placeholder
  rolPermisos.value = [
    { modulo: 'Mobiliario', puede_leer: true, puede_crear: false, puede_actualizar: false, puede_eliminar: false },
    { modulo: 'Equipos', puede_leer: false, puede_crear: false, puede_actualizar: false, puede_eliminar: false },
    { modulo: 'Usuarios', puede_leer: true, puede_crear: false, puede_actualizar: false, puede_eliminar: false },
    { modulo: 'Accesos', puede_leer: true, puede_crear: false, puede_actualizar: false, puede_eliminar: false },
    { modulo: 'Catálogos', puede_leer: true, puede_crear: false, puede_actualizar: false, puede_eliminar: false },
  ]
}

async function openDetail(acc) {
  try {
    const res = await usuariosApi.getAcceso(acc.id_acceso)
    selected.value = res.data
  } catch { selected.value = acc }
  showDetail.value = true
}

function openCreate() {
  editMode.value = false; rolPermisos.value = []
  Object.assign(form, { nombre_usuario: '', numero_nomina: '', correo_electronico: '', puesto: '', password: '', confirm_password: '', area_id: '', rol_id: '' })
  showForm.value = true
}

async function openEdit(acc) {
  editMode.value = true
  Object.assign(form, { nombre_usuario: acc.nombre_usuario, correo_electronico: acc.correo_electronico, area_id: acc.area_id || '', rol_id: acc.rol_id || '', password: '', confirm_password: '' })
  form._id = acc.id_acceso
  showForm.value = true
}

async function saveItem() {
  if (form.password && form.password !== form.confirm_password) { alert('Las contraseñas no coinciden'); return }
  saving.value = true
  try {
    const payload = { nombre_usuario: form.nombre_usuario, correo_electronico: form.correo_electronico, area_id: form.area_id, rol_id: form.rol_id }
    if (form.password) payload.password = form.password
    if (editMode.value) await usuariosApi.updateAcceso(form._id, payload)
    else await usuariosApi.createAcceso(payload)
    showForm.value = false; loadData()
  } catch (e) { alert(e.response?.data?.error || 'Error al guardar') } finally { saving.value = false }
}

function confirmDelete(acc) { toDelete.value = acc; showConfirm.value = true }
async function doDelete() {
  deleting.value = true
  try { await usuariosApi.deleteAcceso(toDelete.value.id_acceso); showConfirm.value = false; toDelete.value = null; loadData() }
  catch (e) { alert(e.response?.data?.error || 'Error') } finally { deleting.value = false }
}

onMounted(() => { loadCatalogos(); loadData() })
</script>