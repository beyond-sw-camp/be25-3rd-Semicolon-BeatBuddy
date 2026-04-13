import { ref } from 'vue'
import { Client } from '@stomp/stompjs'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { useFriendStore } from '@/stores/friend'

const client = ref(null)
const isConnected = ref(false)
const roomSubscriptions = new Map()

export function useWebSocket() {
    const authStore = useAuthStore()
    const chatStore = useChatStore()
    const friendStore = useFriendStore()

    function connect() {
        if (isConnected.value || !authStore.isLoggedIn) return

        client.value = new Client({
            brokerURL: 'ws://localhost:8088/ws/chat/websocket',
            connectHeaders: {
                Authorization: `Bearer ${authStore.accessToken}`,
            },
            reconnectDelay: 5000,
            onConnect: () => {
                isConnected.value = true

                const userId = authStore.user?.id
                if (userId) {
                    client.value.subscribe(`/sub/events/${userId}`, () => {
                        chatStore.fetchRooms()
                        friendStore.fetchNotifications()
                    })
                }
            },
            onDisconnect: () => {
                isConnected.value = false
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame)
            },
        })

        client.value.activate()
    }

    function disconnect() {
        if (client.value) {
            roomSubscriptions.forEach((subscription) => subscription.unsubscribe())
            roomSubscriptions.clear()
            client.value.deactivate()
            client.value = null
            isConnected.value = false
        }
    }

    function subscribeRoom(roomId) {
        if (!isConnected.value || !client.value || roomSubscriptions.has(roomId)) return

        const subscription = client.value.subscribe(`/sub/chat/rooms/${roomId}`, (message) => {
            const body = JSON.parse(message.body)
            chatStore.addMessage(body)
        })
        roomSubscriptions.set(roomId, subscription)
    }

    // 채팅 메시지 전송
    function sendMessage(roomId, content) {
        if (!isConnected.value || !client.value) return
        client.value.publish({
            destination: '/pub/chat/message',
            body: JSON.stringify({ roomId, messageText: content }),
        })
    }

    return { isConnected, connect, disconnect, subscribeRoom, sendMessage }
}
