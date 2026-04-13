import api from './axios'

export const userApi = {
    // 내 프로필 조회
    getMe: () => api.get('/v1/users/me'),

    // 알림 설정 조회
    getNotificationSettings: () => api.get('/v1/users/me/notification'),

    // 프로필 이미지 수정
    updateProfileImage: (profileImageUrl) =>
        api.patch('/v1/users/me/profile-image', { profileImageUrl }),

    // 비밀번호 변경
    changePassword: (data) => api.patch('/v1/users/password', data),

    // 회원 탈퇴
    deleteMe: () => api.delete('/v1/users/me'),
}
