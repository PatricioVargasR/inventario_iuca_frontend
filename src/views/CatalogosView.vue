<template>
  <div class="page-container">

    <PageHeader title="Catálogos del sistema" subtitle="Administración de catálogos y configuraciones">
      <template #actions>
        <button v-if="authStore.canDo('catalogos', 'puede_crear')" class="btn btn-primary" @click="openCreate">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo {{ tabActual.labelSingular }}
        </button>
      </template>
    </PageHeader>

    <!-- Tabs + búsqueda -->
    <div class="card" style="padding:0;margin-bottom:20px;overflow:hidden;">
      <div class="tabs-bar">
        <button v-for="tab in TABS" :key="tab.key" class="tab-btn" :class="{ active: activeTab === tab.key }"
          @click="switchTab(tab.key)">
          {{ tab.label }}
          <span class="tab-count" :class="{ active: activeTab === tab.key }">
            {{ tabCounts[tab.key] }}
          </span>
        </button>
      </div>

      <div class="filters-row">
        <div class="filter-group search">
          <label>Búsqueda general</label>
          <div class="input-with-icon">
            <svg class="input-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input v-model="search" class="form-input"
              :placeholder="`Buscar ${tabActual.labelSingular.toLowerCase()}...`" @input="onSearch" />
          </div>
        </div>
        <div class="filter-group">
          <label>Estado</label>
          <select v-model="estado" class="form-select" @change="loadTab">
            <option value="">Todos los estados</option>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th @click="toggleSort('id')" class="sorted">
              <span class="sort-btn">ID
                <span class="sort-icon" :class="getSortClass('id')">
                  <span class="arr-up"></span><span class="arr-down"></span>
                </span>
              </span>
            </th>
            <th @click="toggleSort('nombre')" class="sorted">
              <span class="sort-btn">Nombre
                <span class="sort-icon" :class="getSortClass('nombre')">
                  <span class="arr-up"></span><span class="arr-down"></span>
                </span>
              </span>
            </th>
            <th>Descripción</th>
            <th v-if="activeTab === 'estado'">Color</th>
            <th @click="toggleSort('activo')" class="sorted">
              <span class="sort-btn">Estado
                <span class="sort-icon" :class="getSortClass('activo')">
                  <span class="arr-up"></span><span class="arr-down"></span>
                </span>
              </span>
            </th>
            <th @click="toggleSort('fecha_creacion')" class="sorted">
              <span class="sort-btn">Creado
                <span class="sort-icon" :class="getSortClass('fecha_creacion')">
                  <span class="arr-up"></span><span class="arr-down"></span>
                </span>
              </span>
            </th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="loading-row">
            <td :colspan="activeTab === 'estado' ? 7 : 6">
              <span class="spinner"></span>
            </td>
          </tr>
          <tr v-else-if="!items.length">
            <td :colspan="activeTab === 'estado' ? 7 : 6">
              <div class="empty-state">
                <div class="empty-icon">📋</div>
                <p>No se encontraron {{ tabActual.label.toLowerCase() }}</p>
              </div>
            </td>
          </tr>
          <template v-else>
            <tr v-for="item in items" :key="getItemId(item)">
              <td>
                <span style="font-family:var(--font-mono);font-size:12px;color:var(--gray-500)">
                  {{ getItemId(item) }}
                </span>
              </td>
              <td style="font-weight:700;color:var(--gray-900)">{{ getItemNombre(item) }}</td>
              <td
                style="color:var(--gray-500);font-size:13px;max-width:260px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                {{ item.descripcion || '–' }}
              </td>
              <td v-if="activeTab === 'estado'">
                <div style="display:flex;align-items:center;gap:8px;">
                  <span
                    style="width:14px;height:14px;border-radius:50%;display:inline-block;border:1px solid var(--border);"
                    :style="{ background: item.color_hex || '#ccc' }"></span>
                  <span style="font-family:var(--font-mono);font-size:12px;color:var(--gray-500)">
                    {{ item.color_hex || '–' }}
                  </span>
                </div>
              </td>
              <td>
                <span class="badge" :class="item.activo ? 'badge-success' : 'badge-danger'">
                  {{ item.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td style="font-size:12px;color:var(--gray-400);font-family:var(--font-mono)">
                {{ formatDate(item.fecha_creacion) }}
              </td>
              <td>
                <div class="actions-cell">
                  <button class="action-btn view" @click="openDetail(activeTab, item)" title="Ver detalle">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  <button v-if="authStore.canDo('catalogos', 'puede_actualizar')" class="action-btn edit"
                    @click="openEdit(activeTab, item)" title="Editar">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button v-if="authStore.canDo('catalogos', 'puede_eliminar')" class="action-btn delete"
                    @click="confirmDelete(activeTab, item)" title="Eliminar">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>

      <Pagination v-if="!loading && items.length > 0" :current="page" :total-pages="totalPages" :total="total"
        :from="from" :to="to" :per-page="perPage" @change="onPageChange" />
    </div>

    <!-- Create / Edit Modal -->
    <BaseModal v-model="showForm"
      :title="editMode ? `Actualizar ${tabActual.labelSingular.toLowerCase()}` : 'Nuevo catálogo'"
      subtitle="Sistema de inventario IUCA" size="md" @update:model-value="handleFormClose">
      <form id="catalogoForm" @submit.prevent="saveItem" novalidate>

        <div v-if="!editMode">
          <div class="section-title" style="margin-top:0;">Tipo de catálogo</div>
          <div class="catalog-type-selector">
            <button v-for="tab in TABS" :key="tab.key" type="button" class="catalog-type-btn"
              :class="{ active: formTab === tab.key }" @click="formTab = tab.key; clearErrors()">
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div class="section-title" :style="editMode ? 'margin-top:0;' : ''">Información</div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Nombre <span class="required">*</span></label>
            <input v-model="form.nombre" class="form-input" :class="{ 'input-error': formErrors.nombre }"
              :placeholder="tipoActual.placeholder" maxlength="50" />
            <span v-if="formErrors.nombre" class="field-error">{{ formErrors.nombre }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Estado <span class="required">*</span></label>
            <select v-model="form.estado_catalogo" class="form-select">
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        <div v-if="(editMode && activeTab === 'estado') || (!editMode && formTab === 'estado')" class="form-group"
          style="margin-top:4px;">
          <label class="form-label">Color <span class="required">*</span></label>
          <div style="display:flex;gap:10px;align-items:center;">
            <input type="text" v-model="form.color_hex" class="form-input"
              :class="{ 'input-error': formErrors.color_hex }" placeholder="#000000" maxlength="7"
              style="max-width:120px;" />
            <input type="color" v-model="form.color_hex"
              style="width:50px;height:40px;padding:0;border:none;background:none;cursor:pointer;" />
          </div>
          <span v-if="formErrors.color_hex" class="field-error">{{ formErrors.color_hex }}</span>
          <small style="color:var(--gray-400);font-size:11px;">Puedes elegir el color o escribir el código HEX
            manualmente.</small>
        </div>

        <div class="section-title">Descripción</div>
        <div class="form-group">
          <textarea v-model="form.descripcion" class="form-textarea" placeholder="Descripción opcional..."
            maxlength="200"></textarea>
          <small style="color:var(--gray-400);font-size:11px;">{{ form.descripcion.length }} / 200</small>
        </div>

      </form>
      <template #footer>
        <button class="btn btn-secondary" @click="handleFormClose">Cancelar</button>
        <button class="btn btn-primary" form="catalogoForm" type="submit" :disabled="saving">
          <span v-if="saving" class="spinner"
            style="width:14px;height:14px;border-width:2px;border-color:rgba(255,255,255,.3);border-top-color:white;"></span>
          <span v-else>{{ editMode ? 'Actualizar' : 'Guardar' }}</span>
        </button>
      </template>
    </BaseModal>

    <!-- Detail Modal -->
    <BaseModal v-model="showDetail" :title="`Detalles — ${tabActual.labelSingular}`" size="sm">
      <template v-if="selected">
        <div class="section-title" style="margin-top:0;">Información general</div>
        <div class="detail-grid">
          <div class="detail-item">
            <label>ID</label>
            <strong style="font-family:var(--font-mono)">{{ getItemId(selected) }}</strong>
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
              <span
                style="width:20px;height:20px;border-radius:50%;border:1px solid var(--border);display:inline-block;"
                :style="{ background: selected.color_hex }"></span>
              <strong style="font-family:var(--font-mono)">{{ selected.color_hex }}</strong>
            </div>
          </div>
        </div>
        <div v-if="selected.descripcion">
          <div class="section-title">Descripción</div>
          <div class="obs-box" style="font-size:13.5px;color:var(--gray-700)">{{ selected.descripcion }}</div>
        </div>
        <div class="section-title">Auditoría</div>
        <div class="detail-grid">
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

    <ConfirmDialog v-model="showConfirm" :title="`Eliminar ${tabActual.labelSingular.toLowerCase()}`"
      :message="`¿Estás seguro de eliminar '${toDelete?.nombre}'? Esta acción no se puede deshacer.`"
      :loading="deleting" @confirm="doDelete" @cancel="handleCancelDelete" />

    <ConcurrencyAlert v-model="showConcurrencyAlert" :title="concurrencyAlert.title" :message="concurrencyAlert.message"
      :lock-info="concurrencyAlert.lockInfo" :show-retry="concurrencyAlert.showRetry" @cancel="handleConcurrencyCancel"
      @retry="handleConcurrencyRetry(items)" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSort } from '@/composables/useSort'
import { formatDateShort as formatDate } from '@/utils/formatters'
import { TABS, getItemId, getItemNombre } from '@/constants/catalogos'
import { useCatalogosData } from '@/composables/useCatalogosData'
import { useCatalogosForm } from '@/composables/useCatalogosForm'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import ConcurrencyAlert from '@/components/ui/ConcurrencyAlert.vue'
import Pagination from '@/components/ui/Pagination.vue'
import PageHeader from '@/components/ui/PageHeader.vue'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

// ── Tab activo — inicializado desde ?tab= query param ────────────────
const VALID_TABS = TABS.map(t => t.key)

function tabFromQuery() {
  const q = route.query.tab
  return VALID_TABS.includes(q) ? q : 'area'
}

const activeTab = ref(tabFromQuery())
const search = ref(route.query.search || '')
const estado = ref('')

// Mantener URL sincronizada cuando cambian tab o search
watch([activeTab, search], ([tab, s]) => {
  router.replace({
    query: {
      ...(tab !== 'area' ? { tab } : {}),
      ...(s ? { search: s } : {}),
    }
  })
}, { flush: 'post' })

// ── Computeds de tab ─────────────────────────────────────────────────
const tabActual = computed(() => TABS.find(t => t.key === activeTab.value))
const tipoActual = computed(() => TABS.find(t => t.key === (editMode.value ? activeTab.value : formTab.value)))

// ── Sort ─────────────────────────────────────────────────────────────
const { toggleSort, getSortClass, applySortToParams, resetSort } = useSort({
  onChange: () => loadTab(true),
})

// ── Datos ────────────────────────────────────────────────────────────
const {
  items, loading, tabCounts,
  page, total, totalPages, perPage, from, to,
  onSearch, onPageChange,
  loadTab, loadAllCounts,
} = useCatalogosData({ activeTab, search, estado, applySortToParams })

// ── Formulario / CRUD ────────────────────────────────────────────────
const {
  showForm, showDetail, showConfirm, showConcurrencyAlert,
  form, formTab, formErrors, editMode, saving, deleting,
  selected, toDelete, concurrencyAlert,
  openCreate, openEdit, openDetail, handleFormClose,
  saveItem, confirmDelete, doDelete, handleCancelDelete,
  handleConcurrencyCancel, handleConcurrencyRetry,
  releasCurrentLock, clearErrors,
} = useCatalogosForm({
  activeTab,
  tabActual,
  tipoActual,
  onSaved: () => { loadAllCounts(); loadTab() },
  onDeleted: () => { loadAllCounts(); loadTab() },
})

// ── Navegación entre tabs ────────────────────────────────────────────
function switchTab(key) {
  activeTab.value = key
  search.value = ''
  estado.value = ''
  resetSort()
  loadTab()
}

// ── Ciclo de vida ────────────────────────────────────────────────────
onBeforeUnmount(releasCurrentLock)

onMounted(async () => {
  await loadAllCounts()
  loadTab()
})
</script>

<style scoped>
.tabs-bar {
  display: flex;
  padding: 0 16px;
  gap: 2px;
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.tabs-bar::-webkit-scrollbar {
  display: none;
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
  flex-shrink: 0;
}

.tab-btn:hover {
  color: var(--gray-800);
}

.tab-btn.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

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
  margin-bottom: 4px;
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
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25);
}

.filters-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
  padding: 16px 20px;
}

.sorted {
  cursor: pointer;
  user-select: none;
}

.sorted:hover {
  color: var(--gray-800);
}
</style>