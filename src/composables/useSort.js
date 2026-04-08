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

    function getSortIcon(field) {
    if (sort.field !== field) return '↕'
    return sort.direction === 'asc' ? '↑' : '↓'
    }


  function applySortToParams(params) {
    if (sort.field) {
      params.sort_by = sort.field
      params.sort_dir = sort.direction
    }
    return params
  }

    function resetSort() {
        sort.field = ''
        sort.direction = ''
    }

  watch(sort, () => {
    onChange?.()
  }, { deep: true })

  return {
    sort,
    toggleSort,
    getSortIcon,
    applySortToParams

  }
}
