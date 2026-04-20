<template>
  <div class="friend-profile-page">
    <div v-if="loading" class="center-box">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <p v-else-if="profileError" class="error-msg">{{ profileError }}</p>

    <template v-else-if="selectedFriend">
      <section class="profile-hero" :style="{ backgroundImage: profileBackgroundImage }">
        <div class="profile-overlay" />
        <div class="profile-content">
          <h3 class="profile-name">{{ selectedFriend.groupNickname || selectedFriend.nickname }}</h3>

          <section class="profile-section">
            <p class="section-label favorite-album-title">FAVORITE ALBUM</p>
            <div class="album-panel">
              <p v-if="profileFavoriteNotice" class="favorite-notice">{{ profileFavoriteNotice }}</p>
              <div v-else class="profile-album-grid">
                <div
                  v-for="(song, index) in profileAlbumSlots"
                  :key="song?.musicId || `empty-${index}`"
                  class="profile-album-tile"
                  :title="song?.trackName || '빈 최애곡 슬롯'"
                  @click="openSongDetail(song)"
                >
                  <img v-if="song?.albumCoverUrl" :src="song.albumCoverUrl" :alt="song.trackName" class="profile-album-cover" />
                  <span v-else class="mdi mdi-music-note profile-album-placeholder" />
                </div>
              </div>
            </div>
          </section>

          <div class="profile-actions">
            <v-btn
              color="primary"
              class="chat-btn"
              prepend-icon="mdi-chat-outline"
              :loading="chatLoading"
              @click="goToChat"
            >채팅</v-btn>
            <v-btn
              color="error"
              class="delete-btn"
              variant="tonal"
              prepend-icon="mdi-account-remove"
              @click="showDeleteConfirm = true"
            >친구 삭제</v-btn>
          </div>

          <p class="error-msg" v-if="chatError">{{ chatError }}</p>
        </div>
      </section>
    </template>

    <v-dialog v-model="showSongDetail" max-width="340">
      <v-card v-if="selectedSong" rounded="xl" class="song-detail-card">
        <img
          v-if="selectedSong.albumCoverUrl"
          :src="selectedSong.albumCoverUrl"
          :alt="selectedSong.trackName"
          class="song-detail-cover-lg"
        />
        <div v-else class="song-detail-placeholder-lg">
          <span class="mdi mdi-music-note" />
        </div>
        <div class="song-detail-lines">
          <p class="song-detail-title">{{ selectedSong.trackName }}</p>
          <p class="song-detail-album">{{ selectedSong.albumName || '앨범명 정보 없음' }}</p>
          <p class="song-detail-artist">{{ selectedSong.artistName }}</p>
        </div>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showSongDetail = false">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showDeleteConfirm" max-width="300">
      <v-card rounded="xl">
        <v-card-title class="dialog-title">친구 삭제</v-card-title>
        <v-card-text>{{ selectedFriend?.groupNickname || selectedFriend?.nickname }}님을 친구 목록에서 삭제할까요?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteConfirm = false">취소</v-btn>
          <v-btn color="error" @click="deleteFriend">삭제</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { friendApi } from '@/api/friend'
import { useFriendStore } from '@/stores/friendStore'
import { useChatStore } from '@/stores/chatStore'

const route = useRoute()
const router = useRouter()
const friendStore = useFriendStore()
const chatStore = useChatStore()

const selectedFriend = ref(null)
const selectedSong = ref(null)
const showSongDetail = ref(false)
const showDeleteConfirm = ref(false)
const loading = ref(false)
const profileError = ref('')
const chatError = ref('')
const chatLoading = ref(false)
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const friendId = computed(() => Number(route.params.friendId))
const groupId = computed(() => route.query.groupId ? Number(route.query.groupId) : null)
const toValidId = (value) => {
  const id = Number(value)
  return Number.isFinite(id) ? id : null
}
const getFriendGroupId = (friend) =>
  friend?.groupId

const profileAlbumSlots = computed(() => {
  return getFavoriteSongs(selectedFriend.value).slice(0, 10)
})

const profileFavoriteNotice = computed(() => {
  const count = getFavoriteSongs(selectedFriend.value).length
  if (count < 10) return '최애곡 10곡을 아직 선택하지 않았어요'
  return ''
})

const profileBackgroundImage = computed(() => {
  const imageUrl = selectedFriend.value?.profileImageUrl
    ? resolveImageUrl(selectedFriend.value.profileImageUrl)
    : resolveImageUrl('/default-profile.jpg')
  return `url("${imageUrl}")`
})

onMounted(async () => {
  loading.value = true
  try {
    if (!friendStore.friends.length) {
      await friendStore.fetchFriends()
    }

    const friend = findFriendByGroup() || friendStore.friends.find((item) => Number(item.friendId) === friendId.value) || {}
    const res = await friendApi.getFriendDetail(friendId.value)
    const detail = res.data?.result || {}

    selectedFriend.value = {
      ...friend,
      ...detail,
      friendId: friendId.value,
      groupId: getFriendGroupId(detail) || getFriendGroupId(friend) || groupId.value,
      groupNickname: detail.groupNickname || friend.groupNickname,
      friendshipId: friend.friendshipId,
      profileImageUrl: detail.profileImageUrl || friend.profileImageUrl,
    }
  } catch (e) {
    profileError.value = e.response?.data?.message || '친구 프로필을 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
})

function getFavoriteSongs(friend) {
  return friend?.favoriteMusicList
    || friend?.favoriteSongs
    || friend?.favoriteMusics
    || friend?.topSongs
    || []
}

function resolveImageUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
  return `${apiBaseUrl}${url.startsWith('/') ? url : `/${url}`}`
}

