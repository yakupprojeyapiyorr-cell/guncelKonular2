import React, { useEffect, useState } from 'react'
import apiClient from '../../lib/api'

export default function ExamManager() {
  const [exams, setExams] = useState([])
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedQuestions, setSelectedQuestions] = useState([])
  const [newExam, setNewExam] = useState({
    title: '',
    durationMinutes: 60,
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [examsRes, questionsRes] = await Promise.all([apiClient.get('/exams'), apiClient.get('/admin/questions')])
        setExams(examsRes.data)
        setQuestions(questionsRes.data.content || [])
      } catch (err) {
        console.error('Sinav yonetimi verileri yuklenemedi:', err)
      }
    }

    loadData()
  }, [])

  const fetchExams = async () => {
    try {
      const { data } = await apiClient.get('/exams')
      setExams(data)
    } catch (err) {
      console.error('Sinavlar yuklenemedi:', err)
    }
  }

  const handleCreateExam = async (e) => {
    e.preventDefault()
    if (selectedQuestions.length === 0) {
      alert('Lutfen en az bir soru secin')
      return
    }

    setLoading(true)
    try {
      await apiClient.post('/admin/exams', {
        ...newExam,
        questionIds: selectedQuestions,
      })
      setShowModal(false)
      setSelectedQuestions([])
      setNewExam({ title: '', durationMinutes: 60 })
      await fetchExams()
    } catch {
      alert('Sinav olusturulamadi')
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (id) => {
    try {
      await apiClient.put(`/admin/exams/${id}/publish`)
      await fetchExams()
    } catch {
      alert('Sinav yayinlanamadi')
    }
  }

  const toggleQuestionSelection = (id) => {
    setSelectedQuestions((prev) => (prev.includes(id) ? prev.filter((qid) => qid !== id) : [...prev, id]))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Sinav Yonetimi</h2>
        <button onClick={() => setShowModal(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg">
          + Yeni Sinav
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exams.map((exam) => (
          <div key={exam.id} className="bg-[#0a0f18]/60 border border-white/[0.05] p-6 rounded-2xl flex justify-between items-center">
            <div>
              <h3 className="text-white font-bold text-lg">{exam.title}</h3>
              <p className="text-slate-400 text-sm">{exam.durationMinutes} Dakika</p>
              <div className="mt-2">
                {exam.isPublished ? (
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-md">Yayinda</span>
                ) : (
                  <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-1 rounded-md">Taslak</span>
                )}
              </div>
            </div>
            {!exam.isPublished && (
              <button onClick={() => handlePublish(exam.id)} className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition">
                Yayinla
              </button>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#111620] border border-white/[0.1] rounded-2xl shadow-2xl w-full max-w-4xl p-8 my-8">
            <h3 className="text-2xl font-bold text-white mb-6">Yeni Sinav Olustur</h3>
            <form onSubmit={handleCreateExam} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">Sinav Basligi</label>
                  <input value={newExam.title} onChange={(e) => setNewExam({ ...newExam, title: e.target.value })} className="w-full bg-[#0a0f18] border border-white/[0.1] text-white rounded-xl px-4 py-3 outline-none" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">Sure (Dakika)</label>
                  <input type="number" value={newExam.durationMinutes} onChange={(e) => setNewExam({ ...newExam, durationMinutes: parseInt(e.target.value, 10) || 0 })} className="w-full bg-[#0a0f18] border border-white/[0.1] text-white rounded-xl px-4 py-3 outline-none" required />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-slate-300 block">Soru Secimi ({selectedQuestions.length} secildi)</label>
                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {questions.map((q) => (
                    <div
                      key={q.id}
                      onClick={() => toggleQuestionSelection(q.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition ${
                        selectedQuestions.includes(q.id) ? 'bg-blue-600/20 border-blue-600' : 'bg-[#0a0f18] border-white/[0.05] hover:border-white/20'
                      }`}
                    >
                      <p className="text-white text-sm truncate">{q.questionText}</p>
                      <span className="text-[10px] text-slate-500 uppercase">{q.difficulty}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 font-bold text-slate-400 hover:text-white">
                  Iptal
                </button>
                <button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-10 py-3 rounded-xl font-bold shadow-lg">
                  {loading ? 'Olusturuluyor...' : 'Sinavi Olustur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
