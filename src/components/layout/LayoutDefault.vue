<template>
    <div class="app-container">
        <Header v-if="!hideHeader" />
        <main 
            class="main-content" 
            :class="{ 
                'no-header': hideHeader,
                'no-footer-padding': reduceFooterPadding
            }"
        >
            <RouterView />
        </main>
        <Footer />
    </div>
</template>

<script setup>
import Header from '../common/Header.vue'
import Footer from '../common/Footer.vue'
</script>

<style scoped>
.app-container {
    width: 100%;
    max-width: 430px;
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
    padding-bottom: 64px;
    padding-top: 64px;
}
</style>