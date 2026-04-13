<template>
    <div class="music-select-view">
        <div class="top-section">
            <div class="top-bar">
                <h1 class="page-title">음악 선택</h1>

                <div class="top-actions">
                    <button class="text-button" @click="goBack">취소</button>
                    <v-btn class="save-button" variant="tonal" rounded="lg" disabled>
                        저장
                    </v-btn>
                </div>
            </div>

            <p class="count-text">선택된 곡: {{ selectedCount }}/10</p>
        </div>

        <div class="bottom-section">
            <v-btn
                color="primary"
                size="large"
                rounded="xl"
                class="add-button"
            >
                + 곡 추가하기
            </v-btn>

        <div class="empty-section">
            <div class="empty-icon">♫</div>
            <p class="empty-text">
                곡 추가하기 버튼을 눌러<br />
                좋아하는 음악을 추가하세요.
            </p>
        </div>
    </div>
</div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router';

const router = useRouter()
const selectedCount = ref(0)

const goBack = () => {
    router.push('/music')
}
</script>

<style scoped>
.music-select-view {
    min-height: calc(100dvh - 64px);
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
}

.top-section {
    padding: 28px 24px 20px;
    border-bottom: 1px solid #e5e7eb;
    background-color: #ffffff;
}

.top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
}

.page-title {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    color: #111827;
}

.top-actions {
    display: flex;
    align-items: center;
    gap: 14px;
}

.text-button {
    border: none;
    background: none;
    font-size: 16px;
    color: #374151;
    cursor: pointer;
}

.save-button {
    min-width: 74px;
    font-weight: 700;
}

.count-text {
    margin: 0;
    font-size: 18px;
    color: #1f2937;
}

.bottom-section {
    flex: 1;
    padding: 20px 24px 0;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
}

.add-button {
    width: 100%;
    height: 48px;
    border-radius: 999px;
    font-size: 14px;
    letter-spacing: -0.2px;
    font-weight: 700;
    box-shadow: none;
}

.empty-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.empty-icon{
    font-size: 72px;
    color: #d1d5db;
    margin-bottom: 16px;
}

.empty-text {
    font-size: 18px;
    line-height: 1.7;
    color: #9ca3af;
}

</style>