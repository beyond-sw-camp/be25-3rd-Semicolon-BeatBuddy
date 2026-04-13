<template>
  <div class="friend-view">

    <!-- 벨 아이콘 (상단 우측 고정) -->
    <button class="bell-btn" :class="{ active: totalNotifCount > 0 }" @click="openNotifications">
      <span class="mdi bell-icon" :class="totalNotifCount > 0 ? 'mdi-bell-ring' : 'mdi-bell-outline'" />
      <span v-if="totalNotifCount > 0" class="bell-badge">{{ totalNotifCount }}</span>
    </button>


    <!-- 검색 바 -->
    <div class="search-area">
      <v-text-field
        v-model="search"
        placeholder="친구 검색"
        variant="outlined"
        density="compact"
        prepend-inner-icon="mdi-magnify"
        color="primary"
        hide-details
        class="search-input"
      />
    </div>

    <!-- 로딩 -->
    <div v-if="loading" class="center-box">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <template v-else>
      <!-- 친구 목록 헤더 -->
      <p class="friends-header">내 친구</p>
      <p class="error-msg" v-if="chatError">{{ chatError }}</p>

      <!-- 친구 없을 때 -->
      <div v-if="filteredFriends.length === 0" class="empty-box">
        <span
          class="mdi empty-icon"
          :class="search ? 'mdi-magnify-close' : 'mdi-account-multiple-outline'"
        />
        <p class="empty-title">{{ search ? '검색 결과가 없어요' : '아직 친구가 없어요' }}</p>
        <p class="empty-sub" v-if="!search">그룹에서 마음에 드는 유저에게<br>친구 신청을 해보세요!</p>
      </div>

      <!-- 친구 목록 -->
      <div v-else class="friend-list">
        <div
          v-for="friend in filteredFriends"
          :key="friend.friendshipId"
          class="friend-item"
          @click="openProfile(friend)"
        >
          <div class="friend-avatar">
            <img v-if="friend.profileImageUrl" :src="friend.profileImageUrl" class="avatar-img" />
            <span v-else class="mdi mdi-account avatar-icon" />
          </div>
          <div class="friend-info">
            <p class="friend-name">{{ friend.nickname }}</p>
          </div>
        </div>
      </div>
    </template>

    <!-- 친구 프로필 다이얼로그 -->
    <v-dialog v-model="showProfile" max-width="360">
      <v-card v-if="selectedFriend" rounded="xl" class="profile-card">
        <div class="profile-header">
          <div class="profile-avatar">
            <img v-if="selectedFriend.profileImageUrl" :src="selectedFriend.profileImageUrl" class="avatar-img" />
            <span v-else class="mdi mdi-account avatar-icon-lg" />
          </div>
          <h3>{{ selectedFriend.nickname }}</h3>
        </div>
        <v-card-text>
          <div v-if="profileLoading" class="center-box compact">
            <v-progress-circular indeterminate color="primary" size="28" />
          </div>
          <p class="error-msg" v-else-if="profileError">{{ profileError }}</p>
          <template v-else>
            <p class="section-label favorite-album-title">FAVORITE ALBUM</p>
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
          </template>
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="primary"
            prepend-icon="mdi-chat-outline"
            :loading="chatLoadingFriendId === selectedFriend.friendId"
            @click="goToChatFromProfile"
          >채팅</v-btn>
          <v-btn
            color="error"
            variant="tonal"
            prepend-icon="mdi-account-remove"
            @click="confirmDeleteFromProfile"
          >친구 삭제</v-btn>
          <v-spacer />
          <v-btn variant="text" @click="showProfile = false">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 곡 상세 다이얼로그 -->
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

    <!-- 알림 다이얼로그 -->
    <v-dialog v-model="showNotifications" max-width="360">
      <v-card rounded="xl">
        <v-card-title class="dialog-title">알림</v-card-title>

        <v-card-text class="pa-0">
          <!-- 알림 -->
          <template v-if="displayNotifications.length">
            <div
              v-for="notif in displayNotifications"
              :key="notif.notificationId"
              class="notif-item"
              :class="{ unread: !notif.isRead }"
            >
              <!-- 친구 요청 타입 알림: receivedRequests에서 발신자 정보 매칭 -->
              <template v-if="isFriendRequest(notif)">
                <div class="notif-avatar">
                  <img
                    v-if="getNotificationSenderProfileImage(notif)"
                    :src="getNotificationSenderProfileImage(notif)"
                    class="avatar-img"
                  />
                  <span v-else class="mdi mdi-account avatar-icon" />
                </div>
                <div class="notif-content">
                  <p class="notif-sender">
                    {{ getNotificationSenderNickname(notif) }}
                  </p>
                  <p class="notif-sub">친구 신청을 보냈어요</p>
                  <p class="notif-time">{{ formatRelative(notif.createdAt) }}</p>
                </div>
                <div class="notif-actions">
                  <v-btn
                    color="primary"
                    size="x-small"
                    :loading="notifLoading === notif.notificationId"
                    @click="acceptNotif(notif)"
                  >수락</v-btn>
                  <v-btn
                    color="grey"
                    variant="tonal"
                    size="x-small"
                    :disabled="notifLoading === notif.notificationId"
                    @click="rejectNotif(notif)"
                  >거절</v-btn>
                </div>
              </template>
              <!-- 친구 요청 수락 알림 -->
              <template v-else-if="isFriendAccept(notif)">
                <div class="notif-avatar">
                  <img
                    v-if="getAcceptedFriendProfileImage(notif)"
                    :src="getAcceptedFriendProfileImage(notif)"
                    class="avatar-img"
                  />
                  <span v-else class="mdi mdi-account-check avatar-icon" />
                </div>
                <div class="notif-content">
                  <p class="notif-sender">{{ getAcceptedFriendNickname(notif) }}</p>
                  <p class="notif-sub">친구 요청을 수락했어요</p>
                  <p class="notif-time">{{ formatRelative(notif.createdAt) }}</p>
                </div>
                <v-btn icon="mdi-close" size="x-small" variant="text" @click="deleteNotif(notif.notificationId)" />
              </template>
              <!-- 일반 알림 -->
              <template v-else>
                <div class="notif-content">
                  <p class="notif-msg">{{ notif.message }}</p>
                  <p class="notif-time">{{ formatRelative(notif.createdAt) }}</p>
                </div>
                <v-btn icon="mdi-close" size="x-small" variant="text" @click="deleteNotif(notif.notificationId)" />
              </template>
            </div>
          </template>

          <!-- 아무것도 없을 때 -->
          <div
            v-if="!displayNotifications.length"
            class="empty-small pa-4"
          >
            새로운 알림이 없어요
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showNotifications = false">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 친구 삭제 확인 -->
    <v-dialog v-model="showDeleteConfirm" max-width="300">
      <v-card rounded="xl">
        <v-card-title class="dialog-title">친구 삭제</v-card-title>
        <v-card-text>{{ deletingFriend?.nickname }}님을 친구 목록에서 삭제할까요?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteConfirm = false">취소</v-btn>
          <v-btn color="error" @click="doDelete">삭제</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFriendStore } from '@/stores/friend'
