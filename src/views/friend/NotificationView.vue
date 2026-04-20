<template>
  <div class="notification-page">
    <div v-if="loading" class="center-box">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <div v-else-if="!displayNotifications.length" class="empty-box">
      <span class="mdi mdi-bell-outline empty-icon" />
      <p>새로운 알림이 없어요</p>
    </div>

    <div v-else class="notification-list">
      <div
        v-for="notif in displayNotifications"
        :key="notif.notificationId"
        class="notif-item"
        :class="{ unread: !notif.isRead }"
      >
        <template v-if="isFriendRequest(notif)">
          <div class="notif-avatar">
            <img
              v-if="getNotificationSenderProfileImage(notif)"
              :src="resolveImageUrl(getNotificationSenderProfileImage(notif))"
              class="avatar-img"
            />
            <span v-else class="mdi mdi-account avatar-icon" />
          </div>
          <div class="notif-content">
            <p v-if="getNotificationGroupName(notif)" class="notif-group">{{ getNotificationGroupName(notif) }}</p>
            <p class="notif-sender">{{ getNotificationSenderNickname(notif) }}</p>
            <p class="notif-sub">친구 신청을 보냈어요</p>
            <p class="notif-time">{{ formatRelative(notif.createdAt) }}</p>
          </div>
          <div class="notif-actions">
            <v-btn
              color="primary"
              variant="flat"
              size="small"
              prepend-icon="mdi-check"
              class="action-btn accept-btn"
              :loading="notifLoading === notif.notificationId"
              @click="acceptNotif(notif)"
            >수락</v-btn>
            <v-btn
              color="grey"
              variant="outlined"
              size="small"
              prepend-icon="mdi-close"
              class="action-btn reject-btn"
              :disabled="notifLoading === notif.notificationId"
              @click="rejectNotif(notif)"
            >거절</v-btn>
          </div>
        </template>

        <template v-else-if="isFriendAccept(notif)">
          <div class="notif-avatar">
            <img
              v-if="getAcceptedFriendProfileImage(notif)"
              :src="resolveImageUrl(getAcceptedFriendProfileImage(notif))"
              class="avatar-img"
            />
            <span v-else class="mdi mdi-account-check avatar-icon" />
          </div>
          <div class="notif-content">
            <p v-if="getNotificationGroupName(notif)" class="notif-group">{{ getNotificationGroupName(notif) }}</p>
            <p class="notif-sender">{{ getAcceptedFriendNickname(notif) }}</p>
            <p class="notif-sub">친구 요청을 수락했어요</p>
            <p class="notif-time">{{ formatRelative(notif.createdAt) }}</p>
          </div>
          <v-btn icon="mdi-close" size="x-small" variant="text" @click="deleteNotif(notif.notificationId)" />
        </template>

        <template v-else>
          <div class="notif-content">
            <p class="notif-msg">{{ notif.message }}</p>
            <p class="notif-time">{{ formatRelative(notif.createdAt) }}</p>
          </div>
          <v-btn icon="mdi-close" size="x-small" variant="text" @click="deleteNotif(notif.notificationId)" />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useFriendStore } from '@/stores/friendStore'

const friendStore = useFriendStore()
const loading = ref(false)
const notifLoading = ref(null)
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
      groupId: req.groupId,
      groupName: req.groupName,
      groupNickname: req.groupNickname,
      targetId: req.friendshipId,
      type: 'FRIEND_REQUEST',
      message: `${req.groupNickname || req.nickname}님이 친구 신청을 보냈어요.`,
      isRead: false,
      createdAt: req.createdAt || req.updatedAt,
      isFallbackRequest: true,
    }))

  return [...friendStore.notifications, ...fallbackRequests]
})

const displayNotifications = computed(() => friendRequestNotifications.value)

onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      friendStore.fetchRequests(),
      friendStore.fetchNotifications(),
      friendStore.fetchFriends(),
    ])
  } finally {
    loading.value = false
  }
})

function isFriendRequest(notif) {
  return notif.type === 'FRIEND_REQUEST'
}

function isFriendAccept(notif) {
  return notif.type === 'FRIEND_ACCEPT'
}

function getRequestByNotification(notif) {
  return friendStore.receivedRequests.find((r) => isSameId(r.friendshipId, notif.targetId))
    || friendStore.receivedRequests.find((r) =>
      isSameId(r.friendId, notif.senderId) &&
      (notif.groupId == null || r.groupId == null || isSameId(r.groupId, notif.groupId))
    )
}

function getFriendByNotification(notif) {
  return friendStore.friends.find((friend) => isSameId(friend.friendId, notif.senderId))
}

function isSameId(a, b) {
  return a != null && b != null && String(a) === String(b)
}

function resolveImageUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url
  return `${apiBaseUrl}${url.startsWith('/') ? url : `/${url}`}`
}

function formatRelative(dateStr) {
  if (!dateStr) return ''

  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return ''

  const now = new Date()
  const diffMs = now - date
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return '방금 전'
  if (diffMinutes < 60) return `${diffMinutes}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) return `${diffDays}일 전`

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function getNotificationSenderNickname(notif) {
  return notif.groupNickname
    || getRequestByNotification(notif)?.groupNickname
    || getRequestByNotification(notif)?.nickname
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
  return notif.groupNickname
    || getFriendByNotification(notif)?.groupNickname
    || getFriendByNotification(notif)?.nickname
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

function getNotificationGroupName(notif) {
  return notif.groupName || getRequestByNotification(notif)?.groupName || ''
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
  notifLoading.value = notif.notificationId
  try {
    await friendStore.rejectFromNotif(notif)
  } finally {
    notifLoading.value = null
  }
}

async function deleteNotif(notifId) {
  await friendStore.deleteNotification(notifId)
}
</script>

<style scoped>
.notification-page {
  height: 100%;
  padding: 12px 16px 24px;
  overflow-y: auto;
  background: #fff;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.action-btn {
  min-width: 60px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;
  letter-spacing: 0;
}

.reject-btn {
  border-color: #bbb !important;
  color: #777 !important;
}

.notif-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 8px;
  border-radius: 8px;
  background: #fff;
}

.notif-item.unread {
  background: #f7f6ff;
}

.notif-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ede9ff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-icon {
  font-size: 22px;
  color: var(--color-primary);
}

.notif-content {
  flex: 1;
  min-width: 0;
}

.notif-sender,
.notif-msg {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.notif-sub,
.notif-time {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 2px 0 0;
}

.notif-group {
  display: inline-block;
  max-width: 100%;
  margin: 0 0 2px;
  padding: 2px 6px;
  border-radius: 6px;
  background: #f0f0ff;
  color: var(--color-primary);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notif-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.center-box,
.empty-box {
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #aaa;
}

.empty-icon {
  font-size: 52px;
  margin-bottom: 8px;
}
</style>
