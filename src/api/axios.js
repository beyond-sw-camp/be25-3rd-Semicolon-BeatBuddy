// src/api/axios.js
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
// 기본 설정이 담긴 axios 인스턴스 만드는 것
// baseURL: 모든 요청 앞에 자동으로 붙음
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    withCredentials: true  // 쿠키 자동으로 붙여줌 (Refresh Token)
})

// 요청 인터셉터
// 요청 보내기 전에 가로챔
// config: 요청 설정 객체 (url, headers, body 등)
api.interceptors.request.use((config) => {
    const authStore = useAuthStore()

    // store에 토큰 있으면 헤더에 자동으로 붙여줌
    if (authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`
    }
    // return config: 이거 없으면 요청이 안 날아감. 꼭 있어야 함
    return config
})

let isRefreshing = false
let waitQueue = []

// 응답 인터셉터
api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const authStore = useAuthStore()
        const originalRequest = error.config

        if (originalRequest.url.includes('/auth/')) {
            return Promise.reject(error)
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            // 이미 refresh 중이면 큐에서 대기
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    waitQueue.push({ resolve, reject })
                }).then(newToken => {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`
                    return api(originalRequest)
                })
            }

            // refresh 시작
            isRefreshing = true

            try {
                const response = await api.post('/api/v1/auth/token/refresh')
                const newToken = response.data.result.accessToken

                authStore.setToken(newToken)

                // 대기 중이던 요청들 전부 새 토큰으로 풀어줌
                waitQueue.forEach(({ resolve }) => resolve(newToken))
                waitQueue = []

                originalRequest.headers.Authorization = `Bearer ${newToken}`
                return api(originalRequest)

            } catch (e) {
                waitQueue.forEach(({ reject }) => reject(e))
                waitQueue = []
                authStore.logout()
                window.location.href = '/login'
            } finally {
                isRefreshing = false  // 무조건 초기화
            }
        }

        return Promise.reject(error)
    }
)

export default api