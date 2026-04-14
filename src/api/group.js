import api from './axios'

export const groupApi = {
    // 내 그룹 목록 조회
    getMyGroups: () => api.get('/api/v1/groups/my-groups'),

    // 그룹명 중복 확인
    checkGroupName: (groupName) => api.get('/api/v1/groups/name-check', { params: { groupName } }),

    // 초대코드 중복 확인
    checkInviteCode: (inviteCode) => api.get('/api/v1/groups/invite-code-check', { params: { inviteCode } }),

    // 초대코드로 그룹 조회
    getGroupByInviteCode: (inviteCode) => api.get(`/api/v1/groups/invite/${inviteCode}`),

    // 그룹 내 닉네임 중복 확인
    checkNickname: (groupId, nickname) => api.get(`/api/v1/groups/${groupId}/nickname-check`, { params: { nickname } }),

    // 그룹 생성
    createGroup: (formData) => api.post('/api/v1/groups', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),

    // 그룹 가입
    joinGroup: (groupId, data) => api.post(`/api/v1/groups/${groupId}/members`, data),

    // 그룹 나가기
    leaveGroup: (groupId) => api.delete(`/api/v1/groups/${groupId}/members/me`),

    // 그룹 내 취향 기반 추천 멤버 목록 (내 코드 추가)
    getRecommendations: (groupId) => api.get(`/api/v1/groups/${groupId}/recommendations`),

    // 추천 멤버 넘기기 - skip (내 코드 추가)
    skipMember: (groupId, targetUserId) =>
        api.post(`/api/v1/groups/${groupId}/recommendations/${targetUserId}/skip`),
}

export const {
    getMyGroups,
    checkGroupName,
    checkInviteCode,
    getGroupByInviteCode,
    checkNickname,
    createGroup,
    joinGroup,
    leaveGroup,
    getRecommendations,
    skipMember,
} = groupApi
