import { defineStore } from 'pinia'
import { ref } from 'vue'
import { chatApi } from '@/api/chat'

export const useChatStore = defineStore('chat', () => {
    const rooms = ref([])
    const currentRoomId = ref(null)
    const messages = ref([])
    const unreadCounts = ref({})

    async function fetchRooms() {
        const res = await chatApi.getRooms()
        rooms.value = res.data || []
        rooms.value.forEach((room) => {
            unreadCounts.value[room.id] = room.unreadCount || 0
        })
    }

    async function fetchMessages(roomId) {
        currentRoomId.value = roomId
        messages.value = []
        const res = await chatApi.getMessages(roomId, { page: 0, size: 50 })
        messages.value = (res.data.content || []).reverse()
        // 해당 방 읽음 처리
        unreadCounts.value[roomId] = 0
    }

    // WebSocket에서 새 메시지 수신 시 호출
    function addMessage(message) {
        if (message.roomId === currentRoomId.value) {
            messages.value.push(message)
        } else {
            unreadCounts.value[message.roomId] = (unreadCounts.value[message.roomId] || 0) + 1
            // 채팅방 목록에서 해당 방의 lastMessage 업데이트
            const room = rooms.value.find((r) => r.id === message.roomId)
            if (room) {
                room.lastMessage = message.content
                room.lastMessageAt = message.createdAt
            }
        }
    }

    async function leaveRoom(roomId) {
        await chatApi.leaveRoom(roomId)
        rooms.value = rooms.value.filter((r) => r.id !== roomId)
        if (currentRoomId.value === roomId) {
            currentRoomId.value = null
            messages.value = []
        }
    }

    function exitRoom() {
        currentRoomId.value = null
        messages.value = []
    }

    return { rooms, currentRoomId, messages, unreadCounts, fetchRooms, fetchMessages, addMessage, leaveRoom, exitRoom }
})
