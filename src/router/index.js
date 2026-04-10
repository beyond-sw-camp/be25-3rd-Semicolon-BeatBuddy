import { createRouter, createWebHistory } from 'vue-router'

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
        name: 'chat',
        component: () => import('../views/chat/ChatView.vue'),
        meta: { layout: 'default', title: '채팅' }
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
        path: '/find-email',
        name: 'findEmail',
        component: () => import('../views/auth/FindEmailView.vue'),
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

export default router