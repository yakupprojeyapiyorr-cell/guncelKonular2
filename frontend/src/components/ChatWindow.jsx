import React, { useEffect, useRef, useState } from 'react'
import apiClient from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'

export default function ChatWindow({ friendId, friendName, onClose }) {
  const { user } = useAuthStore()
  const { messages, setMessages, sendMessage: sendWsMessage, connect, isConnected } = useChatStore()
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true)
        const { data } = await apiClient.get(`/messages/conversation/${friendId}`)
        setMessages(data)
        await apiClient.post(`/messages/mark-read/${friendId}`)
        setUnreadCount(0)
      } catch (error) {
        console.error('Sohbet yuklenirken hata:', error)
      } finally {
        setLoading(false)
      }

      if (!isConnected && user?.id) {
        connect(user.id)
      }
    }

    initializeChat()
  }, [friendId, isConnected, connect, user?.id, setMessages])

  const sendMessage = () => {
    if (!newMessage.trim()) return
    sendWsMessage(user.id, friendId, newMessage)
    setNewMessage('')
  }

  const deleteMessage = async (messageId) => {
    try {
      await apiClient.delete(`/messages/${messageId}`)
      setMessages(messages.filter((m) => m.id !== messageId))
    } catch (error) {
      console.error('Mesaj silinirken hata:', error)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-[#111620] border border-white/10 rounded-3xl shadow-2xl flex flex-col z-50 animate-slideUp">
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-4 rounded-t-3xl flex justify-between items-center">
        <div>
          <h3 className="text-white font-bold">{friendName}</h3>
          {unreadCount > 0 && <span className="text-xs text-blue-200">{unreadCount} okunmamis</span>}
        </div>
        <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-full transition">
          X
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0f18]">
        {loading && messages.length === 0 ? (
          <div className="text-center text-slate-500 text-sm">Yukleniyor...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-slate-500 text-sm mt-8">Henuz mesaj yok.</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex group ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl text-sm transition-all ${
                  msg.senderId === user.id ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-100 rounded-bl-none'
                }`}
              >
                <p className="wrap-break-word">{msg.content}</p>
                <div className={`text-[10px] mt-1 flex items-center gap-1 ${msg.senderId === user.id ? 'text-blue-200' : 'text-slate-500'}`}>
                  <span>
                    {new Date(msg.createdAt).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {msg.senderId === user.id && <span>{msg.isRead ? 'OK' : 'G'}</span>}
                </div>
              </div>

              {msg.senderId === user.id && (
                <button
                  onClick={() => deleteMessage(msg.id)}
                  className="ml-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 text-xs p-1 transition"
                  title="Sil"
                >
                  Sil
                </button>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-white/10 p-4 flex gap-2 bg-[#111620] rounded-b-3xl">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Mesaj gonder..."
          className="flex-1 bg-[#0a0f18] text-white text-sm px-4 py-2 rounded-full border border-white/10 focus:border-blue-500 outline-none transition"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !newMessage.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-full font-bold transition"
        >
          {loading ? '...' : 'Gonder'}
        </button>
      </div>
    </div>
  )
}
