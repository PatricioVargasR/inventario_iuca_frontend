<template>
  <RouterView />
  <ToastNotification />
</template>

<script setup>
import { RouterView } from 'vue-router'
import ToastNotification from '@/components/ui/ToastNotification.vue'
</script>