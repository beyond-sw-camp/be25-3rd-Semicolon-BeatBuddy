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

// 응답 인터셉터
api.interceptors.response.use(
    (response) => response,  // 성공이면 그냥 통과

    async (error) => {
        const authStore = useAuthStore()
        const originalRequest = error.config // 실패한 요청의 원본 설정

        // 로그인/회원가입 요청은 인터셉터 건너뜀
        if (originalRequest.url.includes('/auth/')) {
            return Promise.reject(error)
        }
        // 401 에러 && 재시도 안 한 요청이면
        // 401: Access Token 만료됐다는 뜻
        // _retry: 재시도 플래그
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true  // 무한루프 방지

            try {
                // Refresh Token으로 새 Access Token 발급
                const response = await api.post('/api/v1/auth/token/refresh')
                const newToken = response.data.result.accessToken

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