import { defineStore } from 'pinia'
import { ref } from 'vue'
import { friendApi } from '@/api/friend'

export const useFriendStore = defineStore('friend', () => {
    const friends = ref([])
    const receivedRequests = ref([])
    const sentRequests = ref([])
    const notifications = ref([])
    const unreadNotificationCount = ref(0)

    async function fetchFriends() {
        const res = await friendApi.getFriends()
        friends.value = res.data?.result || []
    }

    // 받은 친구 신청 목록 (알림 다이얼로그 열 때도 호출)
    async function fetchRequests() {
        try {
            const res = await friendApi.getReceivedRequests()
            receivedRequests.value = res.data?.result || []
        } catch (e) {
            console.warn('받은 친구 신청 조회 실패:', e)
        }
    }

    async function fetchNotifications() {
        const res = await friendApi.getNotifications()
        notifications.value = res.data?.result || []
        unreadNotificationCount.value = notifications.value.filter((n) => !n.isRead).length
    }

    async function acceptRequest(requestId) {
        await friendApi.acceptRequest(requestId)
        receivedRequests.value = receivedRequests.value.filter((r) => r.friendshipId !== requestId)
        await fetchFriends()
    }

    async function rejectRequest(requestId) {
        await friendApi.rejectRequest(requestId)
        receivedRequests.value = receivedRequests.value.filter((r) => r.friendshipId !== requestId)
    }

    // 알림(FRIEND_REQUEST)에서 바로 수락
    // FriendResponse.friendId === 상대방 userId === notif.senderId
    async function acceptFromNotif(notif) {
        let request = findRequestForNotification(notif)
        if (!request) {
            await fetchRequests()
            request = findRequestForNotification(notif)
        }
        if (request) {
            await friendApi.acceptRequest(request.friendshipId)
            receivedRequests.value = receivedRequests.value.filter((r) => r.friendshipId !== request.friendshipId)
        }
        notifications.value = notifications.value.filter((n) => n.notificationId !== notif.notificationId)
        unreadNotificationCount.value = notifications.value.filter((n) => !n.isRead).length
        await fetchFriends()
    }

    // 알림(FRIEND_REQUEST)에서 바로 거절
    async function rejectFromNotif(notif) {
        let request = findRequestForNotification(notif)
        if (!request) {
            await fetchRequests()
            request = findRequestForNotification(notif)
        }
        if (request) {
            await friendApi.rejectRequest(request.friendshipId)
            receivedRequests.value = receivedRequests.value.filter((r) => r.friendshipId !== request.friendshipId)
        }
        notifications.value = notifications.value.filter((n) => n.notificationId !== notif.notificationId)
        unreadNotificationCount.value = notifications.value.filter((n) => !n.isRead).length
    }

    async function deleteFriend(friendshipId) {
        await friendApi.deleteFriend(friendshipId)
        friends.value = friends.value.filter((f) => f.friendshipId !== friendshipId)
    }

    async function sendRequest(receiverId) {
        await friendApi.sendRequest(receiverId)
    }

    function addNotification(notification) {
        notifications.value.unshift(notification)
        unreadNotificationCount.value++
    }

    async function markRead(notificationId) {
        await friendApi.markRead(notificationId)
        const n = notifications.value.find((n) => n.notificationId === notificationId)
        if (n) {
            n.isRead = true
            unreadNotificationCount.value = Math.max(0, unreadNotificationCount.value - 1)
        }
    }

    async function deleteNotification(notificationId) {
        await friendApi.deleteNotification(notificationId)
        notifications.value = notifications.value.filter((n) => n.notificationId !== notificationId)
        unreadNotificationCount.value = notifications.value.filter((n) => !n.isRead).length
    }

    function findRequestForNotification(notif) {
        return receivedRequests.value.find((r) => isSameId(r.friendshipId, notif.targetId))
            || receivedRequests.value.find((r) => isSameId(r.friendId, notif.senderId))
    }

    function isSameId(a, b) {
        return a != null && b != null && String(a) === String(b)
    }

    return {
        friends, receivedRequests, sentRequests, notifications, unreadNotificationCount,
        fetchFriends, fetchRequests, fetchNotifications,
        acceptRequest, rejectRequest, deleteFriend, sendRequest,
        acceptFromNotif, rejectFromNotif,
        addNotification, markRead, deleteNotification,
    }
})
