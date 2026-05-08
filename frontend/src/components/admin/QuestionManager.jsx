import React, { useEffect, useState } from 'react'
import apiClient from '../../lib/api'

export default function QuestionManager() {
  const [topics, setTopics] = useState([])
  const [selectedTopicId, setSelectedTopicId] = useState('')
  const [questions, setQuestions] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState({
    topicId: '',
    questionText: '',
    imageUrl: '',
    questionImageUrl: '',
    solutionImageUrl: '',
    difficulty: 'MEDIUM',
    coefficient: 1.0,
    correctOption: 0,
    options: [
      { index: 0, text: '', whyText: '' },
      { index: 1, text: '', whyText: '' },
      { index: 2, text: '', whyText: '' },
      { index: 3, text: '', whyText: '' },
      { index: 4, text: '', whyText: '' },
    ],
  })

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const { data } = await apiClient.get('/lessons')
        const allTopics = []
        for (const lesson of data) {
          const { data: topicsData } = await apiClient.get(`/lessons/${lesson.id}/topics`)
          allTopics.push(...topicsData)
        }
        setTopics(allTopics)
        if (allTopics.length > 0) setSelectedTopicId(allTopics[0].id)
      } catch (error) {
        console.error('Konular yuklenirken hata:', error)
      }
    }

    fetchTopics()
  }, [])

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedTopicId) return
      setLoading(true)
      try {
        const { data } = await apiClient.get(`/admin/questions?topicId=${selectedTopicId}`)
        setQuestions(data.content)
      } catch (error) {
        console.error('Sorular yuklenirken hata:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [selectedTopicId])

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...currentQuestion.options]
    newOptions[index][field] = value
    setCurrentQuestion({ ...currentQuestion, options: newOptions })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...currentQuestion, topicId: selectedTopicId }
      if (currentQuestion.id) {
        await apiClient.put(`/admin/questions/${currentQuestion.id}`, payload)
      } else {
        await apiClient.post('/admin/questions', payload)
      }
      setShowModal(false)
      const { data } = await apiClient.get(`/admin/questions?topicId=${selectedTopicId}`)
      setQuestions(data.content)
    } catch {
      alert('Kaydedilirken hata olustu')
    }
  }

  const handleEdit = (q) => {
    setCurrentQuestion(q)
    setShowModal(true)
  }

  const handleAiGenerate = async () => {
    if (!selectedTopicId) return
    setLoading(true)
    try {
      const { data } = await apiClient.post(`/ai/questions/generate?topicId=${selectedTopicId}&count=3`)
      const firstQ = data[0]
      setCurrentQuestion({
        ...firstQ,
        topicId: selectedTopicId,
        options: firstQ.options.map((o) => ({ ...o, index: o.index })),
      })
      setShowModal(true)
    } catch {
      alert('AI soru uretimi basarisiz oldu. API anahtarinizi kontrol edin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Soru Bankasi Yonetimi</h2>
          <select value={selectedTopicId} onChange={(e) => setSelectedTopicId(e.target.value)} className="mt-2 bg-[#0a0f18] border border-white/[0.1] text-white rounded-lg px-4 py-2 outline-none">
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-4">
          <button onClick={handleAiGenerate} disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2">
            {loading ? 'Uretiliyor...' : 'AI ile Soru Uret'}
          </button>
          <button
            onClick={() => {
              setCurrentQuestion({
                topicId: selectedTopicId,
                questionText: '',
                imageUrl: '',
                questionImageUrl: '',
                solutionImageUrl: '',
                difficulty: 'MEDIUM',
                coefficient: 1.0,
                correctOption: 0,
                options: Array.from({ length: 5 }, (_, i) => ({ index: i, text: '', whyText: '' })),
              })
              setShowModal(true)
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg"
          >
            + Manuel Soru
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {questions.map((q) => (
          <div key={q.id} className="bg-[#0a0f18]/60 border border-white/[0.05] p-6 rounded-2xl flex justify-between items-start">
            <div>
              <p className="text-white font-medium mb-2">{q.questionText}</p>
              <div className="flex gap-3">
                <span className="text-[10px] font-bold uppercase tracking-tighter px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/20">{q.source || 'MANUAL'}</span>
                <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md">{q.difficulty}</span>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md">{q.coefficient} Puan</span>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => handleEdit(q)} className="text-blue-400 hover:text-blue-300 font-bold">
                Duzenle
              </button>
              <button className="text-rose-400 hover:text-rose-300 font-bold">Sil</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#111620] border border-white/[0.1] rounded-2xl shadow-2xl w-full max-w-4xl p-8 my-8">
            <h3 className="text-2xl font-bold text-white mb-6">{currentQuestion.id ? 'Soruyu Duzenle' : 'Yeni Soru Ekle'}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">Soru Metni</label>
                  <textarea value={currentQuestion.questionText} onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })} className="w-full bg-[#0a0f18] border border-white/[0.1] text-white rounded-xl px-4 py-3 outline-none min-h-[120px]" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">Zorluk</label>
                    <select value={currentQuestion.difficulty} onChange={(e) => setCurrentQuestion({ ...currentQuestion, difficulty: e.target.value })} className="w-full bg-[#0a0f18] border border-white/[0.1] text-white rounded-xl px-4 py-3 outline-none">
                      <option value="EASY">Kolay</option>
                      <option value="MEDIUM">Orta</option>
                      <option value="HARD">Zor</option>
                      <option value="EXAM">OSYM Tipi</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">Puan (Katsayi)</label>
                    <input type="number" step="0.1" value={currentQuestion.coefficient} onChange={(e) => setCurrentQuestion({ ...currentQuestion, coefficient: parseFloat(e.target.value) || 0 })} className="w-full bg-[#0a0f18] border border-white/[0.1] text-white rounded-xl px-4 py-3 outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">Dogru Sik (0-4)</label>
                  <select value={currentQuestion.correctOption} onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctOption: parseInt(e.target.value, 10) })} className="w-full bg-[#0a0f18] border border-white/[0.1] text-white rounded-xl px-4 py-3 outline-none">
                    <option value={0}>A</option>
                    <option value={1}>B</option>
                    <option value={2}>C</option>
                    <option value={3}>D</option>
                    <option value={4}>E</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-slate-300">Siklar ve Aciklamalar</label>
                {currentQuestion.options.map((opt, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold flex-shrink-0">{String.fromCharCode(65 + i)}</div>
                    <div className="flex-1 space-y-2">
                      <input placeholder="Sik metni..." value={opt.text} onChange={(e) => handleOptionChange(i, 'text', e.target.value)} className="w-full bg-[#0a0f18] border border-white/[0.1] text-white rounded-lg px-3 py-2 text-sm outline-none" required />
                      <input placeholder="Neden bu sik?" value={opt.whyText} onChange={(e) => handleOptionChange(i, 'whyText', e.target.value)} className="w-full bg-white/[0.03] border border-white/[0.05] text-slate-400 rounded-lg px-3 py-1.5 text-xs outline-none" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="col-span-full flex justify-end gap-4 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 font-bold text-slate-400 hover:text-white">
                  Iptal
                </button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-3 rounded-xl font-bold shadow-lg">
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
