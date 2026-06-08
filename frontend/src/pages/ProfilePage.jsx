import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import apiClient from '../lib/api'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [gamification, setGamification] = useState(null)
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBadge, setSelectedBadge] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [profileRes, gamiRes, badgesRes] = await Promise.all([
        apiClient.get('/profile').catch(() => ({})),
        apiClient.get('/gamification/streak').catch(() => ({})),
        apiClient.get('/gamification/badges/all')
      ])
      setProfile(profileRes.data)
      setGamification({ streak: gamiRes.data })
      setBadges(badgesRes.data)
    } catch (error) {
      console.error('Profil yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const getBadgeIcon = (badge) => {
    // Backend'ten gelen iconUrl'i (emoji) direkt kullan
    return badge?.iconUrl || '🏅'
  }

  if (loading) return <div className="py-20 text-center text-slate-400">Yükleniyor...</div>

  const unlockedBadges = badges.filter(b => b.isUnlocked || b.unlocked)
  const lockedBadges = badges.filter(b => !(b.isUnlocked || b.unlocked))

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
                <span className="text-slate-500 text-xs block">Günlük Hedef</span>
                <span className="text-white font-bold">{profile?.dailyStudyHours || 0} Saat</span>
              </div>
              <div className="bg-indigo-600/10 px-4 py-2 rounded-xl border border-indigo-500/20">
                <span className="text-slate-500 text-xs block">Kazanılan Rozetler</span>
                <span className="text-indigo-400 font-bold">{unlockedBadges.length}/{badges.length}</span>
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
        </div>

        {/* Badges Section */}
        <div className="lg:col-span-2 bg-[#111620]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                <span className="text-3xl">🛡️</span> Başarı Rozetlerin ({unlockedBadges.length}/{badges.length})
            </h2>
            
            {/* Unlocked Badges */}
            {unlockedBadges.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4">Kilit Açıldı</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {unlockedBadges.map((badge) => (
                    <div 
                      key={badge.badgeId} 
                      className="flex flex-col items-center group cursor-pointer"
                      onMouseEnter={() => setSelectedBadge(badge)}
                      onMouseLeave={() => setSelectedBadge(null)}
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/30 to-green-500/30 rounded-2xl flex items-center justify-center text-4xl mb-3 border border-emerald-500/50 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-emerald-500/50 transition-all shadow-xl relative">
                        {getBadgeIcon(badge)}
                        <div className="absolute top-1 right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                      </div>
                      <span className="text-white font-bold text-sm text-center">{badge.name}</span>
                      <span className="text-slate-500 text-[10px] text-center mt-1">✓ Açıldı</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Locked Badges */}
            {lockedBadges.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Kilitli Rozetler</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {lockedBadges.map((badge) => (
                    <div 
                      key={badge.badgeId} 
                      className="flex flex-col items-center group cursor-pointer"
                      title={badge.unlockCondition}
                      onMouseEnter={() => setSelectedBadge(badge)}
                      onMouseLeave={() => setSelectedBadge(null)}
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-slate-700/40 to-slate-800/40 rounded-2xl flex items-center justify-center text-4xl mb-3 border border-slate-600/30 group-hover:scale-110 group-hover:border-slate-500/50 transition-all shadow-xl relative">
                        <span className="opacity-30">{getBadgeIcon(badge)}</span>
                        <div className="absolute inset-0 flex items-center justify-center rounded-2xl">
                          <span className="text-xs font-black text-slate-500">🔒</span>
                        </div>
                      </div>
                      <span className="text-slate-400 font-bold text-sm text-center">{badge.name}</span>
                      
                      {/* Progress Bar */}
                      <div className="w-full mt-2">
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                            style={{ width: `${Math.min(badge.progressPercentage || 0, 100)}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-500 block mt-1 text-center">
                          {badge.currentProgress}/{badge.requiredProgress}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Badge Info Tooltip - Fixed Positioning */}
            {selectedBadge && (
              <div className="fixed bottom-8 right-8 w-96 max-w-[calc(100vw-32px)] p-6 bg-gradient-to-br from-indigo-600/20 to-indigo-700/10 backdrop-blur-xl border border-indigo-500/50 rounded-2xl shadow-2xl z-50 animate-fadeIn">
                <button 
                  onClick={() => setSelectedBadge(null)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-white transition"
                >
                  ✕
                </button>
                <h4 className="text-white font-bold text-lg mb-2 pr-6">{selectedBadge.name}</h4>
                <p className="text-slate-300 text-sm mb-4">{selectedBadge.description}</p>
                {!(selectedBadge.isUnlocked || selectedBadge.unlocked) && (
                  <div className="border-t border-indigo-500/30 pt-4">
                    <p className="text-indigo-300 font-bold text-sm mb-3">🔓 Kilidi Açmak İçin:</p>
                    <div className="bg-indigo-600/30 p-3 rounded-lg border border-indigo-500/40">
                      <p className="text-slate-200 text-sm mb-3">{selectedBadge.unlockCondition}</p>
                      <div className="space-y-2">
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-500"
                            style={{ width: `${Math.min(selectedBadge.progressPercentage || 0, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-400 text-right">{selectedBadge.currentProgress}/{selectedBadge.requiredProgress}</p>
                      </div>
                    </div>
                  </div>
                )}
                {(selectedBadge.isUnlocked || selectedBadge.unlocked) && (
                  <div className="border-t border-emerald-500/30 pt-4">
                    <p className="text-emerald-300 font-bold text-sm">✨ Başarıyla Açıldı!</p>
                  </div>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
