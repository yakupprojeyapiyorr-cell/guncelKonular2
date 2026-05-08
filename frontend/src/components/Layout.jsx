import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import NotificationBell from './NotificationBell'
import StreakCounter from './StreakCounter'
import { useChatStore } from '../store/chatStore'

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const { connect, disconnect, isConnected } = useChatStore()

  useEffect(() => {
    if (user && !isConnected) {
      connect(user.id)
    }
  }, [user, isConnected, connect])

  const handleLogout = () => {
    disconnect()
    logout()
    navigate('/login')
  }

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: 'Dashboard' },
    { label: 'Dersler', href: '/lessons', icon: 'Dersler' },
    { label: 'Konu Calismasi', href: '/practice', icon: 'AI' },
    { label: 'Deneme Sinavi', href: '/exams', icon: 'Sinav' },
    { label: 'Istatistikler', href: '/stats', icon: 'Istatistik' },
    { label: 'Pomodoro', href: '/pomodoro', icon: 'Pomodoro' },
    { label: 'Planlama', href: '/plans', icon: 'Plan' },
    ...(user?.role === 'ADMIN' ? [{ label: 'Admin Panel', href: '/admin', icon: 'Admin' }] : []),
  ]

  return (
    <div className="flex h-screen bg-[#05070a] text-slate-300 font-sans selection:bg-blue-500/30 selection:text-white">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />

      <aside
        className={`${
          sidebarOpen ? 'w-72' : 'w-24'
        } bg-[#0a0f18]/80 backdrop-blur-xl border-r border-white/[0.05] transition-all duration-500 flex flex-col z-40 relative`}
      >
        <div className="p-8 flex items-center justify-center">
          <div className="relative group cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="absolute inset-0 bg-blue-500 rounded-xl blur-xl opacity-20 group-hover:opacity-40 transition-all" />
            <h1 className={`relative font-black tracking-tighter text-white ${sidebarOpen ? 'text-3xl' : 'text-xl'}`}>
              F<span className="text-blue-500">F</span>
              {sidebarOpen && <span className="text-sm font-bold tracking-normal ml-1 text-slate-500">FocusFlow</span>}
            </h1>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group relative ${
                  isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 active:scale-95' : 'text-slate-500 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                {isActive && <div className="absolute left-[-1rem] w-2 h-10 bg-blue-500 rounded-r-full blur-sm" />}
                <span className={`text-sm transition-transform group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>{item.icon}</span>
                {sidebarOpen && <span className="font-bold text-sm tracking-wide">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        <div className="p-6 border-t border-white/[0.05]">
          <div
            className="flex items-center gap-4 mb-6 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-all"
            onClick={() => navigate('/profile')}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold border-2 border-white/10 overflow-hidden">
              {user?.profilePictureUrl ? <img src={user.profilePictureUrl} alt="Profil" className="w-full h-full object-cover" /> : user?.name?.[0] || 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex flex-col min-w-0">
                <span className="text-white font-bold text-sm truncate">{user?.name}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user?.role}</span>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl font-bold text-sm transition-all ${
              sidebarOpen ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20' : 'text-rose-500 hover:bg-rose-500/10'
            }`}
          >
            {sidebarOpen ? 'Guvenli Cikis' : 'Cikis'}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col relative z-10">
        <header className="h-24 flex items-center px-8 justify-between backdrop-blur-md bg-transparent border-b border-white/[0.03]">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
            >
              {sidebarOpen ? 'X' : 'Menu'}
            </button>
            {sidebarOpen && (
              <div className="hidden md:flex flex-col">
                <h2 className="text-white font-bold text-lg leading-tight">Hos geldin, {user?.name}!</h2>
                <p className="text-slate-500 text-xs font-medium">Basariya giden yolda bugun yeni bir adim at.</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <StreakCounter />
            <div className="w-[1px] h-8 bg-white/10 mx-2" />
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8 no-scrollbar scroll-smooth">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
