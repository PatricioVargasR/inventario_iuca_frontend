<template>
  <div class="responsables-selector">
    <!-- Tags de responsables seleccionados -->
    <div class="selected-tags" :class="{ empty: modelValue.length === 0 }">
      <template v-if="modelValue.length > 0">
        <span v-for="id in modelValue" :key="id" class="resp-tag">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
          {{ getNombre(id) }}
          <button type="button" class="tag-remove" @click="remove(id)">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </span>
      </template>
      <span v-else class="placeholder-text">Sin responsables asignados</span>
    </div>

    <!-- Buscador + dropdown -->
    <div class="dropdown-wrapper" ref="wrapperRef">
      <div class="search-input-wrap">
        <svg class="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input ref="inputRef" v-model="search" class="search-input"
          :placeholder="modelValue.length > 0 ? 'Agregar otro responsable...' : 'Buscar responsable...'"
          @focus="open = true" @keydown.escape="open = false" @keydown.down.prevent="moveHighlight(1)"
          @keydown.up.prevent="moveHighlight(-1)" @keydown.enter.prevent="selectHighlighted" />
        <button v-if="search" type="button" class="clear-search" @click="search = ''; inputRef?.focus()">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <Transition name="dropdown">
        <div v-if="open && filtered.length > 0" class="dropdown-list">
          <button v-for="(u, i) in filtered" :key="u.id_usuario" type="button" class="dropdown-item" :class="{
            selected: modelValue.includes(u.id_usuario),
            highlighted: i === highlightIndex
          }" @mousedown.prevent="toggle(u.id_usuario)" @mouseover="highlightIndex = i">
            <div class="item-avatar">{{ initials(u.nombre_usuario) }}</div>
            <div class="item-info">
              <span class="item-name">{{ u.nombre_usuario }}</span>
              <span v-if="u.puesto" class="item-puesto">{{ u.puesto }}</span>
            </div>
            <svg v-if="modelValue.includes(u.id_usuario)" class="item-check" width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        </div>
        <div v-else-if="open && search && filtered.length === 0" class="dropdown-empty">
          No se encontraron responsables con "{{ search }}"
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },  // array de IDs
  usuarios: { type: Array, default: () => [] },   // lista completa de usuarios
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const search = ref('')
const open = ref(false)
const highlightIndex = ref(-1)
const wrapperRef = ref(null)
const inputRef = ref(null)

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  return props.usuarios.filter(u =>
    u.nombre_usuario.toLowerCase().includes(q) ||
    (u.puesto || '').toLowerCase().includes(q) ||
    (u.numero_nomina || '').includes(q)
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
  if (idx === -1) {
    current.push(id)
  } else {
    current.splice(idx, 1)
  }
  emit('update:modelValue', current)
  search.value = ''
  inputRef.value?.focus()
}

function remove(id) {
  emit('update:modelValue', props.modelValue.filter(i => i !== id))
}

function moveHighlight(dir) {
  const max = filtered.value.length - 1
  if (max < 0) return
  highlightIndex.value = Math.max(0, Math.min(max, highlightIndex.value + dir))
}

function selectHighlighted() {
  if (highlightIndex.value >= 0 && filtered.value[highlightIndex.value]) {
    toggle(filtered.value[highlightIndex.value].id_usuario)
  }
}

function onClickOutside(e) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target)) {
    open.value = false
    search.value = ''
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<style scoped>
.responsables-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ── Tags seleccionados ── */
.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-height: 36px;
  padding: 6px 10px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--gray-50);
  align-items: center;
}

.selected-tags.empty {
  background: transparent;
}

.placeholder-text {
  font-size: 13px;
  color: var(--gray-400);
  font-style: italic;
}

.resp-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px 3px 7px;
  background: var(--primary-light);
  color: var(--primary);
  border-radius: 20px;
  font-size: 12.5px;
  font-weight: 600;
  border: 1px solid rgba(37, 99, 235, 0.2);
}

.tag-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: rgba(37, 99, 235, 0.15);
  border-radius: 50%;
  cursor: pointer;
  color: var(--primary);
  padding: 0;
  transition: background 0.12s;
  flex-shrink: 0;
}

.tag-remove:hover {
  background: rgba(37, 99, 235, 0.3);
}

/* ── Input de búsqueda ── */
.dropdown-wrapper {
  position: relative;
}

.search-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: var(--gray-400);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 8px 32px 8px 30px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-family: var(--font-body);
  font-size: 13.5px;
  color: var(--gray-800);
  background: white;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.clear-search {
  position: absolute;
  right: 8px;
  width: 20px;
  height: 20px;
  border: none;
  background: var(--gray-200);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-500);
  padding: 0;
}

.clear-search:hover {
  background: var(--gray-300);
}

/* ── Dropdown ── */
.dropdown-list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 200;
  max-height: 220px;
  overflow-y: auto;
}

.dropdown-empty {
  padding: 14px 16px;
  font-size: 13px;
  color: var(--gray-400);
  text-align: center;
  font-style: italic;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.1s;
  border-bottom: 1px solid var(--gray-100);
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover,
.dropdown-item.highlighted {
  background: var(--gray-50);
}

.dropdown-item.selected {
  background: #eff6ff;
}

.item-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--primary-light);
  color: var(--primary);
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dropdown-item.selected .item-avatar {
  background: var(--primary);
  color: white;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  display: block;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--gray-800);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-puesto {
  display: block;
  font-size: 11.5px;
  color: var(--gray-400);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-check {
  color: var(--primary);
  flex-shrink: 0;
}

/* ── Transición dropdown ── */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>