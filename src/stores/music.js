import { defineStore } from 'pinia'
import { ref } from 'vue'
import { musicApi } from '@/api/music'

export const useMusicStore = defineStore('music', () => {
    const favoriteSongs = ref([])
    const tasteVector = ref([])
    const searchResults = ref([])
    const isSearching = ref(false)

    async function fetchMyProfile() {
        const res = await musicApi.getMyProfile()
        favoriteSongs.value = res.data.favoriteSongs || []
        tasteVector.value = res.data.tasteVector || []
    }

    async function searchSongs(query) {
        if (!query.trim()) {
            searchResults.value = []
            return
        }
        isSearching.value = true
        try {
            const res = await musicApi.search(query)
            searchResults.value = res.data || []
        } finally {
            isSearching.value = false
        }
    }

    async function saveFavorites(songIds) {
        await musicApi.saveFavorites(songIds)
        await fetchMyProfile()
    }

    function clearSearch() {
        searchResults.value = []
    }

    return { favoriteSongs, tasteVector, searchResults, isSearching, fetchMyProfile, searchSongs, saveFavorites, clearSearch }
})
