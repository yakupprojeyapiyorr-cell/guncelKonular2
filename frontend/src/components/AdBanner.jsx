import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function AdBanner() {
  const { user } = useAuthStore()

  if (!user || user.subscriptionType === 'PREMIUM') {
    return null
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-900 rounded-3xl p-6 border border-white/10 shadow-2xl group transition-all hover:border-blue-400/50 mb-6 flex items-center justify-between">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <span className="bg-amber-500 text-black text-xs font-black px-2 py-1 rounded-md uppercase tracking-wider">Reklam</span>
          FocusFlow Premium'u Keşfedin!
        </h3>
        <p className="text-slate-300 max-w-md text-sm">
          Sınırsız proje klasörleri, alt görevler ve gelişmiş Yapay Zeka analizleriyle odaklanma sürenizi ikiye katlayın. Üstelik bu reklamı bir daha görmeyin.
        </p>
      </div>

      <div className="relative z-10 shrink-0">
        <Link 
          to="/pricing" 
          className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-black shadow-lg hover:shadow-xl hover:scale-105 transition-all inline-block"
        >
          Hemen Yükselt
        </Link>
      </div>
    </div>
  )
}
