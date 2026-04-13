import api from './axios'

export const authApi = {
    // 로그인
    login: (data) => api.post('/v1/auth/login', data),

    // 회원가입
    register: (data) => {
        const formData = new FormData()
        formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }))
        if (data.profileImage) {
            formData.append('profileImage', data.profileImage)
        }
        return api.post('/v1/auth/signup', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },

    // 이메일 인증 코드 발송
    sendEmailCode: (email) => api.post('/v1/auth/email/send', { email }),

    // 이메일 인증 코드 확인
    verifyEmailCode: (data) => api.post('/v1/auth/email/verify', data),

    // 비밀번호 찾기 (임시 비밀번호 발송)
    sendPasswordResetCode: (email) => api.post('/v1/auth/password/email/send', { email }),

    // 비밀번호 재설정
    resetPassword: (data) => api.post('/v1/auth/password/reset', data),

    // 토큰 갱신
    refresh: () => api.post('/v1/auth/token/refresh'),

    // 로그아웃
    logout: () => api.post('/v1/auth/logout'),
}
