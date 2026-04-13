import api from './axios'

export const chatApi = {
    // 채팅방 목록 조회
    getRooms: () => api.get('/v1/chat/rooms'),

    // 채팅방 생성/조회
    createRoom: (opponentUserId) => api.post('/v1/chat/rooms', { opponentUserId }),

    // 채팅방 입장 및 메시지 조회
    getMessages: (roomId) => api.get(`/v1/chat/${roomId}/messages`),

    // 채팅방 나가기
    leaveRoom: (roomId) => api.patch(`/v1/chat/${roomId}/exit`),
}
