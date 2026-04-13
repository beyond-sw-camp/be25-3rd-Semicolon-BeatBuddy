<template>
    <div class="music-search-view">
        <div class="top-bar">
            <button class="back-button" @click="goBack">←</button>
            <h1 class="page-title">곡 검색</h1>
        </div>

        <div class="search-box">
            <v-icon class="search-icon">mdi-magnify</v-icon>
            <input 
                v-model="keyword"
                type="text" 
                placeholder="곡, 아티스트, 앨범 검색"
                class="search-input"
            />
        </div>

        <div class="divider"></div>

        <div class="empty-section">
            <div class="empty-icon">♫</div>
            <p class="empty-text">
                검색어를 입력하여<br />
                음악을 찾아보세요
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const keyword = ref('')

const goBack = () => {
    router.push('/music/select')
}
</script>

<style scoped>
.music-search-view {
    min-height: calc(100dvh - 64px);
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
}

.top-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 24px 24px 20px;
}

.back-button {
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    background: #f3f4f6;
    font-size: 22px;
    cursor: pointer;
    color: #111827;
}

.page-title {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    color: #111827;
}

.search-box {
    position: relative;
    margin: 0 24px 20px;
}

.search-icon {
    position: absolute;
    left: 16px;
    top: 54%;
    transform: translateY(-50%);
    font-size: 24px;
    color: #9ca3af;
    pointer-events: none;
    line-height: 1;
}

.search-input {
    width: 100%;
    height: 52px;
    border: 1px solid transparent;
    outline: none;
    border-radius: 16px;
    background-color: #f3f4f6;
    padding: 0 18px 0 44px;
    font-size: 16px;
    color: #111827;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-input::placeholder {
    color: #9ca3af;
}

.search-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.12);
    background-color: #ffffff;
}

.divider {
    width: 100%;
    border-bottom: 1px solid #e5e7eb;
}

.empty-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: #9ca3af;
}

.empty-icon {
    font-size: 72px;
    margin-bottom: 16px;
}

.empty-text {
    font-size: 18px;
    line-height: 1.7;
    margin: 0;
}
</style>