import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import { userApi } from '@/api/user'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
    const accessToken = ref(localStorage.getItem('accessToken') || null)
    const refreshToken = ref(localStorage.getItem('refreshToken') || null)
    const user = ref(null)

    const isLoggedIn = computed(() => !!accessToken.value)

    // 로그인
    async function login(credentials) {
        const res = await authApi.login(credentials)
        const { accessToken: at, refreshToken: rt, user: u } = res.data
        accessToken.value = at
        refreshToken.value = rt
        user.value = u
        localStorage.setItem('accessToken', at)
        localStorage.setItem('refreshToken', rt)
        router.push('/')
    }

    // 로그아웃
    function logout() {
        accessToken.value = null
        refreshToken.value = null
        user.value = null
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        router.push('/auth')
    }

    // 내 정보 조회
    async function fetchMe() {
        try {
            const res = await userApi.getMe()
            user.value = res.data
        } catch {
            logout()
        }
    }

    return { accessToken, refreshToken, user, isLoggedIn, login, logout, fetchMe }
})
