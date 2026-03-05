<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Catálogos del Sistema</h1>
        <p class="page-subtitle">Consultar catálogos y configuraciones</p>
      </div>
        <button class="btn btn-primary" @click="openCreate('tipo_activo')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo catálogo
      </button>
    </div>

    <div class="catalogs-grid">
      <!-- Áreas -->
      <div class="catalog-card">
        <div class="catalog-card-header">
          <span class="catalog-card-title">Áreas</span>
        </div>
        <div v-if="loading.areas" style="text-align:center;padding:20px;"><span class="spinner"></span></div>
        <div v-else>
          <div class="catalog-item" v-for="a in catalogos.areas" :key="a.id_area">
            <span>{{ a.nombre_area }}</span>
            <div class="actions-cell">
              <button class="action-btn view" @click="openDetail('area', a)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></button>
              <button class="action-btn edit" @click="openEdit('area', a)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
              <button class="action-btn delete" @click="confirmDelete('area', a)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tipos de Activo -->
      <div class="catalog-card">
        <div class="catalog-card-header">
          <span class="catalog-card-title">Tipos de Activo</span>
        </div>
        <div v-if="loading.tipos" style="text-align:center;padding:20px;"><span class="spinner"></span></div>
        <div v-else>
          <div class="catalog-item" v-for="t in catalogos.tipos_activo" :key="t.id_tipo_activo">
            <span>{{ t.nombre_tipo }}</span>
            <div class="actions-cell">
              <button class="action-btn view" @click="openDetail('tipo_activo', t)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></button>
              <button class="action-btn edit" @click="openEdit('tipo_activo', t)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
              <button class="action-btn delete" @click="confirmDelete('tipo_activo', t)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Estados -->
      <div class="catalog-card">
        <div class="catalog-card-header">
          <span class="catalog-card-title">Estados</span>
        </div>
        <div v-if="loading.estados" style="text-align:center;padding:20px;"><span class="spinner"></span></div>
        <div v-else>
          <div class="catalog-item" v-for="e in catalogos.estados" :key="e.id_estado">
            <span>{{ e.nombre_estado }}</span>
            <div class="actions-cell">
              <button class="action-btn view" @click="openDetail('estado', e)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></button>
              <button class="action-btn edit" @click="openEdit('estado', e)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
              <button class="action-btn delete" @click="confirmDelete('estado', e)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tipos de Mobiliario -->
      <div class="catalog-card">
        <div class="catalog-card-header">
          <span class="catalog-card-title">Tipos de Mobiliario</span>
        </div>
        <div v-if="loading.mobiliario" style="text-align:center;padding:20px;"><span class="spinner"></span></div>
        <div v-else>
          <div class="catalog-item" v-for="t in catalogos.tipos_mobiliario" :key="t.id_tipo_mobiliario">
            <span>{{ t.nombre_tipo }}</span>
            <div class="actions-cell">
              <button class="action-btn view" @click="openDetail('tipo_mobiliario', t)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></button>
              <button class="action-btn edit" @click="openEdit('tipo_mobiliario', t)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
              <button class="action-btn delete" @click="confirmDelete('tipo_mobiliario', t)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <BaseModal v-model="showForm" :title="editMode ? 'Actualizar Catálogo' : 'Nuevo Catálogo'" size="md">
      <div class="tab-selector">
        <button v-for="t in catalogTypes" :key="t.key" type="button" class="tab-option" :class="{ active: currentType === t.key }" @click="currentType = t.key">{{ t.label }}</button>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Nombre del Tipo <span class="required">*</span></label>
          <input v-model="form.nombre" class="form-input" :placeholder="namePlaceholder" required maxlength="30" />
          <small style="color:var(--gray-400);font-size:11px;">{{ form.nombre.length }} / 30</small>
        </div>
        <div class="form-group">
          <label class="form-label">Estado del Catálogo</label>
          <select v-model="form.estado_catalogo" class="form-select">
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
        <div v-if="currentType == 'estado'" class="form-group span-full">
          <label class="form-label">Color del Estado</label>
          <div style="display:flex; gap:10px; align-items:center;">
            <!-- Campo editable -->
            <input
              type="text"
              v-model="form.color_hex"
              class="form-input"
              placeholder="#000000"
              maxlength="7"
              style="max-width:120px;"
            />
            <!-- Selector visual -->
            <input
              type="color"
              v-model="form.color_hex"
              style="width:50px; height:40px; padding:0; border:none; background:none; cursor:pointer;"
            />
          </div>
          <small style="color:var(--gray-400);font-size:11px;">
            Puedes elegir el color o escribir el código HEX manualmente.
          </small>
        </div>
        <div class="form-group span-full">
          <label class="form-label">Descripción</label>
          <textarea v-model="form.descripcion" class="form-textarea" placeholder="Breve descripción del tipo de activo..." maxlength="200"></textarea>
          <small style="color:var(--gray-400);font-size:11px;">{{ form.descripcion.length }} / 200 — Campo opcional para detalles técnicos</small>
        </div>
      </div>
      <template #footer>
        <button class="btn btn-secondary" @click="showForm = false">Cancelar</button>
        <button class="btn btn-primary" @click="saveItem" :disabled="saving">
          <span v-if="saving" class="spinner" style="width:14px;height:14px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:white;"></span>
          <span v-else>Guardar Catálogo</span>
        </button>
      </template>
    </BaseModal>

    <!-- Detail Modal -->
    <BaseModal v-model="showDetail" title="Detalles del Responsable" size="sm">
      <template v-if="selected">
        <div class="detail-grid" style="grid-template-columns:1fr 1fr;">
          <div class="detail-item"><label>ID</label><strong style="color:var(--primary);font-family:var(--font-mono)">{{ selectedId }}</strong></div>
          <div class="detail-item"><label>Tipo de Catálogo</label><strong>{{ currentTypeLabel }}</strong></div>
          <div class="detail-item"><label>Nombre del tipo</label><strong>{{ selectedName }}</strong></div>
          <div class="detail-item">
            <label>Estado del Catálogo</label>
            <span
              :class=" selected.activo ? 'badge badge-success' : 'badge badge-danger'">
              {{ selected.activo ? 'Activo' : 'Inactivo'}}
            </span>
          </div>
          <div v-if="currentType === 'estado'" class="detail-item">
            <label>Color del tipo</label>

            <div class="color-preview">
              <input
                type="color"
                v-model="selected.color_hex"
                disabled
              />
              <strong>{{ selected.color_hex }}</strong>
            </div>
          </div>


          <div class="detail-item span-full"><label>Descripción</label><strong>{{ selected.descripcion || 'Sin descripción...' }}</strong></div>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-primary" @click="showDetail = false">Cerrar</button>
      </template>
    </BaseModal>

    <ConfirmDialog v-model="showConfirm" title="Eliminar opción del cátalogo" :message="`¿Estás seguro de eliminar la opción del catálogo ${currentTypeLabel} '${toDelete?.nombre}'? Esta acción no se puede deshacer.`" :loading="deleting" @confirm="doDelete" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { catalogosApi } from '@/services/api'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