import { useChatStore } from '@/stores/chat'
import { useRouter } from 'vue-router'
import { friendApi } from '@/api/friend'
import { formatRelative } from '@/utils/format'

const friendStore = useFriendStore()
const chatStore = useChatStore()
const router = useRouter()

const search = ref('')
const loading = ref(false)
const showProfile = ref(false)
const selectedFriend = ref(null)
const selectedSong = ref(null)
const showSongDetail = ref(false)
const profileLoading = ref(false)
const profileError = ref('')
const showNotifications = ref(false)
const showDeleteConfirm = ref(false)
const deletingFriend = ref(null)
const notifLoading = ref(null)
const chatLoadingFriendId = ref(null)
const chatError = ref('')

const friendRequestNotifications = computed(() => {
  const existingRequestKeys = new Set(
    friendStore.notifications
      .filter(isFriendRequest)
      .flatMap((n) => [n.targetId && `target-${n.targetId}`, n.senderId && `sender-${n.senderId}`])
      .filter(Boolean)
  )

  const fallbackRequests = friendStore.receivedRequests
    .filter((req) => {
      return !existingRequestKeys.has(`target-${req.friendshipId}`) &&
        !existingRequestKeys.has(`sender-${req.friendId}`)
    })
    .map((req) => ({
      notificationId: `request-${req.friendshipId}`,
      senderId: req.friendId,
      targetId: req.friendshipId,
      type: 'FRIEND_REQUEST',
      message: `${req.nickname}님이 친구 신청을 보냈어요.`,
      isRead: false,
      createdAt: req.createdAt || req.updatedAt,
      isFallbackRequest: true,
    }))

  return [...friendStore.notifications, ...fallbackRequests]
})

const displayNotifications = computed(() => friendRequestNotifications.value)

const totalNotifCount = computed(() =>
  displayNotifications.value.filter((notif) => !notif.isRead).length
)

