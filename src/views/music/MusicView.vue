<template>
    <div class="music-view">
        <div v-if="loading" class="loading-section">
            <p class="loading-text">불러오는 중입니다...</p>
        </div>

        <div v-else-if="!hasTaste" class="intro-section">
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
                @click="goToSelect"
            >
                음악 선택하기
            </v-btn>

            <p class="guide-text">정확히 10곡을 선택해야 합니다.</p>
        </div>

        <div v-else class="profile-section">
            <!-- 음악 프로필 배경 이미지 동적 적용 -->
            <div 
                class="profile-hero"
                :style="{ backgroundImage: heroBackground }"
            >
                <div class="overlay"></div>

                <div class="hero-top">
                    <h1 class="hero-title">나의 음악 프로필</h1>

                    <v-btn
                        variant="outlined"
                        class="edit-button"
                        rounded="xl"
                        @click="goToEdit"
                    >
                        수정
                    </v-btn>
                </div>

                <div class="hero-content">
                    <!-- 음악 프로필 닉네임 동적 출력 -->
                    <h2 class="nickname">{{ nickname }}</h2>
                    <p class="hero-subtitle">이 음악들이 나를 표현합니다.</p>
                </div>

                <div class="favorite-card">
                    <div class="favorite-header">♫ FAVORITE TRACKS</div>

                    <div class="track-grid">
                        <button
                            v-for="track in tasteTracks"
                            :key="track.trackId"
                            class="track-thumb-button"
                            @click="openTrackModal(track)"
                        >
                            <img
                                v-if="track.albumCoverUrl"
                                :src="track.albumCoverUrl"
                                :alt="track.trackName"
                                class="track-thumb"
                            />

                            <div v-else class="track-thumb placeholder">♫</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 곡 상세 모달 -->
        <div v-if="selectedTrack" class="modal-backdrop" @click="closeTrackModal">
            <div class="modal-card" @click.stop>
                <button class="close-button" @click="closeTrackModal">×</button>

                <img
                    v-if="selectedTrack.albumCoverUrl"
                    :src="selectedTrack.albumCoverUrl"
                    :alt="selectedTrack.trackName"
                    class="modal-image"
                />

                <div v-else class="modal-image placeholder">♫</div>

                <p class="modal-track-name">{{ selectedTrack.trackName }}</p>
                <p class="modal-artist">{{ selectedTrack.artistName }}</p>
                <p class="modal-album">{{ selectedTrack.albumName }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getTaste } from '@/api/music'
import { useMusicStore } from '@/stores/music'
import api from '@/api/axios'

const router = useRouter()
const musicStore = useMusicStore()

const loading = ref(true)
const hasTaste = ref(false)
const tasteTracks = ref([])
const selectedTrack = ref(null)

// 사용자 정보 상태값
const nickname = ref('')
const profileImageUrl = ref('')

// onMounted(async () => {
//     const header = document.querySelector('.header')
//     const mainContent = document.querySelector('.main-content')
// 
//     if (header) header.style.display = 'none'
//     if (mainContent) mainContent.style.paddingTop = '0'
// 
//     await Promise.all([
//         fetchTaste(),
//         fetchUserProfile()
//     ])
// })

const updateHeaderVisibility = (hide) => {
    const header = document.querySelector('.header')
    const mainContent = document.querySelector('.main-content')

    if (header) {
        header.style.display = hide ? 'none' : ''
    }

    if (mainContent) {
        mainContent.style.paddingTop = hide ? '0' : '64px'
    }
}

watch(hasTaste, (value) => {
    updateHeaderVisibility(value)
})

// onUnmounted(() => {
//     const header = document.querySelector('.header')
//     const mainContent = document.querySelector('.main-content')
// 
//     if (header) header.style.display = ''
//     if (mainContent) mainContent.style.paddingTop = '64px'
// })

// 배경 이미지 계산
const heroBackground = computed(() => {
    const image = profileImageUrl.value
        ? `http://localhost:8088${profileImageUrl.value}`
        : 'http://localhost:8088/default-profile.jpg'

    return `
        linear-gradient(rgba(32, 16, 64, 0.72), rgba(18, 7, 38, 0.88)),
        url(${image})
    `
})

const goToSelect = () => {
    router.push('/music/select')
}

const goToEdit = () => {
    // 서버에서 다시 불러와 수정 화면 진입
    musicStore.setTracks(
        tasteTracks.value.map(track => ({
            trackId: track.trackId,
            trackName: track.trackName,
            artistName: track.artistName,
            albumId: track.albumId,
            albumName: track.albumName,
            coverUrl: track.albumCoverUrl
        }))
    )

    // 수정 모드 시작
    musicStore.startEditMode()

    router.push('/music/select')
}

const openTrackModal = (track) => {
    selectedTrack.value = track
}

const closeTrackModal = () => {
    selectedTrack.value = null
}

