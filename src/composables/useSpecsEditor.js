import { ref } from 'vue'
import { nextTick } from 'vue'

export function useSpecsEditor(form, specErrors, specSuggestions) {
  const activeSuggestionIndex = ref(null)

  function openSuggestions(i) { activeSuggestionIndex.value = i }

  function closeSuggestions() {
    setTimeout(() => { activeSuggestionIndex.value = null }, 150)
  }

  function applySuggestion(i, sugerencia) {
    form.especificaciones[i].nombre_especificacion = sugerencia.nombre
    form.especificaciones[i]._placeholder = sugerencia.placeholder
    activeSuggestionIndex.value = null
    nextTick(() => {
      const inputs = document.querySelectorAll(`.spec-row-${i} .spec-value-input`)
      if (inputs[0]) inputs[0].focus()
    })
  }

  function filteredSuggestions(i) {
    const texto = (form.especificaciones[i].nombre_especificacion || '').toLowerCase()
    return specSuggestions.value.filter(s => s.nombre.toLowerCase().includes(texto))
  }

  function addSpec() {
    form.especificaciones.push({ nombre_especificacion: '', valor_especificacion: '' })
  }

  function removeSpec(i) {
    form.especificaciones.splice(i, 1)
    delete specErrors[i]
  }

  return {
    activeSuggestionIndex,
    openSuggestions,
    closeSuggestions,
    applySuggestion,
    filteredSuggestions,
    addSpec,
    removeSpec
  }
}