const filteredFriends = computed(() => {
  const q = search.value.toLowerCase()
  return q
    ? friendStore.friends.filter((f) => f.nickname.toLowerCase().includes(q))
    : friendStore.friends
})

const profileAlbumSlots = computed(() => {
  return selectedFriend.value?.favoriteMusicList?.slice(0, 10) || []
})

const profileFavoriteNotice = computed(() => {
  const count = selectedFriend.value?.favoriteMusicList?.length || 0
  if (count < 10) return '최애곡 10곡을 아직 선택하지 않았어요'
  return ''
})

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      friendStore.fetchFriends(),
      friendStore.fetchRequests(),
      friendStore.fetchNotifications(),
    ])
  } finally {
    loading.value = false
  }
})

async function openNotifications() {
  showNotifications.value = true
  await Promise.all([
    friendStore.fetchRequests(),
    friendStore.fetchNotifications(),
  ])
}

async function openProfile(friend) {
  selectedFriend.value = friend
  selectedSong.value = null
  showProfile.value = true
  profileError.value = ''
  profileLoading.value = true
  try {
    const res = await friendApi.getFriendDetail(friend.friendId)
    selectedFriend.value = {
      ...friend,
      ...res.data?.result,
      friendshipId: friend.friendshipId,
      friendId: friend.friendId,
    }
  } catch (e) {
    profileError.value = e.response?.data?.message || '친구 프로필을 불러오지 못했습니다.'
  } finally {
    profileLoading.value = false
  }
}

function openSongDetail(song) {
  if (!song) return
  selectedSong.value = song
  showSongDetail.value = true
}

async function goToChat(friend) {
  if (!friend?.friendId) {
    chatError.value = '친구 정보를 확인할 수 없습니다.'
    return
  }
  chatError.value = ''
  chatLoadingFriendId.value = friend.friendId
  try {
    const detailRes = await friendApi.getFriendDetail(friend.friendId)
    const detail = detailRes.data?.result

    if (detail?.roomId) {
      chatStore.setCurrentRoom({
        roomId: detail.roomId,
        opponentUserId: friend.friendId,
        opponentNickname: detail.nickname || friend.nickname,
        opponentProfileImageUrl: detail.profileImageUrl || friend.profileImageUrl,
      })
      await router.push({ name: 'chat' })
      return
    }

    const existingRoom = chatStore.rooms.find((room) => room.opponentUserId === friend.friendId)
    if (existingRoom?.roomId) {
      chatStore.setCurrentRoom(existingRoom)
      await router.push({ name: 'chat' })
      return
    }

    const room = await chatStore.createRoom(friend.friendId)
    if (room?.roomId) {
      chatStore.setCurrentRoom(room)
      await router.push({ name: 'chat' })
    } else {
      chatError.value = '채팅방 정보를 찾을 수 없습니다.'
    }
  } catch (e) {
    chatError.value =
      e.response?.status === 500
        ? '채팅방 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.'
        : e.response?.data?.message || '채팅방으로 이동하지 못했습니다.'
  } finally {
    chatLoadingFriendId.value = null
  }
}

function confirmDelete(friend) {
  deletingFriend.value = friend
  showDeleteConfirm.value = true
}

async function goToChatFromProfile() {
  if (!selectedFriend.value) return
  showProfile.value = false
  await goToChat(selectedFriend.value)
}

function confirmDeleteFromProfile() {
  if (!selectedFriend.value) return
  showProfile.value = false
  confirmDelete(selectedFriend.value)
}

async function doDelete() {
  await friendStore.deleteFriend(deletingFriend.value.friendshipId)
  showDeleteConfirm.value = false
  deletingFriend.value = null
}

// type === 'FRIEND_REQUEST' 로 친구 요청 알림 감지
function isFriendRequest(notif) {
  return notif.type === 'FRIEND_REQUEST'
}

function isFriendAccept(notif) {
  return notif.type === 'FRIEND_ACCEPT'
}

function getRequestByNotification(notif) {
  return friendStore.receivedRequests.find((r) => isSameId(r.friendshipId, notif.targetId))
    || friendStore.receivedRequests.find((r) => isSameId(r.friendId, notif.senderId))
}

function getFriendByNotification(notif) {
  return friendStore.friends.find((friend) => isSameId(friend.friendId, notif.senderId))
}

function isSameId(a, b) {
  return a != null && b != null && String(a) === String(b)
}

function getNotificationSenderNickname(notif) {
  return getRequestByNotification(notif)?.nickname
    || notif.senderNickname
    || notif.nickname
    || notif.senderName
    || getSenderNameFromMessage(notif.message)
}

