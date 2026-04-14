<template>
  <div class="page-container">
    <PageHeader title="Responsables" subtitle="Personas que pueden ser asignadas como responsables de activos">
      <template #actions>
        <button v-if="authStore.canDo('responsable', 'puede_crear')" class="btn btn-primary" @click="openCreate">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo responsable
        </button>
      </template>
    </PageHeader>

    <div class="filter-bar">
      <div class="filter-group search">
        <label>Búsqueda general</label>
        <div class="input-with-icon">
          <svg class="input-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input v-model="filters.search" class="form-input" placeholder="Buscar por nombre, puesto..."
            @input="onSearch" />
        </div>
      </div>
      <div class="filter-group">
        <label>Áreas</label>
        <select v-model="filters.area_id" class="form-select" @change="loadData">
          <option value="">Todas las áreas</option>
          <option v-for="a in catalogos.areas" :key="a.nombre_area" :value="a.nombre_area">
            {{ a.nombre_area }}
          </option>
        </select>
      </div>
    </div>

    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th @click="toggleSort('id_usuario')" class="sorted">
              <span class="sort-btn">ID<span class="sort-icon" :class="getSortClass('id_usuario')"><span
                    class="arr-up"></span><span class="arr-down"></span></span></span>
            </th>
            <th @click="toggleSort('nombre_usuario')" class="sorted">
              <span class="sort-btn">Nombre<span class="sort-icon" :class="getSortClass('nombre_usuario')"><span
                    class="arr-up"></span><span class="arr-down"></span></span></span>
            </th>
            <th>Nómina</th>
            <th>Puesto</th>
            <th>Área</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="loading-row">
            <td colspan="6"><span class="spinner"></span></td>
          </tr>
          <tr v-else-if="!items.length">
            <td colspan="6">
              <EmptyState text="No se encontraron responsables" icon="👤" />
            </td>
          </tr>
          <template v-else>
            <tr v-for="u in items" :key="u.id_usuario">
              <td>
                <span style="
                    font-family: var(--font-mono);
                    font-size: 12px;
                    color: var(--gray-500);
                  ">{{ u.id_usuario }}</span>
              </td>
              <td style="font-weight: 700; color: var(--gray-900)">
                {{ u.nombre_usuario }}
              </td>
              <td>
                <span style="font-family: var(--font-mono); font-size: 12.5px">{{ u.numero_nomina || "–" }}</span>
              </td>
              <td style="color: var(--gray-600)">{{ u.puesto || "–" }}</td>
              <td>{{ u.area || "–" }}</td>
              <td>
                <TableActions :show-edit="authStore.canDo('responsable', 'puede_actualizar')
                  " :show-delete="authStore.canDo('responsable', 'puede_eliminar')
                    " @view="openDetail(u)" @edit="openEdit(u)" @delete="confirmDelete(u.id_usuario, u)" />
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <Pagination :current="page" :total-pages="totalPages" :total="total" :from="from" :to="to" :per-page="perPage"
        @change="onPageChange" />
    </div>

    <!-- Detail Modal -->
    <BaseModal v-model="showDetail" title="Detalles del responsable" size="sm">
      <template v-if="selected">
        <div class="section-title" style="margin-top: 0">
          Información personal
        </div>
        <div class="detail-grid">
          <div class="detail-item">
            <label>ID</label><strong style="font-family: var(--font-mono)">{{
              selected.id_usuario
              }}</strong>
          </div>
          <div class="detail-item">
            <label>Número de nómina</label><strong style="font-family: var(--font-mono)">{{
              selected.numero_nomina || "–"
              }}</strong>
          </div>
          <div class="detail-item span-full">
            <label>Nombre completo</label><strong>{{ selected.nombre_usuario }}</strong>
          </div>
          <div class="detail-item">
            <label>Puesto</label><strong>{{ selected.puesto || "–" }}</strong>
          </div>
          <div class="detail-item">
            <label>Área de adscripción</label><strong>{{ selected.area || "–" }}</strong>
          </div>
        </div>
        <div class="section-title">Auditoría</div>
        <div class="detail-grid">
          <div class="detail-item">
            <label>Fecha de creación</label><strong>{{ selected.fecha_creacion?.slice(0, 10) || "–" }}</strong>
          </div>
        </div>
      </template>
      <template #footer>
        <button class="btn btn-primary" @click="showDetail = false">
          Cerrar
        </button>
      </template>
    </BaseModal>

    <!-- Form Modal -->
    <BaseModal v-model="showForm" :title="editMode ? 'Actualizar responsable' : 'Nuevo responsable'" size="sm"
      @update:model-value="handleFormClose">
      <LockWarningBanner v-if="editMode" :message="lockWarning" />

      <form id="usuariosForm" @submit.prevent="saveItem" novalidate>
        <div class="section-title" style="margin-top: 0">Identificación</div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Número de nómina</label>
            <div style="position: relative">
              <span style="
                  position: absolute;
                  left: 10px;
                  top: 50%;
                  transform: translateY(-50%);
                  color: var(--gray-400);
                  font-weight: 700;
                ">#</span>
              <input v-model="form.numero_nomina" class="form-input"
                :class="{ 'input-error': formErrors.numero_nomina }" placeholder="Opcional" style="padding-left: 26px"
                maxlength="4" />
            </div>
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 3px;
              ">
              <span v-if="formErrors.numero_nomina" class="field-error">{{
                formErrors.numero_nomina
                }}</span>
              <span v-else></span>
              <small style="color: var(--gray-400); font-size: 11px">{{ form.numero_nomina.length }} / 4 —
                Opcional</small>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Área de adscripción <span class="required">*</span></label>
            <select v-model="form.area_id" class="form-select" :class="{ 'input-error': formErrors.area_id }">
              <option value="">Seleccionar área</option>
              <option v-for="a in catalogos.areas" :key="a.id_area" :value="a.id_area">
                {{ a.nombre_area }}
              </option>
            </select>
            <span v-if="formErrors.area_id" class="field-error">{{
              formErrors.area_id
              }}</span>
          </div>
        </div>

        <div class="section-title">Datos personales</div>
        <div class="form-grid">
          <div class="form-group span-full">
            <label class="form-label">Nombre completo <span class="required">*</span></label>
            <div style="position: relative">
              <svg style="
                  position: absolute;
                  left: 10px;
                  top: 50%;
                  transform: translateY(-50%);
                  color: var(--gray-400);
                " width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              <input v-model="form.nombre_usuario" class="form-input"
                :class="{ 'input-error': formErrors.nombre_usuario }" placeholder="Nombre completo"
                style="padding-left: 30px" maxlength="100" />
            </div>
            <span v-if="formErrors.nombre_usuario" class="field-error">{{
              formErrors.nombre_usuario
              }}</span>
          </div>
          <div class="form-group span-full">
            <label class="form-label">Puesto <span class="required">*</span></label>
            <div style="position: relative">
              <svg style="
                  position: absolute;
                  left: 10px;
                  top: 50%;
                  transform: translateY(-50%);
                  color: var(--gray-400);
                " width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
              <input v-model="form.puesto" class="form-input" :class="{ 'input-error': formErrors.puesto }"
                placeholder="Cargo que desempeña" style="padding-left: 30px" maxlength="80" />
            </div>
            <span v-if="formErrors.puesto" class="field-error">{{
              formErrors.puesto
              }}</span>
          </div>
        </div>
      </form>

      <template #footer>
        <button class="btn btn-secondary" @click="handleFormClose">
          Cancelar
        </button>
        <button class="btn btn-primary" type="submit" form="usuariosForm" :disabled="saving">
          <span v-if="saving" class="spinner" style="
              width: 14px;
              height: 14px;
              border-width: 2px;
              border-color: rgba(255, 255, 255, 0.3);
              border-top-color: white;
            "></span>
          <span v-else>{{ editMode ? "Actualizar" : "Guardar" }}</span>
        </button>
      </template>
    </BaseModal>

    <ConfirmDialog v-model="showConfirm" title="Eliminar responsable"
      :message="`¿Estás seguro de eliminar el responsable '${toDelete?.nombre_usuario}'? Esta acción no se puede deshacer.`"
      :loading="deleting" @confirm="handleDoDelete" @cancel="handleCancelDelete" />

    <ConcurrencyAlert v-model="showConcurrencyAlert" :title="concurrencyAlert.title" :message="concurrencyAlert.message"
      :lock-info="concurrencyAlert.lockInfo" :show-retry="concurrencyAlert.showRetry" @cancel="handleConcurrencyCancel"
      @retry="handleConcurrencyRetry" />

    <ConflictModal v-model="showConflictModal" entity-label="este responsable" @reload="handleConflictReload" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { usuariosApi, vistasApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
import BaseModal from "@/components/ui/BaseModal.vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import ConcurrencyAlert from "@/components/ui/ConcurrencyAlert.vue";
import Pagination from "@/components/ui/Pagination.vue";
import { useFormErrors } from "@/composables/useFormErrors";
import { usePagination } from "@/composables/usePagination";
import { useCrud } from "@/composables/useCrud";
import { useConcurrencyHandlers } from "@/composables/useConcurrencyHandlers";
import { useCatalogos } from "@/composables/useCatalogos";
import { useSort } from "@/composables/useSort";
import ConflictModal from "@/components/ui/ConflictModal.vue";
import LockWarningBanner from "@/components/ui/LockWarningBanner.vue";
import TableActions from "@/components/ui/TableActions.vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import EmptyState from "@/components/ui/EmptyState.vue";

const { catalogos, loadCatalogos } = useCatalogos();
const { getSortClass, toggleSort, applySortToParams } = useSort({
  onChange: loadData,
});
const {
  page,
  total,
  totalPages,
  perPage,
  from,
  to,
  onSearch,
  onPageChange,
  setMeta,
  setLoadFn,
} = usePagination();
const { formErrors, clearErrors, applyFieldErrors, setError } = useFormErrors();
const authStore = useAuthStore();
const { toast } = useToast();

const items = ref([]);
const loading = ref(false);
const filters = reactive({ search: "", area_id: "" });

const {
  showForm,
  showConfirm,
  showConcurrencyAlert,
  showConflictModal,
  showDetail,
  selected,
  editMode,
  saving,
  deleting,
  toDelete,
  lockWarning,
  concurrencyAlert,
  openCreate: crudOpenCreate,
  openDetail: crudOpenDetail,
  openEdit: crudOpenEdit,
  handleFormClose,
  save,
  confirmDelete,
  doDelete,
  handleCancelDelete,
  releaseOnUnmount,
  setOnSuccess,
} = useCrud({
  tabla: "usuario",
  apiGet: (id) => usuariosApi.getResponsable(id),
  apiGetDetail: (id) => vistasApi.getResponsable(id),
  apiCreate: (data) => usuariosApi.createResponsable(data),
  apiUpdate: (id, data) => usuariosApi.updateResponsable(id, data),
  apiDelete: (id) => usuariosApi.deleteResponsable(id),
  clearErrors,
  applyFieldErrors,
});

const form = reactive({
  _id: null,
  nombre_usuario: "",
  numero_nomina: "",
  puesto: "",
  area_id: "",
  version: null,
});

function populateForm(d) {
  Object.assign(form, {
    _id: d.id_usuario,
    nombre_usuario: d.nombre_usuario,
    numero_nomina: d.numero_nomina || "",
    puesto: d.puesto || "",
    area_id: d.area_id || "",
    version: d.version,
  });
}

const {
  handleConcurrencyCancel,
  handleConcurrencyRetry,
  handleConflictReload: reloadConflict,
} = useConcurrencyHandlers({
  showConcurrencyAlert,
  showConflictModal,
  concurrencyAlert,
  items,
  idKey: "id_usuario",
  openEdit: (u) => openEdit(u),
  confirmDelete: (u) => confirmDelete(u),
  apiGet: (id) => usuariosApi.getResponsable(id),
  clearErrors,
  toast,
});

function validateForm() {
  clearErrors();
  let valid = true;
  if (!form.nombre_usuario?.trim()) {
    setError("nombre_usuario", '"Nombre completo" es obligatorio');
    valid = false;
  }
  if (!form.puesto?.trim()) {
    setError("puesto", '"Puesto" es obligatorio');
    valid = false;
  }
  if (!form.area_id) {
    setError("area_id", '"Área de adscripción" es obligatoria');
    valid = false;
  }
  if (form.numero_nomina && !/^\d+$/.test(form.numero_nomina)) {
    setError("numero_nomina", "Solo se permiten dígitos");
    valid = false;
  }
  return valid;
}

async function loadData() {
  loading.value = true;
  try {
    let params = { page: page.value, per_page: perPage };
    if (filters.search) params.search = filters.search;
    if (filters.area_id) params.area_id = filters.area_id;
    params = applySortToParams(params);
    const res = await vistasApi.listResponsables(params);
    items.value = res.data.responsables;
    setMeta(res.data);
  } catch {
    toast.error("Error al cargar los responsables");
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  crudOpenCreate(() => {
    Object.assign(form, {
      _id: null,
      nombre_usuario: "",
      numero_nomina: "",
      puesto: "",
      area_id: "",
      version: null,
    });
  });
}

async function openEdit(u) {
  await crudOpenEdit(u.id_usuario, populateForm);
}
async function openDetail(u) {
  await crudOpenDetail(u.id_usuario);
}

async function saveItem() {
  if (!validateForm()) {
    toast.warning("Revisa los campos marcados en el formulario");
    return;
  }
  const payload = {
    nombre_usuario: form.nombre_usuario,
    numero_nomina: form.numero_nomina || null,
    puesto: form.puesto || null,
    area_id: form.area_id || null,
    version: form.version,
  };
  await save(form._id, payload);
}

async function handleDoDelete() {
  await doDelete(toDelete.value.id_usuario);
}
async function handleConflictReload() {
  await reloadConflict(form._id, populateForm);
}

onBeforeUnmount(async () => {
  await releaseOnUnmount();
});
setOnSuccess(loadData);
setLoadFn(loadData);
onMounted(() => {
  loadCatalogos(["areas"]);
  loadData();
});
</script>

<style scoped>
.sorted {
  cursor: pointer;
  user-select: none;
}

.sorted:hover {
  color: var(--primary);
}
</style>
