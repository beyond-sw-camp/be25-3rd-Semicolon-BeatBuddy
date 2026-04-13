import { defineStore } from 'pinia'
import { ref } from 'vue'
import { groupApi } from '@/api/group'

export const useGroupStore = defineStore('group', () => {
    const groups = ref([])
    const currentGroupId = ref(null)
    const recommendations = ref([])

    async function fetchGroups() {
        const res = await groupApi.getMyGroups()
        groups.value = res.data?.result || []
        if (!groups.value.some((group) => group.groupId === currentGroupId.value)) {
                currentGroupId.value = null
                recommendations.value = []
        }
    }

    async function fetchRecommendations(groupId) {
        const res = await groupApi.getRecommendations(groupId)
        recommendations.value = res.data?.result || []
    }

    async function createGroup(data) {
        await groupApi.createGroup(data)
        await fetchGroups()
    }

    // 초대코드로 그룹 조회 후 가입
    async function joinGroup(data) {
        // 1. 초대코드로 groupId 조회
        const infoRes = await groupApi.getGroupByInviteCode(data.inviteCode)
        const groupId = infoRes.data?.result?.groupId
        if (!groupId) throw new Error('그룹을 찾을 수 없습니다.')
        // 2. 가입
        await groupApi.joinGroup(groupId, data)
        await fetchGroups()
    }

    async function skipMember(targetUserId) {
        if (!currentGroupId.value) return
        await groupApi.skipMember(currentGroupId.value, targetUserId)
        removeRecommendation(targetUserId)
    }

    function removeRecommendation(targetUserId) {
        recommendations.value = recommendations.value.filter((r) => r.userId !== targetUserId)
    }

    function setCurrentGroup(groupId) {
        currentGroupId.value = groupId
    }

    function clearSelection() {
        currentGroupId.value = null
        recommendations.value = []
    }

    return { groups, currentGroupId, recommendations, fetchGroups, fetchRecommendations, createGroup, joinGroup, skipMember, removeRecommendation, setCurrentGroup, clearSelection }
})
