import { defineStore } from 'pinia'
import {
  changePassword,
  deleteProfileImage,
  getMyGroupNicknames,
  getMyNotificationSetting,
  getMyProfile,
  updateChatNotificationSetting,
  updateGroupNickname,
  updateProfileImage,
  updateSocialNotificationSetting,
  withdraw,
} from '@/api/userApi'
import { getErrorMessage, getResponseResult } from '@/api/response'
import { useAuthStore } from '@/stores/authStore'

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null,
    notificationSetting: null,
    groupNicknames: [],
    loading: false,
    errorMessage: '',
  }),

  actions: {
    setError(error) {
      this.errorMessage = getErrorMessage(error)
    },

    async fetchMyProfile() {
      this.loading = true
      this.errorMessage = ''

      try {
        const response = await getMyProfile()
        this.profile = getResponseResult(response)
        return this.profile
      } catch (error) {
        this.setError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchMyNotificationSetting() {
      this.loading = true
      this.errorMessage = ''

      try {
        const response = await getMyNotificationSetting()
        this.notificationSetting = getResponseResult(response)
        return this.notificationSetting
      } catch (error) {
        this.setError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchMyGroupNicknames() {
      this.loading = true
      this.errorMessage = ''

      try {
        const response = await getMyGroupNicknames()
        const data = getResponseResult(response)
        this.groupNicknames = Array.isArray(data?.groups) ? data.groups : []
        return this.groupNicknames
      } catch (error) {
        this.setError(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateChatNotification(payload) {
      await updateChatNotificationSetting(payload)
      await this.fetchMyNotificationSetting()
    },

    async updateSocialNotification(payload) {
      await updateSocialNotificationSetting(payload)
      await this.fetchMyNotificationSetting()
    },

    async updateNickname(groupId, payload) {
      this.errorMessage = ''

      try {
        await updateGroupNickname(groupId, payload)
        await this.fetchMyGroupNicknames()
      } catch (error) {
        this.setError(error)
        throw error
      }
    },

    async changeMyPassword(payload) {
      this.errorMessage = ''

      try {
        await changePassword(payload)
      } catch (error) {
        this.setError(error)
        throw error
      }
    },

    async updateMyProfileImage(payload) {
      this.errorMessage = ''

      try {
        await updateProfileImage(payload)
        await this.fetchMyProfile()
      } catch (error) {
        this.setError(error)
        throw error
      }
    },

    async deleteMyProfileImage() {
      this.errorMessage = ''

      try {
        await deleteProfileImage()
        await this.fetchMyProfile()
      } catch (error) {
        this.setError(error)
        throw error
      }
    },

    async withdrawMe() {
      await withdraw()
      const authStore = useAuthStore()
      authStore.logout()        // 이러면 'token', 'user' 다 지워짐
      this.$reset()
    },
  },
})
