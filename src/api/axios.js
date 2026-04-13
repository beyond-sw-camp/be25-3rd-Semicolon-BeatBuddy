import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
    withCredentials: true, // refreshToken 쿠키 자동 전송
})

// 요청 인터셉터: JWT 자동 첨부 (auth 엔드포인트 제외)
api.interceptors.request.use((config) => {
    const isAuthEndpoint = config.url?.includes('/auth/')
    if (!isAuthEndpoint) {
        const token = localStorage.getItem('accessToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
    }
    return config
})

// 응답 인터셉터: 401 → 쿠키의 refreshToken으로 재발급 → 재시도
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        error ? prom.reject(error) : prom.resolve(token)
    })
    failedQueue = []
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // 로그인/refresh 요청 자체가 401 난 경우는 재시도 안 함
        const isAuthCall = originalRequest.url?.includes('/auth/')
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthCall) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`
                        return api(originalRequest)
                    })
                    .catch((err) => Promise.reject(err))
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                // refreshToken은 쿠키로 자동 전송됨 (withCredentials: true)
                const res = await api.post('/v1/auth/token/refresh')
                const newAccessToken = res.data?.result?.accessToken
                if (!newAccessToken) throw new Error('토큰 갱신 실패')

                localStorage.setItem('accessToken', newAccessToken)
                api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
                processQueue(null, newAccessToken)
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                return api(originalRequest)
            } catch (err) {
                processQueue(err, null)
                // 갱신도 실패했다면 로그아웃
                localStorage.removeItem('accessToken')
                const authStore = useAuthStore()
                authStore.clearUser()
                window.location.href = '/auth'
                return Promise.reject(err)
            } finally {
                isRefreshing = false
            }
        }

        return Promise.reject(error)
    },
)

export default api
