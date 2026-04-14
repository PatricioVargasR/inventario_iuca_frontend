export function useConcurrencyHandlers({
  showConcurrencyAlert,
  showConflictModal,
  concurrencyAlert,
  items,
  idKey,
  openEdit,
  confirmDelete,
  apiGet,
  clearErrors,
  toast
}) {

  function handleConcurrencyCancel() {
    showConcurrencyAlert.value = false
  }

  async function handleConcurrencyRetry() {
    showConcurrencyAlert.value = false
    setTimeout(() => {
      const registroId = concurrencyAlert.lockInfo?.registro_id
      const item = items.value.find(i => i[idKey] === registroId)
      if (!item) return
      if (concurrencyAlert.title === 'No se puede eliminar') confirmDelete(item)
      else openEdit(item)
    }, 1000)
  }

  async function handleConflictReload(id, populate) {
    if (!id) {
      toast.error('No se pudo recargar el registro')
      return
    }
    try {
      const res = await apiGet(id)
      showConflictModal.value = false
      populate(res.data)
      clearErrors()
      toast.info('Datos recargados. Verifica los cambios antes de guardar.')
    } catch {
      toast.error('No se pudieron recargar los datos')
    }
  }

  return {
    handleConcurrencyCancel,
    handleConcurrencyRetry,
    handleConflictReload
  }
}