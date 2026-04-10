import api from './axios'

export const userApi = {
    // 내 프로필 조회
    getMe: () => api.get('/users/me'),

    // 프로필 수정 (닉네임, 프로필 이미지 등)
    updateMe: (data) => api.put('/users/me', data),

    // 비밀번호 변경
    changePassword: (data) => api.put('/users/me/password', data),

    // 회원 탈퇴
    deleteMe: () => api.delete('/users/me'),
}
