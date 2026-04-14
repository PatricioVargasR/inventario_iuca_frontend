// ─────────────────────────────────────────────────────────────
// useCatalogosForm.js
// Maneja el formulario, validación, CRUD y concurrencia.
// ─────────────────────────────────────────────────────────────

import { ref, reactive, watch } from 'vue'   // ← agregado watch
import { catalogosApi } from '@/services/api'
import { acquireLock, releaseLock } from '@/services/concurrency'
import { useToast } from '@/composables/useToast'
import { useFormErrors } from '@/composables/useFormErrors'
import { TABLA_MAP, METODO_MAP, NOMBRE_FIELD, getItemId, getItemNombre, capitalize } from '@/constants/catalogos'

export function useCatalogosForm({ activeTab, tabActual, tipoActual, onSaved, onDeleted }) {
  const { toast } = useToast()
  const { formErrors, clearErrors, applyFieldErrors, setError } = useFormErrors()

  // ── Visibilidad de modales ───────────────────────────────────
  const showForm             = ref(false)
  const showDetail           = ref(false)
  const showConfirm          = ref(false)
  const showConcurrencyAlert = ref(false)

  // ── Estado interno ───────────────────────────────────────────
  const selected      = ref(null)
  const toDelete      = ref(null)
  const editMode      = ref(false)
  const saving        = ref(false)
  const deleting      = ref(false)
  const formTab       = ref('area')
  const pendingDelete = ref(null)
  const currentLock   = ref(null)

  const concurrencyAlert = reactive({
    title: '', message: '', lockInfo: null, showRetry: false,
  })

  const form = reactive({
    nombre: '', descripcion: '', estado_catalogo: 'activo', color_hex: '', version: null, _id: null,
  })

  // ── Watcher: liberar bloqueo de eliminación si el ConfirmDialog
  //    se cierra por cualquier vía (botón X, click fuera, cancelar) ──
  watch(showConfirm, async (isOpen) => {
    if (!isOpen && pendingDelete.value) {
      await releaseLock(pendingDelete.value.tabla, pendingDelete.value.id)
      pendingDelete.value = null
      toDelete.value = null
    }
  })

  // ── Validación ───────────────────────────────────────────────
  function validateForm() {
    clearErrors()
    let valid = true
    const tipo = editMode.value ? activeTab.value : formTab.value

    if (!form.nombre?.trim()) {
      setError('nombre', '"Nombre" es obligatorio')
      valid = false
    } else {
      const maxLen = (tipo === 'tipo_activo' || tipo === 'tipo_mobiliario') ? 30 : 50
      if (form.nombre.trim().length > maxLen) {
        setError('nombre', `"Nombre" no puede superar ${maxLen} caracteres`)
        valid = false
      }
    }

    if (tipo === 'estado') {
      if (!form.color_hex?.trim()) {
        setError('color_hex', '"Color" es obligatorio para los estados')
        valid = false
      } else if (!/^#[0-9A-Fa-f]{6}$/.test(form.color_hex)) {
        setError('color_hex', 'El color debe tener formato HEX válido (Ej: #FF5733)')
        valid = false
      }
    }

    return valid
  }

  // ── Helpers de lock ──────────────────────────────────────────
  async function tryAcquireLock(tab, id, ttl, tipo) {
    const result = await acquireLock(TABLA_MAP[tab], id, ttl, tipo)
    if (!result.success && result.locked) {
      const esEdicion = result.lockInfo.tipo_bloqueo === 'edicion'
      concurrencyAlert.title     = tipo === 'eliminacion' ? 'No se puede eliminar' : 'Registro en uso'
      concurrencyAlert.message   = tipo === 'eliminacion'
        ? (esEdicion ? `No puedes eliminar porque ${result.lockInfo.nombre_usuario} lo está editando`
                     : `${result.lockInfo.nombre_usuario} ya está eliminando este registro`)
        : (esEdicion ? `${result.lockInfo.nombre_usuario} está editando este registro`
                     : `No puedes editar porque ${result.lockInfo.nombre_usuario} lo está eliminando`)
      concurrencyAlert.lockInfo  = result.lockInfo
      concurrencyAlert.showRetry = true
      showConcurrencyAlert.value = true
    } else if (!result.success) {
      toast.error(result.error || 'Error al adquirir bloqueo')
    }
    return result.success
  }

  // ── Abrir / cerrar formulario ────────────────────────────────
  function openCreate() {
    editMode.value = false
    formTab.value  = activeTab.value
    clearErrors()
    Object.assign(form, { nombre: '', descripcion: '', estado_catalogo: 'activo', color_hex: '', version: null, _id: null })
    showForm.value = true
  }

  async function openEdit(tab, item) {
    const id = getItemId(item)
    const ok = await tryAcquireLock(tab, id, 10, 'edicion')
    if (!ok) return

    currentLock.value = { tabla: TABLA_MAP[tab], id }
    editMode.value    = true
    clearErrors()

    try {
      const res = await catalogosApi[METODO_MAP[tab].getOne](id)
      const d   = res.data
      Object.assign(form, {
        nombre:          d.nombre_area ?? d.nombre_tipo ?? d.nombre_estado ?? '',
        descripcion:     d.descripcion || '',
        estado_catalogo: d.activo ? 'activo' : 'inactivo',
        color_hex:       d.color_hex || '',
        version:         d.version ?? null,
        _id:             id,
      })
      showForm.value = true
    } catch {
      toast.error('No se pudieron cargar los datos del registro')
      await releaseLock(TABLA_MAP[tab], id)
      currentLock.value = null
    }
  }

  async function openDetail(tab, item) {
    try {
      const res = await catalogosApi[METODO_MAP[tab].getOne](getItemId(item))
      selected.value = res.data
    } catch {
      selected.value = item
    }
    showDetail.value = true
  }

  async function handleFormClose(shouldClose = true) {
    if (currentLock.value && editMode.value) {
      await releaseLock(currentLock.value.tabla, currentLock.value.id)
      currentLock.value = null
    }
    if (shouldClose) {
      showForm.value = false
      clearErrors()
    }
  }

  // ── Guardar ──────────────────────────────────────────────────
  async function saveItem() {
    if (!validateForm()) {
      toast.warning('Revisa los campos marcados en el formulario')
      return
    }

    const tipo = editMode.value ? activeTab.value : formTab.value
    saving.value = true

    const payload = {
      [NOMBRE_FIELD[tipo]]: form.nombre.trim(),
      descripcion:          form.descripcion,
      activo:               form.estado_catalogo === 'activo',
      ...(form.version != null && { version: form.version }),
      ...(tipo === 'estado' && { color_hex: form.color_hex }),
    }

    try {
      if (editMode.value) {
        await catalogosApi[METODO_MAP[tipo].update](form._id, payload)
        toast.success(`${capitalize(tabActual.value.labelSingular)} actualizado correctamente`, 'Actualización exitosa')
      } else {
        await catalogosApi[METODO_MAP[tipo].create](payload)
        toast.success(`${capitalize(tipoActual.value.labelSingular)} creado correctamente`, 'Registro exitoso')
      }
      await handleFormClose(true)
      onSaved?.()
    } catch (e) {
      const errorData = e.response?.data
      if (errorData?.error === 'conflict') {
        toast.warning('El registro fue modificado por otro usuario. Recarga e intenta de nuevo.')
      } else if (errorData?.campos) {
        applyFieldErrors(errorData.campos)
        toast.warning(errorData.error || 'Revisa los campos del formulario')
      } else {
        toast.fromError(errorData)
      }
    } finally {
      saving.value = false
    }
  }

  // ── Eliminar ─────────────────────────────────────────────────
  async function confirmDelete(tab, item) {
    const id = getItemId(item)
    const ok = await tryAcquireLock(tab, id, 2, 'eliminacion')
    if (!ok) return

    // Guardar con tabla y id para que el watcher pueda liberar si el modal se cierra
    pendingDelete.value = { tabla: TABLA_MAP[tab], id }
    toDelete.value      = { ...item, nombre: getItemNombre(item) }
    showConfirm.value   = true
  }

  async function doDelete() {
    deleting.value = true
    try {
      const id = getItemId(toDelete.value)
      await catalogosApi[METODO_MAP[activeTab.value].delete](id)

      // El watcher se encargará de liberar pendingDelete cuando showConfirm → false,
      // pero como aquí ya eliminamos el registro (y el bloqueo en el backend también
      // se borra en cascada), simplemente limpiamos el estado local.
      pendingDelete.value = null

      toast.success(`"${toDelete.value.nombre}" fue eliminado`, 'Eliminado')
      showConfirm.value = false   // watcher dispara, pendingDelete ya es null → no intenta liberar
      toDelete.value    = null
      onDeleted?.()
    } catch (e) {
      toast.fromError(e.response?.data)
    } finally {
      deleting.value = false
    }
  }

  // Ya no es necesario liberar manualmente aquí: el watcher lo hace.
  async function handleCancelDelete() {
    showConfirm.value = false  // dispara el watcher → libera pendingDelete
  }

  // ── Concurrencia ─────────────────────────────────────────────
  function handleConcurrencyCancel() {
    showConcurrencyAlert.value = false
    // Si había un pendingDelete que se intentó y falló (bloqueo ajeno),
    // no hay nada que liberar — tryAcquireLock falló antes de crear el bloqueo.
    // Limpiar toDelete por si quedó algo parcial.
    if (pendingDelete.value) {
      pendingDelete.value = null
      toDelete.value = null
    }
  }

  async function handleConcurrencyRetry(items) {
    showConcurrencyAlert.value = false
    setTimeout(() => {
      const registroId = concurrencyAlert.lockInfo?.registro_id
      const item = items.find(i => getItemId(i) === registroId)
      if (!item) return
      if (concurrencyAlert.title === 'No se puede eliminar') confirmDelete(activeTab.value, item)
      else openEdit(activeTab.value, item)
    }, 1000)
  }

  // ── Liberar lock al desmontar ────────────────────────────────
  async function releasCurrentLock() {
    if (currentLock.value) {
      await releaseLock(currentLock.value.tabla, currentLock.value.id)
    }
    // También liberar pendingDelete si quedó colgado
    if (pendingDelete.value) {
      await releaseLock(pendingDelete.value.tabla, pendingDelete.value.id)
      pendingDelete.value = null
    }
  }

  return {
    // estado de modales
    showForm, showDetail, showConfirm, showConcurrencyAlert,
    // datos de formulario
    form, formTab, formErrors, editMode, saving, deleting,
    // datos de detalle / confirmación
    selected, toDelete, concurrencyAlert,
    // acciones
    openCreate, openEdit, openDetail, handleFormClose,
    saveItem, confirmDelete, doDelete, handleCancelDelete,
    handleConcurrencyCancel, handleConcurrencyRetry,
    releasCurrentLock, clearErrors,
  }
}