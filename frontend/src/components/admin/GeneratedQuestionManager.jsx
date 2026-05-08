import React, { useEffect, useState } from 'react'
import apiClient from '../../lib/api'

export default function GeneratedQuestionManager() {
  const [lessons, setLessons] = useState([])
  const [selectedLessonId, setSelectedLessonId] = useState('')
  const [topics, setTopics] = useState([])
  const [selectedTopicId, setSelectedTopicId] = useState('')
  const [difficulty, setDifficulty] = useState('MEDIUM')
  const [count, setCount] = useState(5)
  const [pendingQuestions, setPendingQuestions] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await apiClient.get('/lessons')
        setLessons(response.data)
        if (response.data.length > 0) {
          setSelectedLessonId(response.data[0].id)
        }
      } catch (error) {
        console.error('Dersler yuklenirken hata:', error)
      }
    }

    const fetchPendingQuestions = async () => {
      setIsLoading(true)
      try {
        const response = await apiClient.get('/admin/questions/pending')
        setPendingQuestions(response.data)
      } catch (error) {
        console.error('Bekleyen sorular yuklenirken hata:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLessons()
    fetchPendingQuestions()
  }, [])

  useEffect(() => {
    const fetchTopics = async () => {
      if (!selectedLessonId) {
        setTopics([])
        return
      }

      try {
        const response = await apiClient.get(`/lessons/${selectedLessonId}/topics`)
        setTopics(response.data)
        if (response.data.length > 0) {
          setSelectedTopicId(response.data[0].id)
        }
      } catch (error) {
        console.error('Konular yuklenirken hata:', error)
      }
    }

    fetchTopics()
  }, [selectedLessonId])

  const fetchPendingQuestions = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get('/admin/questions/pending')
      setPendingQuestions(response.data)
    } catch (error) {
      console.error('Bekleyen sorular yuklenirken hata:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!selectedTopicId) return
    setIsGenerating(true)
    try {
      await apiClient.post('/admin/questions/generate', {
        topicId: selectedTopicId,
        difficulty,
        count,
      })
      await fetchPendingQuestions()
      alert('Sorular basariyla uretildi!')
    } catch {
      alert('Soru uretimi sirasinda hata olustu')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleValidate = async (id, isApproved) => {
    const feedback = isApproved ? 'APPROVED' : 'REJECTED'
    try {
      await apiClient.post(`/admin/questions/validate/${id}?feedback=${feedback}&isApproved=${isApproved}`)
      setPendingQuestions((prev) => prev.filter((q) => q.id !== id))
    } catch {
      alert('Dogrulama sirasinda hata olustu')
    }
  }

  return (
    <div className="animate-fadeUp space-y-12">
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">LLM Soru Uretimi</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-400 ml-1">Ders</label>
            <select value={selectedLessonId} onChange={(e) => setSelectedLessonId(e.target.value)} className="w-full bg-[#0a0f18] border border-white/[0.1] text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50">
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-400 ml-1">Konu</label>
            <select value={selectedTopicId} onChange={(e) => setSelectedTopicId(e.target.value)} className="w-full bg-[#0a0f18] border border-white/[0.1] text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50">
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-400 ml-1">Zorluk ve Adet</label>
            <div className="flex gap-2">
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full bg-[#0a0f18] border border-white/[0.1] text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50">
                <option value="EASY">Kolay</option>
                <option value="MEDIUM">Orta</option>
                <option value="HARD">Zor</option>
              </select>
              <input type="number" value={count} min="1" max="10" onChange={(e) => setCount(parseInt(e.target.value, 10) || 1)} className="w-24 bg-[#0a0f18] border border-white/[0.1] text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50" />
            </div>
          </div>
          <button onClick={handleGenerate} disabled={isGenerating || !selectedTopicId} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white h-[50px] rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
            {isGenerating ? 'Uretiliyor...' : 'Sorulari Uret'}
          </button>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Onay Bekleyen Sorular</h2>
          <span className="bg-blue-600/10 text-blue-400 px-4 py-1.5 rounded-full text-sm font-bold border border-blue-500/20">{pendingQuestions.length} Soru</span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20 text-slate-400">Yukleniyor...</div>
        ) : pendingQuestions.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-white/[0.05] rounded-3xl">
            <p className="text-slate-500 font-medium">Onay bekleyen yapay zeka sorusu bulunmuyor.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingQuestions.map((q) => (
              <div key={q.id} className="bg-white/[0.02] border border-white/[0.08] rounded-3xl p-8 hover:border-white/[0.15] transition-all group">
                <div className="flex justify-between items-start gap-6 mb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">{q.topicName}</span>
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                          q.difficulty === 'HARD'
                            ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                            : q.difficulty === 'MEDIUM'
                              ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                              : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-white leading-relaxed pt-2">{q.questionText}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleValidate(q.id, true)} className="bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white w-12 h-12 rounded-xl border border-emerald-500/20 transition-all flex items-center justify-center text-xl" title="Onayla">
                      ✓
                    </button>
                    <button onClick={() => handleValidate(q.id, false)} className="bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white w-12 h-12 rounded-xl border border-rose-500/20 transition-all flex items-center justify-center text-xl" title="Reddet">
                      X
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(q.options).map(([key, text]) => (
                    <div key={key} className={`p-4 rounded-2xl border ${key === q.correctAnswer ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100' : 'bg-white/[0.02] border-white/[0.05] text-slate-400'}`}>
                      <span className="font-bold mr-3">{key}:</span> {text}
                    </div>
                  ))}
                </div>

                {q.explanation && (
                  <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                    <p className="text-sm text-blue-300/80 italic">
                      <span className="font-bold not-italic text-blue-400 mr-2">Cozum Aciklamasi:</span>
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
