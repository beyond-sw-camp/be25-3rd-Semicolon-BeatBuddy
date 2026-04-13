<template>
    <div class="music-view">
        <div class="intro-section">
            <div class="icon-circle">♫</div>

            <h1 class="title">나의 프로필을 만드세요</h1>
        
            <p class="description">
                당신의 음악 취향을 보여주세요!<br />
                좋아하는 곡 10개를 선택하면<br />
                비슷한 취향의 친구를 만날 수 있어요.
            </p>

        <v-btn 
            color="primary" 
            size="large"
            class="select-button"
            rounded="xl"
            @click="goToSelectPage"
        >
            음악 선택하기
        </v-btn>

        <p class="guide-text">
            정확히 10곡을 선택해야 합니다.
        </p>
    </div>
</div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToSelect = () => {
    router.push('/music/select')
}
</script>

<style scoped>
.music-view {
    min-height: calc(100vh - 120px);
    background-color: #f8f7fc;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 32px 24px;
    text-align: center;
}

.intro-section {
    width: 100%;
    max-width: 360px;
}

.icon-circle {
    width: 120px;
    height: 120px;
    margin: 0 auto 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--color-primary));
    color: white;
    font-size: 56px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 10px 24px rgba(99, 102, 241, 0.25);
}

.title {
    font-size: 28px;
    font-weight: 800;
    margin-bottom: 20px;
    color: #111827;
}

.description {
    font-size: 16px;
    line-height: 1.8;
    color: #6b7280;
    margin-bottom: 32px;
}

.select-button {
    width: 100%;
    max-width: 220px;
    font-weight: 700;
    margin-bottom: 28px;
}

.guide-text {
    font-size: 14px;
    color: var(--color-primary);
}

</style>
