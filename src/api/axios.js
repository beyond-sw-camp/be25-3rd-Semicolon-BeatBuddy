// src/api/axios.js
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const api = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true  // 쿠키 자동으로 붙여줌 (Refresh Token)
})

// 요청 인터셉터
api.interceptors.request.use((config) => {
    const authStore = useAuthStore()

    if (authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`
    }

    return config
})

// 응답 인터셉터
api.interceptors.response.use(
    (response) => response,  // 성공이면 그냥 통과

    async (error) => {
        const authStore = useAuthStore()
        const originalRequest = error.config

        // 401 에러 && 재시도 안 한 요청이면
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true  // 무한루프 방지

            try {
                // Refresh Token으로 새 Access Token 발급
                const response = await api.post('/api/v1/auth/token/refresh')
                const newToken = response.data.data.accessToken

                // 새 토큰 저장
                authStore.setToken(newToken)

                // 실패했던 요청 새 토큰으로 재시도
                originalRequest.headers.Authorization = `Bearer ${newToken}`
                return api(originalRequest)

            } catch (e) {
                // Refresh Token도 만료됐으면 로그아웃
                authStore.logout()
                window.location.href = '/login'
            }
        }

        return Promise.reject(error)
    }
)

export default api