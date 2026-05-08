import React, { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import apiClient from '../lib/api'
import LeaderboardWidget from '../components/LeaderboardWidget'

export default function StatsPage() {
  const [stats, setStats] = useState(null)
  const [weakTopics, setWeakTopics] = useState([])
  const [pomodoroTrend, setPomodoroTrend] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [statsRes, weakRes, trendRes] = await Promise.all([
        apiClient.get('/stats/me'),
        apiClient.get('/stats/me/weak-topics'),
        apiClient.get('/stats/me/pomodoro-trend')
      ])
      setStats(statsRes.data)
      setWeakTopics(weakRes.data)
      setPomodoroTrend(trendRes.data)
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="py-20 text-center text-slate-400">Yükleniyor...</div>

  return (
    <div className="space-y-8 animate-fadeUp">
      <div>
        <h1 className="text-4xl font-extrabold text-white mb-2">Başarı Analizi</h1>
        <p className="text-slate-400 font-medium">Performansını takip et, eksiklerini tamamla</p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#111620]/60 backdrop-blur-md border border-white/[0.05] p-6 rounded-2xl">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Toplam Soru</h3>
          <p className="text-3xl font-black text-white">{stats?.totalQuestions || 0}</p>
        </div>
        <div className="bg-[#111620]/60 backdrop-blur-md border border-white/[0.05] p-6 rounded-2xl">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Doğru Oranı</h3>
          <p className="text-3xl font-black text-emerald-400">%{stats?.correctPercentage?.toFixed(1) || 0}</p>
        </div>
        <div className="bg-[#111620]/60 backdrop-blur-md border border-white/[0.05] p-6 rounded-2xl">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Ortalama Net</h3>
          <p className="text-3xl font-black text-blue-400">{stats?.averageNetScore?.toFixed(2) || 0}</p>
        </div>
        <div className="bg-[#111620]/60 backdrop-blur-md border border-white/[0.05] p-6 rounded-2xl">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Odaklanma</h3>
          <p className="text-3xl font-black text-orange-400">{stats?.totalPomodoroHours?.toFixed(1) || 0}h</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Topic Points Chart */}
        <div className="bg-[#111620]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">📊</span> Konu Bazlı Puanlar
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.topicStats || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="topicName" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111620', border: '1px solid #ffffff10', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="totalPoints" name="Toplam Puan" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weak Topics Analysis */}
        <div className="bg-[#111620]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">🎯</span> Geliştirilmesi Gerekenler (AI)
          </h2>
          <div className="space-y-4">
            {weakTopics.length > 0 ? weakTopics.map((topic, idx) => (
              <div key={idx} className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-white">{topic.topicName}</span>
                  <span className="text-rose-400 font-bold text-sm">%{topic.accuracyRate?.toFixed(1)} Başarı</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">{topic.recommendation}</p>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-500">Henüz analiz edilecek veri bulunmuyor.</div>
            )}
          </div>
        </div>

        {/* Pomodoro Trend Chart */}
        <div className="bg-[#111620]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">⏱️</span> Odaklanma Trendi (Son 7 Gün)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={pomodoroTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickFormatter={(val) => new Date(val).toLocaleDateString('tr-TR', { weekday: 'short' })} />
              <YAxis stroke="#94a3b8" fontSize={12} unit=" dk" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111620', border: '1px solid #ffffff10', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="totalMinutes" name="Odaklanma Süresi" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 5 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Global Leaderboard */}
        <div className="lg:col-span-full">
           <LeaderboardWidget />
        </div>
      </div>
    </div>
  )
}
