import React from 'react'

export default function PomodoroPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pomodoro Tekniği</h1>
        <p className="text-gray-600">25 dakika çalışma, 5 dakika mola dönüşüyle verimli çalışın</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="text-7xl font-bold text-blue-600 mb-6">25:00</div>
        <div className="flex gap-4 justify-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold">
            Başla
          </button>
          <button className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-8 py-3 rounded-lg font-semibold">
            Duraklat
          </button>
        </div>
      </div>
    </div>
  )
}
