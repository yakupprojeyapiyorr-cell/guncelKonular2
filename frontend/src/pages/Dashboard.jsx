import React from 'react'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gösterge Paneli</h1>
        <p className="text-gray-600">YKS sınav hazırlığınız hakkında kısa bir özet</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">Çalışılan Konular</h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">Çözdüğü Soru</h3>
          <p className="text-3xl font-bold text-green-600">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">Toplam Çalışma Süresi</h3>
          <p className="text-3xl font-bold text-purple-600">0h</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">Sıralamanız</h3>
          <p className="text-3xl font-bold text-orange-600">-</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Hızlı İşlemler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition">
            📚 Ders Çalış
          </button>
          <button className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition">
            ⏱️ Pomodoro Başlat
          </button>
          <button className="bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-semibold transition">
            📝 Deneme Sınavı
          </button>
          <button className="bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition">
            📈 İstatistik Gör
          </button>
        </div>
      </div>
    </div>
  )
}
