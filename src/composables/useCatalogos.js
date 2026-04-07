import { reactive } from 'vue'
import { catalogosApi, usuariosApi } from '@/services/api'
import { useToast } from '@/composables/useToast'

export function useCatalogos() {
  const { toast } = useToast()

  const catalogos = reactive({
    areas:      [],
    estados:    [],
    tipos:      [],    // tipos de activo o mobiliario según contexto
    usuarios:   [],
    accesos:    [],
  })

  async function loadAreas() {
    try {
      const res = await catalogosApi.getAreasCompleto()
      catalogos.areas = res.data
    } catch {
      toast.error('No se pudieron cargar las áreas')
    }
  }

  async function loadEstados() {
    try {
      const res = await catalogosApi.getEstadosCompleto()
      catalogos.estados = res.data
    } catch {
      toast.error('No se pudieron cargar los estados')
    }
  }

  async function loadTiposActivo() {
    try {
      const res = await catalogosApi.getTiposActivoCompleto()
      catalogos.tipos = res.data
    } catch {
      toast.error('No se pudieron cargar los tipos de activo')
    }
  }

  async function loadTiposMobiliario() {
    try {
      const res = await catalogosApi.getMobiliarioCompleto()
      catalogos.tipos = res.data
    } catch {
      toast.error('No se pudieron cargar los tipos de mobiliario')
    }
  }

  async function loadUsuarios() {
    try {
      const res = await usuariosApi.listResponsables()
      catalogos.usuarios = res.data
    } catch {
      toast.error('No se pudieron cargar los responsables')
    }
  }

  async function loadAccesos() {
    try {
      const res = await usuariosApi.listAccesosFiltro()
      catalogos.accesos = res.data
    } catch {
      toast.error('No se puedieron cargar los accesos')
    }
  }

  // Carga múltiple en paralelo según lo que el módulo necesite
  async function loadCatalogos(needed = []) {
    const loaders = {
      areas:           loadAreas,
      estados:         loadEstados,
      tiposActivo:     loadTiposActivo,
      tiposMobiliario: loadTiposMobiliario,
      usuarios:        loadUsuarios,
      accesos:         loadAccesos,
    }

    const promises = needed
      .filter(key => loaders[key])
      .map(key => loaders[key]())

    await Promise.all(promises)
  }

  return {
    catalogos,
    loadCatalogos,
    loadAreas,
    loadEstados,
    loadTiposActivo,
    loadTiposMobiliario,
    loadUsuarios,
    loadAccesos
  }
}