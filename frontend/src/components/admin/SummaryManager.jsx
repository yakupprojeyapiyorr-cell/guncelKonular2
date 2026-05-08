import React, { useEffect, useState } from 'react'
import apiClient from '../../lib/api'

export default function SummaryManager() {
  const [topics, setTopics] = useState([])
  const [selectedTopic, setSelectedTopic] = useState('')
  const [contentMarkdown, setContentMarkdown] = useState('')
  const [sourcePdfUrl, setSourcePdfUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    const fetchLessonsAndTopics = async () => {
      try {
        const { data: lessonsData } = await apiClient.get('/lessons')
        const allTopics = []
        for (const lesson of lessonsData) {
          const { data: topicsData } = await apiClient.get(`/lessons/${lesson.id}/topics`)
          allTopics.push(...topicsData)
        }
        setTopics(allTopics)
      } catch (error) {
        console.error('Veriler yuklenirken hata:', error)
      }
    }

    fetchLessonsAndTopics()
  }, [])

  const handleTopicChange = async (topicId) => {
    setSelectedTopic(topicId)
    if (!topicId) return

    try {
      const { data } = await apiClient.get(`/admin/summaries/${topicId}`)
      if (data) {
        setContentMarkdown(data.contentMarkdown || '')
        setSourcePdfUrl(data.sourcePdfUrl || '')
      } else {
        setContentMarkdown('')
        setSourcePdfUrl('')
      }
    } catch {
      setContentMarkdown('')
      setSourcePdfUrl('')
    }
  }

  const handleSave = async () => {
    if (!selectedTopic) return
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      await apiClient.post('/admin/summaries', {
        topicId: selectedTopic,
        contentMarkdown,
        sourcePdfUrl,
      })
      setMessage({ type: 'success', text: 'Ozet basariyla kaydedildi!' })
    } catch {
      setMessage({ type: 'error', text: 'Kaydedilirken hata olustu.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">MEB Kitap Ozetleri</h2>
      </div>

      {message.text && <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>{message.text}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300 ml-1">Konu Secin</label>
            <select value={selectedTopic} onChange={(e) => handleTopicChange(e.target.value)} className="w-full bg-[#0a0f18] border border-white/[0.1] text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all">
              <option value="">Konu Seciniz...</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300 ml-1">PDF Kaynak Linki</label>
            <input type="text" value={sourcePdfUrl} onChange={(e) => setSourcePdfUrl(e.target.value)} placeholder="https://... (Orn: MEB EBA PDF Linki)" className="w-full bg-[#0a0f18] border border-white/[0.1] text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300 ml-1">Ozet Icerigi (Markdown)</label>
            <textarea value={contentMarkdown} onChange={(e) => setContentMarkdown(e.target.value)} rows={10} placeholder="LLM tarafindan ozetlenmis icerigi buraya yapistirin..." className="w-full bg-[#0a0f18] border border-white/[0.1] text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-sm" />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button onClick={handleSave} disabled={loading || !selectedTopic} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-10 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all">
          {loading ? 'Kaydediliyor...' : 'Ozeti Kaydet'}
        </button>
      </div>
    </div>
  )
}
