<template>
  <div class="app-container">
    <Header v-if="!route.meta.hideHeader" />
    <main class="main-content" :class="{ 'main-content--headerless': route.meta.hideHeader }">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import Header from '../common/Header.vue'
import Footer from '../common/Footer.vue'

const route = useRoute()
</script>

<style scoped>
.app-container {
  width: 100%;
  max-width: 430px;
  height: 100vh;
  height: 100dvh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background: var(--color-background);
  position: relative;
  overflow: hidden;
}

.main-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-top: 64px;
  padding-bottom: var(--app-footer-height);
}

.main-content--headerless {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding-top: 0;
  padding-bottom: var(--app-footer-height);
  overflow: hidden;
}
</style>
