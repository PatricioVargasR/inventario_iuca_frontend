<template>
  <div class="page-header">
    <div>
      <h1 class="page-title">
        <slot name="title">{{ title }}</slot>
      </h1>
      <p class="page-subtitle">
        <slot name="subtitle">{{ subtitle }}</slot>
      </p>
    </div>

    <div class="page-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  subtitle: String
})
</script>

<style scoped>
@media (max-width:768px) {
  .page-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>