const catalogos = reactive({ areas: [], tipos_activo: [], estados: [], tipos_mobiliario: [] })
const loading = reactive({ areas: false, tipos: false, estados: false, mobiliario: false })
const showForm = ref(false)
const showDetail = ref(false)
const showConfirm = ref(false)
const editMode = ref(false)
const saving = ref(false)
const deleting = ref(false)
const currentType = ref('activo')
const selected = ref(null)
const toDelete = ref(null)
const form = reactive({ nombre: '', descripcion: '', estado_catalogo: 'activo', color_hex: '' })

const catalogTypes = [
  { key: 'tipo_activo', label: 'Activos' },
  { key: 'area', label: 'Áreas' },
  { key: 'estado', label: 'Estados' },
  { key: 'tipo_mobiliario', label: 'Mobiliarios' },
]

const typeLabels = { area: 'Áreas', tipo_activo: 'Activos', estado: 'Estados', tipo_mobiliario: 'Mobiliario' }
const currentTypeLabel = computed(() => typeLabels[currentType.value] || currentType.value)

const namePlaceholders = { area: 'Ej: Dirección, Sistemas...', tipo_activo: 'Ej: Laptops, Escritorios', estado: 'Ej: Bueno, Regular...', tipo_mobiliario: 'Ej: Silla, Mesa...' }
const namePlaceholder = computed(() => namePlaceholders[currentType.value] || 'Nombre...')

const selectedId = computed(() => {
  if (!selected.value) return '–'
  return selected.value.id_area || selected.value.id_tipo_activo || selected.value.id_estado || selected.value.id_tipo_mobiliario
})
const selectedName = computed(() => selected.value?.nombre_area || selected.value?.nombre_tipo || selected.value?.nombre_estado || '–')

