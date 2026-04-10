import api from './axios'

export const musicApi = {
    // Spotify 곡 검색
    search: (query) => api.get('/music/search', { params: { q: query } }),

    // 내 취향 프로필(최애곡 + 벡터) 조회
    getMyProfile: () => api.get('/music/profile'),

    // 최애곡 저장 (회원가입 or 수정)
    saveFavorites: (songIds) => api.post('/music/favorites', { songIds }),

    // 특정 유저 취향 프로필 조회 (친구 프로필 확인용)
    getUserProfile: (userId) => api.get(`/music/profile/${userId}`),
}
