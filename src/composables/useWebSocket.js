import { ref } from 'vue'
import { Client } from '@stomp/stompjs'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'
import { useFriendStore } from '@/stores/friend'

const client = ref(null)
const isConnected = ref(false)

export function useWebSocket() {
    const authStore = useAuthStore()
    const chatStore = useChatStore()
    const friendStore = useFriendStore()

    function connect() {
        if (isConnected.value || !authStore.isLoggedIn) return

        client.value = new Client({
            brokerURL: 'ws://localhost:8088/ws',
            connectHeaders: {
                Authorization: `Bearer ${authStore.accessToken}`,
            },
            reconnectDelay: 5000,
            onConnect: () => {
                isConnected.value = true

                // 채팅 메시지 구독 (로그인한 유저의 메시지)
                client.value.subscribe(`/user/queue/chat`, (message) => {
                    const body = JSON.parse(message.body)
                    chatStore.addMessage(body)
                })

                // 알림 구독 (친구 신청, 수락 등)
                client.value.subscribe(`/user/queue/notifications`, (message) => {
                    const body = JSON.parse(message.body)
                    friendStore.addNotification(body)
                })
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
            client.value.deactivate()
            client.value = null
            isConnected.value = false
        }
    }

    // 채팅 메시지 전송
    function sendMessage(roomId, content) {
        if (!isConnected.value || !client.value) return
        client.value.publish({
            destination: `/app/chat/${roomId}`,
            body: JSON.stringify({ content }),
        })
    }

    return { isConnected, connect, disconnect, sendMessage }
}
