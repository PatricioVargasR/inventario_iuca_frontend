// ─────────────────────────────────────────────────────────────
// useCatalogosData.js
// Maneja la carga de datos, contadores por tab y paginación.
// ─────────────────────────────────────────────────────────────

import { ref, reactive } from 'vue'
import { catalogosApi } from '@/services/api'
import { useToast } from '@/composables/useToast'
import { usePagination } from '@/composables/usePagination'
import { DATA_KEY, METODO_MAP, resolveField } from '@/constants/catalogos'

export function useCatalogosData({ activeTab, search, estado, applySortToParams }) {
  const { toast } = useToast()
  const { page, total, totalPages, perPage, from, to, onSearch, onPageChange, setMeta, setLoadFn } = usePagination()

  const items = ref([])
  const loading = ref(false)

  const tabCounts = reactive({
    area: 0, tipo_activo: 0, estado: 0, tipo_mobiliario: 0,
  })

  // ── Carga principal ──────────────────────────────────────────
  async function loadTab(resetPage = false) {
    if (resetPage) page.value = 1
    loading.value = true
    try {
      const params = {
        page:     page.value,
        per_page: perPage,
        search:   search.value,
        estado:   estado.value || undefined,
      }

      // Aplica sort y traduce el campo lógico al nombre real de columna
      applySortToParams(params)
      if (params.sort_by) {
        params.sort_by = resolveField(params.sort_by, activeTab.value)
      }

      const tab = activeTab.value
      const res = await catalogosApi[METODO_MAP[tab].getAll](params)

      items.value = res.data[DATA_KEY[tab]] || []
      setMeta(res.data)

      if (!search.value) {
        tabCounts[tab] = res.data.total || 0
      }
    } catch {
      toast.error('Error al cargar los datos')
      items.value = []
    } finally {
      loading.value = false
    }
  }

  // ── Contadores de todos los tabs ─────────────────────────────
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
    } catch {
      toast.error('No se pudieron cargar los contadores')
    }
  }

  setLoadFn(loadTab)

  return {
    // datos
    items,
    loading,
    tabCounts,
    // paginación
    page,
    total,
    totalPages,
    perPage,
    from,
    to,
    onSearch,
    onPageChange,
    // acciones
    loadTab,
    loadAllCounts,
  }
}