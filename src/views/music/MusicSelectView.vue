<template>
    <div class="music-select-view">
        <div class="top-fixed">
            <div class="top-section">
                <div class="top-bar">
                    <h1 class="page-title">음악 선택</h1>

                    <div class="top-actions">
                        <button class="text-button" @click="goBack">취소</button>

                        <!-- 10곡일 때만 저장 버튼 활성화 -->
                        <v-btn 
                            class="save-button" 
                            color="primary" 
                            rounded="lg" 
                            :disabled="!musicStore.isComplete || saving"
                            @click="handleSave"
                        >
                            {{ saving ? '저장 중...' : '저장' }}
                        </v-btn>
                    </div>
                </div>

                <!-- 선택된 곡 개수를 store 기준으로 표시 -->
                <div class="count-row">
                    <p class="count-text">선택된 곡: {{ musicStore.selectedCount }}/10</p>

                    <span v-if="musicStore.isComplete" class="complete-badge">✓</span>
                </div>
            </div>

            <div class="add-button-wrap">
                <!-- 10곡이면 곡 추가 버튼 비활성화 -->
                <v-btn
                    color="primary"
                    size="large"
                    rounded="xl"
                    class="add-button"
                    :disabled="musicStore.isComplete"
                    @click="goToSearch"
                >
                    + 곡 추가하기
                </v-btn>
            </div>
        </div>

        <div class="content-section">
        <!-- 선택된 곡이 있으면 목록 표시 -->
        <div v-if="musicStore.selectedCount > 0" class="selected-section">
            <!-- <h2 class="selected-title">선택된 곡 ({{ musicStore.selectedCount }}/10)</h2> -->

                <div class="selected-list">
                    <div
                        v-for="track in musicStore.selectedTracks"
                        :key="track.trackId"
                        class="track-card"
                    >
                        <img
                            v-if="track.coverUrl"
                            :src="track.coverUrl"
                            alt="앨범 커버"
                            class="album-image"
                        />
                        
                        <div v-else class="album-placeholder">♫</div>

                        <div class="track-info">
                            <p class="track-name">{{ track.trackName }}</p>
                            <p class="artist-name">{{ track.artistName }}</p>
                        </div>

                        <!-- 삭제 버튼 -->
                        <button
                            class="remove-button"
                            @click="removeTrack(track.trackId)"
                        >
                            ×
                        </button>
                    </div>
                </div>
            </div>

            <!-- 아무 곡도 없을 때만 빈 상태 표시 -->
            <div v-else class="empty-section">
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
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMusicStore } from '@/stores/music';
import { saveTaste, updateTaste } from '@/api/music';

const router = useRouter()
const musicStore = useMusicStore()

// 저장 중 상태
const saving = ref(false)

onMounted(() => {
    const header = document.querySelector('.header')
    const mainContent = document.querySelector('.main-content')

    if (header) header.style.display = 'none'
    if (mainContent) mainContent.style.paddingTop = '0'
})

onUnmounted(() => {
    const header = document.querySelector('.header')
    const mainContent = document.querySelector('.main-content')

    if (header) header.style.display = ''
    if (mainContent) mainContent.style.paddingTop = '64px'
})

const goBack = () => {
    musicStore.endEditMode()
    router.push('/music')
}

// 검색 화면으로 이동
const goToSearch = () => {
    router.push('/music/search')
}

// 선택된 곡 삭제
const removeTrack = (trackId) => {
    musicStore.removeTrack(trackId)
}

// 저장 버튼 클릭
const handleSave = async () => {
    if (!musicStore.isComplete) return

    saving.value = true

    try {
        const payload = {
            tracks: musicStore.selectedTracks.map(track => ({
                trackId: track.trackId,
                trackName: track.trackName,
                artistName: track.artistName,
                albumId: track.albumId,
                albumName: track.albumName,
                coverUrl: track.coverUrl,
            }))
        }

        if (musicStore.isEditMode) {
            // 수정 모드면 PUT
            const result = await updateTaste(payload)
            console.log('수정 저장 성공:', result)
        } else {
            // 최초 저장이면 POST
            const result = await saveTaste(payload)
            console.log('최초 저장 성공:', result)
        }

        // 저장 끝나면 수정 모드 종료
        musicStore.endEditMode()

        // 저장 성공 후 음악 메인 화면으로 이동
        router.push('/music')

    } catch (error) {
        console.error('취향 저장 실패:', error)
        alert('취향 저장에 실패했습니다.')
    } finally {
        saving.value = false
    }
}
</script>

<style scoped>
.music-select-view {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 64px;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.top-fixed {
    flex-shrink: 0;
    background-color: #ffffff;
}

.top-section {
    padding: 28px 24px 20px;
    background-color: #ffffff;
    border-bottom: 1px solid #e5e7eb;
}

.top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
}

.page-title {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
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
    font-size: 14px;
    color: #374151;
    cursor: pointer;
}

.save-button {
    min-width: 74px;
}

.save-button :deep(.v-btn__content) {
    font-size: 14px;
    font-weight: 700;
}

.count-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.count-text {
    margin: 0;
    font-size: 15px;
    color: #1f2937;
    font-weight: 400;
}

.complete-badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    border-radius: 999px;
    background-color: #e8f7ec;
    color: #16a34a;
    font-size: 13px;
    font-weight: 700;
}

.add-button-wrap {
    padding: 20px 24px 24px;
    background-color: #ffffff;
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

.content-section {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 20px 24px 24px;
    background-color: #ffffff; 
}

.selected-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
}

.selected-title {
    margin: 0 0 16px;
    font-size: 18px;
    font-weight: 800;
    color: #111827;
    flex-shrink: 0;
}

.selected-list {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
    overflow-y: auto;
    padding-right: 4px;
}

.track-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    background-color: #ffffff;
}

.album-image,
.album-placeholder {
    width: 68px;
    height: 68px;
    border-radius: 14px;
    flex-shrink: 0;
}

.album-image {
    object-fit: cover;
}

.album-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f3f4f6;
    color: #9ca3af;
    font-size: 28px;
}

.track-info {
    flex: 1;
    min-width: 0;
}

.track-name {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 700;
    color: #111827;
}

.artist-name {
    margin: 0;
    font-size: 14px;
    color: #6b7280;
}

.remove-button {
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    background-color: #f3f4f6;
    color: #9ca3af;
    font-size: 24px;
    cursor: pointer;
    flex-shrink: 0;
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