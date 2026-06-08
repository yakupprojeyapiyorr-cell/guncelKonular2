import React, { useState, useEffect } from 'react'
import apiClient from '../lib/api'

export default function LeaderboardWidget() {
  const [leaderboard, setLeaderboard] = useState([])
  const [currentUserRank, setCurrentUserRank] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get('/stats/leaderboard')
      setLeaderboard(response.data.leaderboard)
      setCurrentUserRank(response.data.currentUserRank)
    } catch (err) {
      console.error('Liderlik tablosu yüklenemedi:', err)
    } finally {
      setLoading(false)
    }
  }

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const formatMinutesToHours = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  if (loading) return <div className="p-4 text-slate-400 text-center">Yükleniyor...</div>

  return (
    <div className="bg-[#111620]/60 border border-white/5 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          🏆 Liderlik Tablosu
        </h3>
        <div className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
          {leaderboard.length} Katılımcı
        </div>
      </div>

      {/* Your Rank Section */}
      {currentUserRank && currentUserRank > 0 && (
        <div className="bg-gradient-to-r from-indigo-600/20 to-blue-600/20 border border-indigo-500/30 rounded-2xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Senin Sıralaman</p>
              <p className="text-white font-black text-2xl">{getMedalEmoji(currentUserRank)} #{currentUserRank}</p>
            </div>
            <div className="text-right">
              <p className="text-indigo-400 font-bold text-lg">Sıralamaya Devam Et!</p>
              <p className="text-slate-500 text-xs">Her saat çalışmak seni yukarıya taşır</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm">Henüz veri yok. Pomodoro seansı başlat!</p>
          </div>
        ) : (
          leaderboard.map((user) => (
            <div 
              key={user.userId} 
              className={`p-4 rounded-2xl flex items-center justify-between transition-all ${
                user.isCurrentUser 
                  ? 'bg-indigo-600/20 border border-indigo-500/30 shadow-lg shadow-indigo-500/10' 
                  : 'bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10'
              }`}
            >
              {/* Rank & Name */}
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                  user.rank === 1 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                  user.rank === 2 ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' :
                  user.rank === 3 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                  'bg-white/10 text-slate-400 border border-white/10'
                }`}>
                  {getMedalEmoji(user.rank)}
                </div>
                <div className="flex-1">
                  <p className={`font-bold ${user.isCurrentUser ? 'text-indigo-300' : 'text-white'}`}>
                    {user.userName}
                    {user.isCurrentUser && <span className="text-xs ml-2 bg-indigo-500/20 px-2 py-1 rounded-full border border-indigo-500/30">SEN</span>}
                  </p>
                  {user.currentStreak > 0 && (
                    <p className="text-xs text-orange-400 font-bold">🔥 {user.currentStreak} Günlük Seri</p>
                  )}
                </div>
              </div>

              {/* Hours Studied */}
              <div className="text-right">
                <p className="text-indigo-400 font-black text-lg">{formatMinutesToHours(user.totalPomodoroMinutes)}</p>
                <p className="text-slate-500 text-xs font-medium">Çalışma Süresi</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-white/5 text-center">
        <p className="text-xs text-slate-500 font-medium">
          💡 En çok Pomodoro seansı tamamlayan kazanır!
        </p>
      </div>
    </div>
  )
}
