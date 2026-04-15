<template>
  <v-app theme="light">
    <LayoutAuth v-if="isAuthPage" />
    <LayoutDefault v-else />
  </v-app>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import LayoutDefault from './components/layout/LayoutDefault.vue'
import LayoutAuth from './components/layout/LayoutAuth.vue'

const route = useRoute()
const isAuthPage = computed(() => route.meta.layout === 'auth')
</script>
<style>

</style>