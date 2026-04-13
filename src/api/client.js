import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

const AUTH_API_PATH = '/api/v1/auth'

const isAuthRequest = (url = '') => {
  return url.includes(AUTH_API_PATH)
}

const redirectToAuth = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('user')

  if (window.location.pathname === '/auth') {
    return
  }

  const redirect = `${window.location.pathname}${window.location.search}`
  window.location.replace(`/auth?redirect=${encodeURIComponent(redirect)}`)
}

apiClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken')

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
    return config
  }

  if (!isAuthRequest(config.url)) {
    redirectToAuth()
    return Promise.reject(new axios.CanceledError('로그인이 필요합니다.'))
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isPasswordChangeRequest = error.config?.url?.includes('/api/v1/users/password')

    if (error.response?.status === 401 && !isPasswordChangeRequest) {
      redirectToAuth()
    }

    return Promise.reject(error)
  }
)

export default apiClient
