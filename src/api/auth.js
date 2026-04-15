// src/api/auth.js
import api from './axios'

// 이메일 중복 확인
export const checkEmail = (email) => {
    return api.get('/api/v1/auth/email/exists', { params: { email } })
}

// 이메일 인증코드 발송
export const sendVerificationCode = (email) => {
    return api.post('/api/v1/auth/email/send', { email })
}

// 이메일 인증코드 확인
export const verifyCode = (email, code) => {
    return api.post('/api/v1/auth/email/verify', { email, code })
}

// 회원가입
export const signup = (data, profileImage) => {
    const formData = new FormData()
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }))
    if (profileImage) {
    formData.append('profileImage', profileImage)
    }
    return api.post('/api/v1/auth/signup', formData)
}

// 로그인
export const login = (email, password) => {
    return api.post('/api/v1/auth/login', { email, password })
}

// 로그아웃
export const logout = () => {
    return api.post('/api/v1/auth/logout')
}

// 비밀번호 재설정 이메일 발송
export const sendPasswordResetCode = (email) => {
    return api.post('/api/v1/auth/password/email/send', { email })
}

// 비밀번호 재설정
export const resetPassword = (email, newPassword) => {
    return api.post('/api/v1/auth/password/reset', { email, newPassword })
}