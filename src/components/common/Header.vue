<template>
    <header class="header">
        <v-btn
            v-if="route.meta.showBack"
            icon="mdi-arrow-left"
            variant="text"
            color="var(--color-text-primary)"
            size="small"
            @click="router.back()"
        />
        <span class="title">{{ route.meta.title }}</span>
    </header>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
</script>

<style scoped>
.header {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 430px;
    height: 64px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    background: #ffffff;
    border-bottom: 1px solid #eeeeee;
    z-index: 100;
}

.title {
    font-size: 20px;
    font-weight: 700;
    color: black;
}
</style>