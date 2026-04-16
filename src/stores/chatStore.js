import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import api from '@/api/axios'
import { useAuthStore } from '@/stores/authStore'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '')
const WS_BASE_URL = (import.meta.env.VITE_WS_BASE_URL ?? API_BASE_URL).replace(/\/$/, '')

const TOKEN_REFRESH_BUFFER_SECONDS = 60

const buildApiError = (error, fallbackMessage) => {
  const data = error.response?.data
  const detail = data?.message ?? data?.error ?? data?.status
  return new Error(detail ? `${fallbackMessage}: ${detail}` : fallbackMessage)
}

const decodeJwtPayload = (token) => {
  if (!token) return null

  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = decodeURIComponent(
      atob(normalized)
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    )

    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export const useChatStore = defineStore('chat', () => {
  const authStore = useAuthStore()
  const getAccessToken = () => authStore.token
  const getCurrentUserId = () => {
    if (authStore.user?.userId) return Number(authStore.user.userId)
    if (authStore.user?.id) return Number(authStore.user.id)
    const payload = decodeJwtPayload(authStore.token)
    return payload?.sub ? Number(payload.sub) : null
  }

  let stompClient = null
  let roomSubscription = null
  let eventSubscription = null
  let isConnecting = false

  const isConnected = ref(false)
  const rooms = ref([])
  const messages = ref([])
  const isOpponentExited = ref(false)
  const loadRoomsError = '채팅 목록 조회에 실패했습니다'
  const loadMessagesError = '메시지 조회에 실패했습니다'
  const exitRoomError = '채팅방 나가기에 실패했습니다'
  const createRoomError = '채팅방 생성에 실패했습니다'

  const shouldRefreshToken = () => {
    const payload = decodeJwtPayload(authStore.token)
    if (!payload?.exp) return false

    const expiresAt = Number(payload.exp) * 1000
    return expiresAt <= Date.now() + TOKEN_REFRESH_BUFFER_SECONDS * 1000
  }

  const refreshAccessToken = async () => {
    const response = await api.post('/api/v1/auth/token/refresh')
    const newToken = response.data?.result?.accessToken

    if (newToken) {
      authStore.setToken(newToken)
    }

    return newToken ?? authStore.token
  }

  const ensureFreshAccessToken = async () => {
    if (!authStore.token) return null
    if (!shouldRefreshToken()) return authStore.token
    return refreshAccessToken()
  }

  const loadRooms = async () => {
    try {
      const { data } = await api.get('/api/v1/chat/rooms')
      rooms.value = data.result ?? []
    } catch (error) {
      console.error(error)
      throw buildApiError(error, loadRoomsError)
    }
  }

  const loadMessages = async (roomId) => {
    try {
      const { data } = await api.get(`/api/v1/chat/${roomId}/messages`)
      messages.value = data.result?.messages ?? []
      isOpponentExited.value = data.result?.opponentExited ?? false
    } catch (error) {
      console.error(error)
      throw buildApiError(error, loadMessagesError)
    }
  }

  const subscribeRoom = (roomId) => {
    if (!stompClient?.connected) return

    if (roomSubscription) {
      roomSubscription.unsubscribe()
    }

    roomSubscription = stompClient.subscribe(`/sub/chat/rooms/${roomId}`, (frame) => {
      const msg = JSON.parse(frame.body)
      messages.value.push(msg)

      if (Number(msg.senderId) !== getCurrentUserId()) {
        stompClient.publish({
          destination: '/pub/chat/read',
          body: JSON.stringify({ roomId }),
        })
      }
    })
  }

  const unsubscribeRoom = () => {
    if (roomSubscription) {
      roomSubscription.unsubscribe()
      roomSubscription = null
    }

    messages.value = []
    isOpponentExited.value = false
  }

  const sendMessage = (roomId, text) => {
    if (!text.trim() || !stompClient?.connected) return false

    stompClient.publish({
      destination: '/pub/chat/message',
      body: JSON.stringify({ roomId, messageText: text }),
    })

    return true
  }

  const markAsRead = (roomId) => {
    if (!roomId || !stompClient?.connected) return

    stompClient.publish({
      destination: '/pub/chat/read',
      body: JSON.stringify({ roomId }),
    })
  }

  const exitRoom = async (roomId) => {
    try {
      await api.patch(`/api/v1/chat/${roomId}/exit`)
      unsubscribeRoom()
      await loadRooms()
    } catch (error) {
      console.error(error)
      throw buildApiError(error, exitRoomError)
    }
  }

  const createRoom = async (opponentUserId) => {
    try {
      const { data } = await api.post('/api/v1/chat/rooms', { opponentUserId })
      await loadRooms()
      return data.result
    } catch (error) {
      console.error(error)
      throw buildApiError(error, createRoomError)
    }
  }

  const connect = async () => {
    if (!getAccessToken() || isConnecting || stompClient?.active || stompClient?.connected) return

    isConnecting = true

    try {
      await ensureFreshAccessToken()
    } catch (error) {
      console.error(error)
      authStore.logout()
      window.location.href = '/login'
      isConnecting = false
      return
    }

    const socket = new SockJS(`${WS_BASE_URL}/ws/chat`)
    stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: { Authorization: `Bearer ${getAccessToken()}` },
      debug: () => {},
      onConnect: () => {
        isConnected.value = true

        if (eventSubscription) {
          eventSubscription.unsubscribe()
        }

        eventSubscription = stompClient.subscribe(`/sub/events/${getCurrentUserId()}`, (frame) => {
          const event = JSON.parse(frame.body)
          handleEvent(event)
        })

        loadRooms().catch(console.error)
      },
      onDisconnect: () => {
        isConnected.value = false
        eventSubscription = null
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame.headers.message, frame.body)
      },
      onWebSocketError: (error) => {
        console.error('WebSocket error', error)
      },
    })

    stompClient.activate()
    isConnecting = false
  }

  const disconnect = async () => {
    unsubscribeRoom()

    if (eventSubscription) {
      eventSubscription.unsubscribe()
      eventSubscription = null
    }

    if (stompClient) {
      await stompClient.deactivate()
      stompClient = null
    }

    isConnected.value = false
  }

  const handleEvent = (event) => {
    const eventType = String(event?.type ?? '')
      .trim()
      .replace(/[\s-]+/g, '_')
      .toUpperCase()

    switch (eventType) {
      case 'NEW_MESSAGE':
        loadRooms().catch(console.error)
        break
      case 'MESSAGE_READ':
        messages.value = messages.value.map((message) =>
          Number(message.senderId) === getCurrentUserId() ? { ...message, isRead: true } : message
        )
        loadRooms().catch(console.error)
        break
      case 'OPPONENT_EXITED':
        isOpponentExited.value = true
        loadRooms().catch(console.error)
        break
      default:
        // Unknown event names should still refresh the room list so the UI stays in sync.
        loadRooms().catch(console.error)
        break
    }
  }

  return {
    isConnected,
    rooms,
    messages,
    isOpponentExited,
    connect,
    disconnect,
    loadRooms,
    loadMessages,
    subscribeRoom,
    unsubscribeRoom,
    sendMessage,
    markAsRead,
    exitRoom,
    createRoom,
  }
})
