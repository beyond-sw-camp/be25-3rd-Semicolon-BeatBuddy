import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getMyGroups, getRecommendations, skipMember } from '@/api/group.js'

export const useGroupStore = defineStore('group', () => {
    // 상태
    const groups = ref([])
    const recommendations = ref([])
    const currentGroupId = ref(null)

    // 내 그룹 목록 조회
    const fetchGroups = async () => {
        const res = await getMyGroups()
        groups.value = res.data.result ?? res.data.data ?? []
    }

    // 현재 선택된 그룹 설정
    const setCurrentGroup = (groupId) => {
        currentGroupId.value = groupId
    }

    // 추천 멤버 목록 조회
    const fetchRecommendations = async (groupId) => {
        const res = await getRecommendations(groupId)
        recommendations.value = res.data.result ?? []
    }

    // 추천 멤버 넘기기
    const skipMemberAction = async (targetUserId) => {
        if (!currentGroupId.value) return
        await skipMember(currentGroupId.value, targetUserId)
        removeRecommendation(targetUserId)
    }

    // 추천 목록에서 제거
    const removeRecommendation = (targetUserId) => {
        recommendations.value = recommendations.value.filter(
            (m) => m.userId !== targetUserId
        )
    }

    // 선택 초기화
    const clearSelection = () => {
        currentGroupId.value = null
        recommendations.value = []
    }

    return {
        groups,
        recommendations,
        currentGroupId,
        fetchGroups,
        setCurrentGroup,
        fetchRecommendations,
        skipMember: skipMemberAction,
        removeRecommendation,
        clearSelection,
    }
})