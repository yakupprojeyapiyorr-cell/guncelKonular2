import React from 'react'

export default function StatsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">İstatistikler</h1>
        <p className="text-gray-600">Ilerlemenizi görün ve geliştirilmesi gereken alanları belirleyin</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center py-12">İstatistik verisi henüz bulunmuyor</p>
      </div>
    </div>
  )
}
