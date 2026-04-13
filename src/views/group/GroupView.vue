<template>
  <div class="group-view">
    <!-- 내 그룹 정보 -->
    <div class="my-groups-list" v-if="groupStore.groups.length">
      <div
        v-for="group in groupStore.groups"
        :key="group.groupId"
        :class="['current-group-panel', { active: groupStore.currentGroupId === group.groupId }]"
        @click="selectGroup(group.groupId)"
      >
        <div class="group-image-box">
          <img
            v-if="getGroupImageUrl(group)"
            :src="getGroupImageUrl(group)"
            :alt="group.groupName"
            class="group-image"
          />
          <span v-else class="mdi mdi-account-group group-image-placeholder" />
        </div>
        <div class="group-info">
          <h2 class="group-name">{{ group.groupName }}</h2>
          <p class="group-description">
            {{ group.description || '그룹 설명이 없어요' }}
          </p>
          <div class="group-meta">
            <span>
              <span class="mdi mdi-account-multiple-outline" />
              멤버 {{ group.memberCount ?? 0 }}명
            </span>
            <span>
              <span class="mdi mdi-key-outline" />
              {{ getGroupInviteCode(group) || '초대코드 정보 없음' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 그룹 선택 전/그룹 없을 때 -->
    <div v-if="groupStore.groups.length" class="empty-box">
      <span class="mdi mdi-touch-tap empty-icon" />
      <p>그룹을 선택해 주세요</p>
      <p class="sub">그룹 정보를 누르면 취향 추천을 볼 수 있어요</p>
    </div>
    <div v-else class="empty-box">
      <span class="mdi mdi-account-group empty-icon" />
      <p>아직 속한 그룹이 없어요</p>
      <p class="sub">그룹에 참여하면 친구를 추천받을 수 있어요!</p>
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
          <div v-if="loading" class="center-box">
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
                  :src="currentRecommendation.profileImageUrl"
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
                  icon="mdi-close"
                  color="grey"
                  variant="tonal"
                  size="large"
                  class="mr-4"
                  :loading="skipLoadingUserId === currentRecommendation.userId"
                  :disabled="requestLoadingUserId != null"
                  @click="skip(currentRecommendation)"
                />
                <v-btn
                  icon="mdi-account-plus"
                  color="primary"
                  size="large"
                  :loading="requestLoadingUserId === currentRecommendation.userId"
                  :disabled="skipLoadingUserId != null"
                  @click="sendRequest(currentRecommendation)"
                />
              </div>
              <div class="action-labels">
                <span>넘기기</span>
                <span>친구 신청</span>
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

    <!-- 하단 FAB -->
    <div class="fab-area">
      <v-btn icon="mdi-plus" color="primary" size="large" @click="showGroupDialog = true" />
    </div>

    <!-- 그룹 생성/참가 다이얼로그 -->
    <v-dialog v-model="showGroupDialog" max-width="360">
      <v-card rounded="xl" class="dialog-card">
        <v-card-title class="dialog-title">그룹 참여</v-card-title>
        <v-card-text>
          <v-tabs v-model="groupTab" color="primary" class="mb-4">
            <v-tab value="join">초대 코드로 가입</v-tab>
            <v-tab value="create">새 그룹 만들기</v-tab>
          </v-tabs>
          <div v-if="groupTab === 'join'">
            <v-text-field
              v-model="joinForm.inviteCode"
              label="초대 코드"
              variant="outlined"
              prepend-inner-icon="mdi-key-outline"
              color="primary"
              class="mb-2"
            />
            <v-text-field
              v-model="joinForm.groupNickname"
              label="그룹 내 닉네임"
              variant="outlined"
              prepend-inner-icon="mdi-account-outline"
              color="primary"
            />
          </div>
          <div v-else>
            <v-text-field
              v-model="createForm.groupName"
              label="그룹 이름"
              variant="outlined"
              prepend-inner-icon="mdi-account-group"
              color="primary"
              class="mb-2"
            />
            <v-text-field
              v-model="createForm.inviteCode"
              label="초대 코드 (영문 대문자+숫자)"
              variant="outlined"
              prepend-inner-icon="mdi-key-outline"
              color="primary"
              class="mb-2"
            />
            <v-text-field
              v-model="createForm.groupNickname"
              label="그룹 내 닉네임"
              variant="outlined"
              prepend-inner-icon="mdi-account-outline"
              color="primary"
            />
          </div>
          <p class="error-msg" v-if="dialogError">{{ dialogError }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showGroupDialog = false">취소</v-btn>
          <v-btn color="primary" :loading="dialogLoading" @click="handleGroupAction">확인</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGroupStore } from '@/stores/group'
import { useFriendStore } from '@/stores/friend'

const groupStore = useGroupStore()
const friendStore = useFriendStore()

const loading = ref(false)
const skipLoadingUserId = ref(null)
const requestLoadingUserId = ref(null)
const actionError = ref('')
const actionErrorUserId = ref(null)
const showGroupDialog = ref(false)
const showRecommendDialog = ref(false)
const showSongDetail = ref(false)
const selectedSong = ref(null)
const groupTab = ref('join')
const joinForm = ref({ inviteCode: '', groupNickname: '' })
const createForm = ref({ groupName: '', inviteCode: '', groupNickname: '' })
const dialogLoading = ref(false)
const dialogError = ref('')
const recommendationIndex = ref(0)

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

function getGroupInviteCode(group) {
  return group?.inviteCode || group?.groupInviteCode || ''
}

function getFavoriteSongs(member) {
  return member?.favoriteMusicList || member?.favoriteSongs || []
}

function hasCompleteFavoriteSongs(member) {
  return getFavoriteSongs(member).length === 10
}

function getGroupImageUrl(group) {
  if (!group?.groupImageUrl) return ''
  return group.groupImageUrl
}

function openSongDetail(song) {
  if (!song) return
  selectedSong.value = song
  showSongDetail.value = true
}

onMounted(async () => {
  loading.value = true
  try {
    groupStore.clearSelection()
    await groupStore.fetchGroups()
  } finally {
    loading.value = false
  }
})

async function selectGroup(groupId) {
  actionError.value = ''
  actionErrorUserId.value = null
  groupStore.setCurrentGroup(groupId)
  showRecommendDialog.value = true
  loading.value = true
  try {
    await groupStore.fetchRecommendations(groupId)
    recommendationIndex.value = 0
  } finally {
    loading.value = false
  }
}

function closeRecommendDialog() {
  showRecommendDialog.value = false
  actionError.value = ''
  actionErrorUserId.value = null
  recommendationIndex.value = 0
  groupStore.clearSelection()
}

function handleRecommendDialogUpdate(isOpen) {
  if (!isOpen) {
    closeRecommendDialog()
  }
}

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
      actionError.value = message
      actionErrorUserId.value = targetUserId
    } else {
      actionError.value = message
      actionErrorUserId.value = targetUserId
    }
  } finally {
    requestLoadingUserId.value = null
  }
}

