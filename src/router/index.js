import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'group',
            component: () => import('../views/group/GroupView.vue'),
            meta: { layout: 'default', title: '그룹', requiresAuth: true }
        },
        {
        path: '/group/create',
        name: 'group-create',
        component: () => import('../views/group/GroupCreateView.vue'),
        meta: { layout: 'default', title: '새 그룹 만들기', showBack: true }
        },
        {
        path: '/group/join',
        name: 'group-join',
        component: () => import('../views/group/GroupJoinView.vue'),
        meta: { layout: 'default', title: '초대 코드로 가입', showBack: true }
        },
        {
        path: '/chat',
        name: 'chat',
        component: () => import('../views/chat/ChatView.vue'),
        meta: { layout: 'default', title: '채팅' }
        },
        {
            path: '/friend',
            name: 'friend',
            component: () => import('../views/friend/FriendView.vue'),
            meta: { layout: 'default', title: '친구', requiresAuth: true }
        },
        {
            path: '/music',
            name: 'music',
            component: () => import('../views/music/MusicView.vue'),
            meta: { layout: 'default', title: '음악', requiresAuth: true }
        },
        {
            path: '/mypage',
            name: 'mypage',
            component: () => import('../views/mypage/MypageView.vue'),
            meta: { layout: 'default', title: '마이페이지', requiresAuth: true }
        },
        {
            path: '/auth',
            name: 'auth',
            component: () => import('../views/auth/AuthView.vue'),
            meta: { layout: 'auth' }
        },
    ],
})

// 네비게이션 가드
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('accessToken')
    const isLoggedIn = !!token

    if (to.meta.requiresAuth && !isLoggedIn) {
        // 로그인 필요 페이지 → 비로그인 상태면 /auth로
        next({ name: 'auth' })
    } else if (to.name === 'auth' && isLoggedIn) {
        // 이미 로그인 상태로 /auth 접근 → 홈으로
        next({ name: 'group' })
    } else {
        next()
    }
})

export default router