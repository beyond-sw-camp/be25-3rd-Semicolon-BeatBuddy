<template>
  <div class="friend-view">
    <!-- 알림 배지 영역 -->
    <div class="notif-bar" v-if="friendStore.unreadNotificationCount > 0" @click="showNotifications = true">
      <span class="mdi mdi-bell" />
      새 알림 {{ friendStore.unreadNotificationCount }}개
      <span class="mdi mdi-chevron-right" />
    </div>

    <!-- 탭 -->
    <v-tabs v-model="tab" color="primary" class="friend-tabs">
      <v-tab value="friends">
        친구
        <v-badge v-if="friendStore.friends.length" :content="friendStore.friends.length" color="primary" inline />
      </v-tab>
      <v-tab value="requests">
        신청
        <v-badge v-if="friendStore.receivedRequests.length" :content="friendStore.receivedRequests.length" color="error" inline />
      </v-tab>
    </v-tabs>

    <!-- 친구 목록 탭 -->
    <div v-if="tab === 'friends'" class="tab-content">
      <!-- 검색 -->
      <v-text-field
        v-model="search"
        placeholder="친구 검색"
        variant="outlined"
        density="compact"
        prepend-inner-icon="mdi-magnify"
        color="primary"
        class="mb-3"
        hide-details
      />
      <div v-if="loading" class="center-box">
        <v-progress-circular indeterminate color="primary" />
      </div>
      <div v-else-if="filteredFriends.length === 0" class="empty-box">
        <span class="mdi mdi-account-multiple empty-icon" />
        <p>{{ search ? '검색 결과가 없어요' : '아직 친구가 없어요' }}</p>
      </div>
      <div v-else class="friend-list">
        <div
          v-for="friend in filteredFriends"
          :key="friend.id"
          class="friend-item"
          @click="openProfile(friend)"
        >
          <div class="friend-avatar">
            <img v-if="friend.profileImage" :src="friend.profileImage" class="avatar-img" />
            <span v-else class="mdi mdi-account avatar-icon" />
          </div>
          <div class="friend-info">
            <p class="friend-name">{{ friend.name }}</p>
            <p class="friend-email">{{ friend.email }}</p>
          </div>
          <v-btn
            icon="mdi-chat-outline"
            variant="text"
            color="primary"
            size="small"
            @click.stop="goToChat(friend)"
          />
          <v-btn
            icon="mdi-account-remove"
            variant="text"
            color="grey"
            size="small"
            @click.stop="confirmDelete(friend)"
          />
        </div>
      </div>
    </div>

    <!-- 신청 관리 탭 -->
    <div v-else class="tab-content">
      <p class="section-label">받은 신청 ({{ friendStore.receivedRequests.length }})</p>
      <div v-if="friendStore.receivedRequests.length === 0" class="empty-small">받은 친구 신청이 없어요</div>
      <div class="friend-list" v-else>
        <div v-for="req in friendStore.receivedRequests" :key="req.id" class="friend-item">
          <div class="friend-avatar">
            <span class="mdi mdi-account avatar-icon" />
          </div>
          <div class="friend-info">
            <p class="friend-name">{{ req.senderName }}</p>
          </div>
          <v-btn icon="mdi-check" color="primary" size="small" class="mr-1" @click="accept(req.id)" />
          <v-btn icon="mdi-close" color="grey" variant="tonal" size="small" @click="reject(req.id)" />
        </div>
      </div>

      <p class="section-label mt-4">보낸 신청 ({{ friendStore.sentRequests.length }})</p>
      <div v-if="friendStore.sentRequests.length === 0" class="empty-small">보낸 친구 신청이 없어요</div>
      <div class="friend-list" v-else>
        <div v-for="req in friendStore.sentRequests" :key="req.id" class="friend-item">
          <div class="friend-avatar">
            <span class="mdi mdi-account avatar-icon" />
          </div>
          <div class="friend-info">
            <p class="friend-name">{{ req.receiverName }}</p>
          </div>
          <v-chip size="small" color="grey" variant="tonal">대기 중</v-chip>
        </div>
      </div>
    </div>

    <!-- 친구 프로필 다이얼로그 -->
    <v-dialog v-model="showProfile" max-width="360">
      <v-card v-if="selectedFriend" rounded="xl" class="profile-card">
        <div class="profile-header">
          <div class="profile-avatar">
            <img v-if="selectedFriend.profileImage" :src="selectedFriend.profileImage" class="avatar-img" />
            <span v-else class="mdi mdi-account avatar-icon-lg" />
          </div>
          <h3>{{ selectedFriend.name }}</h3>
          <p class="text-grey">{{ selectedFriend.email }}</p>
        </div>
        <v-card-text v-if="selectedFriend.topSongs">
          <p class="section-label">💿 최애곡</p>
          <div v-for="song in selectedFriend.topSongs" :key="song.id" class="mini-song-item">
            <img v-if="song.albumCover" :src="song.albumCover" class="mini-cover" />
            <div>
              <p class="song-title">{{ song.title }}</p>
              <p class="song-artist">{{ song.artist }}</p>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showProfile = false">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 알림 다이얼로그 -->
    <v-dialog v-model="showNotifications" max-width="360">
      <v-card rounded="xl">
        <v-card-title class="dialog-title">🔔 알림</v-card-title>
        <v-card-text class="pa-0">
          <div v-for="notif in friendStore.notifications" :key="notif.id" class="notif-item" :class="{ unread: !notif.read }">
            <span class="notif-msg">{{ notif.message }}</span>
            <v-btn icon="mdi-close" size="x-small" variant="text" @click="deleteNotif(notif.id)" />
          </div>
          <div v-if="!friendStore.notifications.length" class="empty-small pa-4">알림이 없어요</div>
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
        <v-card-text>{{ deletingFriend?.name }}님을 친구 목록에서 삭제할까요?</v-card-text>
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
import { useRouter } from 'vue-router'

