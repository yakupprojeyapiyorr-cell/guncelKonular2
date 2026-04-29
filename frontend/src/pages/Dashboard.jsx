import React, { useState, useEffect } from 'react'
import apiClient from '../lib/api'
import { useAuthStore } from '../store/authStore'

export default function Dashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    lessonsCount: 0,
    solvedQuestions: 0,
    studyTime: '0h',
    rank: '-'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const { data: lessons } = await apiClient.get('/lessons')
      // Diğer istatistikler için şimdilik mock veri veya 0 kullanıyoruz
      setStats(prev => ({
        ...prev,
        lessonsCount: lessons.length
      }))
    } catch (error) {
      console.error('Dashboard verisi yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-fadeUp">
      <div>
        <h1 className="text-4xl font-extrabold text-white mb-2">
          Merhaba, <span className="text-blue-500">{user?.name || 'Öğrenci'}</span> 👋
        </h1>
        <p className="text-slate-400 font-medium">YKS hazırlık yolculuğunda bugün neler yapacaksın?</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Aktif Dersler" value={stats.lessonsCount} icon="📚" color="blue" />
        <StatCard title="Çözülen Soru" value={stats.solvedQuestions} icon="📝" color="emerald" />
        <StatCard title="Çalışma Süresi" value={stats.studyTime} icon="⏱️" color="purple" />
        <StatCard title="Genel Sıralama" value={stats.rank} icon="🏆" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-[#111620]/60 backdrop-blur-md border border-white/[0.05] rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Hızlı İşlemler</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ActionButton label="Ders Çalışmaya Başla" icon="📖" color="blue" />
            <ActionButton label="Pomodoro Zamanlayıcı" icon="⌛" color="emerald" />
            <ActionButton label="Deneme Sınavı Çöz" icon="✍️" color="purple" />
            <ActionButton label="Gelişim İstatistikleri" icon="📊" color="amber" />
          </div>
        </div>

        {/* Daily Motivation or Goal */}
        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-md border border-white/[0.1] rounded-2xl p-8 flex flex-col justify-center items-center text-center">
          <div className="text-5xl mb-4">🎯</div>
          <h3 className="text-xl font-bold text-white mb-2">Günün Hedefi</h3>
          <p className="text-slate-300 mb-6">Bugün henüz bir hedef belirlemedin. Hayallerine bir adım daha yaklaşmak için başla!</p>
          <button className="bg-white text-blue-900 font-bold px-6 py-2 rounded-full hover:bg-blue-50 transition-colors">
            Hedef Belirle
          </button>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }) {
  const colorMap = {
    blue: 'text-blue-400 bg-blue-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
  }

  return (
    <div className="bg-[#111620]/60 backdrop-blur-md border border-white/[0.05] rounded-2xl p-6 transition-transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
      <h3 className="text-slate-400 text-sm font-semibold mb-1 uppercase tracking-wider">{title}</h3>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  )
}

function ActionButton({ label, icon, color }) {
  const colorMap = {
    blue: 'hover:bg-blue-600 shadow-blue-600/10',
    emerald: 'hover:bg-emerald-600 shadow-emerald-600/10',
    purple: 'hover:bg-purple-600 shadow-purple-600/10',
    amber: 'hover:bg-amber-600 shadow-amber-600/10',
  }
  
  return (
    <button className={`flex items-center gap-4 bg-[#1a2130] p-4 rounded-xl text-white font-bold transition-all ${colorMap[color]} hover:shadow-lg active:scale-[0.98]`}>
      <span className="text-2xl">{icon}</span>
      <span>{label}</span>
    </button>
  )
}
