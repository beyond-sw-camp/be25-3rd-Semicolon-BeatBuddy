<template>
    <div class="group-page">
        <!-- 툴바 -->
        <v-toolbar flat color="transparent">
            <v-toolbar-title class="section-title">내 그룹</v-toolbar-title>
            <v-spacer />
            <v-btn variant="text" color="primary" @click="editMode = !editMode">
                {{ editMode ? '완료' : '편집' }}
            </v-btn>
        </v-toolbar>

        <!-- 그룹 목록 -->
        <div style="flex: 1; overflow-y: auto;">
            <GroupList
                :groups="groups"
                :loading="loading"
                :edit-mode="editMode"
                @leave="handleLeaveGroup"
                @select="handleSelectGroup"
            />
        </div>

        <!-- 하단 버튼 -->
        <div class="bottom-buttons">
            <v-btn block color="primary" rounded="lg" height="48" class="mb-4" @click="router.push('/group/create')">
                + 새 그룹 만들기
            </v-btn>
            <v-btn block variant="outlined" color="primary" rounded="lg" height="48" class="mt-2" @click="router.push('/group/join')">
                초대 코드로 가입하기
            </v-btn>
        </div>

        <!-- 추천 친구 다이얼로그 -->
        <v-dialog
            v-model="showRecommendDialog"
            max-width="390"
            @update:model-value="handleRecommendDialogUpdate"
        >
            <v-card rounded="lg" class="dialog-card">
                <v-card-title class="dialog-title">추천 친구</v-card-title>
                <v-card-text>
                    <div v-if="recommendLoading" class="center-box">
                        <v-progress-circular indeterminate color="primary" />
                    </div>
                    <div v-else-if="sortedRecommendations.length === 0" class="empty-box recommend-empty">
                        <span class="mdi mdi-account-search empty-icon" />
                        <p>추천할 새 친구가 없어요</p>
                        <p class="sub">나중에 다시 확인해 보세요!</p>
                    </div>
                    <div v-else class="recommend-card-wrap">
                        <div class="recommend-counter">
                            {{ recommendationIndex + 1 }} / {{ sortedRecommendations.length }}
                        </div>
                        <div class="member-card">
                            <div class="card-avatar">
                                <img
                                    v-if="currentRecommendation.profileImageUrl"
                                    :src="`${apiBaseUrl}${currentRecommendation.profileImageUrl}`"
                                    class="avatar-img"
                                />
                                <span v-else class="mdi mdi-account avatar-icon" />
                            </div>
                            <h3 class="member-name">{{ currentRecommendation.nickname }}</h3>
                            <div class="favorite-preview">
                                <div v-if="getFavoriteSongs(currentRecommendation).length" class="album-grid">
                                    <div
                                        v-for="song in getFavoriteSongs(currentRecommendation)"
                                        :key="song.musicId || song.trackId"
                                        class="album-tile"
                                        :title="song.trackName"
                                        @click="openSongDetail(song)"
                                    >
                                        <img
                                            v-if="song.albumCoverUrl || song.coverUrl"
                                            :src="song.albumCoverUrl || song.coverUrl"
                                            :alt="song.trackName"
                                            class="album-cover"
                                        />
                                        <span v-else class="mdi mdi-music-note album-placeholder" />
                                    </div>
                                </div>
                                <p v-else class="favorite-empty">아직 선택한 곡이 없어요</p>
                            </div>
                            <div class="card-actions">
                                <v-btn
                                    color="primary"
                                    rounded="xl"
                                    size="large"
                                    class="friend-request-btn"
                                    :loading="requestLoadingUserId === currentRecommendation.userId"
                                    :disabled="skipLoadingUserId != null"
                                    @click="sendRequest(currentRecommendation)"
                                >
                                    <v-icon start>mdi-account-plus</v-icon>
                                    친구 신청
                                </v-btn>
                                <v-btn
                                    color="grey"
                                    variant="tonal"
                                    rounded="xl"
                                    size="large"
                                    class="skip-btn"
                                    :loading="skipLoadingUserId === currentRecommendation.userId"
                                    :disabled="requestLoadingUserId != null"
                                    @click="skip(currentRecommendation)"
                                >
                                    넘기기
                                </v-btn>
                            </div>
                            <p class="error-msg" v-if="actionErrorUserId === currentRecommendation.userId">{{ actionError }}</p>
                        </div>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn variant="text" @click="closeRecommendDialog">닫기</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 곡 상세 다이얼로그 -->
        <v-dialog v-model="showSongDetail" max-width="340">
            <v-card v-if="selectedSong" rounded="xl" class="song-detail-card">
                <img
                    v-if="selectedSong.albumCoverUrl || selectedSong.coverUrl"
                    :src="selectedSong.albumCoverUrl || selectedSong.coverUrl"
                    :alt="selectedSong.trackName"
                    class="song-detail-cover-lg"
                />
                <div v-else class="song-detail-placeholder-lg">
                    <span class="mdi mdi-music-note" />
                </div>
                <div class="song-detail-lines">
                    <p class="song-detail-title">{{ selectedSong.trackName || '곡명 정보 없음' }}</p>
                    <p class="song-detail-album">{{ selectedSong.albumName || '앨범명 정보 없음' }}</p>
                    <p class="song-detail-artist">{{ selectedSong.artistName || '아티스트 정보 없음' }}</p>
                </div>
                <v-card-actions>
                    <v-spacer />
                    <v-btn variant="text" @click="showSongDetail = false">닫기</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup>