const friendStore = useFriendStore()
const router = useRouter()

const tab = ref('friends')
const search = ref('')
const loading = ref(false)
const showProfile = ref(false)
const selectedFriend = ref(null)
const showNotifications = ref(false)
const showDeleteConfirm = ref(false)
const deletingFriend = ref(null)

const filteredFriends = computed(() => {
  const q = search.value.toLowerCase()
  return q
    ? friendStore.friends.filter((f) => f.name.toLowerCase().includes(q) || f.email.toLowerCase().includes(q))
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

function openProfile(friend) {
  selectedFriend.value = friend
  showProfile.value = true
}

function goToChat(friend) {
  router.push({ name: 'chat', query: { friendId: friend.id } })
}

function confirmDelete(friend) {
  deletingFriend.value = friend
  showDeleteConfirm.value = true
}

async function doDelete() {
  await friendStore.deleteFriend(deletingFriend.value.id)
  showDeleteConfirm.value = false
  deletingFriend.value = null
}

async function accept(requestId) {
  await friendStore.acceptRequest(requestId)
}

async function reject(requestId) {
  await friendStore.rejectRequest(requestId)
}

async function deleteNotif(notifId) {
  await friendStore.deleteNotification(notifId)
}
</script>

<style scoped>
.friend-view {
  height: 100%;
  padding: 0 12px 12px;
}

.notif-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ede9ff;
  color: #6C63FF;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 10px;
  margin-bottom: 10px;
  cursor: pointer;
}

.notif-bar .mdi-chevron-right {
  margin-left: auto;
}

.friend-tabs {
  margin-bottom: 12px;
}

.tab-content {
  padding: 0 4px;
}

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

.section-label {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
}

.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 0;
  color: #bbb;
}

.empty-icon {
  font-size: 56px;
  margin-bottom: 8px;
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

.mini-song-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
}

.mini-cover {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  object-fit: cover;
}

.song-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.song-artist {
  font-size: 11px;
  color: #888;
}

.notif-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.notif-item.unread {
  background: #f5f0ff;
}

.notif-msg {
  flex: 1;
  font-size: 13px;
  color: #333;
}

.dialog-title {
  font-size: 18px;
  font-weight: 700;
  padding: 16px 16px 0;
}
</style>
>>>>>>> parent of 6e7ed79 (feat: 채팅/친구/그룹/음악/마이페이지 기능 개선 및 UI 수정)
