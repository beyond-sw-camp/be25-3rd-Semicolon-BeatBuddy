import { defineStore } from "pinia";
import { ref, computed } from 'vue';

export const useMusicStore = defineStore('music', () => {
    // 선택한 곡 목록
    const selectedTracks = ref([])

    // 선택 개수
    const selectedCount = computed(() => selectedTracks.value.length)
    // 10곡 여부
    const isComplete = computed(() => selectedTracks.value.length === 10)

    // 이미 선택된 곡인지 확인
    const isAlreadySelected = (trackId) => {
        return selectedTracks.value.some(track => track.trackId === trackId)
    }

    // 곡 추가
    const addTrack = (track) => {
        if (selectedTracks.value.length >= 10) return false
        if (isAlreadySelected(track.trackId)) return false
        
        selectedTracks.value.push(track)
        return true
    }

    // 곡 삭제
    const removeTrack = (trackId) => {
        selectedTracks.value = selectedTracks.value.filter(
            track => track.trackId !== trackId
        )
    }

    // 전체 비우기
    const clearTracks = () => {
        selectedTracks.value = []
    }

    return {
        selectedTracks,
        selectedCount,
        isComplete,
        isAlreadySelected,
        addTrack,
        removeTrack,
        clearTracks
    }
})