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
            <img v-if="friend.profileImageUrl" :src="resolveImageUrl(friend.profileImageUrl)" class="avatar-img" />
            <span v-else class="mdi mdi-account avatar-icon" />
          </div>
          <div class="friend-info">
            <p class="friend-name">{{ friend.groupNickname || friend.nickname }}</p>
          </div>
        </div>
      </div>
    </template>

    <!-- 친구 삭제 확인 -->
    <v-dialog v-model="showDeleteConfirm" max-width="300">
      <v-card rounded="xl">
        <v-card-title class="dialog-title">친구 삭제</v-card-title>
        <v-card-text>{{ deletingFriend?.groupNickname || deletingFriend?.nickname }}님을 친구 목록에서 삭제할까요?</v-card-text>
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
import { useFriendStore } from '@/stores/friendStore'
import { useRouter } from 'vue-router'

const friendStore = useFriendStore()
const router = useRouter()

const search = ref('')
const loading = ref(false)
const showDeleteConfirm = ref(false)
const deletingFriend = ref(null)
const chatError = ref('')
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

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
    ? friendStore.friends.filter((f) => (f.groupNickname || f.nickname).toLowerCase().includes(q))
    : friendStore.friends
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

function openNotifications() {
  router.push('/friend/notifications')
}

function openProfile(friend) {
  const friendId = getFriendUserId(friend)
  if (!friendId) return
  router.push({ name: 'friend-profile', params: { friendId } })
}

function confirmDelete(friend) {
  deletingFriend.value = friend
  showDeleteConfirm.value = true
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

function getFriendUserId(friend) {
  return friend?.friendId ?? friend?.userId ?? friend?.targetUserId ?? friend?.receiverId
}

function resolveImageUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
  return `${apiBaseUrl}${url.startsWith('/') ? url : `/${url}`}`
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

.search-input :deep(.v-field__prepend-inner) {
  padding-left: 8px;
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
  background: #f7f6ff;
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
