import React from 'react'

export default function ExamPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Deneme Sınavları</h1>
        <p className="text-gray-600">Yayınlanmış sınavları seçerek başlayın</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center py-12">Henüz yayınlanmış sınav bulunmuyor</p>
      </div>
    </div>
  )
}
