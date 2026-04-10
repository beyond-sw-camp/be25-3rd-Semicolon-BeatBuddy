import api from './axios'

export const chatApi = {
    // 채팅방 목록 조회
    getRooms: () => api.get('/chat/rooms'),

    // 채팅방 메시지 조회 (페이지네이션)
    getMessages: (roomId, params) => api.get(`/chat/rooms/${roomId}/messages`, { params }),

    // 채팅방 나가기
    leaveRoom: (roomId) => api.delete(`/chat/rooms/${roomId}/members/me`),
}
