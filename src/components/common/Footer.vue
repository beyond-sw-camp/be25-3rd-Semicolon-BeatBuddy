<template>
  <nav class="tab-bar">
    <RouterLink to="/" class="tab-item" :class="{ 'tab-item--active': isActive('/') }">
      <span class="mdi mdi-account-group"></span>
      <span>그룹</span>
    </RouterLink>

    <RouterLink to="/friend" class="tab-item" :class="{ 'tab-item--active': isActive('/friend') }">
      <span class="mdi mdi-account-multiple"></span>
      <span>친구</span>
    </RouterLink>

    <RouterLink to="/music" class="tab-item" :class="{ 'tab-item--active': isActive('/music') }">
      <span class="mdi mdi-music"></span>
      <span>음악</span>
    </RouterLink>

    <RouterLink to="/chat" class="tab-item" :class="{ 'tab-item--active': isActive('/chat') }">
      <span class="mdi mdi-chat"></span>
      <span>채팅</span>
    </RouterLink>

    <RouterLink to="/mypage" class="tab-item" :class="{ 'tab-item--active': isActive('/mypage') }">
      <span class="mdi mdi-account"></span>
      <span>마이</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const isActive = (path) => {
  if (path === '/') {
    return route.path === '/'
  }

  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 430px;
  height: 64px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #ffffff;
  border-top: 1px solid var(--color-border);
  z-index: 100;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: 11px;
}

.tab-item .mdi {
  font-size: 24px;
}

.tab-item--active { /* .tab-item.router-link-active 같은 경우 애매한 /chat/:roomId 같은 상세 페이지에서 활성화가 애매해서 수정.. */
  color: var(--color-primary);
}
</style>