// 기본 import
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { leaveGroup } from '@/api/group.js'
import GroupList from './components/GroupList.vue'
// store import
import { useGroupStore } from '@/stores/groupStore'
import { useFriendStore } from '@/stores/friendStore'

const router = useRouter()
const groupStore = useGroupStore()
const friendStore = useFriendStore()
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

// 기본 상태
const loading = ref(false)
const editMode = ref(false)

// groups를 store에서 가져오도록 연결
const groups = computed(() => groupStore.groups)

// 추천 친구 관련 상태
const recommendLoading = ref(false)
const skipLoadingUserId = ref(null)
const requestLoadingUserId = ref(null)
const actionError = ref('')
const actionErrorUserId = ref(null)
const showRecommendDialog = ref(false)
const showSongDetail = ref(false)
const selectedSong = ref(null)
const recommendationIndex = ref(0)

// 추천 친구 computed
const sortedRecommendations = computed(() =>
    groupStore.recommendations.filter(hasCompleteFavoriteSongs).sort((a, b) => {
        const aScore = Number(a.similarityScore)
        const bScore = Number(b.similarityScore)
        const normalizedA = Number.isFinite(aScore) ? aScore : Number.MAX_SAFE_INTEGER
        const normalizedB = Number.isFinite(bScore) ? bScore : Number.MAX_SAFE_INTEGER
        return normalizedA - normalizedB
    })
)
const currentRecommendation = computed(
    () => sortedRecommendations.value[recommendationIndex.value] || {}
)

// 유틸 함수
function getFavoriteSongs(member) {
    return member?.favoriteMusicList || member?.favoriteSongs || []
}

function hasCompleteFavoriteSongs(member) {
    return getFavoriteSongs(member).length === 10
}

function openSongDetail(song) {
    if (!song) return
    selectedSong.value = song
    showSongDetail.value = true
}

// 그룹 목록 불러오기
const fetchGroups = async () => {
    loading.value = true
    try {
        await groupStore.fetchGroups()
    } catch (e) {
        console.error('그룹 목록 불러오기 실패', e)
    } finally {
        loading.value = false
    }
}

// 그룹 나가기
const handleLeaveGroup = async (groupId) => {
    try {
        await leaveGroup(groupId)
        await fetchGroups()
    } catch (e) {
        console.error('그룹 나가기 실패', e)
    }
}

// 그룹 선택 → 추천 친구 다이얼로그 열기
const handleSelectGroup = async (groupId) => {
    actionError.value = ''
    actionErrorUserId.value = null
    groupStore.setCurrentGroup(groupId)
    showRecommendDialog.value = true
    recommendLoading.value = true
    try {
        await groupStore.fetchRecommendations(groupId)
        recommendationIndex.value = 0
    } finally {
        recommendLoading.value = false
    }
}

// 추천 친구 다이얼로그 닫기
function closeRecommendDialog() {
    showRecommendDialog.value = false
    actionError.value = ''
    actionErrorUserId.value = null
    recommendationIndex.value = 0
    groupStore.clearSelection()
}

function handleRecommendDialogUpdate(isOpen) {
    if (!isOpen) closeRecommendDialog()
}

// 추천 넘기기
async function skip(member) {
    if (!member?.userId) return
    actionError.value = ''
    actionErrorUserId.value = null
    skipLoadingUserId.value = member.userId
    try {
        await groupStore.skipMember(member.userId)
        recommendationIndex.value = Math.min(
            recommendationIndex.value,
            Math.max(0, sortedRecommendations.value.length - 1)
        )
    } catch (e) {
        actionError.value = e.response?.data?.message || '추천 넘기기에 실패했습니다.'
        actionErrorUserId.value = member.userId
    } finally {
        skipLoadingUserId.value = null
    }
}