function openSongDetail(song) {
  if (!song) return
  selectedSong.value = song
  showSongDetail.value = true
}

async function goToChat() {
  if (!friendId.value) {
    chatError.value = '친구 정보를 확인할 수 없습니다.'
    return
  }

  chatError.value = ''
  chatLoading.value = true
  try {
    const detailRes = await friendApi.getFriendDetail(friendId.value)
    const detail = detailRes.data?.result

    if (detail?.roomId) {
      seedChatRoom(detail.roomId)
      await router.push({ name: 'chat-room', params: { roomId: detail.roomId } })
      return
    }

    const selectedGroupId = getSelectedGroupId()
    const existingRoom = chatStore.rooms.find((room) =>
      Number(room.opponentUserId) === Number(friendId.value) &&
      (!selectedGroupId || Number(room.groupId) === Number(selectedGroupId))
    )
    if (existingRoom?.roomId) {
      seedChatRoom(existingRoom.roomId)
      await router.push({ name: 'chat-room', params: { roomId: existingRoom.roomId } })
      return
    }

    if (!selectedGroupId) {
      console.warn('채팅방 생성 groupId 확인 실패', {
        routeGroupId: groupId.value,
        selectedFriend: selectedFriend.value,
        friends: friendStore.friends,
      })
      chatError.value = '채팅방 생성을 위한 그룹 정보를 확인할 수 없습니다.'
      return
    }

    const room = await chatStore.createRoom(friendId.value, selectedGroupId)
    if (room?.roomId) {
      seedChatRoom(room.roomId)
      await router.push({ name: 'chat-room', params: { roomId: room.roomId } })
    } else {
      chatError.value = '채팅방 정보를 찾을 수 없습니다.'
    }
  } catch (e) {
    chatError.value =
      e.response?.status === 500
        ? '채팅방 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.'
        : e.response?.data?.message || '채팅방으로 이동하지 못했습니다.'
  } finally {
    chatLoading.value = false
  }
}

function findFriendByGroup() {
  if (!groupId.value) return null
  return friendStore.friends.find((item) =>
    Number(item.friendId) === friendId.value && Number(getFriendGroupId(item)) === groupId.value
  )
}

function getSelectedGroupId() {
  return toValidId(getFriendGroupId(selectedFriend.value))
    || toValidId(groupId.value)
    || toValidId(getFriendGroupId(friendStore.friends.find((item) => Number(item.friendId) === friendId.value)))
}

function seedChatRoom(roomId) {
  const targetRoomId = Number(roomId)
  const index = chatStore.rooms.findIndex((room) => Number(room.roomId) === targetRoomId)
  const friend = selectedFriend.value || {}
  const fallbackRoom = {
    roomId: targetRoomId,
    groupId: getFriendGroupId(friend) || groupId.value,
    isFallbackRoom: true,
    opponentUserId: friendId.value,
    opponentNickname: friend.groupNickname || friend.nickname,
    opponentProfileImageUrl: friend.profileImageUrl,
  }

  if (index >= 0) {
    chatStore.rooms[index] = {
      ...fallbackRoom,
      ...chatStore.rooms[index],
      roomId: targetRoomId,
      groupId: fallbackRoom.groupId || chatStore.rooms[index].groupId,
      opponentNickname: fallbackRoom.opponentNickname || chatStore.rooms[index].opponentNickname,
      opponentProfileImageUrl: chatStore.rooms[index].opponentProfileImageUrl || fallbackRoom.opponentProfileImageUrl,
    }
    return
  }

  chatStore.rooms.push(fallbackRoom)
}

async function deleteFriend() {
  if (!selectedFriend.value?.friendshipId) {
    profileError.value = '친구 관계 정보를 확인할 수 없습니다.'
    showDeleteConfirm.value = false
    return
  }

  await friendStore.deleteFriend(selectedFriend.value.friendshipId)
  showDeleteConfirm.value = false
  router.push('/friend')
}
</script>

<style scoped>
.friend-profile-page {
  height: 100%;
  overflow: hidden;
  background: #111;
}

.profile-hero {
  position: relative;
  height: 100%;
  min-height: 560px;
  display: flex;
  align-items: flex-end;
  background-position: center;
  background-size: cover;
  overflow-y: auto;
}

.profile-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.08) 0%,
    rgba(0, 0, 0, 0.28) 46%,
    rgba(0, 0, 0, 0.82) 100%
  );
}

.profile-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  padding: 0 18px 30px;
}

.profile-name {
  color: #fff;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.2;
  text-align: left;
  word-break: break-word;
}

.profile-section {
  margin-top: 18px;
}

.section-label {
  font-size: 12px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.78);
  margin-bottom: 10px;
}

.favorite-album-title {
  text-align: left;
  letter-spacing: 0;
}

.favorite-notice {
  font-size: 13px;
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
}

.album-panel {
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(14px);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.14);
}

.profile-album-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 7px;
  max-width: 260px;
  margin: 0 auto;
}

.profile-album-tile {
  aspect-ratio: 1;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
}

.profile-album-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-album-placeholder {
  font-size: 22px;
  color: rgba(255, 255, 255, 0.88);
}

.profile-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.chat-btn {
  flex: 2 1 0;
  min-width: 0;
}

.delete-btn {
  flex: 1 1 0;
  min-width: 0;
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

.center-box {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.error-msg {
  color: #ff5252;
  font-size: 13px;
  text-align: center;
  margin: 10px 0;
}
</style>
