import React, { useEffect, useRef, useState } from 'react'
import apiClient from '../lib/api'

export default function StudyAiChat({ questionId = null, topicName = 'Genel', selectedOption = null }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Merhaba! ${topicName} konusunda yardim etmek icin buradayim.\n\nBir soru sorabilir, anlamadigin yeri yazabilir veya fotograf yukleyebilirsin.`,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [isOpen, setIsOpen] = useState(true)
  const [autoExplained, setAutoExplained] = useState(false)
  const fileInputRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!questionId || selectedOption === null || autoExplained) {
      return
    }

    const autoExplain = async () => {
      setAutoExplained(true)
      setLoading(true)
      addMessage('user', 'Bu soruyu yanlis yaptim, aciklar misin?')
      try {
        const { data } = await apiClient.post('/ai/explain', {
          questionId,
          selectedOption,
        })
        addMessage('assistant', data.explanation)
      } catch {
        addMessage('assistant', 'Aciklama alinamadi. Lutfen tekrar dene.')
      } finally {
        setLoading(false)
      }
    }

    autoExplain()
  }, [questionId, selectedOption, autoExplained])

  const addMessage = (role, content) => {
    setMessages((prev) => [...prev, { role, content }])
  }

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSend = async () => {
    if (!input.trim() && !imageFile) return

    const userText = input.trim() || '(Fotografi acikla)'
    const userMsg = imagePreview ? `${userText}\n[Fotograf yüklendi]` : userText

    addMessage('user', userMsg)
    setInput('')
    setLoading(true)

    try {
      const payload = {
        questionId: questionId || null,
        followUpQuestion: userText,
        studentImageUrl: imagePreview || null,
        selectedOption: null,
      }

      const { data } = await apiClient.post('/ai/explain', payload)
      addMessage('assistant', data.explanation)
    } catch (err) {
      addMessage('assistant', `Yanit alinamadi: ${err.response?.data?.message || err.message}`)
    } finally {
      setLoading(false)
      setImageFile(null)
      setImagePreview(null)
    }
  }

  const formatMessage = (content) =>
    content.split('\n').map((line, i) => (
      <p key={i} className="mb-1">
        {line}
      </p>
    ))

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full shadow-2xl shadow-indigo-600/40 flex items-center justify-center text-sm hover:scale-110 transition-all z-50"
        title="AI Ogretmeni Ac"
      >
        AI
      </button>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0f18] border-l border-white/[0.07] min-w-[340px] max-w-[420px]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07] bg-gradient-to-r from-indigo-600/20 to-purple-600/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm">AI</div>
          <div>
            <h3 className="text-white font-bold text-sm">AI Ogretmen</h3>
            <p className="text-indigo-300 text-[10px] font-medium">{topicName} • FocusFlow</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
          X
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs mr-2 mt-1 flex-shrink-0">
                AI
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-[#111620] border border-white/[0.07] text-slate-200 rounded-bl-none'
              }`}
            >
              {formatMessage(msg.content)}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs mr-2 mt-1">AI</div>
            <div className="bg-[#111620] border border-white/[0.07] rounded-2xl rounded-bl-none px-4 py-3">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {imagePreview && (
        <div className="px-4 pb-2 flex items-center gap-3">
          <div className="relative">
            <img src={imagePreview} alt="Yuklenen gorsel" className="w-16 h-16 object-cover rounded-xl border border-white/10" />
            <button
              onClick={() => {
                setImageFile(null)
                setImagePreview(null)
              }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
            >
              X
            </button>
          </div>
          <p className="text-slate-400 text-xs">Gorsel gonderilmeye hazir</p>
        </div>
      )}

      <div className="px-4 py-3 border-t border-white/[0.07] bg-[#0a0f18]">
        <div className="flex gap-2 items-end">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-all"
            title="Fotograf yukle"
          >
            Img
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Sormak istedigini yaz... (Enter = gonder)"
            rows={1}
            className="flex-1 bg-[#111620] border border-white/[0.1] text-white text-sm px-4 py-2.5 rounded-xl outline-none focus:border-indigo-500/50 resize-none placeholder:text-slate-600 transition-all"
          />

          <button
            onClick={handleSend}
            disabled={loading || (!input.trim() && !imageFile)}
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white transition-all shadow-lg shadow-indigo-600/30"
          >
            {loading ? '...' : 'Go'}
          </button>
        </div>
        <p className="text-[10px] text-slate-600 mt-1.5 text-center">Sisteme kayitli olmayan sorular icin fotograf yukleyebilirsin</p>
      </div>
    </div>
  )
}
