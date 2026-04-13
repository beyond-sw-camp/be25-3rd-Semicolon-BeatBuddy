import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import { userApi } from '@/api/user'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
    const accessToken = ref(localStorage.getItem('accessToken') || null)
    const user = ref(null)

    const isLoggedIn = computed(() => !!accessToken.value)

    // 로그인
    async function login(credentials) {
        const res = await authApi.login(credentials)
        // 백엔드 응답: { status, message, result: { accessToken, userId, email, nickname } }
        const result = res.data?.result
        if (!result?.accessToken) {
            throw new Error(res.data?.message || '로그인 응답이 올바르지 않습니다.')
        }
        const { accessToken: at, userId, email, nickname } = result
        accessToken.value = at
        user.value = { id: userId, email, name: nickname }
        localStorage.setItem('accessToken', at)
        await router.replace('/')
    }

    // 로그아웃
    function logout() {
        clearUser()
        router.push('/auth')
    }

    // 유저 상태만 초기화 (인터셉터에서 router 없이 호출 가능)
    function clearUser() {
        accessToken.value = null
        user.value = null
        localStorage.removeItem('accessToken')
    }

    // 내 정보 조회 — 실패해도 로그아웃 하지 않음 (토큰은 유효할 수 있음)
    async function fetchMe() {
        try {
            const res = await userApi.getMe()
            const data = res.data?.result ?? res.data
            user.value = {
                id: data.userId ?? data.id,
                email: data.email,
                name: data.nickname ?? data.name,
                gender: data.gender,
                birthYear: data.birthYear,
                profileImage: data.profileImageUrl ?? data.profileImage ?? null,
            }
        } catch (e) {
            // 401이면 인터셉터가 refresh를 시도함 — 여기서는 조용히 실패만 처리
            console.warn('fetchMe 실패:', e?.response?.status)
        }
    }

    return { accessToken, user, isLoggedIn, login, logout, clearUser, fetchMe }
})
