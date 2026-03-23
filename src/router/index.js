import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    component: () => import('@/views/AppLayout.vue'),
    redirect: '/equipos',
    children: [
      { path: 'equipos',    name: 'Equipos',    component: () => import('@/views/EquiposView.vue'),    meta: { modulo: 'computo'     } },
      { path: 'mobiliario', name: 'Mobiliario', component: () => import('@/views/MobiliarioView.vue'), meta: { modulo: 'mobiliario'  } },
      { path: 'accesos',    name: 'Accesos',    component: () => import('@/views/AccesosView.vue'),    meta: { modulo: 'acceso'      } },
      { path: 'catalogos',  name: 'Catalogos',  component: () => import('@/views/CatalogosView.vue'),  meta: { modulo: 'catalogos'   } },
      { path: 'historial',  name: 'Historial',  component: () => import('@/views/HistorialView.vue'),  meta: { modulo: 'historial'   } },
      { path: 'usuarios',   name: 'Usuarios',   component: () => import('@/views/UsuariosView.vue'),   meta: { modulo: 'responsable' } },
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const MODULOS_PRIORITY = [
  { path: '/equipos',    modulo: 'computo'     },
  { path: '/mobiliario', modulo: 'mobiliario'  },
  { path: '/usuarios',   modulo: 'responsable' },
  { path: '/catalogos',  modulo: 'catalogos'   },
  { path: '/historial',  modulo: 'historial'   },
  { path: '/accesos',    modulo: 'acceso'       },
]

function primeraRutaPermitida(auth) {
  const encontrada = MODULOS_PRIORITY.find(r => auth.canDo(r.modulo, 'puede_leer'))
  return encontrada?.path ?? '/login'
}

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (to.meta.public) return

  if (!auth.isAuthenticated) return '/login'

  try {
    await auth.me()
  } catch {
    localStorage.clear()
    return '/login?session_invalidated=true'
  }

  if (to.path === '/login') return primeraRutaPermitida(auth)

  const modulo = to.meta.modulo
  if (modulo && !auth.canDo(modulo, 'puede_leer')) {
    return primeraRutaPermitida(auth)
  }
})

export default router