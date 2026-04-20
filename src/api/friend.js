import api from './axios'

export const friendApi = {

    // 친구 목록 조회 (ACCEPTED)
    getFriends: () => api.get('/api/v1/friends'),

    // 받은 친구 신청 목록 (PENDING)
    getReceivedRequests: () => api.get('/api/v1/friends/requests/received'),

    // 친구 신청 보내기
    sendRequest: (receiverId, groupId) => api.post('/api/v1/friends/requests', { receiverId, groupId }),

    // 친구 신청 수락 (POST)
    acceptRequest: (requestId) => api.post(`/api/v1/friends/requests/${requestId}/accept`),

    // 친구 신청 거절 (POST)
    rejectRequest: (requestId) => api.post(`/api/v1/friends/requests/${requestId}/reject`),

    // 친구 삭제
    deleteFriend: (friendId) => api.delete(`/api/v1/friends/${friendId}`),

    // 친구 상세 조회
    getFriendDetail: (friendId) => api.get(`/api/v1/friends/${friendId}`),

    // 알림 목록 조회
    getNotifications: () => api.get('/api/v1/notifications'),

    // 알림 읽음 처리
    markRead: (notificationId) => api.patch(`/api/v1/notifications/${notificationId}/read`),

    // 알림 삭제
    deleteNotification: (notificationId) => api.delete(`/api/v1/notifications/${notificationId}`),

}
