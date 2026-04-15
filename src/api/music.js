import api from './axios'

// 곡 검색
export const searchTracks = async (keyword) => {
    const response = await api.get('/api/v1/music/search', {
        params: { keyword }
    })
    return response.data
}

// 취향 곡 저장
export const saveTaste = async (payload) => {
    const response = await api.post('/api/v1/music/taste', payload)
    return response.data
}

// 취향 곡 수정 저장
export const updateTaste = async (payload) => {
    const response = await api.put('/api/v1/music/taste', payload)
    return response.data
}

// 저장된 취향 곡 조회
export const getTaste = async () => {
    const response = await api.get('/api/v1/music/taste')
    return response.data
}