<template>
  <LayoutAuth v-if="isAuthPage" />
  <LayoutDefault v-else />
</template>

<script setup>
import { computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import LayoutDefault from './components/layout/LayoutDefault.vue'
import LayoutAuth from './components/layout/LayoutAuth.vue'
import { useAuthStore } from '@/stores/auth'
import { useFriendStore } from '@/stores/friendStore'
import { useWebSocket } from '@/composables/useWebSocket'

const route = useRoute()
const authStore = useAuthStore()
const friendStore = useFriendStore()
const { connect, disconnect } = useWebSocket()
let notificationPoller = null

const isAuthPage = computed(() => route.meta.layout === 'auth')

async function refreshNotifications() {
  try {
    await Promise.all([
      friendStore.fetchNotifications(),
      friendStore.fetchRequests(),
    ])
  } catch {
    // 다음 주기에 다시 시도한다.
  }
}

function startNotificationPolling() {
  if (notificationPoller) return
  refreshNotifications()
  notificationPoller = window.setInterval(refreshNotifications, 30000)
}

function stopNotificationPolling() {
  if (!notificationPoller) return
  window.clearInterval(notificationPoller)
  notificationPoller = null
}

// 로그인 상태 변화 감지: 로그인하면 WebSocket 연결, 로그아웃하면 해제
watch(
  () => authStore.isLoggedIn,
  (loggedIn) => {
    if (loggedIn) {
      connect()
      startNotificationPolling()
    } else {
      disconnect()
      stopNotificationPolling()
    }
  },
)

// 앱 시작 시 이미 토큰이 있으면 내 정보 로드 + WebSocket 연결
onMounted(async () => {
  if (authStore.isLoggedIn) {
    await authStore.fetchMe()
    connect()
    startNotificationPolling()
  }
})

onBeforeUnmount(() => {
  stopNotificationPolling()
})
</script>
<style>

</style>
