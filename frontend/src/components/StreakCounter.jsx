import React, { useEffect, useState } from 'react'
import apiClient from '../lib/api'

export default function StreakCounter() {
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const { data } = await apiClient.get('/gamification/streak')
        setStreak(data.currentStreak)
      } catch {
        console.error('Seri verisi yuklenemedi')
      }
    }

    fetchStreak()
  }, [])

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl">
      <span className="text-xl animate-bounce">Alev</span>
      <div className="flex flex-col">
        <span className="text-xs font-bold text-orange-400 leading-none">SERI</span>
        <span className="text-sm font-black text-white leading-none">{streak} GUN</span>
      </div>
    </div>
  )
}
