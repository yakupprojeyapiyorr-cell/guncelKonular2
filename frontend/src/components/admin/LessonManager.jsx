import React, { useState, useEffect } from 'react'
import apiClient from '../../lib/api'

export default function LessonManager() {
  const [lessons, setLessons] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [currentLesson, setCurrentLesson] = useState({ name: '', description: '', orderIndex: 0 })
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchLessons()
  }, [])

  const fetchLessons = async () => {
    try {
      const response = await apiClient.get('/lessons')
      setLessons(response.data)
    } catch (error) {
      console.error('Dersler yüklenirken hata:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (isEditing) {
        await apiClient.put(`/admin/lessons/${currentLesson.id}`, currentLesson)
      } else {
        await apiClient.post('/admin/lessons', currentLesson)
      }
      setShowModal(false)
      setCurrentLesson({ name: '', description: '', orderIndex: 0 })
      setIsEditing(false)
      fetchLessons()
    } catch (error) {
      alert('İşlem sırasında hata oluştu')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Bu dersi silmek istediğinize emin misiniz?')) {
      try {
        await apiClient.delete(`/admin/lessons/${id}`)
        fetchLessons()
      } catch (error) {
        alert('Ders silinemedi')
      }
    }
  }

  const handleEdit = (lesson) => {
    setCurrentLesson(lesson)
    setIsEditing(true)
    setShowModal(true)
  }

  return (
    <div className="animate-fadeUp">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Ders Yönetimi</h2>
          <p className="text-slate-400 text-sm">Sistemdeki dersleri görüntüleyin ve düzenleyin</p>
        </div>
        <button
          onClick={() => {
            setIsEditing(false)
            setCurrentLesson({ name: '', description: '', orderIndex: 0 })
            setShowModal(true)
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center gap-2"
        >
          <span className="text-xl">+</span> Yeni Ders Ekle
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 text-slate-400">Yükleniyor...</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/[0.05]">
          <table className="min-w-full divide-y divide-white/[0.05]">
            <thead className="bg-white/[0.02]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Sıra</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Ders Adı</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Açıklama</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {lessons.map((lesson) => (
                <tr key={lesson.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-medium">#{lesson.orderIndex}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">{lesson.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-400 truncate max-w-xs">{lesson.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(lesson)}
                      className="text-blue-400 hover:text-blue-300 mr-6 font-bold"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(lesson.id)}
                      className="text-rose-400 hover:text-rose-300 font-bold"
                    >
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
            <h3 className="text-2xl font-bold text-white mb-6">{isEditing ? 'Dersi Düzenle' : 'Yeni Ders Ekle'}</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300 ml-1">Ders Adı</label>
                <input
                  type="text"
                  required
                  value={currentLesson.name}
                  onChange={(e) => setCurrentLesson({ ...currentLesson, name: e.target.value })}
                  className="w-full bg-[#0a0f18] border border-white/[0.1] text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="Örn: Matematik"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300 ml-1">Açıklama</label>
                <textarea
                  value={currentLesson.description}
                  onChange={(e) => setCurrentLesson({ ...currentLesson, description: e.target.value })}
                  className="w-full bg-[#0a0f18] border border-white/[0.1] text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all min-h-[100px]"
                  placeholder="Ders hakkında kısa bilgi..."
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300 ml-1">Sıra No</label>
                <input
                  type="number"
                  value={currentLesson.orderIndex}
                  onChange={(e) => setCurrentLesson({ ...currentLesson, orderIndex: parseInt(e.target.value) })}
                  className="w-full bg-[#0a0f18] border border-white/[0.1] text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 font-bold text-slate-400 hover:text-white transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all"
                >
                  {isEditing ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