function getNotificationSenderProfileImage(notif) {
  return getRequestByNotification(notif)?.profileImageUrl
    || notif.senderProfileImageUrl
    || notif.profileImageUrl
}

function getAcceptedFriendNickname(notif) {
  return getFriendByNotification(notif)?.nickname
    || notif.senderNickname
    || notif.nickname
    || notif.senderName
    || getSenderNameFromMessage(notif.message)
}

function getAcceptedFriendProfileImage(notif) {
  return getFriendByNotification(notif)?.profileImageUrl
    || notif.senderProfileImageUrl
    || notif.profileImageUrl
}

function getSenderNameFromMessage(message) {
  if (!message) return '알 수 없음'
  const match = message.match(/^(.+?)님/)
  return match?.[1] || '알 수 없음'
}

async function acceptNotif(notif) {
  notifLoading.value = notif.notificationId
  try {
    await friendStore.acceptFromNotif(notif)
  } finally {
    notifLoading.value = null
  }
}

async function rejectNotif(notif) {
  await friendStore.rejectFromNotif(notif)
}

async function deleteNotif(notifId) {
  await friendStore.deleteNotification(notifId)
}
</script>

<style scoped>
.friend-view {
  height: 100%;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
}

/* 검색 */
.search-area {
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
}

/* 벨 아이콘 - 헤더 우측 고정 */
.bell-btn {
  position: fixed;
  top: 0;
  right: max(0px, calc(50% - 215px));
  height: 64px;
  padding-right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 101;
}

.bell-icon {
  font-size: 26px;
  color: #555;
}

.bell-btn.active .bell-icon {
  color: #FF5252;
}

.bell-badge {
  position: absolute;
  top: 12px;
  right: 10px;
  background: #FF5252;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
}

/* 친구 헤더 */
.friends-header {
  font-size: 15px;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
}

/* 친구 목록 */
.friend-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.friend-item {
  display: flex;
  align-items: center;
  padding: 10px 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s;
}

.friend-item:hover {
  background: #f5f0ff;
}

.friend-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #ede9ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
  overflow: hidden;
}


.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-icon {
  font-size: 24px;
  color: #6C63FF;
}

.friend-info {
  flex: 1;
}

.friend-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.friend-email {
  font-size: 12px;
  color: #888;
}

/* 빈 화면 - GroupView와 동일한 스타일 */
.empty-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #bbb;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 12px;
  color: #d0cbff;
}

.empty-title {
  font-size: 15px;
  font-weight: 600;
  color: #999;
  margin-bottom: 8px;
}

.empty-sub {
  font-size: 13px;
  color: #ccc;
  line-height: 1.6;
}

.empty-small {
  color: #bbb;
  font-size: 13px;
  padding: 12px 0;
}

.center-box {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.center-box.compact {
  padding: 16px;
}

/* 알림 다이얼로그 */
.dialog-title {
  font-size: 18px;
  font-weight: 700;
  padding: 16px 16px 0;
}

.notif-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid #f0f0f0;
  gap: 6px;
}

.notif-item.unread {
  background: #f5f0ff;
}

.notif-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #ede9ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.notif-content {
  flex: 1;
  min-width: 0;
}

.notif-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.notif-sender {
  font-size: 13px;
  font-weight: 700;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notif-sub {
  font-size: 12px;
  color: #888;
}

.notif-time {
  font-size: 11px;
  color: #aaa;
  margin-top: 2px;
}

.notif-msg {
  flex: 1;
  font-size: 13px;
  color: #333;
}

/* 프로필 카드 */
.section-label {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
}

.favorite-album-title {
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.favorite-notice {
  font-size: 12px;
  color: #888;
  background: #f7f6ff;
  border-radius: 8px;
  padding: 8px 10px;
  margin-bottom: 10px;
}

.profile-card {
  padding: 8px;
}

.profile-header {
  text-align: center;
  padding: 24px 16px 8px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #ede9ff;
  margin: 0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-icon-lg {
  font-size: 40px;
  color: #6C63FF;
}

.profile-album-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  margin-bottom: 12px;
}

.profile-album-tile {
  aspect-ratio: 1;
  border: 2px solid transparent;
  border-radius: 8px;
  background: #ede9ff;
  padding: 0;
  overflow: hidden;
  cursor: pointer;
}

.profile-album-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.profile-album-placeholder {
  width: 100%;
  height: 100%;
  color: #6C63FF;
  display: flex;
  align-items: center;
  justify-content: center;
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

</style>
