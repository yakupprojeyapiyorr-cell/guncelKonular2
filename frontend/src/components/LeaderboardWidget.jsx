import React, { useState, useEffect } from 'react'
import apiClient from '../lib/api'

export default function LeaderboardWidget() {
  const [leaderboard, setLeaderboard] = useState([])
  const [myScore, setMyScore] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadScores()
  }, [])

  const loadScores = async () => {
    try {
      const [meRes, boardRes] = await Promise.all([
        apiClient.get('/scores/me'),
        apiClient.get('/scores/leaderboard?page=0&size=10')
      ])
      setMyScore(meRes.data)
      setLeaderboard(boardRes.data?.content || [])
    } catch (err) {
      console.error('Skor yüklenemedi:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-4 text-slate-400">Yükleniyor...</div>

  return (
    <div className="bg-[#111620]/60 border border-white/5 rounded-3xl p-6">
      <h3 className="text-white font-bold mb-4">🏆 Leaderboard</h3>

      {/* My Score */}
      {myScore && (
        <div className="bg-linear-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-4 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white font-bold text-lg">{myScore.userName}</p>
              <p className="text-slate-400 text-xs">Senin Puanın</p>
            </div>
            <div className="text-right">
              <p className="text-blue-400 font-bold text-2xl">{myScore.totalScore?.toFixed(1)}</p>
              <p className="text-slate-500 text-xs">{myScore.accuracy?.toFixed(1)}% başarı</p>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-2">
        {leaderboard.length === 0 ? (
          <p className="text-slate-500 text-sm">Henüz skorlar yok</p>
        ) : (
          leaderboard.map((user, idx) => (
            <div key={user.userId} className="bg-white/5 hover:bg-white/10 p-3 rounded-2xl flex items-center justify-between transition">
              <div className="flex items-center gap-3 flex-1">
                <span className={`font-bold text-lg w-6 text-center ${
                  idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-orange-400' : 'text-slate-500'
                }`}>
                  #{idx + 1}
                </span>
                <div>
                  <p className="text-white text-sm font-bold">{user.userName}</p>
                  <p className="text-xs text-slate-500">{user.examCount} sınav</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">{user.totalScore?.toFixed(1)}</p>
                <p className="text-xs text-slate-500">{user.accuracy?.toFixed(1)}%</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
