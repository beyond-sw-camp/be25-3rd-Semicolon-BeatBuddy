import api from './axios'

export const musicApi = {
    // Spotify 곡 검색
    search: (query) => api.get('/v1/music/search', { params: { keyword: query } }),

    // 내 취향 조회
    getMyTaste: () => api.get('/v1/music/taste'),

    // 최애곡 저장/수정
    saveTaste: (tracks) => api.post('/v1/music/taste', { tracks }),
    updateTaste: (tracks) => api.put('/v1/music/taste', { tracks }),
}
