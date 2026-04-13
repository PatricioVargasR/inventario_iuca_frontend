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
   * Devuelve la clase CSS para el .sort-icon según el campo activo y dirección.
   *   ''     → neutro (ambas flechas tenues)
   *   'asc'  → flecha arriba activa
   *   'desc' → flecha abajo activa
   */
  function getSortClass(field) {
    if (sort.field !== field) return ''
    return sort.direction
  }

  /**
   * Agrega sort_by y sort_dir al objeto de params si hay un campo activo.
   * El llamador es responsable de traducir sort_by al nombre real de columna
   * antes de enviarlo al backend (ver SORT_FIELD_MAP en el componente).
   */
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