import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const protectedLayout = { layout: 'default', requiresAuth: true }

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
        path: '/',
        name: 'group',
        component: () => import('../views/group/GroupView.vue'),
        meta: { layout: 'default', title: '그룹' }
        },
        {
        path: '/chat',
        name: 'chat-list',
        component: () => import('../views/chat/ChatListView.vue'),
        meta: { layout: 'default', title: '채팅', hideHeader: true },
        },
        {
        path: '/chat/:roomId',
        name: 'chat-room',
        component: () => import('../views/chat/ChatRoomView.vue'),
        meta: { layout: 'default', title: '채팅방', hideHeader: true },
        },
        {
        path: '/friend',
        name: 'friend',
        component: () => import('../views/friend/FriendView.vue'),
        meta: { layout: 'default', title: '친구' }
        },
        {
        path: '/music',
        name: 'music',
        component: () => import('../views/music/MusicView.vue'),
        meta: { layout: 'default', title: '음악' }
        },
        {
        path: '/music/select',
        name: 'music-select',
        component: () => import('../views/music/MusicSelectView.vue'),
        meta: { layout: 'default', title: '음악 선택', hideHeader: true }
        },
        {
        path: '/music/search',
        name: 'music-search',
        component: () => import('../views/music/MusicSearchView.vue'),
        meta: { layout: 'default', title: '음악 검색', hideHeader: true }
        },
        {
        path: '/mypage',
        name: 'mypage',
        component: () => import('../views/mypage/MypageView.vue'),
        meta: { layout: 'default', title: '마이페이지' }
        },
        {
        path: '/login',
        name: 'login',
        component: () => import('../views/auth/LoginView.vue'),
        meta: { layout: 'auth' }
        },
        {
        path: '/register',
        name: 'register',
        component: () => import('../views/auth/RegisterView.vue'),
        meta: { layout: 'auth' }
        },
        {
        path: '/find-password',
        name: 'findPassword',
        component: () => import('../views/auth/FindPasswordView.vue'),
        meta: { layout: 'auth' }
        },
        {
        path: '/onboarding',
        name: 'onboarding',
        component: () => import('../views/auth/OnboardingView.vue'),
        meta: { layout: 'auth' }
        }
    ],
})
// 페이지 이동할 때마다 먼저 실행되는 함수
router.beforeEach((to) => {
    // to: 지금 가려는 페이지
    // from: 지금 있던 페이지
    // next(): "통과시켜줘" 하는 함수

    // const authStore = useAuthStore()
    // // 로그인 없이 접근 가능한 페이지 목록
    // const publicPages = ['/login', '/register', '/find-password', '/onboarding']
    // // 지금 가려는 페이지가 그 목록에 있는지 확인
    // const isPublic = publicPages.includes(to.path)

    // // if (!isPublic && !authStore.isLoggedIn) {
    // //     // !isPublic: 보호된 페이지인데 && !authStore.isLoggedIn: 로그인도 안 했으면 => /login 으로 강제 이동
    // //     next('/login')
    // // } else if (isPublic && authStore.isLoggedIn) {
    // //     next('/')  // 이미 로그인했으면 홈으로
    // // } else {
    // //     next() // 아니면 그냥 통과
    // // }
    // if (!isPublic && !authStore.isLoggedIn) {
    //     return '/login'
    // }
    // else if (isPublic && authStore.isLoggedIn) {
    //     return '/'
    // }

    const token = localStorage.getItem('token')
    const publicPages = ['/login', '/register', '/find-password', '/onboarding']
    const isPublic = publicPages.includes(to.path)

    if (!isPublic && !token) {
        return '/login'
    } else if (isPublic && token) {
        return '/'
    }
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
