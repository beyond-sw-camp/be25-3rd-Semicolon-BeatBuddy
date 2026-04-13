import { defineStore } from 'pinia'
import { ref } from 'vue'
import { musicApi } from '@/api/music'

export const useMusicStore = defineStore('music', () => {
    const favoriteSongs = ref([])
    const tasteVector = ref([])
    const searchResults = ref([])
    const isSearching = ref(false)
    const isTasteAnalyzed = ref(false)

    function normalizeTrack(track) {
        return {
            id: track.trackId,
            trackId: track.trackId,
            title: track.trackName,
            trackName: track.trackName,
            artist: track.artistName,
            artistName: track.artistName,
            albumId: track.albumId,
            albumName: track.albumName,
            albumCover: track.coverUrl ?? track.albumCoverUrl,
            coverUrl: track.coverUrl ?? track.albumCoverUrl,
        }
    }

    function toTasteTrack(song) {
        return {
            trackId: song.trackId ?? song.id,
            trackName: song.trackName ?? song.title,
            artistName: song.artistName ?? song.artist,
            albumId: song.albumId,
            albumName: song.albumName,
            coverUrl: song.coverUrl ?? song.albumCover,
        }
    }

    async function fetchMyProfile() {
        const res = await musicApi.getMyTaste()
        const result = res.data?.result ?? {}
        favoriteSongs.value = (result.tracks || []).map(normalizeTrack)
        isTasteAnalyzed.value = !!result.isTasteAnalyzed
        tasteVector.value = []
    }

    async function searchSongs(query) {
        if (!query.trim()) {
            searchResults.value = []
            return
        }
        isSearching.value = true
        try {
            const res = await musicApi.search(query)
            searchResults.value = (res.data?.result || []).map(normalizeTrack)
        } finally {
            isSearching.value = false
        }
    }

    async function saveFavorites(songs) {
        const tracks = songs.map(toTasteTrack)
        const request = favoriteSongs.value.length ? musicApi.updateTaste : musicApi.saveTaste
        await request(tracks)
        await fetchMyProfile()
    }

    function clearSearch() {
        searchResults.value = []
    }

    return { favoriteSongs, tasteVector, searchResults, isSearching, isTasteAnalyzed, fetchMyProfile, searchSongs, saveFavorites, clearSearch }
})
