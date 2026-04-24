import React from 'react'

export default function PlanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Çalışma Planı</h1>
        <p className="text-gray-600">Günlük çalışma planınızı oluşturun ve takip edin</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Bugünün Planı</h2>
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold mb-4">
          + Yeni Plan Ekle
        </button>
        <p className="text-gray-500 text-center py-8">Henüz plan eklenmedi</p>
      </div>
    </div>
  )
}
