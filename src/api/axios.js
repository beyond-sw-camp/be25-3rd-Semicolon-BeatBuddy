import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
})

// 요청 인터셉터: JWT 자동 첨부
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// 응답 인터셉터: 401 → refresh token 재발급 → 재시도
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

        if (error.response?.status === 401 && !originalRequest._retry) {
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

            const refreshToken = localStorage.getItem('refreshToken')

            if (!refreshToken) {
                isRefreshing = false
                const authStore = useAuthStore()
                authStore.logout()
                return Promise.reject(error)
            }

            try {
                const res = await axios.post('/api/auth/refresh', { refreshToken })
                const { accessToken } = res.data
                localStorage.setItem('accessToken', accessToken)
                api.defaults.headers.common.Authorization = `Bearer ${accessToken}`
                processQueue(null, accessToken)
                originalRequest.headers.Authorization = `Bearer ${accessToken}`
                return api(originalRequest)
            } catch (err) {
                processQueue(err, null)
                const authStore = useAuthStore()
                authStore.logout()
                return Promise.reject(err)
            } finally {
                isRefreshing = false
            }
        }

        return Promise.reject(error)
    },
)

export default api
