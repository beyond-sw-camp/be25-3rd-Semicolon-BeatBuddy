import { defineStore } from 'pinia'
import { ref } from 'vue'
import { chatApi } from '@/api/chat'

export const useChatStore = defineStore('chat', () => {
    const rooms = ref([])
    const currentRoomId = ref(null)
    const messages = ref([])
    const unreadCounts = ref({})
    const emptyRoomIds = ref(new Set())

    async function fetchRooms() {
        const res = await chatApi.getRooms()
        const fetchedRooms = res.data?.result || []
        const currentRoom = rooms.value.find((room) => room.roomId === currentRoomId.value)
        rooms.value = fetchedRooms
        if (
            currentRoom?.roomId &&
            !rooms.value.some((room) => room.roomId === currentRoom.roomId)
        ) {
            rooms.value.unshift(currentRoom)
        }
        rooms.value.forEach((room) => {
            unreadCounts.value[room.roomId] = room.unreadCount || 0
        })
    }

    async function fetchMessages(roomId) {
        currentRoomId.value = roomId
        messages.value = []
        if (emptyRoomIds.value.has(roomId)) {
            unreadCounts.value[roomId] = 0
            return
        }
        const res = await chatApi.getMessages(roomId)
        messages.value = res.data?.result?.messages || []
        // 해당 방 읽음 처리
        unreadCounts.value[roomId] = 0
    }

    // WebSocket에서 새 메시지 수신 시 호출
    function addMessage(message) {
        emptyRoomIds.value.delete(message.roomId)
        if (message.roomId === currentRoomId.value) {
            messages.value.push(message)
        } else {
            unreadCounts.value[message.roomId] = (unreadCounts.value[message.roomId] || 0) + 1
            // 채팅방 목록에서 해당 방의 lastMessage 업데이트
            const room = rooms.value.find((r) => r.roomId === message.roomId)
            if (room) {
                room.lastMessageText = message.messageText
                room.lastMessageAt = message.createdAt
            }
        }
    }

    async function leaveRoom(roomId) {
        await chatApi.leaveRoom(roomId)
        rooms.value = rooms.value.filter((r) => r.roomId !== roomId)
        if (currentRoomId.value === roomId) {
            currentRoomId.value = null
            messages.value = []
        }
    }

    function exitRoom() {
        currentRoomId.value = null
        messages.value = []
    }

    function setCurrentRoom(room) {
        if (!room?.roomId) return
        const existingRoom = rooms.value.find((r) => r.roomId === room.roomId)
        if (existingRoom) {
            Object.assign(existingRoom, room)
        } else {
            rooms.value.unshift({
                lastMessageText: '',
                lastMessageAt: null,
                unreadCount: 0,
                ...room,
            })
        }
        currentRoomId.value = room.roomId
        unreadCounts.value[room.roomId] = room.unreadCount || 0
    }

    async function createRoom(opponentUserId) {
        const res = await chatApi.createRoom(opponentUserId)
        const room = res.data?.result
        if (res.status === 201 && room?.roomId) {
            emptyRoomIds.value.add(room.roomId)
        }
        if (room?.roomId && !rooms.value.some((r) => r.roomId === room.roomId)) {
            rooms.value.unshift({
                ...room,
                lastMessageText: '',
                lastMessageAt: null,
                unreadCount: 0,
            })
            unreadCounts.value[room.roomId] = 0
        }
        return room
    }

    return { rooms, currentRoomId, messages, unreadCounts, fetchRooms, fetchMessages, addMessage, leaveRoom, exitRoom, setCurrentRoom, createRoom }
})
