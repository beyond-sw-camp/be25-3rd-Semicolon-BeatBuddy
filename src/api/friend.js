import api from './axios'

export const friendApi = {
    // 친구 목록 조회
    getFriends: () => api.get('/friends'),

    // 받은 친구 신청 목록
    getReceivedRequests: () => api.get('/friends/requests/received'),

    // 보낸 친구 신청 목록
    getSentRequests: () => api.get('/friends/requests/sent'),

    // 친구 신청 보내기
    sendRequest: (targetUserId) => api.post('/friends/requests', { targetUserId }),

    // 친구 신청 수락
    acceptRequest: (requestId) => api.put(`/friends/requests/${requestId}/accept`),

    // 친구 신청 거절
    rejectRequest: (requestId) => api.put(`/friends/requests/${requestId}/reject`),

    // 친구 삭제
    deleteFriend: (friendId) => api.delete(`/friends/${friendId}`),

    // 친구 프로필 조회
    getFriendProfile: (friendId) => api.get(`/friends/${friendId}/profile`),

    // 알림 목록 조회
    getNotifications: () => api.get('/notifications'),

    // 알림 읽음 처리
    markRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),

    // 알림 삭제
    deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
}
