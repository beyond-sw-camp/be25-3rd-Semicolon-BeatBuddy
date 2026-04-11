import apiClient from './client'

const USER_BASE_URL = '/api/v1/users'

export const getMyProfile = () => {
  return apiClient.get(`${USER_BASE_URL}/me`)
}

export const getMyNotificationSetting = () => {
  return apiClient.get(`${USER_BASE_URL}/me/notification`)
}

export const updateChatNotificationSetting = (payload) => {
  return apiClient.patch(`${USER_BASE_URL}/me/notifications/chat`, payload)
}

export const updateSocialNotificationSetting = (payload) => {
  return apiClient.patch(`${USER_BASE_URL}/me/notifications/social`, payload)
}

export const getMyGroupNicknames = () => {
  return apiClient.get(`${USER_BASE_URL}/me/group-nicknames`)
}

export const updateGroupNickname = (groupId, payload) => {
  return apiClient.patch(`${USER_BASE_URL}/me/group-nicknames/${groupId}`, payload)
}

export const changePassword = (payload) => {
  return apiClient.patch(`${USER_BASE_URL}/password`, payload)
}

export const updateProfileImage = (payload) => {
  return apiClient.patch(`${USER_BASE_URL}/me/profile-image`, payload)
}

export const withdraw = () => {
  return apiClient.delete(`${USER_BASE_URL}/me`)
}
