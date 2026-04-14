import { ref, reactive, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { acquireLock, releaseLock } from '@/services/concurrency'

export function useCrud({ tabla, apiGet, apiGetDetail, apiCreate, apiUpdate, apiDelete, onSuccess, clearErrors, applyFieldErrors }) {
  const authStore = useAuthStore()
  const { toast } = useToast()

  const showForm = ref(false)
  const showConfirm = ref(false)
  const showConcurrencyAlert = ref(false)
  const showConflictModal = ref(false)
  const showDetail = ref(false)
  const editMode = ref(false)
  const saving = ref(false)
  const deleting = ref(false)
  const toDelete = ref(null)
  const pendingDelete = ref(null)  // ahora es { bloqueo, id }
  const currentLock = ref(null)    // contiene registro_id del backend
  const lockWarning = ref(null)
  const selected = ref(null)
  const concurrencyAlert = reactive({
    title: '', message: '', lockInfo: null, showRetry: false
  })

  let _onSuccess = onSuccess
  function setOnSuccess(fn) { _onSuccess = fn }

  // ── Liberación de locks ────────────────────────────────────────
  async function _releaseLock(lock) {
    if (!lock) return
    try {
      await releaseLock(tabla, lock.registro_id)
    } catch {}
  }

  // Libera TODOS los locks activos (edición + eliminación)
  async function _releaseAllLocks() {
    if (currentLock.value) {
      await _releaseLock(currentLock.value)
      currentLock.value = null
    }

    if (pendingDelete.value) {
      await _releaseLock(pendingDelete.value.bloqueo)
      pendingDelete.value = null
      toDelete.value = null
    }
  }


  // ── Watcher form ───────────────────────────────────────────────
  watch(showForm, async (isOpen) => {
    if (!isOpen) {
      await _releaseAllLocks()
      lockWarning.value = null
      clearErrors?.()
    }
  })

  // ── Watcher confirm ────────────────────────────────────────────
  watch(showConfirm, async (isOpen) => {
    if (!isOpen) {
      await _releaseAllLocks()
    }
  })


  // ── openCreate ────────────────────────────────────────────────
  async function openCreate(resetForm) {
    editMode.value = false
    lockWarning.value = null
    clearErrors?.()
    resetForm?.()
    showForm.value = true
  }

  // ── openDetail ────────────────────────────────────────────────
  async function openDetail(id) {
    const getter = apiGetDetail ?? apiGet
    try {
      const res = await getter(id)
      selected.value = res.data
      showDetail.value = true
    } catch {
      toast.error('No se pudo cargar el detalle')
    }
  }

  // ── openEdit ──────────────────────────────────────────────────
  async function openEdit(id, populate) {
    editMode.value = true
    lockWarning.value = null
    clearErrors?.()

    const lockResult = await acquireLock(tabla, id, 10, 'edicion')
    if (!lockResult.success) {
      editMode.value = false
      if (lockResult.locked) {
        concurrencyAlert.title = 'Registro en Uso'
        concurrencyAlert.message = lockResult.lockInfo.tipo_bloqueo === 'edicion'
          ? `${lockResult.lockInfo.nombre_usuario} está editando este registro`
          : `No puedes editar porque ${lockResult.lockInfo.nombre_usuario} lo está eliminando`
        concurrencyAlert.lockInfo = lockResult.lockInfo
        concurrencyAlert.showRetry = true
        showConcurrencyAlert.value = true
      } else {
        toast.error(lockResult.error || 'Error al adquirir bloqueo')
      }
      return false
    }

    currentLock.value = lockResult.bloqueo  // contiene registro_id
    try {
      const res = await apiGet(id)
      const d = res.data
      if (d.editado_por && d.editado_por !== authStore.user?.id_acceso) {
        lockWarning.value = `${d.nombre_editor} estaba editando este registro`
      }
      populate(d)
      showForm.value = true
      return true
    } catch {
      toast.error('No se pudieron cargar los datos')
      await _releaseAllLocks()
      return false
    }
  }

  // ── handleFormClose ───────────────────────────────────────────
  async function handleFormClose(_, shouldClose = true) {
    await _releaseAllLocks()
    lockWarning.value = null

    if (shouldClose) {
      showForm.value = false
    }
  }


  // ── save ──────────────────────────────────────────────────────
  async function save(id, payload) {
    saving.value = true
    try {
      if (editMode.value) {
        await apiUpdate(id, payload)
        toast.success('Registro actualizado correctamente', 'Actualización exitosa')
      } else {
        await apiCreate(payload)
        toast.success('Elemento creado correctamente', 'Registro exitoso')
      }
      await handleFormClose(id, true)
      _onSuccess?.()
      return true
    } catch (e) {
      const errorData = e.response?.data
      if (errorData?.error === 'conflict') {
        showConflictModal.value = true
        return false
      }
      if (errorData?.campos) {
        applyFieldErrors?.(errorData.campos)
        toast.warning(errorData.error || 'Revisa los campos del formulario')
      } else {
        toast.fromError(errorData)
      }
      return false
    } finally {
      saving.value = false
    }
  }

  // ── confirmDelete ─────────────────────────────────────────────
  async function confirmDelete(id, item) {
    const lockResult = await acquireLock(tabla, id, 2, 'eliminacion')
    if (!lockResult.success) {
      if (lockResult.locked) {
        concurrencyAlert.title = 'No se puede eliminar'
        concurrencyAlert.message = lockResult.lockInfo.tipo_bloqueo === 'edicion'
          ? `No puedes eliminar porque ${lockResult.lockInfo.nombre_usuario} lo está editando`
          : `${lockResult.lockInfo.nombre_usuario} ya está eliminando este registro`
        concurrencyAlert.lockInfo = lockResult.lockInfo
        concurrencyAlert.showRetry = true
        showConcurrencyAlert.value = true
      } else {
        toast.error(lockResult.error || 'Error al adquirir bloqueo')
      }
      return false
    }
    pendingDelete.value = { bloqueo: lockResult.bloqueo, id }
    toDelete.value = item
    showConfirm.value = true
    return true
  }

  // ── doDelete ──────────────────────────────────────────────────
  async function doDelete(id) {
    deleting.value = true
    try {
      await apiDelete(id)

      // liberar lock correcto (el de eliminación)
      await _releaseLock(pendingDelete.value?.bloqueo)

      pendingDelete.value = null
      toDelete.value = null

      toast.success('Registro eliminado', 'Eliminado')
      showConfirm.value = false
      _onSuccess?.()
    } catch (e) {
      toast.fromError(e.response?.data)
    } finally {
      deleting.value = false
    }
  }

  // ── handleCancelDelete — el watcher hace el trabajo ──────────
  async function handleCancelDelete() {
    showConfirm.value = false  // dispara el watcher
  }

  // ── releaseOnUnmount ──────────────────────────────────────────
  async function releaseOnUnmount() {
    await _releaseAllLocks()
  }

  return {
    showForm, showConfirm, showConcurrencyAlert, showConflictModal,
    showDetail, selected,
    editMode, saving, deleting, toDelete, currentLock, lockWarning,
    concurrencyAlert,
    openCreate, openDetail, openEdit,
    handleFormClose, save,
    confirmDelete, doDelete, handleCancelDelete,
    releaseOnUnmount,
    setOnSuccess
  }
}