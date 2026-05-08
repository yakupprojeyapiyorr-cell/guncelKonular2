import React, { useEffect, useState } from 'react'
import apiClient from '../lib/api'
import { useAuthStore } from '../store/authStore'
import GoalWidget from '../components/GoalWidget'
import StudyPlanCard from '../components/StudyPlanCard'
import LeaderboardWidget from '../components/LeaderboardWidget'
import FriendsWidget from '../components/FriendsWidget'

export default function Dashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    lessonsCount: 0,
    solvedQuestions: 0,
    studyTime: '0h',
    rank: '-',
  })
  const [daysLeft, setDaysLeft] = useState(0)

  useEffect(() => {
    const calculateYksCountdown = () => {
      const yksDate = new Date('2026-06-20')
      const today = new Date()
      const diffTime = Math.abs(yksDate - today)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setDaysLeft(diffDays)
    }

    const fetchDashboardData = async () => {
      try {
        const [lessonsRes, statsRes] = await Promise.all([apiClient.get('/lessons'), apiClient.get('/stats/me')])
        setStats({
          lessonsCount: lessonsRes.data.length,
          solvedQuestions: statsRes.data.totalQuestions || 0,
          studyTime: `${(statsRes.data.totalPomodoroHours || 0).toFixed(1)}h`,
          rank: statsRes.data.globalRank || '-',
        })
      } catch (error) {
        console.error('Dashboard verisi yuklenirken hata:', error)
      }
    }

    fetchDashboardData()
    calculateYksCountdown()
  }, [])

  return (
    <div className="space-y-10 animate-fadeUp">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">
            Merhaba, <span className="text-blue-500">{user?.name?.split(' ')[0] || 'Ogrenci'}</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">YKS hazirlik yolculugunda bugun yeni bir zafer kazan.</p>
        </div>

        <div className="bg-gradient-to-r from-rose-500 to-orange-500 p-[2px] rounded-3xl shadow-xl shadow-rose-500/10">
          <div className="bg-[#0a0f18] px-8 py-4 rounded-[calc(1.5rem-2px)] flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">YKS 2026</span>
              <span className="text-3xl font-black text-white">{daysLeft}</span>
            </div>
            <div className="text-xs font-bold text-slate-400">GUN KALDI</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Aktif Dersler" value={stats.lessonsCount} icon="Ders" color="blue" />
        <StatCard title="Cozulen Soru" value={stats.solvedQuestions} icon="Soru" color="emerald" />
        <StatCard title="Calisma Suresi" value={stats.studyTime} icon="Sure" color="purple" />
        <StatCard title="Genel Siralama" value={stats.rank} icon="Siralama" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6">
          <StudyPlanCard />
        </div>

        <div className="lg:col-span-6 space-y-6">
          <LeaderboardWidget />
          <FriendsWidget />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-[#111620]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">Gunluk Hedeflerin</h2>
            <div className="space-y-4">
              <GoalItem label="1 Pomodoro Tamamla" completed={stats.studyTime !== '0.0h'} />
              <GoalItem label="20 Soru Coz" completed={stats.solvedQuestions >= 20} />
              <GoalItem label="Bir Ders Videosu Izle" completed={stats.lessonsCount > 0} />
              <GoalItem label="Siralamada Yuksel" completed={false} />
            </div>
          </div>
          <GoalWidget />
        </div>

        <div className="lg:col-span-8">
          <div className="bg-[#111620]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">AI Analiz - Zayif Noktalar</h2>
            <p className="text-slate-400 text-sm mb-4">Son calisma performansina gore gelisim alanlarini gorelim...</p>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition">Analiz Baslat</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ActionButton label="Dersler" href="/lessons" />
        <ActionButton label="Deneme Sinavi" href="/exams" />
        <ActionButton label="Pomodoro" href="/pomodoro" />
        <ActionButton label="Basari Analizi" href="/stats" />
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
        <div className={`p-4 rounded-2xl ${colorMap[color]}`}>
          <span className="text-sm">{icon}</span>
        </div>
      </div>
      <h3 className="text-slate-500 text-[10px] font-black mb-1 uppercase tracking-widest">{title}</h3>
      <p className="text-4xl font-black text-white">{value}</p>
    </div>
  )
}

function ActionButton({ label, href }) {
  return (
    <a href={href} className="flex flex-col items-center justify-center gap-3 bg-[#111620]/60 border border-white/5 p-6 rounded-3xl text-white font-bold transition-all hover:bg-blue-600 group active:scale-95">
      <span className="text-[10px] uppercase tracking-widest font-black text-slate-500 group-hover:text-white">{label}</span>
    </a>
  )
}

function GoalItem({ label, completed }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${completed ? 'bg-emerald-500 border-emerald-500' : 'border-white/10 group-hover:border-white/30'}`}>
        {completed && <span className="text-white text-xs">✓</span>}
      </div>
      <span className={`text-sm font-bold ${completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>{label}</span>
    </div>
  )
}
