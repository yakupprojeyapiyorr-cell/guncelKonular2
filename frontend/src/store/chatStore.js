import { create } from 'zustand'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const useChatStore = create((set, get) => ({
  stompClient: null,
  messages: [],
  isConnected: false,

  connect: (userId) => {
    if (get().isConnected) return

    const socket = new SockJS(`${API_BASE_URL}/ws`)
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    client.onConnect = (frame) => {
      console.log(`Connected: ${frame}`)
      set({ isConnected: true })

      client.subscribe(`/user/${userId}/queue/messages`, (message) => {
        const receivedMsg = JSON.parse(message.body)
        set((state) => ({
          messages: [...state.messages, receivedMsg],
        }))
      })
    }

    client.onStompError = (frame) => {
      console.error('STOMP error', frame)
    }

    client.activate()
    set({ stompClient: client })
  },

  disconnect: () => {
    const { stompClient } = get()
    if (stompClient) {
      stompClient.deactivate()
      set({ stompClient: null, isConnected: false })
    }
  },

  sendMessage: (senderId, receiverId, content) => {
    const { stompClient, isConnected } = get()
    if (stompClient && isConnected) {
      stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify({ senderId, receiverId, content }),
      })
    }
  },

  setMessages: (messages) => set({ messages }),
}))
