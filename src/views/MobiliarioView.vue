<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Mobiliario</h1>
        <p class="page-subtitle">Gestión integral del inventario de activos físicos y mobiliario de oficina.</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo Mobiliario
      </button>
    </div>

    <div class="filter-bar">
      <div class="filter-group search">
        <label>Búsqueda General</label>
        <div class="input-with-icon">
          <svg class="input-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="filters.search" class="form-input" placeholder="Buscar por marca, modelo..." @input="onSearch" />
        </div>
      </div>
      <div class="filter-group">
        <label>Tipo de Mobiliario</label>
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

    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th><th>TIPO</th><th>MARCA</th><th>MODELO</th>
            <th>COLOR</th><th>CARACTERÍSTICAS</th><th>ESTADO</th>
            <th>RESPONSABLE</th><th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="loading-row"><td colspan="9"><span class="spinner"></span></td></tr>
          <tr v-else-if="!items.length">
            <td colspan="9"><div class="empty-state"><div class="empty-icon">🪑</div><p>No se encontró mobiliario</p></div></td>
          </tr>
          <tr v-else v-for="m in items" :key="m.id_mueble">
            <td><span style="font-family:var(--font-mono);font-size:12px;color:var(--gray-500)">MOB-{{ String(m.id_mueble).padStart(3,'0') }}</span></td>
            <td>{{ m.tipo_mobiliario }}</td>
            <td>{{ m.marca || '–' }}</td>
            <td>{{ m.modelo || '–' }}</td>
            <td>{{ m.color || '–' }}</td>
            <td style="font-size:12.5px;color:var(--gray-500);max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ m.caracteristicas || '–' }}</td>
            <td><StatusBadge :estado="m.estado" /></td>
            <td>{{ m.responsable || '–' }}</td>
            <td>
              <div class="actions-cell">
                <button class="action-btn view" @click="openDetail(m)" title="Ver detalle">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="action-btn edit" @click="openEdit(m)" title="Editar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="action-btn delete" @click="confirmDelete(m)" title="Eliminar">
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
          <div class="detail-item"><label>ID</label><strong style="font-family:var(--font-mono)">MOB-{{ String(selected.id_mueble).padStart(3,'0') }}</strong></div>
          <div class="detail-item"><label>Tipo</label><strong>{{ selected.tipo_mobiliario }}</strong></div>
          <div class="detail-item"><label>Tipo de activo</label><strong>Mobiliario</strong></div>
          <div class="detail-item"><label>Marca</label><strong>{{ selected.marca || '–' }}</strong></div>
          <div class="detail-item"><label>Modelo</label><strong>{{ selected.modelo || '–' }}</strong></div>
          <div class="detail-item"><label>Estado</label><StatusBadge :estado="selected.estado" /></div>
          <div class="detail-item"><label>Color</label><strong>{{ selected.color || '–' }}</strong></div>
          <div class="detail-item"><label>Responsable</label><strong>{{ selected.responsable || '–' }}</strong></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:16px;">
          <div>
            <div class="section-title">Características</div>
            <div class="specs-box">
              <div v-if="selected.caracteristicas" style="font-size:13.5px;color:var(--gray-700)">
                <div v-for="c in selected.caracteristicas.split(',')" :key="c" class="spec-item">{{ c.trim() }}</div>
              </div>
              <div v-else style="font-size:13px;color:var(--gray-400)">Sin características</div>
            </div>
          </div>
          <div>
            <div class="section-title">Observaciones</div>
            <div class="obs-box" style="font-size:13.5px;color:var(--gray-700)">
              {{ selected.observaciones || 'Sin observaciones' }}
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-primary" @click="showDetail = false">Cerrar</button>
      </template>
    </BaseModal>

    <!-- Form Modal -->
    <BaseModal v-model="showForm" :title="editMode ? 'Actualizar Mobiliario' : 'Nuevo Mobiliario'" size="lg">
      <form id="mobiliarioForm" @submit.prevent="saveItem">
        <div class="section-title" style="color:var(--primary);display:flex;align-items:center;gap:6px;">
          Información General
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Tipo de Activo <span class="required">*</span></label>
            <select v-model="form.tipo_mobiliario_id" class="form-select" required>
              <option value="">Seleccionar...</option>
              <option v-for="t in catalogos.tipos" :key="t.id_tipo_mobiliario" :value="t.id_tipo_mobiliario">{{ t.nombre_tipo }}</option>
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
            <label class="form-label">Responsable</label>
            <select v-model="form.usuario_asignado_id" class="form-select">
              <option value="">Sin asignar</option>
              <option v-for="u in catalogos.usuarios" :key="u.id_usuario" :value="u.id_usuario">{{ u.nombre_usuario }}</option>
            </select>
          </div>
        </div>
        <div class="section-title" style="color:var(--primary);display:flex;align-items:center;gap:6px;">
          Detalles
        </div>
        <div class="form-grid">
          <div class="form-group"><label class="form-label">Marca <span class="required">*</span></label><input v-model="form.marca" class="form-input" placeholder="Ej: IKEA" required /></div>
          <div class="form-group"><label class="form-label">Modelo <span class="required">*</span></label><input v-model="form.modelo" class="form-input" placeholder="Ej: Bekant" required="" /></div>
          <div class="form-group"><label class="form-label">Color </label><input v-model="form.color" class="form-input" placeholder="Ej: Café" /></div>
          <div class="form-group"><label class="form-label">Sucursal <span class="required">*</span></label><input v-model="form.sucursal_nombre" class="form-input" required="" /></div>
          <div class="form-group span-full">
            <label class="form-label">Observaciones</label>
            <textarea v-model="form.observaciones" class="form-textarea" placeholder="Escriba cualquier observación relevante aquí..." maxlength="200"></textarea>
            <small style="color:var(--gray-400);font-size:11px;">{{ form.observaciones.length }} / 200 — Campo opcional para observaciones</small>
          </div>
          <div class="form-group span-full">
            <label class="form-label">Características</label>
            <textarea v-model="form.caracteristicas" class="form-textarea" placeholder="Escriba cualquier observación relevante aquí..." maxlength="200"></textarea>
            <small style="color:var(--gray-400);font-size:11px;">{{ form.caracteristicas.length }} / 200 — Campo opcional para detalles</small>

          </div>
        </div>
      </form>
      <template #footer>
        <button class="btn btn-secondary" @click="showForm = false">Cancelar</button>
        <button class="btn btn-primary" type="submit" form="mobiliarioForm"  :disabled="saving">
          <span v-if="saving" class="spinner" style="width:14px;height:14px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:white;"></span>
          <span v-else>{{ editMode ? 'Crear' : 'Crear' }}</span>
        </button>
      </template>
    </BaseModal>

    <ConfirmDialog
      v-model="showConfirm"
      title="Eliminar Mobiliario"
      :message="`¿Estás seguro de eliminar el mobiliario '${toDelete?.tipo_mobiliario}'? Esta acción no se puede deshacer.`"
      :loading="deleting"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { mobiliarioApi, catalogosApi, usuariosApi, vistasApi } from '@/services/api'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import Pagination from '@/components/ui/Pagination.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const items = ref([])
