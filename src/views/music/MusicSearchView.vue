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
                @keyup.enter="handleSearch"
            />
        </div>

        <div class="divider"></div>

        <div v-if="loading" class="state-section">
            <p class="state-text">검색 중입니다...</p>
        </div>

        <div v-else-if="errorMessage" class="state-section">
            <p class="state-text">{{ errorMessage }}</p>
        </div>

        <div v-else-if="searched && tracks.length === 0" class="state-section">
            <div class="empty-icon">♫</div>
            <p class="empty-text">
                검색 결과가 없습니다.<br />
                다른 검색어를 입력해보세요.
            </p>
        </div>

        <div v-else-if="tracks.length > 0" class="result-list">
            <div 
                v-for="track in tracks"
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
                    <p class="album-name">{{ track.albumName }}</p>
                </div>

                <v-btn
                    color="primary"
                    variant="tonal"
                    rounded="lg"
                    class="select-button"
                    @click="selectTrack(track)"
                >
                    선택
                </v-btn>
            </div>
        </div>

        <div v-else class="empty-section">
            <div class="empty-icon">♫</div>
            <p class="empty-text">
                검색어를 입력하여<br />
                음악을 찾아보세요.
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { searchTracks } from '@/api/music'

const router = useRouter()

const keyword = ref('')
const tracks = ref([])
const loading = ref(false)
const searched = ref(false)
const errorMessage = ref('')


const goBack = () => {
    router.push('/music/select')
}

const handleSearch = async () => {
    const trimmedKeyword = keyword.value.trim()

    if (!trimmedKeyword) {
        errorMessage.value = '검색어를 입력해주세요.'
        tracks.value = []
        searched.value = false
        return
    }

    loading.value = true
    errorMessage.value = ''
    searched.value = true

    try {
        // 백엔드 호출 (ApiResponse 구조 기준)
        const result = await searchTracks(trimmedKeyword)

        tracks.value = result.result ?? []
    } catch (error) {
        console.error('곡 검색 실패:', error)
        tracks.value = []
        errorMessage.value = '곡 검색에 실패했습니다.'
    } finally {
        loading.value = false
    }
}

const selectTrack = (track) => {
    console.log('선택한 곡:', track)
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

.state-section,
.empty-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: #9ca3af;
    padding: 24px;
}

.empty-icon {
    font-size: 72px;
    margin-bottom: 16px;
}

.state-text,
.empty-text {
    font-size: 18px;
    line-height: 1.7;
    margin: 0;
}

.result-list {
    padding: 20px 24px 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.track-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    background-color: #ffffff;
}

.album-image,
.album-placeholder {
    width: 64px;
    height: 64px;
    border-radius: 12px;
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

.artist-name,
.album-name {
    margin: 0;
    font-size: 14px;
    color: #6b7280;
}

.album-name {
    margin-top: 4px;
}

.select-button {
    flex-shrink: 0;
}

</style>