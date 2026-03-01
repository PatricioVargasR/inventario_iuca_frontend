<template>
  <div class="app-layout">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="navbar-inner">
        <RouterLink to="/equipos" class="nav-brand">Sistema de Inventario IUCA</RouterLink>

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

        <div class="nav-user" @click="toggleUserMenu" ref="userMenuRef">
          <div class="user-info">
            <span class="user-name">{{ authStore.user?.nombre_usuario }}</span>
            <span class="user-role">{{ authStore.user?.area }}</span>
          </div>
          <div class="user-avatar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          </div>

          <div v-if="userMenuOpen" class="user-dropdown">
            <div class="dropdown-user">
              <strong>{{ authStore.user?.nombre_usuario }}</strong>
              <span>{{ authStore.user?.correo_electronico }}</span>
            </div>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item danger" @click="handleLogout">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Page content -->
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const userMenuOpen = ref(false)
const userMenuRef = ref(null)

const navLinks = [
  { to: '/equipos', label: 'Equipos' },
  { to: '/mobiliario', label: 'Mobiliario' },
  { to: '/accesos', label: 'Accesos' },
  { to: '/catalogos', label: 'Catálogos' },
  { to: '/historial', label: 'Historial' },
  { to: '/usuarios', label: 'Usuarios' },
]

function toggleUserMenu() { userMenuOpen.value = !userMenuOpen.value }

function handleLogout() {
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
  height: var(--nav-height);
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
  height: 100%;
  display: flex;
  align-items: center;
  gap: 0;
}

.nav-brand {
  font-size: 15px;
  font-weight: 800;
  color: var(--primary);
  text-decoration: none;
  letter-spacing: -0.02em;
  white-space: nowrap;
  margin-right: 36px;
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
}
.nav-link:hover { color: var(--gray-800); background: var(--gray-100); }
.nav-link.active { color: var(--primary); font-weight: 700; background: var(--primary-light); }

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

.main-content { flex: 1; }
</style>