<template>
  <div class="chat-list">
    <header class="chat-header">
      <h1>{{ headerTitle }}</h1>
      <button class="text-btn" type="button" :class="{ 'text-btn--active': isEditMode }" @click="toggleEditMode">
        {{ isEditMode ? completeLabel : editLabel }}
      </button>
    </header>

    <div class="room-list">
      <div
        v-for="room in chatStore.rooms"
        :key="room.roomId"
        class="room-row"
        :class="{ 'room-row--edit': isEditMode }"
      >
        <button
          type="button"
          class="exit-trigger"
          :class="{ 'exit-trigger--visible': isEditMode }"
          :tabindex="isEditMode ? 0 : -1"
          :aria-hidden="!isEditMode"
          :aria-label="exitRoomLabel"
          @click="isEditMode && openExitModal(room)"
        >
          <span class="mdi mdi-exit-to-app" />
        </button>

        <button class="room-item" type="button" :disabled="isEditMode" @click="goToRoom(room)">
          <div class="avatar">
            <img
              v-if="room.opponentProfileImageUrl"
              :src="getImageUrl(room.opponentProfileImageUrl)"
              :alt="room.opponentNickname"
            />
            <span v-else>{{ room.opponentNickname?.[0] ?? '?' }}</span>
          </div>

          <div class="room-info">
            <div class="room-top">
              <strong>{{ room.opponentNickname }}</strong>
              <span class="room-time">{{ formatTime(room.lastMessageAt) }}</span>
            </div>
            <div class="room-bottom">
              <p class="room-preview">{{ room.lastMessageText || '' }}</p>
              <span v-if="room.unreadCount > 0" class="badge">{{ room.unreadCount }}</span>
              <span v-else class="badge-placeholder" aria-hidden="true"></span>
            </div>
          </div>
        </button>
      </div>

      <div v-if="chatStore.rooms.length === 0" class="empty-list">
        {{ emptyLabel }}
      </div>
    </div>

    <div v-if="showExitModal" class="modal-overlay" @click.self="closeExitModal">
      <div class="modal-card">
        <div class="modal-icon">
          <span class="mdi mdi-exit-to-app" />
        </div>
        <h3>{{ exitRoomLabel }}</h3>
        <p>{{ exitModalDescription }}</p>
        <div class="modal-btns">
          <button type="button" class="modal-btn secondary" @click="closeExitModal">{{ cancelLabel }}</button>
          <button type="button" class="modal-btn danger" @click="confirmExitRoom">{{ exitLabel }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chatStore'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '')
const router = useRouter()
const chatStore = useChatStore()

const headerTitle = '\uCC44\uD305'
const editLabel = '\uD3B8\uC9D1'
const completeLabel = '\uC644\uB8CC'
const exitRoomLabel = '\uCC44\uD305\uBC29 \uB098\uAC00\uAE30'
const exitModalDescription = '\uB300\uD654 \uB0B4\uC6A9\uC774 \uBAA8\uB450 \uC0AD\uC81C\uB429\uB2C8\uB2E4. \uC815\uB9D0\uB85C \uB098\uAC00\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?'
const cancelLabel = '\uCDE8\uC18C'
const exitLabel = '\uB098\uAC00\uAE30'
const emptyLabel = '\uCC44\uD305\uBC29\uC774 \uC5C6\uC2B5\uB2C8\uB2E4'
const yesterdayLabel = '\uC5B4\uC81C'

const isEditMode = ref(false)
const showExitModal = ref(false)
const selectedRoomId = ref(null)

onMounted(async () => {
  chatStore.connect()

  try {
    await chatStore.loadRooms()
  } catch (error) {
    console.error(error)
  }
})

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value

  if (!isEditMode.value) {
    closeExitModal()
  }
}

const openExitModal = (room) => {
  selectedRoomId.value = room.roomId
  showExitModal.value = true
}

const closeExitModal = () => {
  showExitModal.value = false
  selectedRoomId.value = null
}

const confirmExitRoom = async () => {
  if (!selectedRoomId.value) return

  try {
    await chatStore.exitRoom(selectedRoomId.value)
    closeExitModal()
  } catch (error) {
    console.error(error)
  }
}

const goToRoom = (room) => {
  if (isEditMode.value) return
  router.push(`/chat/${room.roomId}`)
}

const getImageUrl = (path) => (path ? `${API_BASE_URL}${path}` : null)

const formatTime = (dateStr) => {
  if (!dateStr) return ''

  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) {
    return date.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' })
  }

  if (diffDays === 1) {
    return yesterdayLabel
  }

  return `${diffDays}\uC77C \uC804`
}
</script>

<style scoped>
.chat-list {
  display: flex;
  flex-direction: column;
  height: calc(100dvh - var(--app-footer-height));
  background: #ffffff;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 16px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.chat-header h1 {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.text-btn {
  min-width: 52px;
  height: 32px;
  padding: 0 12px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.text-btn--active {
  background: rgba(108, 99, 255, 0.12);
  color: var(--color-primary);
}

.room-list {
  flex: 1;
  overflow-y: auto;
}

.room-row {
  position: relative;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  overflow: hidden;
}

.room-row--edit {
  padding-left: 0;
  gap: 0;
}

.exit-trigger {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #ff4d5e;
  display: grid;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;
  z-index: 1;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.22s ease, transform 0.22s ease;
  transform: translate(-6px, -50%);
}

.exit-trigger .mdi {
  font-size: 22px;
}

.exit-trigger--visible {
  opacity: 1;
  pointer-events: auto;
  transform: translate(0, -50%);
}

.room-item {
  display: flex;
  width: 100%;
  gap: 12px;
  align-items: center;
  padding: 14px 20px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease, padding-left 0.22s ease;
}

.room-item:hover:not(:disabled) {
  background: var(--color-background);
}

.room-item:disabled {
  cursor: default;
}

.room-row--edit .room-item {
  padding-left: 56px;
}

.avatar {
  position: relative;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7f3dff, #4c3cff);
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #ff4d5e;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.room-info {
  flex: 1;
  min-width: 0;
}

.room-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  gap: 12px;
}

.room-top strong {
  color: var(--color-text-primary);
  font-size: 16px;
  font-weight: 700;
}

.room-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.room-time {
  color: var(--color-text-secondary);
  font-size: 11px;
  flex-shrink: 0;
}

.room-preview {
  flex: 1;
  overflow: hidden;
  color: var(--color-text-secondary);
  font-size: 14px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.badge-placeholder {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.empty-list {
  padding: 48px 0;
  color: var(--color-text-secondary);
  font-size: 14px;
  text-align: center;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
}

.modal-card {
  width: min(320px, calc(100vw - 32px));
  padding: 28px 24px 24px;
  border-radius: 24px;
  background: #ffffff;
  text-align: center;
}

.modal-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: rgba(255, 77, 94, 0.12);
  color: #ff4d5e;
  display: grid;
  place-items: center;
}

.modal-icon .mdi {
  font-size: 28px;
}

.modal-card h3 {
  margin-bottom: 10px;
  color: var(--color-text-primary);
  font-size: 28px;
  font-weight: 800;
}

.modal-card p {
  margin-bottom: 20px;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.5;
}

.modal-btns {
  display: flex;
  gap: 10px;
}

.modal-btn {
  flex: 1;
  height: 48px;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.modal-btn.secondary {
  background: var(--color-background);
  color: var(--color-text-primary);
}

.modal-btn.danger {
  background: linear-gradient(90deg, #ff3b30 0%, #ff6676 100%);
  color: #fff;
}
</style>
