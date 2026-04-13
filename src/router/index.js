import { createRouter, createWebHistory } from 'vue-router'

const protectedLayout = { layout: 'default', requiresAuth: true }

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'group',
      component: () => import('../views/group/GroupView.vue'),
      meta: { ...protectedLayout, title: '그룹' },
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('../views/chat/ChatView.vue'),
      meta: { ...protectedLayout, title: '채팅' },
    },
    {
      path: '/friend',
      name: 'friend',
      component: () => import('../views/friend/FriendView.vue'),
      meta: { ...protectedLayout, title: '친구' },
    },
    {
      path: '/music',
      name: 'music',
      component: () => import('../views/music/MusicView.vue'),
      meta: { ...protectedLayout, title: '음악' },
    },
    {
      path: '/mypage',
      name: 'mypage',
      component: () => import('../views/mypage/MypageView.vue'),
      meta: { ...protectedLayout, title: '마이페이지' },
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/auth/AuthView.vue'),
      meta: { layout: 'auth', guestOnly: true },
    },
  ],
})

router.beforeEach((to) => {
  const isAuthenticated = Boolean(localStorage.getItem('accessToken'))

  if (to.meta.requiresAuth && !isAuthenticated) {
    return {
      path: '/auth',
      query: { redirect: to.fullPath },
    }
  }

  if (to.meta.guestOnly && isAuthenticated) {
    return '/mypage'
  }

  return true
})

export default router
