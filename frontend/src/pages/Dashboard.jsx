import React, { useEffect, useState } from 'react'
import apiClient from '../lib/api'
import { useAuthStore } from '../store/authStore'
import GoalWidget from '../components/GoalWidget'
import StudyPlanCard from '../components/StudyPlanCard'
import LeaderboardWidget from '../components/LeaderboardWidget'
import TaskManagerWidget from '../components/TaskManagerWidget'
import AdBanner from '../components/AdBanner'
import FocusTrendChart from '../components/FocusTrendChart'
import CategoryPieChart from '../components/CategoryPieChart'
import MostUrgentTasks from '../components/MostUrgentTasks'
import AiChatPanel from '../components/AiChatPanel'

export default function Dashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    completedTasks: 0,
    pendingTasks: 0,
    studyTimeToday: '0h',
  })

  const [aiSuggestion, setAiSuggestion] = useState('AI analizi yükleniyor...')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await apiClient.get('/stats/me')
        setStats({
          completedTasks: data.completedTasks ?? data.totalQuestions ?? 0,
          pendingTasks: data.pendingTasks ?? 0,
          studyTimeToday: `${((data.todayPomodoroMinutes ?? 0) / 60).toFixed(1)}h`,
        })
      } catch (error) {
        console.error('Dashboard verisi yuklenirken hata:', error)
      }
    }

    void fetchDashboardData()
    
    // Görev tamamlandığında stats'ı yenile
    const handleStatsUpdate = () => {
      void fetchDashboardData()
    }
    window.addEventListener('stats-updated', handleStatsUpdate)
    
    return () => {
      window.removeEventListener('stats-updated', handleStatsUpdate)
    }
  }, [])

  const handleGetAiSuggestion = async () => {
    setAiSuggestion('Gemini analiz ediyor...')
    try {
      const { data } = await apiClient.get('/stats/me')
      const completed = data.completedTasks ?? data.totalQuestions ?? 0
      const minutes = data.todayPomodoroMinutes ?? Math.round((data.totalPomodoroHours || 0) * 60)
      const pending = data.pendingTasks ?? 0
      const aiRes = await apiClient.get(
        `/ai/suggestions?focusMinutes=${minutes}&completedTasks=${completed}&pendingTasks=${pending}`
      )
      setAiSuggestion(aiRes.data.suggestion)
    } catch (aiErr) {
      console.error('AI tavsiyesi yuklenemedi:', aiErr)
      setAiSuggestion('Analiz başarısız oldu. Lütfen tekrar deneyin.')
    }
  }

  return (
    <div className="space-y-10 animate-fadeUp">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">
            Merhaba, <span className="text-blue-500">{user?.name?.split(' ')[0] || 'Kullanici'}</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Hedeflerine ulasma yolculugunda bugun yeni bir zafer kazan.</p>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-emerald-500 p-[2px] rounded-3xl shadow-xl shadow-blue-500/10">
          <div className="bg-[#0a0f18] px-8 py-4 rounded-[calc(1.5rem-2px)] flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gorevler</span>
              <span className="text-3xl font-black text-white">{stats.completedTasks}</span>
            </div>
            <div className="text-xs font-bold text-slate-400">TAMAMLANDI</div>
          </div>
        </div>
      </div>

      <AdBanner />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <StatCard title="Tamamlanan Gorev" value={stats.completedTasks} icon="✅" color="emerald" />
            <StatCard title="Bugunku Calisma" value={stats.studyTimeToday} icon="⏱️" color="purple" />
          </div>

          <FocusTrendChart />
          <div className="bg-[#111620]/60 backdrop-blur-md border border-white/[0.05] rounded-3xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4">Kategori Dağılımı</h3>
            <CategoryPieChart />
          </div>
          <MostUrgentTasks />
          <StudyPlanCard />
          <TaskManagerWidget />
        </div>

        <div className="lg:col-span-4 space-y-8">
          <GoalWidget />
          <LeaderboardWidget />
          <AiChatPanel />
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }) {
  const colorMap = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  }

  return (
    <div className={`bg-[#111620]/60 backdrop-blur-md border ${colorMap[color]} rounded-3xl p-6 transition-all hover:-translate-y-1 hover:bg-[#111620]/80`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl ${colorMap[color]} text-2xl`}>
          <span>{icon}</span>
        </div>
      </div>
      <h3 className="text-slate-500 text-[10px] font-black mb-1 uppercase tracking-widest">{title}</h3>
      <p className="text-4xl font-black text-white">{value}</p>
    </div>
  )
}
