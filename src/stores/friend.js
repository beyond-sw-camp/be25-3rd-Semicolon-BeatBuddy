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
        friends.value = res.data || []
    }

    async function fetchRequests() {
        const [recv, sent] = await Promise.all([
            friendApi.getReceivedRequests(),
            friendApi.getSentRequests(),
        ])
        receivedRequests.value = recv.data || []
        sentRequests.value = sent.data || []
    }

    async function fetchNotifications() {
        const res = await friendApi.getNotifications()
        notifications.value = res.data || []
        unreadNotificationCount.value = notifications.value.filter((n) => !n.read).length
    }

    async function acceptRequest(requestId) {
        await friendApi.acceptRequest(requestId)
        receivedRequests.value = receivedRequests.value.filter((r) => r.id !== requestId)
        await fetchFriends()
    }

    async function rejectRequest(requestId) {
        await friendApi.rejectRequest(requestId)
        receivedRequests.value = receivedRequests.value.filter((r) => r.id !== requestId)
    }

    async function deleteFriend(friendId) {
        await friendApi.deleteFriend(friendId)
        friends.value = friends.value.filter((f) => f.id !== friendId)
    }

    async function sendRequest(targetUserId) {
        const res = await friendApi.sendRequest(targetUserId)
        sentRequests.value.push(res.data)
    }

    // WebSocket에서 새 알림 수신 시 호출
    function addNotification(notification) {
        notifications.value.unshift(notification)
        unreadNotificationCount.value++
    }

    async function markRead(notificationId) {
        await friendApi.markRead(notificationId)
        const n = notifications.value.find((n) => n.id === notificationId)
        if (n) {
            n.read = true
            unreadNotificationCount.value = Math.max(0, unreadNotificationCount.value - 1)
        }
    }

    async function deleteNotification(notificationId) {
        await friendApi.deleteNotification(notificationId)
        notifications.value = notifications.value.filter((n) => n.id !== notificationId)
    }

    return {
        friends, receivedRequests, sentRequests, notifications, unreadNotificationCount,
        fetchFriends, fetchRequests, fetchNotifications,
        acceptRequest, rejectRequest, deleteFriend, sendRequest,
        addNotification, markRead, deleteNotification,
    }
})