// 친구 신청
async function sendRequest(member) {
    const targetUserId = member?.userId
    if (!targetUserId) return
    actionError.value = ''
    actionErrorUserId.value = null
    requestLoadingUserId.value = targetUserId
    try {
        await friendStore.sendRequest(targetUserId)
        await groupStore.skipMember(targetUserId)
        recommendationIndex.value = Math.min(
            recommendationIndex.value,
            Math.max(0, sortedRecommendations.value.length - 1)
        )
    } catch (e) {
        const message = e.response?.data?.message || '친구 신청에 실패했습니다.'
        const isAlreadyHandled =
            e.response?.status === 409 &&
            (message.includes('이미 처리 중인 친구 요청') || message.includes('이미 친구 관계'))

        if (isAlreadyHandled) {
            try {
                await groupStore.skipMember(targetUserId)
            } catch {
                groupStore.removeRecommendation(targetUserId)
            }
        }
        actionError.value = message
        actionErrorUserId.value = targetUserId
    } finally {
        requestLoadingUserId.value = null
    }
}

onMounted(() => {
    fetchGroups()
})
</script>

<style scoped>
.group-page {
    padding: 8px 16px;
    height: 100%;
    background: #fff;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.section-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--color-text-primary);
}

.bottom-buttons {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

/* 추천 친구 다이얼로그 스타일 */
.recommend-card-wrap {
    width: 100%;
    max-width: 360px;
    max-height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    padding: 2px 0 16px;
}

.recommend-counter {
    align-self: center;
    font-size: 12px;
    font-weight: 700;
    color: var(--color-text-secondary);
    background: var(--color-background);
    border-radius: 8px;
    padding: 4px 10px;
    margin-bottom: 10px;
}

.member-card {
    background: #fff;
    border-radius: 20px;
    padding: 28px 20px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(108, 99, 255, 0.15);
}

.card-avatar {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: #ede9ff;
    margin: 0 auto 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-icon {
    font-size: 48px;
    color: var(--color-primary);
}

.member-name {
    font-size: 20px;
    font-weight: 700;
    color: var(--color-text-primary);
}

.favorite-preview {
    margin: 14px 0 16px;
}

.album-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 6px;
    max-width: 230px;
    margin: 0 auto;
}

.album-tile {
    aspect-ratio: 1;
    border-radius: 8px;
    background: #ede9ff;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.album-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.album-placeholder {
    font-size: 20px;
    color: var(--color-primary);
}

.favorite-empty {
    font-size: 12px;
    color: var(--color-text-secondary);
    background: #f7f6ff;
    border-radius: 8px;
    padding: 10px 12px;
    max-width: 230px;
    margin: 0 auto;
}

/* 곡 상세 다이얼로그 스타일 */
.song-detail-card {
    padding: 18px;
}

.song-detail-cover-lg,
.song-detail-placeholder-lg {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 8px;
}

.song-detail-cover-lg {
    object-fit: cover;
    display: block;
}

.song-detail-placeholder-lg {
    background: #ede9ff;
    color: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 64px;
}

.song-detail-lines {
    padding: 14px 0 4px;
}

.song-detail-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: 6px;
    word-break: break-word;
}

.song-detail-album,
.song-detail-artist {
    font-size: 13px;
    color: var(--color-text-secondary);
    line-height: 1.5;
    word-break: break-word;
}

.card-actions {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    margin-bottom: 4px;
}

.friend-request-btn {
    flex: 1;
    max-width: 200px;
}

.skip-btn {
    flex-shrink: 0;
}

/* 공통 */
.empty-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--color-text-secondary);
}

.recommend-empty {
    min-height: 280px;
}

.empty-icon {
    font-size: 64px;
    margin-bottom: 12px;
}

.sub {
    font-size: 13px;
    color: var(--color-text-secondary);
    margin-top: 4px;
}

.center-box {
    display: flex;
    justify-content: center;
    padding: 40px;
}

.dialog-card {
    padding: 8px;
}

.dialog-title {
    font-size: 18px;
    font-weight: 700;
    padding: 16px 16px 0;
}

.error-msg {
    color: rgb(var(--v-theme-error));
    font-size: 13px;
    margin-top: 4px;
}
</style>