async function loadAll() {
  loading.areas = loading.tipos = loading.estados = loading.mobiliario = true
  try {
    const [a, t, e, m] = await Promise.all([catalogosApi.getAreas(), catalogosApi.getTiposActivo(), catalogosApi.getEstados(), catalogosApi.getTiposMobiliario()])
    catalogos.areas = a.data; catalogos.tipos_activo = t.data; catalogos.estados = e.data; catalogos.tipos_mobiliario = m.data
  } finally { loading.areas = loading.tipos = loading.estados = loading.mobiliario = false }
}

function openCreate(type) { currentType.value = type; editMode.value = false; Object.assign(form, { nombre: '', descripcion: '', estado_catalogo: 'activo', color_hex: '' }); showForm.value = true }

async function openEdit(type, item) {
  currentType.value = type;
  editMode.value = true

  let res;

  switch (type) {
    case 'area':
      res = await catalogosApi.getArea(item.id_area);
      break;
    case 'tipo_activo':
      res = await catalogosApi.getActivo(item.id_tipo_activo);
      break;
    case 'estado':
      res = await catalogosApi.getEstado(item.id_estado);
      break;
    case 'tipo_mobiliario':
      res = await catalogosApi.getMobiliario(item.id_tipo_mobiliario);
      break;
  }
  const d = res.data

  if (type === 'estado') {
    form.color_hex = d.color_hex
  }
  form.nombre = d.nombre_area || d.nombre_tipo || d.nombre_estado || ''
  form.descripcion = d.descripcion || '';
  form.estado_catalogo = d.activo ? 'activo' : 'inactivo';
  form._id = d.id_area || d.id_tipo_activo || d.id_estado || d.id_tipo_mobiliario
  showForm.value = true
}
async function openDetail(type, item) {

  try {

    let res;

    switch (type) {
      case 'area':
        res = await catalogosApi.getArea(item.id_area);
        break;
      case 'tipo_activo':
        res = await catalogosApi.getActivo(item.id_tipo_activo);
        break;
      case 'estado':
        res = await catalogosApi.getEstado(item.id_estado);
        break;
      case 'tipo_mobiliario':
        res = await catalogosApi.getMobiliario(item.id_tipo_mobiliario);
        break;
    }

    selected.value = res.data

  } catch {
    selected.value = item
  }

  currentType.value = type;
  showDetail.value = true;

}
function confirmDelete(type, item) { currentType.value = type; toDelete.value = { ...item, nombre: item.nombre_area || item.nombre_tipo || item.nombre_estado || '' }; showConfirm.value = true }

async function saveItem() {
  saving.value = true
  let metodo;


  const accion = editMode.value ? 'update' : 'create'

  let payload = {
      descripcion: form.descripcion,
      activo: form.estado_catalogo === 'activo' ? true : false
    }

  if (currentType.value === 'estado') payload['color_hex'] = form.color_hex

  const valor_nombre = currentType.value.includes('tipo') ? 'nombre_tipo' : `nombre_${currentType.value}`
  payload[valor_nombre] = form.nombre

  try {

    switch (currentType.value) {
      case 'area':
        metodo = `${accion}Area`
      break;

      case 'tipo_activo':
        metodo = `${accion}TipoActivo`
      break;

      case 'estado':
        metodo = `${accion}Estado`
      break;

      case 'tipo_mobiliaro':
        metodo = `${accion}TipoMobiliario`
      break;
    }


    if (editMode.value) {
      await catalogosApi[metodo](form._id, payload)
    } else {
      await catalogosApi[metodo](payload)
    }

    showForm.value = false;
    loadAll()

  } catch (e) {
    alert(e.response?.data?.error || 'Error al guardar')
  } finally {
    saving.value = false;
  }

}

async function doDelete() {
  deleting.value = true
  try {
    const id = toDelete.value.id_area || toDelete.value.id_tipo_activo || toDelete.value.id_estado || toDelete.value.id_tipo_mobiliario
    if (currentType.value === 'area') await catalogosApi.deleteArea(id)
    else if (currentType.value === 'tipo_activo') await catalogosApi.deleteTipoActivo(id)
    else if (currentType.value === 'estado') await catalogosApi.deleteEstado(id)
    else if (currentType.value === 'tipo_mobiliario') await catalogosApi.deleteTipoMobiliario(id)
    showConfirm.value = false; loadAll()
  } catch (e) { alert(e.response?.data?.error || 'Error') } finally { deleting.value = false }
}

onMounted(loadAll)
</script>

<style scoped>
.catalogs-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.catalogs-grid .catalog-card:nth-child(4) {
  grid-column: 1;
}

@media (max-width: 1100px) { .catalogs-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 700px) { .catalogs-grid { grid-template-columns: 1fr; } }

.color-preview {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-preview input[type="color"] {
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  padding: 0;
}
</style>


