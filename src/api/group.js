import api from './axios'

export const groupApi = {
    // 가입 그룹 목록 조회
    getMyGroups: () => api.get('/v1/groups/my-groups'),

    // 초대코드로 그룹 조회 (groupId 얻기)
    getGroupByInviteCode: (inviteCode) => api.get(`/v1/groups/invite/${inviteCode}`),

    // 그룹 생성 (multipart/form-data)
    createGroup: (data) => {
        const formData = new FormData()
        formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }))
        if (data.groupImage) {
            formData.append('groupImage', data.groupImage)
        }
        return api.post('/v1/groups', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },

    // 그룹 가입 POST /v1/groups/{groupId}/members
    joinGroup: (groupId, data) => api.post(`/v1/groups/${groupId}/members`, data),

    // 그룹 탈퇴
    leaveGroup: (groupId) => api.delete(`/v1/groups/${groupId}/members/me`),

    // 그룹 내 취향 기반 추천 멤버 목록
    getRecommendations: (groupId) => api.get(`/v1/groups/${groupId}/recommendations`),

    // 추천 멤버 넘기기 (skip)
    skipMember: (groupId, targetUserId) =>
        api.post(`/v1/groups/${groupId}/recommendations/${targetUserId}/skip`),
}
