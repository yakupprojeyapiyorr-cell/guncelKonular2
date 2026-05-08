import React, { useEffect, useState } from 'react'
import apiClient from '../../lib/api'

export default function TopicManager() {
  const [lessons, setLessons] = useState([])
  const [selectedLessonId, setSelectedLessonId] = useState('')
  const [topics, setTopics] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [currentTopic, setCurrentTopic] = useState({ name: '', lessonId: '', orderIndex: 0 })
  const [isEditing, setIsEditing] = useState(false)

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

    fetchLessons()
  }, [])

  useEffect(() => {
    const fetchTopics = async () => {
      if (!selectedLessonId) {
        setTopics([])
        return
      }

      setIsLoading(true)
      try {
        const response = await apiClient.get(`/lessons/${selectedLessonId}/topics`)
        setTopics(response.data)
      } catch (error) {
        console.error('Konular yuklenirken hata:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopics()
  }, [selectedLessonId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (isEditing) {
        await apiClient.put(`/admin/topics/${currentTopic.id}`, currentTopic)
      } else {
        await apiClient.post('/admin/topics', { ...currentTopic, lessonId: selectedLessonId })
      }
      setShowModal(false)
      setCurrentTopic({ name: '', lessonId: '', orderIndex: 0 })
      setIsEditing(false)
      const response = await apiClient.get(`/lessons/${selectedLessonId}/topics`)
      setTopics(response.data)
    } catch {
      alert('Islem sirasinda hata olustu')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bu konuyu silmek istediginize emin misiniz?')) return

    try {
      await apiClient.delete(`/admin/topics/${id}`)
      const response = await apiClient.get(`/lessons/${selectedLessonId}/topics`)
      setTopics(response.data)
    } catch {
      alert('Konu silinemedi')
    }
  }

  const handleEdit = (topic) => {
    setCurrentTopic({ ...topic, lessonId: selectedLessonId })
    setIsEditing(true)
    setShowModal(true)
  }

  return (
    <div className="animate-fadeUp">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Konu Yonetimi</h2>
          <div className="mt-3 flex items-center gap-3 bg-white/[0.03] p-1.5 pl-4 rounded-xl border border-white/[0.05]">
            <label className="text-sm font-semibold text-slate-400">Ders Filtresi:</label>
            <select value={selectedLessonId} onChange={(e) => setSelectedLessonId(e.target.value)} className="bg-transparent text-white font-bold text-sm outline-none cursor-pointer pr-4">
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id} className="bg-[#111620]">
                  {lesson.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={() => {
            setIsEditing(false)
            setCurrentTopic({ name: '', lessonId: selectedLessonId, orderIndex: 0 })
            setShowModal(true)
          }}
          disabled={!selectedLessonId}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-2"
        >
          <span className="text-xl">+</span> Yeni Konu Ekle
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 text-slate-400">Yukleniyor...</div>
      ) : topics.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-white/[0.05] rounded-2xl">
          <p className="text-slate-500 font-medium">Bu derse ait henuz bir konu eklenmemis.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/[0.05]">
          <table className="min-w-full divide-y divide-white/[0.05]">
            <thead className="bg-white/[0.02]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Sira</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Konu Adi</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Islemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {topics.map((topic) => (
                <tr key={topic.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-medium">#{topic.orderIndex}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">{topic.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(topic)} className="text-blue-400 hover:text-blue-300 mr-6 font-bold">
                      Duzenle
                    </button>
                    <button onClick={() => handleDelete(topic.id)} className="text-rose-400 hover:text-rose-300 font-bold">
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#111620] border border-white/[0.1] rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fadeUp">
            <h3 className="text-2xl font-bold text-white mb-6">{isEditing ? 'Konuyu Duzenle' : 'Yeni Konu Ekle'}</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300 ml-1">Konu Adi</label>
                <input type="text" required value={currentTopic.name} onChange={(e) => setCurrentTopic({ ...currentTopic, name: e.target.value })} className="w-full bg-[#0a0f18] border border-white/[0.1] text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" placeholder="Orn: Limit ve Sureklilik" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300 ml-1">Sira No</label>
                <input type="number" value={currentTopic.orderIndex} onChange={(e) => setCurrentTopic({ ...currentTopic, orderIndex: parseInt(e.target.value, 10) || 0 })} className="w-full bg-[#0a0f18] border border-white/[0.1] text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 font-bold text-slate-400 hover:text-white transition-colors">
                  Iptal
                </button>
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all">
                  {isEditing ? 'Guncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
