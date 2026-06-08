import React, { useEffect, useState } from 'react'
import apiClient from '../lib/api'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    totalTasks: 0,
    totalPomodoroMinutes: 0
  })
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStatsAndUsers = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/admin/users')
      ])
      setStats(statsRes.data)
      setUsers(usersRes.data)
      setLoading(false)
    } catch (err) {
      console.error('Admin veri yükleme hatası:', err)
      setError('Veriler yüklenemedi. Yetkiniz olmayabilir.')
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/dashboard')
      return
    }
    fetchStatsAndUsers()
  }, [user, navigate])

  const handleAction = async (userId, actionType) => {
    try {
      await apiClient.post(`/admin/users/${userId}/${actionType}`)
      // Tabloyu ve istatistikleri yenile
      await fetchStatsAndUsers()
    } catch (err) {
      console.error('Kullanıcı güncellenemedi:', err)
      setError('Kullanıcı güncellenemedi.')
    }
  }

  if (loading) {
    return <div className="text-white text-center mt-20 animate-pulse">Veriler yükleniyor...</div>
  }

  return (
    <div className="space-y-8 animate-fadeUp">
      <div>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600 mb-2">
          Admin Paneli
        </h1>
        <p className="text-slate-400 font-medium">Sistemin genel istatistikleri ve performans özeti.</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-[#111620]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <h3 className="text-slate-400 text-sm font-semibold mb-2">Toplam Kullanıcı</h3>
          <p className="text-4xl font-black text-white">{stats.totalUsers}</p>
          <div className="mt-4 text-xs font-medium text-blue-400 flex items-center gap-1">
            <span>👥 Platforma kayıtlı öğrenci</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#111620]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <h3 className="text-slate-400 text-sm font-semibold mb-2">Premium Kullanıcı</h3>
          <p className="text-4xl font-black text-emerald-400">{stats.premiumUsers}</p>
          <div className="mt-4 text-xs font-medium text-emerald-500/80 flex items-center gap-1">
            <span>💎 Aktif abonelikler</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#111620]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <h3 className="text-slate-400 text-sm font-semibold mb-2">Toplam Odaklanma</h3>
          <p className="text-4xl font-black text-purple-400">{Math.floor(stats.totalPomodoroMinutes / 60)} <span className="text-lg">Saat</span></p>
          <div className="mt-4 text-xs font-medium text-purple-500/80 flex items-center gap-1">
            <span>⏱️ Toplam {stats.totalPomodoroMinutes} dakika</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#111620]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
          <h3 className="text-slate-400 text-sm font-semibold mb-2">Sistemdeki Görevler</h3>
          <p className="text-4xl font-black text-amber-400">{stats.totalTasks}</p>
          <div className="mt-4 text-xs font-medium text-amber-500/80 flex items-center gap-1">
            <span>📋 Oluşturulan toplam görev</span>
          </div>
        </div>
      </div>
      
      <div className="mt-12 bg-[#111620]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/[0.08]">
          <h2 className="text-xl font-bold text-white">Kayıtlı Öğrenciler</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-white/[0.02] text-xs uppercase font-semibold text-slate-300">
              <tr>
                <th className="px-6 py-4">İsim Soyisim</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Paket</th>
                <th className="px-6 py-4 text-right">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{u.name} {u.surname}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded-lg text-xs font-bold border border-blue-500/20">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.subscriptionType === 'PREMIUM' ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">💎 Premium</span>
                    ) : (
                      <span className="text-slate-400 font-bold">Free</span>
                    )}
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    {u.subscriptionType !== 'PREMIUM' && (
                      <button 
                        onClick={() => handleAction(u.id, 'premium')}
                        className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-all border border-emerald-500/20"
                      >
                        👑 Premium Yap
                      </button>
                    )}
                    {u.subscriptionType === 'PREMIUM' && (
                      <button 
                        onClick={() => handleAction(u.id, 'free')}
                        className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-all border border-rose-500/20"
                      >
                        ⬇️ Free Yap
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">Kullanıcı bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
