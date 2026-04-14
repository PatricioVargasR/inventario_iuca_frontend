<template>
  <div class="resp-filter" ref="wrapperRef">
    <label class="filter-label-text">{{ label }}</label>

    <!-- Trigger button -->
    <button type="button" class="resp-filter-trigger" :class="{ active: modelValue.length > 0, open: isOpen }"
      @click="isOpen = !isOpen">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
      <span v-if="modelValue.length === 0">{{ placeholder }}</span>
      <span v-else-if="modelValue.length === 1">{{ getNombre(modelValue[0]) }}</span>
      <span v-else>{{ modelValue.length }} responsables</span>
      <svg class="chevron" :class="{ rotated: isOpen }" width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>

    <!-- Badge de seleccionados -->
    <div v-if="modelValue.length > 0" class="active-tags">
      <span v-for="id in modelValue" :key="id" class="active-tag">
        {{ getNombre(id) }}
        <button type="button" @click.stop="remove(id)">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </span>
      <button type="button" class="clear-all" @click.stop="clearAll">Limpiar</button>
    </div>

    <!-- Dropdown -->
    <Transition name="dropdown">
      <div v-if="isOpen" class="resp-filter-dropdown">
        <div class="dropdown-search">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input ref="searchRef" v-model="search" class="dropdown-search-input" placeholder="Buscar..."
            @keydown.escape="isOpen = false" />
        </div>
        <div class="dropdown-options">
          <label v-for="u in filtered" :key="u.id_usuario" class="dropdown-option"
            :class="{ checked: modelValue.includes(u.id_usuario) }">
            <input type="checkbox" :checked="modelValue.includes(u.id_usuario)" @change="toggle(u.id_usuario)" />
            <div class="option-avatar">{{ initials(u.nombre_usuario) }}</div>
            <div class="option-info">
              <span class="option-name">{{ u.nombre_usuario }}</span>
              <span v-if="u.puesto" class="option-puesto">{{ u.puesto }}</span>
            </div>
            <svg v-if="modelValue.includes(u.id_usuario)" class="option-check" width="13" height="13"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </label>
          <div v-if="filtered.length === 0" class="dropdown-no-results">
            Sin resultados
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  usuarios: { type: Array, default: () => [] },
  label: { type: String, default: 'Responsable' },
  placeholder: { type: String, default: 'Todos los responsables' }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const search = ref('')
const wrapperRef = ref(null)
const searchRef = ref(null)

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return props.usuarios
  return props.usuarios.filter(u =>
    u.nombre_usuario.toLowerCase().includes(q) ||
    (u.puesto || '').toLowerCase().includes(q)
  )
})

function getNombre(id) {
  const u = props.usuarios.find(u => u.id_usuario === id)
  return u ? u.nombre_usuario : `#${id}`
}

function initials(name) {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function toggle(id) {
  const current = [...props.modelValue]
  const idx = current.indexOf(id)
  if (idx === -1) current.push(id)
  else current.splice(idx, 1)
  emit('update:modelValue', current)
  emit('change', current)
}

function remove(id) {
  const next = props.modelValue.filter(i => i !== id)
  emit('update:modelValue', next)
  emit('change', next)
}

function clearAll() {
  emit('update:modelValue', [])
  emit('change', [])
}

watch(isOpen, async (val) => {
  if (val) {
    await nextTick()
    searchRef.value?.focus()
  } else {
    search.value = ''
  }
})

function onClickOutside(e) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<style scoped>
.resp-filter {
  display: flex;
  flex-direction: column;
  gap: 5px;
  position: relative;
  min-width: 180px;
}

.filter-label-text {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gray-500);
}

/* ── Trigger ── */
.resp-filter-trigger {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: white;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--gray-600);
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  text-align: left;
  width: 100%;
}

.resp-filter-trigger:hover {
  border-color: var(--gray-300);
}

.resp-filter-trigger.active {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
}

.resp-filter-trigger.open {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.resp-filter-trigger span {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chevron {
  flex-shrink: 0;
  transition: transform 0.15s;
}

.chevron.rotated {
  transform: rotate(180deg);
}

/* ── Tags activos ── */
.active-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.active-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  background: var(--primary-light);
  color: var(--primary);
  border-radius: 12px;
  font-size: 11.5px;
  font-weight: 600;
  border: 1px solid rgba(37, 99, 235, 0.2);
}

.active-tag button {
  display: inline-flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--primary);
  padding: 0;
  opacity: 0.7;
}

.active-tag button:hover {
  opacity: 1;
}

.clear-all {
  font-size: 11px;
  color: var(--gray-400);
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: var(--font-body);
  text-decoration: underline;
}

.clear-all:hover {
  color: var(--danger);
}

/* ── Dropdown ── */
.resp-filter-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  min-width: 240px;
  background: white;
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 300;
  overflow: hidden;
}

.dropdown-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--gray-100);
}

.dropdown-search-input {
  flex: 1;
  border: none;
  outline: none;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--gray-700);
  background: transparent;
}

.dropdown-search-input::placeholder {
  color: var(--gray-400);
}

.dropdown-options {
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-option {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.1s;
  border-bottom: 1px solid var(--gray-100);
  user-select: none;
}

.dropdown-option:last-child {
  border-bottom: none;
}

.dropdown-option:hover {
  background: var(--gray-50);
}

.dropdown-option.checked {
  background: #eff6ff;
}

.dropdown-option input[type="checkbox"] {
  display: none;
}

.option-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--gray-100);
  color: var(--gray-500);
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dropdown-option.checked .option-avatar {
  background: var(--primary);
  color: white;
}

.option-info {
  flex: 1;
  min-width: 0;
}

.option-name {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-800);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.option-puesto {
  display: block;
  font-size: 11px;
  color: var(--gray-400);
}

.option-check {
  color: var(--primary);
  flex-shrink: 0;
}

.dropdown-no-results {
  padding: 14px;
  text-align: center;
  font-size: 13px;
  color: var(--gray-400);
  font-style: italic;
}

/* ── Transición ── */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* 📱 Responsive */
@media (max-width: 760px) {
  .resp-filter {
    width: 100%;
    min-width: unset;
    /* 👈 rompe el bloqueo */
  }

  .resp-filter-trigger {
    width: 100%;
  }

  .resp-filter-dropdown {
    min-width: unset;
    /* 👈 clave */
    width: 100%;
  }
}


@media (max-width: 640px) {
  .resp-filter-dropdown {
    position: fixed;
    top: 10%;
    left: 5%;
    right: 5%;
    width: auto;
    max-height: 70vh;
    border-radius: 12px;
  }

  .dropdown-options {
    max-height: 55vh;
  }
}
</style>