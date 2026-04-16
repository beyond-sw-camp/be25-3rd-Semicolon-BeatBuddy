import api from './axios'

const USER_BASE_URL = '/api/v1/users'

export const getMyProfile = () => {
  return api.get(`${USER_BASE_URL}/me`)
}

export const getMyNotificationSetting = () => {
  return api.get(`${USER_BASE_URL}/me/notification`)
}

export const updateChatNotificationSetting = (payload) => {
  return api.patch(`${USER_BASE_URL}/me/notifications/chat`, payload)
}

export const updateSocialNotificationSetting = (payload) => {
  return api.patch(`${USER_BASE_URL}/me/notifications/social`, payload)
}

export const getMyGroupNicknames = () => {
  return api.get(`${USER_BASE_URL}/me/group-nicknames`)
}

export const updateGroupNickname = (groupId, payload) => {
  return api.patch(`${USER_BASE_URL}/me/group-nicknames/${groupId}`, payload)
}

export const changePassword = (payload) => {
  return api.patch(`${USER_BASE_URL}/password`, payload)
}

export const updateProfileImage = (payload) => {
  return api.patch(`${USER_BASE_URL}/me/profile-image`, payload)
}

export const deleteProfileImage = () => {
  return api.delete(`${USER_BASE_URL}/me/profile-image`)
}

export const withdraw = () => {
  return api.delete(`${USER_BASE_URL}/me`)
}