const loading = ref(false)
const page = ref(1)
const total = ref(0)
const totalPages = ref(1)
const filters = reactive({ search: '', tipo_mobiliario_id: '', estado_id: '', usuario_id: '' })
const catalogos = reactive({ tipos: [], estados: [], usuarios: [] })
const showDetail = ref(false)
const showForm = ref(false)
const showConfirm = ref(false)
const selected = ref(null)
const toDelete = ref(null)
const editMode = ref(false)
const saving = ref(false)
const deleting = ref(false)
const form = reactive({ tipo_mobiliario_id: '', estado_id: '', usuario_asignado_id: '', tipo: '', marca: '', modelo: '', color: '', sucursal_nombre: 'Tulancingo', observaciones: '', caracteristicas: '' })
let searchTimeout = null

async function loadCatalogos() {
  const [tipos, estados, usuarios] = await Promise.all([catalogosApi.getTiposMobiliario(), catalogosApi.getEstados(), usuariosApi.listResponsables()])
  catalogos.tipos = tipos.data; catalogos.estados = estados.data; catalogos.usuarios = usuarios.data
}

async function loadData() {
  loading.value = true
  try {
    const params = { page: page.value, per_page: 20 }
    if (filters.search) params.search = filters.search
    if (filters.tipo_mobiliario_id) params.tipo_mobiliario_id = filters.tipo_mobiliario_id
    if (filters.estado_id) params.estado_id = filters.estado_id
    if (filters.usuario_id) params.usuario_id = filters.usuario_id
    const res = await vistasApi.listMobiliario(params)
    items.value = res.data.mobiliario
    total.value = res.data.total
    totalPages.value = res.data.pages
  } catch (e) { console.error(e) } finally { loading.value = false }
}

function onSearch() { clearTimeout(searchTimeout); searchTimeout = setTimeout(() => { page.value = 1; loadData() }, 400) }
function onPageChange(p) { page.value = p; loadData() }

async function openDetail(m) { const res = await vistasApi.getMobiliario(m.id_mueble); selected.value = res.data; showDetail.value = true }

function openCreate() {
  editMode.value = false
  Object.assign(form, { tipo_mobiliario_id: '', estado_id: '', usuario_asignado_id: '', tipo: '', marca: '', modelo: '', color: '', sucursal_nombre: 'Tulancingo', observaciones: '', caracteristicas: '' })
  showForm.value = true
}

async function openEdit(m) {
  editMode.value = true
  const res = await mobiliarioApi.get(m.id_mueble)
  const d = res.data
  Object.assign(form, { tipo_mobiliario_id: d.tipo_mobiliario_id, estado_id: d.estado_id, usuario_asignado_id: d.usuario_asignado_id || '', marca: d.marca || '', modelo: d.modelo || '', color: d.color || '', sucursal_nombre: d.sucursal_nombre || 'Tulancingo', observaciones: d.observaciones || '', caracteristicas: d.caracteristicas || '' })
  form._id = d.id_mueble
  showForm.value = true
}

async function saveItem() {
  saving.value = true
  try {
    if (editMode.value) await mobiliarioApi.update(form._id, { ...form })
    else await mobiliarioApi.create({ ...form })
    showForm.value = false; loadData()
  } catch (e) { alert(e.response?.data?.error || 'Error al guardar') } finally { saving.value = false }
}

function confirmDelete(m) { toDelete.value = m; showConfirm.value = true }

async function doDelete() {
  deleting.value = true
  try { await mobiliarioApi.delete(toDelete.value.id_mueble); showConfirm.value = false; toDelete.value = null; loadData() }
  catch (e) { alert(e.response?.data?.error || 'Error') } finally { deleting.value = false }
}

onMounted(() => { loadCatalogos(); loadData() })
</script>