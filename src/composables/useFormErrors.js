import { reactive } from 'vue'

export function useFormErrors() {
  const formErrors = reactive({})

  function clearErrors() {
    Object.keys(formErrors).forEach(k => delete formErrors[k])
  }

  function applyFieldErrors(campos) {
    if (!campos) return
    Object.entries(campos).forEach(([campo, mensaje]) => {
      formErrors[campo] = mensaje
    })
  }

  function setError(campo, mensaje) {
    formErrors[campo] = mensaje
  }

  return { formErrors, clearErrors, applyFieldErrors, setError }
}