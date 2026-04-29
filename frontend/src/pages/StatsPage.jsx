import React, { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function StatsPage() {
  const [stats, setStats] = useState(null)

  // Sample data
  const topicStats = [
    { name: 'Matematik', doğru: 35, yanlış: 15 },
    { name: 'Türkçe', doğru: 42, yanlış: 8 },
    { name: 'İngilizce', doğru: 28, yanlış: 22 },
    { name: 'Fen', doğru: 38, yanlış: 12 },
    { name: 'Sosyal', doğru: 45, yanlış: 5 },
  ]

  const performanceData = [
    { hafta: '1. Hafta', net: 45.5 },
    { hafta: '2. Hafta', net: 52.3 },
    { hafta: '3. Hafta', net: 58.7 },
    { hafta: '4. Hafta', net: 62.1 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">İstatistikler</h1>
        <p className="text-gray-600">Ilerlemenizi görün ve geliştirilmesi gereken alanları belirleyin</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">Toplam Soru</h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">Doğru Oranı</h3>
          <p className="text-3xl font-bold text-green-600">0%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">En İyi Konu</h3>
          <p className="text-3xl font-bold text-purple-600">-</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">Çalışma Süresi</h3>
          <p className="text-3xl font-bold text-orange-600">0h</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Konu Bazlı Başarı</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topicStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="doğru" fill="#10b981" />
              <Bar dataKey="yanlış" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Haftalık Ilerleme</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hafta" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="net" stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weak Topics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Çalışılması Gereken Konular</h2>
        <div className="space-y-3">
          {[
            { name: 'Türev', yanlış: 12 },
            { name: 'Limit', yanlış: 10 },
            { name: 'Integral', yanlış: 8 },
          ].map((topic, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <span className="font-semibold text-gray-900">{topic.name}</span>
              <span className="text-red-600 font-bold">{topic.yanlış} yanlış</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