async function handleGroupAction() {
  dialogError.value = ''
  dialogLoading.value = true
  try {
    if (groupTab.value === 'join') {
      await groupStore.joinGroup(joinForm.value)
    } else {
      await groupStore.createGroup(createForm.value)
    }
    showGroupDialog.value = false
    joinForm.value = { inviteCode: '', groupNickname: '' }
    createForm.value = { groupName: '', inviteCode: '', groupNickname: '' }
  } catch (e) {
    dialogError.value = e.response?.data?.message || '처리에 실패했습니다.'
  } finally {
    dialogLoading.value = false
  }
}
</script>

<style scoped>
.group-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.my-groups-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}

.current-group-panel {
  display: flex;
  gap: 14px;
  align-items: center;
  background: #fff;
  border: 1px solid #eeeeee;
  border-radius: 8px;
  padding: 14px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.current-group-panel.active {
  border-color: #6C63FF;
  box-shadow: 0 6px 22px rgba(108, 99, 255, 0.16);
}

.group-image-box {
  width: 78px;
  height: 78px;
  border-radius: 8px;
  background: #f3f2ff;
  overflow: hidden;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.group-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.group-image-placeholder {
  font-size: 36px;
  color: #6C63FF;
}

.group-info {
  min-width: 0;
  flex: 1;
}

.group-name {
  font-size: 18px;
  font-weight: 800;
  color: #222;
  margin: 0 0 4px;
  overflow-wrap: anywhere;
}

.group-description {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  margin: 0 0 10px;
  overflow-wrap: anywhere;
}

.group-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #555;
}

.group-meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  overflow-wrap: anywhere;
}

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
  color: #777;
  background: #f4f4f4;
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
  color: #6C63FF;
}

.member-name {
  font-size: 20px;
  font-weight: 700;
  color: #333;
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
  color: #6C63FF;
}

.favorite-empty {
  font-size: 12px;
  color: #aaa;
  background: #f7f6ff;
  border-radius: 8px;
  padding: 10px 12px;
  max-width: 230px;
  margin: 0 auto;
}

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
  color: #6C63FF;
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
  color: #333;
  margin-bottom: 6px;
  word-break: break-word;
}

.song-detail-album,
.song-detail-artist {
  font-size: 13px;
  color: #777;
  line-height: 1.5;
  word-break: break-word;
}

.card-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 4px;
}

.action-labels {
  display: flex;
  justify-content: space-around;
  font-size: 12px;
  color: #aaa;
  padding: 0 32px;
}

.empty-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #bbb;
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
  color: #ccc;
  margin-top: 4px;
}

.center-box {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.fab-area {
  position: fixed;
  bottom: 80px;
  right: calc(50% - 215px);
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
  color: #FF5252;
  font-size: 13px;
  margin-top: 4px;
}
</style>
