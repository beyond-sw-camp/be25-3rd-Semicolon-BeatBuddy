<template>
  <div class="chat-room">
    <header class="room-header">
      <button type="button" class="back-btn" @click="router.push('/chat')">
        <span class="mdi mdi-chevron-left" />
      </button>

      <div class="room-profile">
        <div class="avatar">
          <img
            v-if="room?.opponentProfileImageUrl"
            :src="getImageUrl(room.opponentProfileImageUrl)"
            :alt="room?.opponentNickname"
          />
          <span v-else>{{ room?.opponentNickname?.[0] ?? '?' }}</span>
        </div>

        <div class="room-copy">
          <h1>{{ room?.opponentNickname ?? defaultRoomTitle }}</h1>
          <p>{{ onlineLabel }}</p>
        </div>
      </div>
    </header>

    <div ref="messageListEl" class="message-list">
      <div class="message-stack">
        <div
          v-for="(msg, index) in normalizedMessages"
          :key="msg.messageId ?? index"
        >
          <div v-if="shouldShowDateChip(index)" class="date-chip">
            <span>{{ formatDateChip(msg.createdAt) }}</span>
          </div>

          <div class="msg-row" :class="{ mine: isMine(msg) }">
            <div v-if="!isMine(msg)" class="small-avatar">
              <img
                v-if="room?.opponentProfileImageUrl"
                :src="getImageUrl(room.opponentProfileImageUrl)"
                :alt="room?.opponentNickname"
              />
              <span v-else>{{ room?.opponentNickname?.[0] ?? '?' }}</span>
            </div>

            <div class="msg-body">
              <div v-if="!isMine(msg)" class="msg-sender">
                {{ room?.opponentNickname ?? msg.senderNickname }}
              </div>

              <div class="bubble-wrap">
                <div class="bubble">{{ msg.messageText }}</div>
                <div class="msg-meta">
                  <span v-if="isMine(msg) && showUnreadBadge(msg)" class="unread-dot">1</span>
                  <span class="msg-time">{{ formatTime(msg.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="composer-shell">
      <div class="composer">
        <input
          v-model="draft"
          type="text"
          :placeholder="composerPlaceholder"
          :disabled="chatStore.isOpponentExited"
          @keydown.enter="sendMessage"
        />
        <button
          type="button"
          class="send-btn"
          :disabled="chatStore.isOpponentExited || !chatStore.isConnected"
          @click="sendMessage"
        >
          <span class="mdi mdi-send" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/authStore'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '')
const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()
const authStore = useAuthStore()

const defaultRoomTitle = '\uCC44\uD305\uBC29'
const onlineLabel = '\uC628\uB77C\uC778'
const exitedPlaceholder = '\uC0C1\uB300\uBC29\uC774 \uCC44\uD305\uBC29\uC744 \uB098\uAC14\uC2B5\uB2C8\uB2E4'
const defaultPlaceholder = '\uBA54\uC2DC\uC9C0\uB97C \uC785\uB825\uD558\uC138\uC694...'
const decodeJwtPayload = (token) => {
  if (!token) return null

  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = decodeURIComponent(
      atob(normalized)
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    )

    return JSON.parse(decoded)
  } catch {
    return null
  }
}

const roomId = computed(() => Number(route.params.roomId))
const room = computed(() => chatStore.rooms.find((item) => item.roomId === roomId.value))

const draft = ref('')
const messageListEl = ref(null)

const normalizedMessages = computed(() =>
  [...chatStore.messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
)

const composerPlaceholder = computed(() =>
  chatStore.isOpponentExited ? exitedPlaceholder : defaultPlaceholder
)
const currentUserId = computed(() => {
  if (authStore.user?.userId) return Number(authStore.user.userId)
  if (authStore.user?.id) return Number(authStore.user.id)
  const payload = decodeJwtPayload(authStore.token)
  return payload?.sub ? Number(payload.sub) : null
})

const getImageUrl = (path) => (path ? `${API_BASE_URL}${path}` : null)

const isMine = (message) => {
  return Number(message.senderId) === currentUserId.value
}

const showUnreadBadge = (message) => message.isRead === false

const markRoomAsRead = () => {
  if (!chatStore.isConnected) return
  chatStore.markAsRead(roomId.value)
}

const formatTime = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' })
    : ''

const formatDateChip = (dateStr) => {
  if (!dateStr) return ''

  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

const toDateKey = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

const shouldShowDateChip = (index) => {
  if (index === 0) return true

  const current = normalizedMessages.value[index]
  const previous = normalizedMessages.value[index - 1]

  if (!current || !previous) return false

  return toDateKey(current.createdAt) !== toDateKey(previous.createdAt)
}

const sendMessage = async () => {
  if (!draft.value.trim()) return

  const sent = chatStore.sendMessage(roomId.value, draft.value)
  if (!sent) return

  draft.value = ''
  await scrollToBottom()
}

const scrollToBottom = async () => {
  await nextTick()

  if (messageListEl.value) {
    messageListEl.value.scrollTop = messageListEl.value.scrollHeight
  }
}

watch(
  () => normalizedMessages.value.length,
  async () => {
    await scrollToBottom()
    markRoomAsRead()
  }
)

watch(
  () => chatStore.isConnected,
  (connected) => {
    if (!connected) return
    chatStore.subscribeRoom(roomId.value)
    markRoomAsRead()
  }
)

onMounted(async () => {
  chatStore.connect()

  try {
    if (chatStore.rooms.length === 0) {
      await chatStore.loadRooms()
    }

    await chatStore.loadMessages(roomId.value)
    if (chatStore.isConnected) {
      chatStore.subscribeRoom(roomId.value)
      markRoomAsRead()
    }
    await scrollToBottom()
  } catch (error) {
    console.error(error)
  }
})

onUnmounted(() => {
  chatStore.unsubscribeRoom()
})
</script>

<style scoped>
.chat-room {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  overflow: hidden;
}

.room-header {
  height: 64px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  border-bottom: 1px solid var(--color-border);
  background: #ffffff;
  flex-shrink: 0;
}

.back-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--color-text-primary);
  display: grid;
  place-items: center;
  cursor: pointer;
}

.back-btn .mdi {
  font-size: 24px;
}

.room-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.avatar,
.small-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #7f3dff, #4c3cff);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.small-avatar {
  width: 32px;
  height: 32px;
  margin-top: 2px;
  font-size: 12px;
}

.avatar img,
.small-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.room-copy h1 {
  color: var(--color-text-primary);
  font-size: 18px;
  font-weight: 700;
}

.room-copy p {
  margin-top: 2px;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.message-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px 16px 8px;
}

.message-stack {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 14px;
}

.date-chip {
  display: flex;
  justify-content: center;
  margin-bottom: 2px;
}

.date-chip span {
  padding: 5px 14px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: #ffffff;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.msg-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.msg-row.mine {
  justify-content: flex-end;
}

.msg-body {
  display: flex;
  flex-direction: column;
  max-width: min(74%, 260px);
}

.msg-row.mine .msg-body {
  align-items: flex-end;
}

.msg-sender {
  margin-bottom: 4px;
  padding: 0 4px;
  color: var(--color-text-secondary);
  font-size: 12px;
}

.bubble-wrap {
  display: flex;
  align-items: flex-end;
  gap: 6px;
}

.bubble {
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  background: #f4f5f8;
  color: var(--color-text-primary);
  font-size: 14px;
  line-height: 1.55;
  word-break: break-word;
}

.msg-row.mine .bubble {
  border-color: var(--color-primary);
  border-bottom-right-radius: 4px;
  background: var(--color-primary);
  color: #ffffff;
}

.msg-row:not(.mine) .bubble {
  border-bottom-left-radius: 4px;
}

.msg-row:not(.mine) .bubble-wrap {
  align-items: flex-end;
}

.msg-row:not(.mine) .msg-meta {
  order: 2;
}

.msg-row.mine .bubble-wrap {
  flex-direction: row;
}

.msg-row.mine .msg-meta {
  order: -1;
  align-items: flex-end;
}

.msg-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
  flex-shrink: 0;
}

.msg-time {
  color: var(--color-text-secondary);
  font-size: 11px;
  flex-shrink: 0;
}

.unread-dot {
  color: var(--color-primary);
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.composer-shell {
  padding: 10px 16px 12px;
  border-top: 1px solid var(--color-border);
  background: #ffffff;
  flex-shrink: 0;
}

.composer {
  display: flex;
  align-items: center;
  gap: 10px;
}

.composer input {
  flex: 1;
  height: 40px;
  padding: 0 16px;
  border: 1.5px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-background);
  color: var(--color-text-primary);
  font-size: 14px;
  outline: none;
}

.composer input:focus {
  border-color: var(--color-primary);
}

.composer input::placeholder {
  color: var(--color-text-secondary);
}

.composer input:disabled {
  background: var(--color-border);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

.send-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: var(--color-primary);
  color: #ffffff;
  font-size: 18px;
  display: grid;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
