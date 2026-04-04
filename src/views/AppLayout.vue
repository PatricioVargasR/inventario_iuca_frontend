<template>
  <div class="app-layout">
    <nav class="navbar">
      <div class="navbar-inner">
        <RouterLink :to="primeraRuta" class="nav-brand">
          Sistema de inventario IUCA
        </RouterLink>

        <!-- Desktop links -->
        <div class="nav-links">
          <RouterLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="nav-link"
            :class="{ active: route.path.startsWith(link.to) }"
          >
            {{ link.label }}
          </RouterLink>
        </div>

        <div class="nav-right">
          <!-- Desktop user menu -->
          <div class="nav-user" @click="toggleUserMenu" ref="userMenuRef">
            <div class="user-info">
              <span class="user-name">{{ authStore.user?.nombre_usuario }}</span>
              <span class="user-role">{{ authStore.user?.area }}</span>
            </div>
            <div class="user-avatar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </div>

            <div v-if="userMenuOpen" class="user-dropdown">
              <div class="dropdown-user">
                <strong>{{ authStore.user?.nombre_usuario }}</strong>
                <span>{{ authStore.user?.correo_electronico }}</span>
              </div>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item danger" @click="handleLogout">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" x2="9" y1="12" y2="12"/>
                </svg>
                Cerrar sesión
              </button>
            </div>
          </div>

          <!-- Hamburger button (mobile only) -->
          <button class="hamburger" @click="toggleMobileMenu" :class="{ open: mobileMenuOpen }">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <Transition name="mobile-menu">
        <div v-if="mobileMenuOpen" class="mobile-menu">
          <div class="mobile-links">
            <RouterLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="mobile-link"
              :class="{ active: route.path.startsWith(link.to) }"
              @click="mobileMenuOpen = false"
            >
              {{ link.label }}
            </RouterLink>
          </div>

          <div class="mobile-user">
            <div class="mobile-user-info">
              <div class="user-avatar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </div>
              <div>
                <strong>{{ authStore.user?.nombre_usuario }}</strong>
                <span>{{ authStore.user?.correo_electronico }}</span>
              </div>
            </div>
            <button class="mobile-logout" @click="handleLogout">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" x2="9" y1="12" y2="12"/>
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      </Transition>
    </nav>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { primeraRutaPermitida } from '@/router'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const userMenuOpen = ref(false)
const mobileMenuOpen = ref(false)
const userMenuRef = ref(null)

const TODAS_LAS_RUTAS = [
  { to: '/accesos',    label: 'Accesos',      modulo: 'acceso'      },
  { to: '/catalogos',  label: 'Catálogos',    modulo: 'catalogos'   },
  { to: '/equipos',    label: 'Equipos',      modulo: 'computo'     },
  { to: '/historial',  label: 'Historial',    modulo: 'historial'   },
  { to: '/mobiliario', label: 'Mobiliario',   modulo: 'mobiliario'  },
  { to: '/usuarios',   label: 'Responsables', modulo: 'responsable' },
]

const navLinks = computed(() =>
  TODAS_LAS_RUTAS.filter(link => authStore.canDo(link.modulo, 'puede_leer'))
)

const primeraRuta = computed(() => navLinks.value[0]?.to ?? '/login')

function toggleUserMenu() { userMenuOpen.value = !userMenuOpen.value }
function toggleMobileMenu() { mobileMenuOpen.value = !mobileMenuOpen.value }

function handleLogout() {
  mobileMenuOpen.value = false
  authStore.logout()
  router.push('/login')
}

function onClickOutside(e) {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target)) {
    userMenuOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
.app-layout { min-height: 100vh; display: flex; flex-direction: column; }

.navbar {
  background: white;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.navbar-inner {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 24px;
  height: var(--nav-height);
  display: flex;
  align-items: center;
  gap: 0;
  /* Transición suave al cambiar tamaño */
  transition: max-width 0.2s ease;
}

.nav-brand {
  font-size: 15px;
  font-weight: 800;
  color: var(--primary);
  text-decoration: none;
  letter-spacing: -0.02em;
  white-space: nowrap;
  margin-right: 36px;
  flex-shrink: 0;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.nav-link {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--gray-500);
  text-decoration: none;
  transition: all 0.15s;
  white-space: nowrap;
}
.nav-link:hover { color: var(--gray-800); background: var(--gray-100); }
.nav-link.active { color: var(--primary); font-weight: 700; background: var(--primary-light); }

.nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

/* ── User menu (desktop) ── */
.nav-user {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 10px;
  transition: background 0.15s;
  position: relative;
  user-select: none;
}
.nav-user:hover { background: var(--gray-100); }

.user-info { text-align: right; }
.user-name { display: block; font-size: 13px; font-weight: 700; color: var(--gray-800); }
.user-role { display: block; font-size: 11px; color: var(--gray-500); }

.user-avatar {
  width: 34px; height: 34px;
  background: var(--primary-light);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--primary);
  flex-shrink: 0;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border-radius: 12px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  min-width: 200px;
  overflow: hidden;
  z-index: 200;
  animation: slideUp 0.15s ease;
}

.dropdown-user {
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.dropdown-user strong { font-size: 13.5px; color: var(--gray-800); }
.dropdown-user span { font-size: 12px; color: var(--gray-500); }

.dropdown-divider { height: 1px; background: var(--gray-100); }

.dropdown-item {
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-body);
  font-size: 13.5px;
  font-weight: 500;
  color: var(--gray-700);
  transition: background 0.12s;
  text-align: left;
}
.dropdown-item:hover { background: var(--gray-50); }
.dropdown-item.danger { color: var(--danger); }
.dropdown-item.danger:hover { background: var(--danger-light); }

/* ── Hamburger ── */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 36px;
  height: 36px;
  padding: 6px;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.15s;
}
.hamburger:hover { background: var(--gray-100); }
.hamburger span {
  display: block;
  height: 2px;
  width: 100%;
  background: var(--gray-700);
  border-radius: 2px;
  transition: all 0.2s ease;
  transform-origin: center;
}
.hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
.hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* ── Mobile menu ── */
.mobile-menu {
  border-top: 1px solid var(--border);
  background: white;
  padding: 12px 16px 20px;
}

.mobile-links {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 16px;
}

.mobile-link {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--gray-600);
  text-decoration: none;
  transition: all 0.15s;
}
.mobile-link:hover { background: var(--gray-50); color: var(--gray-800); }
.mobile-link.active { background: var(--primary-light); color: var(--primary); font-weight: 700; }

.mobile-user {
  border-top: 1px solid var(--border);
  padding-top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.mobile-user-info strong { display: block; font-size: 13px; color: var(--gray-800); }
.mobile-user-info span { display: block; font-size: 11px; color: var(--gray-500); }

.mobile-logout {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--danger-light);
  color: var(--danger);
  border: none;
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
  flex-shrink: 0;
}
.mobile-logout:hover { background: #fecaca; }

/* ── Transición mobile menu ── */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  max-height: 0;
}
.mobile-menu-enter-to,
.mobile-menu-leave-from {
  opacity: 1;
  max-height: 400px;
}

.main-content { flex: 1; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .nav-links { display: none; }
  .nav-user { display: none; }
  .hamburger { display: flex; }

  .nav-brand {
    font-size: 13px;
    margin-right: 0;
  }
}

@media (min-width: 769px) {
  .hamburger { display: none; }
  .mobile-menu { display: none; }
}
</style>