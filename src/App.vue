<template>
  <LayoutAuth v-if="isAuthPage" />
  <LayoutDefault v-else />
</template>

<script setup>
import { computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import LayoutDefault from './components/layout/LayoutDefault.vue'
import LayoutAuth from './components/layout/LayoutAuth.vue'
import { useAuthStore } from '@/stores/auth'
import { useWebSocket } from '@/composables/useWebSocket'

const route = useRoute()
const authStore = useAuthStore()
const { connect, disconnect } = useWebSocket()

const isAuthPage = computed(() => route.meta.layout === 'auth')

// 로그인 상태 변화 감지: 로그인하면 WebSocket 연결, 로그아웃하면 해제
watch(
  () => authStore.isLoggedIn,
  (loggedIn) => {
    if (loggedIn) {
      connect()
    } else {
      disconnect()
    }
  },
)

// 앱 시작 시 이미 토큰이 있으면 내 정보 로드 + WebSocket 연결
onMounted(async () => {
  if (authStore.isLoggedIn) {
    await authStore.fetchMe()
    connect()
  }
})
</script>
<style>

</style>