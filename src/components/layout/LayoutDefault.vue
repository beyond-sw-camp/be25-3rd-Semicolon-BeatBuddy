<template>
    <div class="app-container">
        <Header />
        <main class="main-content">
            <RouterView />
        </main>
        <Footer />
    </div>
</template>

<script setup>
import Header from './Header.vue'
import Footer from './Footer.vue'
</script>

<style scoped>
.app-container {
    width: 100%;
    max-width: 480px;
    min-height: 100vh;
    min-height: 100dvh;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    background: #f5f5f5;
    position: relative;
}

.main-content {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 72px;
    padding-top: 64px;
}
</style>