// 사용자 정보 조회
const fetchUserProfile = async () => {
    try {
        const response = await api.get('/api/v1/users/me')
        const user = response.data.result

        nickname.value = user.nickname
        profileImageUrl.value = user.profileImageUrl        
    } catch (error) {
        console.error('사용자 정보 조회 실패:', error)
    }
}

const fetchTaste = async () => {
    loading.value = true

    try {
        const result = await getTaste()
        // console.log('취향 조회 전체 응답:', result)

        const data = result.result
        // console.log('취향 조회 result:', data)

        const tracks = data?.tracks ?? []
        const isTasteAnalyzed = data?.isTasteAnalyzed ?? false

        // console.log('tracks:', tracks)
        // console.log('isTasteAnalyzed:', isTasteAnalyzed)

        hasTaste.value = isTasteAnalyzed || tracks.length > 0
        tasteTracks.value = tracks

        // console.log('hasTaste 최종값:', hasTaste.value)
    } catch (error) {
        console.error('취향 조회 실패:', error)
        hasTaste.value = false
        tasteTracks.value = []
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    await Promise.all([
        fetchTaste(),
        fetchUserProfile()
    ])

    updateHeaderVisibility(hasTaste.value)
})

onUnmounted(() => {
    updateHeaderVisibility(false)
})
</script>

<style scoped>
.music-view {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #f7f7fb;
    overflow: hidden;
}

.loading-section,
.intro-section {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 28px 24px;
    box-sizing: border-box;
}

.loading-text {
    font-size: 15px;
    color: #6b7280;
}

.icon-circle {
    width: 132px;
    height: 132px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 60px;
    color: white;
    background: linear-gradient(180deg, #6c63ff 0%, #7c3aed 100%);
    margin-bottom: 24px;
}

.title {
    margin: 0 0 22px;
    font-size: 25px;
    font-weight: 800;
    color: #111827;
    line-height: 1.3;
}

.description {
    margin: 0 0 25px;
    font-size: 15px;
    line-height: 1.9;
    color: #6b7280;
}

.select-button {
    width: 270px;
    height: 50px;
    font-weight: 700;
    font-size: 16px;
    margin-bottom: 18px;
}

.guide-text {
    margin: 0;
    font-size: 14px;
    color: #6c63ff;
}

.profile-section {
    height: 100%;
    background: linear-gradient(180deg, #2b2148 0%, #10051f 100%);
    overflow: hidden;
    padding: 0;
}

.profile-hero {
    position: relative;
    height: 100%;
    overflow: hidden;
    padding: 18px;
    box-sizing: border-box;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}

.overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

.hero-top {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
}

.hero-title {
    margin: 0;
    font-size: 18px;
    font-weight: 800;
    color: white;
}

.edit-button {
    color: white;
    border-color: rgba(255, 255, 255, 0.35);
}

.hero-content {
    position: absolute;
    left: 22px;
    right: 22px;
    bottom: 240px;
    z-index: 1;
}

.nickname {
    margin: 0 0 8px;
    font-size: 40px;
    font-weight: 900;
    line-height: 1;
    color: white;
}

.hero-subtitle {
    margin: 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.88);
}

.favorite-card {
    position: absolute;
    left: 20px;
    right: 20px;
    bottom: 20px;
    z-index: 2;
    border-radius: 24px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.16);
}

.favorite-header {
    margin-bottom: 14px;
    font-size: 14px;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.92);
}

.track-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
}

.track-thumb-button {
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
}

.track-thumb,
.track-thumb.placeholder {
    width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 14px;
    object-fit: cover;
    display: block;
}

.track-thumb.placeholder {
    background: rgba(255, 255, 255, 0.12);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
}

.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(10, 10, 20, 0.72);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    z-index: 1000;
}

.modal-card {
    width: 100%;
    max-width: 360px;
    border-radius: 28px;
    background: linear-gradient(180deg, #041228 0%, #020815 100%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 28px 24px 24px;
    position: relative;
    text-align: center;
}

.close-button {
    position: absolute;
    top: 18px;
    right: 18px;
    width: 44px;
    height: 44px;
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    color: white;
    font-size: 28px;
    cursor: pointer;
}

.modal-image,
.modal-image.placeholder {
    width: 100%;
    max-width: 220px;
    aspect-ratio: 1 / 1;
    margin: 20px auto 24px;
    border-radius: 20px;
    object-fit: cover;
    display: block;
}

.modal-image.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.08);
    color: white;
    font-size: 34px;
}

.modal-track-name {
    margin: 0 0 10px;
    font-size: 22px;
    font-weight: 800;
    color: white;
}

.modal-artist {
    margin: 0 0 10px;
    font-size: 16px;
    color: rgba(255, 255, 255, 0.84);
}

.modal-album {
    margin: 0;
    font-size: 15px;
    color: rgba(255, 255, 255, 0.6);
}
</style>
