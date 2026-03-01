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
      { path: 'equipos', name: 'Equipos', component: () => import('@/views/EquiposView.vue') },
      { path: 'mobiliario', name: 'Mobiliario', component: () => import('@/views/MobiliarioView.vue') },
      { path: 'accesos', name: 'Accesos', component: () => import('@/views/AccesosView.vue') },
      { path: 'catalogos', name: 'Catalogos', component: () => import('@/views/CatalogosView.vue') },
      { path: 'historial', name: 'Historial', component: () => import('@/views/HistorialView.vue') },
      { path: 'usuarios', name: 'Usuarios', component: () => import('@/views/UsuariosView.vue') },
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isAuthenticated) {
    return '/login'
  }
  if (to.path === '/login' && auth.isAuthenticated) {
    return '/equipos'
  }
})

export default router