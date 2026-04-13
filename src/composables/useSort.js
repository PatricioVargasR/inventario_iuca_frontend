import { watch, reactive } from 'vue'

export function useSort({ onChange } = {}) {
  const sort = reactive({
    field: '',
    direction: ''
  })

  function toggleSort(field) {
    if (sort.field === field) {
      sort.direction = sort.direction === 'asc' ? 'desc' : 'asc'
    } else {
      sort.field = field
      sort.direction = 'asc'
    }
  }

  /**
   * Devuelve la clase CSS que debe aplicarse al .sort-icon
   * según si el campo está activo y en qué dirección.
   *   ''     → neutro (ambas flechas tenues)
   *   'asc'  → flecha arriba activa
   *   'desc' → flecha abajo activa
   */
  function getSortClass(field) {
    if (sort.field !== field) return ''
    return sort.direction  // 'asc' | 'desc'
  }

  function applySortToParams(params) {
    if (sort.field) {
      params.sort_by  = sort.field
      params.sort_dir = sort.direction
    }
    return params
  }

  function resetSort() {
    sort.field     = ''
    sort.direction = ''
  }

  watch(sort, () => {
    onChange?.()
  }, { deep: true })

  return {
    sort,
    toggleSort,
    getSortClass,
    applySortToParams,
    resetSort
  }
}