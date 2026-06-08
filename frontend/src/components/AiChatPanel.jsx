import React, { useState, useRef, useEffect } from 'react';
import apiClient from '../lib/api';

export default function AiChatPanel() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Merhaba! Ben FocusFlow Yapay Zeka Koçun. Bugün odaklanma performansını nasıl artırabiliriz?' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userMessage = { sender: 'user', text: prompt };
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setLoading(true);

    try {
      const response = await apiClient.post('/ai/chat', { prompt });
      const aiText = response.data?.reply || "Seni duyamadım, tekrar dener misin?";
      setMessages(prev => [...prev, { sender: 'ai', text: aiText }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Bir hata oluştu, lütfen tekrar dene.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111620]/60 backdrop-blur-md border border-white/[0.05] text-white p-5 rounded-3xl shadow-xl flex flex-col h-[400px]">
      <div className="border-b border-white/10 pb-3 mb-3 flex items-center gap-3">
        <span className="text-2xl">🤖</span>
        <h3 className="font-bold text-indigo-400">AI Verimlilik Koçu</h3>
      </div>
      
      {/* Mesaj Alanı */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-3 text-sm custom-scrollbar">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white/10 text-slate-200 rounded-bl-sm border border-white/5'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 p-3 rounded-2xl rounded-bl-sm border border-white/5">
              <span className="text-slate-400 text-xs animate-pulse">Düşünüyor...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Alanı */}
      <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-white/10 pt-3">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Koçuna bir şey sor..."
          className="flex-1 bg-[#0a0f18] border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          disabled={loading}
        />
        <button 
          type="submit" 
          disabled={loading || !prompt.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg"
        >
          Gönder
        </button>
      </form>
    </div>
  );
}
