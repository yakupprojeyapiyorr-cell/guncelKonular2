import React, { useEffect, useRef, useState } from 'react'
import apiClient from '../lib/api'

const normalizeHistory = (data) => {
  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.messages)) {
    return data.messages
  }

  return []
}

const formatErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  'Uzgunum, bir hata olustu. Lutfen tekrar deneyin.'

export default function AiChatPanel({ topicId, topicName }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await apiClient.get(`/ai/chat/history/${topicId}`)
        setMessages(normalizeHistory(res.data))
      } catch (err) {
        console.error('Sohbet gecmisi yuklenemedi:', err)
        setMessages([])
      }
    }

    loadHistory()
  }, [topicId])

  const sendMessage = async () => {
    const trimmedInput = input.trim()
    if (!trimmedInput) return

    const userMsg = {
      role: 'user',
      content: trimmedInput,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await apiClient.post('/ai/chat', {
        topicId,
        message: trimmedInput,
      })

      const aiMsg = {
        role: 'assistant',
        content: res.data?.reply || 'AI yaniti bos dondu.',
        source: res.data?.source || `${topicName || 'Konu'} asistani`,
        timestamp: res.data?.createdAt || new Date().toISOString(),
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      console.error('AI cevap alinamadi:', err)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: formatErrorMessage(err),
          isError: true,
          timestamp: new Date().toISOString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-linear-to-b from-[#0a0f18] to-[#05070a] border-l border-white/10">
      <div className="p-4 border-b border-white/10 bg-[#111620]/40">
        <h3 className="text-white font-bold">{topicName} Asistani</h3>
        <p className="text-xs text-slate-500">AI destekli konu anlatimi</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <p className="text-slate-500 text-sm">Bu konuyla ilgili soru sormaya basla</p>
              <p className="text-slate-600 text-xs mt-2">Orn: "Turevin tanimi nedir?"</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={`${msg.timestamp || 'msg'}-${i}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : msg.isError
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-slate-700/50 text-slate-100'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              {msg.source && <p className="text-xs text-slate-400 mt-2 italic">{msg.source}</p>}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-700/50 px-4 py-2 rounded-2xl">
              <p className="text-sm text-slate-300">AI dusunuyor...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/10 bg-[#111620]/40">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Soru sor..."
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white px-4 py-2 rounded-full font-bold text-sm transition"
          >
            {loading ? '...' : 'Gonder'}
          </button>
        </div>
      </div>
    </div>
  )
}
