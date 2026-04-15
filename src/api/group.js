import api from './axios.js'

// 내 그룹 목록 조회
export const getMyGroups = () => api.get('/api/v1/groups/my-groups')

// 그룹명 중복 확인
export const checkGroupName = (groupName) => api.get('/api/v1/groups/name-check', { params: { groupName } })

// 초대코드 중복 확인
export const checkInviteCode = (inviteCode) => api.get('/api/v1/groups/invite-code-check', { params: { inviteCode } })

// 초대코드로 그룹 조회
export const getGroupByInviteCode = (inviteCode) => api.get(`/api/v1/groups/invite/${inviteCode}`)

// 그룹 내 닉네임 중복 확인
export const checkNickname = (groupId, nickname) => api.get(`/api/v1/groups/${groupId}/nickname-check`, { params: { nickname } })

// 그룹 생성
export const createGroup = (formData) => api.post('/api/v1/groups', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
})

// 그룹 가입
export const joinGroup = (groupId, data) => api.post(`/api/v1/groups/${groupId}/members`, data)

// 그룹 나가기
export const leaveGroup = (groupId) => api.delete(`/api/v1/groups/${groupId}/members/me`)

// 친구 관련
export const getRecommendations = (groupId) => api.get(`/api/v1/groups/${groupId}/recommendations`)

export const skipMember = (groupId, targetUserId) =>
    api.post(`/api/v1/groups/${groupId}/recommendations/${targetUserId}/skip`)