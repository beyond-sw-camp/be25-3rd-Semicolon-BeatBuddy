import api from './axios'

export const authApi = {
    // 로그인
    login: (data) => api.post('/auth/login', data),

    // 회원가입
    register: (data) => api.post('/auth/register', data),

    // 이메일 인증 코드 발송
    sendEmailCode: (email) => api.post('/auth/email/send', { email }),

    // 이메일 인증 코드 확인
    verifyEmailCode: (data) => api.post('/auth/email/verify', data),

    // 비밀번호 찾기 (임시 비밀번호 발송)
    forgotPassword: (email) => api.post('/auth/password/forgot', { email }),

    // 토큰 갱신
    refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),

    // 로그아웃
    logout: () => api.post('/auth/logout'),
}
