import { defineStore } from 'pinia'
import { ref } from 'vue'
import { groupApi } from '@/api/group'

export const useGroupStore = defineStore('group', () => {
    const groups = ref([])
    const currentGroupId = ref(null)
    const recommendations = ref([])

    async function fetchGroups() {
        const res = await groupApi.getMyGroups()
        groups.value = res.data || []
        if (groups.value.length && !currentGroupId.value) {
            currentGroupId.value = groups.value[0].id
        }
    }

    async function fetchRecommendations(groupId) {
        const res = await groupApi.getRecommendations(groupId)
        recommendations.value = res.data || []
    }

    async function createGroup(data) {
        const res = await groupApi.createGroup(data)
        groups.value.push(res.data)
        return res.data
    }

    async function joinGroup(code) {
        const res = await groupApi.joinGroup(code)
        groups.value.push(res.data)
        return res.data
    }

    async function skipMember(targetUserId) {
        if (!currentGroupId.value) return
        await groupApi.skipMember(currentGroupId.value, targetUserId)
        recommendations.value = recommendations.value.filter((r) => r.userId !== targetUserId)
    }

    function setCurrentGroup(groupId) {
        currentGroupId.value = groupId
    }

    return { groups, currentGroupId, recommendations, fetchGroups, fetchRecommendations, createGroup, joinGroup, skipMember, setCurrentGroup }
})
