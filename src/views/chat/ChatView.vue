<template>
  <div class="chat-view">
    <!-- 채팅방 목록 -->
    <div v-if="!chatStore.currentRoomId" class="room-list">
      <div v-if="loading" class="center-box">
        <v-progress-circular indeterminate color="primary" />
      </div>
      <div v-else-if="chatStore.rooms.length === 0" class="empty-box">
        <span class="mdi mdi-chat-outline empty-icon" />
        <p>채팅방이 없어요</p>
        <p class="sub">친구 신청을 수락하면 채팅방이 자동으로 열려요</p>
      </div>
      <div
        v-for="room in chatStore.rooms"
        :key="room.id"
        class="room-item"
        @click="openRoom(room.id)"
      >
        <div class="room-avatar">
          <img v-if="room.partnerProfileImage" :src="room.partnerProfileImage" class="avatar-img" />
          <span v-else class="mdi mdi-account avatar-icon" />
        </div>
        <div class="room-info">
          <p class="room-name">{{ room.partnerName }}</p>
          <p class="room-last">{{ truncate(room.lastMessage, 24) }}</p>
        </div>
        <div class="room-meta">
          <p class="room-time">{{ formatRelative(room.lastMessageAt) }}</p>
          <v-badge
            v-if="chatStore.unreadCounts[room.id]"
            :content="chatStore.unreadCounts[room.id]"
            color="primary"
            inline
          />
        </div>
      </div>
    </div>

    <!-- 채팅방 상세 -->
    <div v-else class="chat-room">
      <div class="chat-header">
        <v-btn icon="mdi-arrow-left" variant="text" @click="exitRoom" />
        <span class="chat-partner">{{ currentRoom?.partnerName }}</span>
        <v-btn icon="mdi-exit-to-app" variant="text" color="grey" @click="confirmLeave = true" />
      </div>
      <div class="messages-wrap" ref="messagesEl">
        <div v-for="msg in chatStore.messages" :key="msg.id" class="msg-row" :class="{ mine: msg.senderId === myId }">
          <div class="bubble" :class="{ mine: msg.senderId === myId }">
            <p class="bubble-text">{{ msg.content }}</p>
            <p class="bubble-time">{{ formatTime(msg.createdAt) }}</p>
          </div>
        </div>
      </div>
      <div class="input-area">
        <v-text-field
          v-model="inputMsg"
          placeholder="메시지를 입력하세요"
          variant="outlined"
          density="compact"
          hide-details
          color="primary"
          class="msg-input"
          @keyup.enter="sendMsg"
        />
        <v-btn icon="mdi-send" color="primary" @click="sendMsg" />
      </div>
    </div>

    <!-- 채팅방 나가기 확인 -->
    <v-dialog v-model="confirmLeave" max-width="300">
      <v-card rounded="xl">
        <v-card-title style="font-size:16px;font-weight:700;padding:16px 16px 0">채팅방 나가기</v-card-title>
        <v-card-text>채팅방에서 나가면 대화 내용이 사라져요.</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmLeave = false">취소</v-btn>
          <v-btn color="error" @click="leaveRoom">나가기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { useWebSocket } from '@/composables/useWebSocket'
import { formatTime, formatRelative, truncate } from '@/utils/format'

const chatStore = useChatStore()
const authStore = useAuthStore()
const { sendMessage } = useWebSocket()

const loading = ref(false)
const inputMsg = ref('')
const confirmLeave = ref(false)
const messagesEl = ref(null)

const myId = computed(() => authStore.user?.id)
const currentRoom = computed(() => chatStore.rooms.find((r) => r.id === chatStore.currentRoomId))

onMounted(async () => {
  loading.value = true
  try {
    await chatStore.fetchRooms()
  } finally {
    loading.value = false
  }
})

// 새 메시지 오면 스크롤 맨 아래로
watch(
  () => chatStore.messages.length,
  async () => {
    await nextTick()
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
  },
)

async function openRoom(roomId) {
  await chatStore.fetchMessages(roomId)
  await nextTick()
  if (messagesEl.value) {
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  }
}

function sendMsg() {
  if (!inputMsg.value.trim() || !chatStore.currentRoomId) return
  sendMessage(chatStore.currentRoomId, inputMsg.value)
  inputMsg.value = ''
}

function exitRoom() {
  chatStore.exitRoom()
}

async function leaveRoom() {
  await chatStore.leaveRoom(chatStore.currentRoomId)
  confirmLeave.value = false
}
</script>

<style scoped>
.chat-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 채팅방 목록 */
.room-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.room-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s;
}

.room-item:hover {
  background: #f5f0ff;
}

.room-avatar {
  width: 48px;
  height: 48px;
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
  font-size: 26px;
  color: #6C63FF;
}

.room-info {
  flex: 1;
  min-width: 0;
}

.room-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.room-last {
  font-size: 13px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.room-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.room-time {
  font-size: 11px;
  color: #aaa;
}

/* 채팅방 */
.chat-room {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 8px 4px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.chat-partner {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

.messages-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.msg-row {
  display: flex;
  justify-content: flex-start;
}

.msg-row.mine {
  justify-content: flex-end;
}

.bubble {
  max-width: 70%;
  background: #fff;
  border-radius: 16px 16px 16px 4px;
  padding: 10px 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.bubble.mine {
  background: #6C63FF;
  border-radius: 16px 16px 4px 16px;
}

.bubble-text {
  font-size: 14px;
  color: #333;
  word-break: break-word;
}

.bubble.mine .bubble-text {
  color: #fff;
}

.bubble-time {
  font-size: 10px;
  color: #aaa;
  text-align: right;
  margin-top: 4px;
}

.bubble.mine .bubble-time {
  color: rgba(255,255,255,0.7);
}

.input-area {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}

.msg-input {
  flex: 1;
}

.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 0;
  color: #bbb;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 12px;
}

.sub {
  font-size: 13px;
  color: #ccc;
  margin-top: 4px;
  text-align: center;
}

.center-box {
  display: flex;
  justify-content: center;
  padding: 40px;
}
</style>
