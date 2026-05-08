import React, { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import apiClient from '../../lib/api'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function QuestionPoolDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await apiClient.get('/admin/pool/analytics')
      setStats(response.data)
    } catch (error) {
      console.error('Analytics failed:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="py-20 text-center text-slate-400">Analizler yükleniyor...</div>

  const sourceData = [
    { name: 'Manuel', value: stats?.manualCount || 0 },
    { name: 'Yapay Zeka', value: stats?.generatedCount || 0 }
  ]

  const difficultyData = Object.entries(stats?.difficultyDistribution || {}).map(([key, value]) => ({
    name: key,
    count: value
  }))

  return (
    <div className="animate-fadeUp space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111620]/60 backdrop-blur-md border border-white/[0.05] p-6 rounded-3xl">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Toplam Soru</h3>
          <p className="text-4xl font-black text-white">{stats?.total || 0}</p>
        </div>
        <div className="bg-[#111620]/60 backdrop-blur-md border border-white/[0.05] p-6 rounded-3xl">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Manuel Eklenen</h3>
          <p className="text-4xl font-black text-blue-400">{stats?.manualCount || 0}</p>
        </div>
        <div className="bg-[#111620]/60 backdrop-blur-md border border-white/[0.05] p-6 rounded-3xl">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">AI Üretilen</h3>
          <p className="text-4xl font-black text-emerald-400">{stats?.generatedCount || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Source Distribution */}
        <div className="bg-[#111620]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">📦</span> Kaynak Dağılımı
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#111620', border: '1px solid #ffffff10', borderRadius: '12px' }}
                   itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Difficulty Distribution */}
        <div className="bg-[#111620]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">⚖️</span> Zorluk Dağılımı
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={difficultyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#111620', border: '1px solid #ffffff10', borderRadius: '12px' }}
                   itemStyle={{ color: '#fff' }}
                   cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                />
                <Bar dataKey="count" name="Soru Sayısı" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
