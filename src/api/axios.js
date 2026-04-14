import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:8088',
    timeout: 5000
})

// 요청 보낼 때 토큰 자동 추가
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken')

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => Promise.reject(error)
)

export default api