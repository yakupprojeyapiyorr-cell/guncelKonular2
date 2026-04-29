import React, { useState, useEffect } from 'react'
import apiClient from '../lib/api'

export default function LessonsPage() {
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)

  const colors = ['blue', 'emerald', 'indigo', 'rose', 'amber', 'purple', 'cyan']

  useEffect(() => {
    fetchLessons()
  }, [])

  const fetchLessons = async () => {
    try {
      const { data } = await apiClient.get('/lessons')
      setLessons(data)
    } catch (error) {
      console.error('Dersler yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-slate-400">Yükleniyor...</div>
  }

  return (
    <div className="space-y-8 animate-fadeUp">
      <div>
        <h1 className="text-4xl font-extrabold text-white mb-3">Dersler</h1>
        <p className="text-slate-400 font-medium">Çalışmak istediğiniz dersi seçin ve odaklanmaya başlayın</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessons.map((lesson, index) => {
          const color = colors[index % colors.length]
          return (
            <div
              key={lesson.id}
              className="group relative bg-[#111620]/60 backdrop-blur-md border border-white/[0.05] rounded-2xl p-8 cursor-pointer hover:border-blue-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:-translate-y-1"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-${color}-500/10 transition-all`} />
              
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{lesson.name}</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                {lesson.description || 'Bu ders için henüz bir açıklama eklenmemiş.'}
              </p>
              
              <div className="flex justify-between items-center pt-4 border-t border-white/[0.05]">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">0 Konu Tamamlandı</span>
                <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <span className="text-xl">→</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
