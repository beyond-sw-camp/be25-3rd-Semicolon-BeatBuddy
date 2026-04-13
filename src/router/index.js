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
        path: '/music/select',
        name: 'musicSelect',
        component: () => import('../views/music/MusicSelectView.vue'),
        meta: { layout: 'default' }
        },
        {
        path: '/music/search',
        name: 'musicSearch',
        component: () => import('../views/music/MusicSearchView.vue'),
        meta: { layout: 'default' }
        },
        {
        path: '/mypage',
        name: 'mypage',
        component: () => import('../views/mypage/MypageView.vue'),
        meta: { layout: 'default', title: '마이페이지' }
        },
        {
        path: '/auth',
        name: 'auth',
        component: () => import('../views/auth/AuthView.vue'),
        meta: { layout: 'auth' }
        },
    ],
})

export default router