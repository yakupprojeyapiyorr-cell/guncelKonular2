import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import apiClient from '../lib/api'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [gamification, setGamification] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [profileRes, gamiRes] = await Promise.all([
        apiClient.get('/profile'),
        apiClient.get('/profile/gamification')
      ])
      setProfile(profileRes.data)
      setGamification(gamiRes.data)
    } catch (error) {
      console.error('Profil yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="py-20 text-center text-slate-400">Yükleniyor...</div>

  return (
    <div className="space-y-8 animate-fadeUp">
      {/* Header Profile Section */}
      <div className="bg-[#111620]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8">
            <div className="bg-blue-600/10 text-blue-400 px-4 py-2 rounded-xl text-sm font-bold border border-blue-600/20">
                {user?.role} Üye
            </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-5xl text-white font-black border-4 border-white/10 shadow-2xl">
              {user?.name?.[0]}
            </div>
            {gamification?.streak?.currentStreak > 0 && (
                <div className="absolute -bottom-2 -right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg animate-bounce">
                    🔥 {gamification.streak.currentStreak} Gün
                </div>
            )}
          </div>
          
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black text-white mb-2">{user?.name}</h1>
            <p className="text-slate-400 font-medium mb-4">{user?.email}</p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <span className="text-slate-500 text-xs block">Hedef Üniversite</span>
                <span className="text-white font-bold">{profile?.targetUniversity || 'Belirtilmemiş'}</span>
              </div>
              <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <span className="text-slate-500 text-xs block">Sınıf</span>
                <span className="text-white font-bold">{profile?.grade || '12. Sınıf'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gamification Stats */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#111620]/60 backdrop-blur-md border border-white/[0.05] p-8 rounded-3xl">
                <h3 className="text-xl font-bold text-white mb-6">Devamlılık</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">Güncel Seri</span>
                        <span className="text-orange-500 font-black text-2xl">{gamification?.streak?.currentStreak || 0} 🔥</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400">En Uzun Seri</span>
                        <span className="text-white font-bold">{gamification?.streak?.longestStreak || 0} Gün</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden mt-4">
                        <div 
                            className="h-full bg-orange-500 transition-all duration-1000" 
                            style={{ width: `${Math.min((gamification?.streak?.currentStreak || 0) * 10, 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-[#111620]/60 backdrop-blur-md border border-white/[0.05] p-8 rounded-3xl">
                <h3 className="text-xl font-bold text-white mb-6">Hedef Netler</h3>
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-slate-400 uppercase font-bold">TYT Hedefi</span>
                            <span className="text-emerald-400 font-bold">{profile?.targetTytNet || 0} Net</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: '65%' }} />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-slate-400 uppercase font-bold">AYT Hedefi</span>
                            <span className="text-blue-400 font-bold">{profile?.targetAytNet || 0} Net</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: '40%' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Badges Section */}
        <div className="lg:col-span-2 bg-[#111620]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                <span className="text-3xl">🛡️</span> Başarı Rozetlerin
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {gamification?.badges?.length > 0 ? gamification.badges.map((badge, idx) => (
                    <div key={idx} className="flex flex-col items-center group cursor-pointer">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center text-4xl mb-3 border border-white/5 group-hover:scale-110 group-hover:border-indigo-500/50 transition-all shadow-xl">
                            {badge.badge.icon || '🏅'}
                        </div>
                        <span className="text-white font-bold text-sm text-center">{badge.badge.name}</span>
                        <span className="text-slate-500 text-[10px] text-center mt-1">{new Date(badge.earnedAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                )) : (
                    <div className="col-span-full py-20 text-center">
                        <div className="text-6xl mb-4 opacity-20">🔒</div>
                        <p className="text-slate-500">Henüz rozet kazanılmadı. Çalışmaya devam et!</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  )
}
