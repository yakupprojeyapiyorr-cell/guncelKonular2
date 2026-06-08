import React, { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import apiClient from '../lib/api'
import { tooltipStyle } from './chartTheme'

const DAY_LABELS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']

export default function FocusTrendChart() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        const { data: trend } = await apiClient.get('/stats/me/pomodoro-trend')
        setData(
          trend.map((item) => ({
            name: DAY_LABELS[new Date(item.date).getDay()],
            dakika: item.totalMinutes,
            date: item.date,
          }))
        )
      } catch (err) {
        console.error('Odaklanma trendi yuklenemedi:', err)
      } finally {
        setLoading(false)
      }
    }
    void fetchTrend()
  }, [])

  if (loading) {
    return (
      <div className="bg-[#111620]/60 backdrop-blur-md border border-white/[0.08] rounded-3xl p-6 h-64 flex items-center justify-center text-slate-500">
        Grafik yükleniyor...
      </div>
    )
  }

  return (
    <div className="bg-[#111620]/60 backdrop-blur-md border border-white/[0.08] rounded-3xl p-6 shadow-2xl">
      <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
        📊 Son 7 Gün Odaklanma
      </h2>
      <p className="text-xs text-slate-500 mb-6">Günlük Pomodoro dakikalarınız</p>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => [`${value} dk`, 'Odaklanma']}
            labelFormatter={(label) => label}
          />
          <Bar dataKey="dakika" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
