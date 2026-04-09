import { ref, computed } from 'vue'

export function usePagination({ perPage = 20 } = {}) {
  const page       = ref(1)
  const total      = ref(0)
  const totalPages = ref(1)
  let searchTimeout = null
  let _loadFn = null

  const from = computed(() => {
    if (total.value === 0) return 0
    return (page.value - 1) * perPage + 1
  })

  const to = computed(() => {
    if (total.value === 0) return 0
    return Math.min(page.value * perPage, total.value)
  })

  function setLoadFn(fn) { _loadFn = fn }

  function onSearch() {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => { page.value = 1; _loadFn?.() }, 400)
  }

  function onPageChange(p) {
    page.value = p
    _loadFn?.()
  }

  function setMeta(data) {
    total.value = data.total || 0
    totalPages.value = data.pages || 1
  }

  return { page, total, totalPages, perPage, from, to, onSearch, onPageChange, setMeta, setLoadFn }
}