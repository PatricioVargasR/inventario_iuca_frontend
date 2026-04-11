<template>
  <div class="actions-cell">

    <!-- Ver -->
    <button
      v-if="showView"
      class="action-btn view"
      title="Ver detalle"
      @click="$emit('view')"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    </button>

    <!-- Editar -->
    <button
      v-if="showEdit"
      class="action-btn edit"
      title="Editar"
      @click="$emit('edit')"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    </button>

    <!-- Eliminar — deleteHidden lo oculta por lógica de negocio -->
    <button
      v-if="showDelete && !deleteHidden"
      class="action-btn delete"
      title="Eliminar"
      @click="$emit('delete')"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14H6L5 6"/>
        <path d="M10 11v6"/><path d="M14 11v6"/>
        <path d="M9 6V4h6v2"/>
      </svg>
    </button>

  </div>
</template>

<script setup>
defineProps({
  // Visibilidad por permiso del rol
  showView:     { type: Boolean, default: true  },
  showEdit:     { type: Boolean, default: false },
  showDelete:   { type: Boolean, default: false },
  // Oculta eliminar por lógica de negocio (ej: no puedes eliminarte a ti mismo)
  deleteHidden: { type: Boolean, default: false },
})

defineEmits(['view', 'edit', 'delete'])
</script>