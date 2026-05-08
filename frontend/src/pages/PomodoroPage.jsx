import React, { useEffect, useState } from 'react'

export default function PomodoroPage() {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState('work')

  useEffect(() => {
    if (!isRunning) return undefined

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const nextMode = mode === 'work' ? 'break' : 'work'
          setMode(nextMode)
          return nextMode === 'work' ? 25 * 60 : 5 * 60
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, mode])

  const handleStart = () => setIsRunning(true)
  const handlePause = () => setIsRunning(false)
  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(25 * 60)
    setMode('work')
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pomodoro Teknigi</h1>
        <p className="text-gray-600">25 dakika calisma, 5 dakika mola dongusuyle verimli calisin</p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-lg p-12 text-center">
        <div className={`text-8xl font-bold mb-6 ${mode === 'work' ? 'text-blue-600' : 'text-green-600'}`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className="text-xl font-semibold mb-8 text-gray-700">{mode === 'work' ? 'Calisma Zamani' : 'Mola Zamani'}</div>

        <div className="flex gap-4 justify-center mb-6">
          <button onClick={handleStart} disabled={isRunning} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-semibold transition">
            Basla
          </button>
          <button onClick={handlePause} disabled={!isRunning} className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-semibold transition">
            Duraklat
          </button>
          <button onClick={handleReset} className="bg-gray-400 hover:bg-gray-500 text-white px-8 py-3 rounded-lg font-semibold transition">
            Sifirla
          </button>
        </div>

        <div className="inline-block bg-white px-4 py-2 rounded-full text-sm font-semibold">{mode === 'work' ? 'Calisma Oturumu' : 'Mola Oturumu'}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">Bugunun Oturumlari</h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">Bu Hafta Toplami</h3>
          <p className="text-3xl font-bold text-green-600">0h</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">En Uzun Seri</h3>
          <p className="text-3xl font-bold text-purple-600">0</p>
        </div>
      </div>
    </div>
  )
}
