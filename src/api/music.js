import api from './axios'

// 곡 검색
export const searchTracks = async (keyword) => {
    const response = await api.get('/api/v1/music/search', {
        params: { keyword }
    })
    return response.data
}