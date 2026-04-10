import api from './axios'

export const groupApi = {
    // 내 그룹 목록 조회
    getMyGroups: () => api.get('/groups'),

    // 그룹 생성
    createGroup: (data) => api.post('/groups', data),

    // 초대 코드로 그룹 가입
    joinGroup: (code) => api.post('/groups/join', { code }),

    // 그룹 탈퇴
    leaveGroup: (groupId) => api.delete(`/groups/${groupId}/members/me`),

    // 그룹 내 취향 기반 추천 멤버 목록
    getRecommendations: (groupId) => api.get(`/groups/${groupId}/recommendations`),

    // 추천 멤버 넘기기 (skip)
    skipMember: (groupId, targetUserId) =>
        api.post(`/groups/${groupId}/recommendations/${targetUserId}/skip`),
}
