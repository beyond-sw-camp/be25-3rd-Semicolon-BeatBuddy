import api from './axios'

export const musicApi = {
    // Spotify 곡 검색
    search: (query) => api.get('/api/v1/music/search', { params: { keyword: query } }),

    // 내 취향 조회
    getMyTaste: () => api.get('/api/v1/music/taste'),

    // 최애곡 저장/수정
    saveTaste: (tracks) => api.post('/api/v1/music/taste', { tracks }),
    updateTaste: (tracks) => api.put('/api/v1/music/taste', { tracks }),
}
