import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Layout({ children }) {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { label: 'Gösterge Paneli', href: '/dashboard', icon: '📊' },
    { label: 'Dersler', href: '/lessons', icon: '📚' },
    { label: 'Deneme Sınavı', href: '/exams', icon: '📝' },
    { label: 'İstatistikler', href: '/stats', icon: '📈' },
    { label: 'Pomodoro', href: '/pomodoro', icon: '⏱️' },
    { label: 'Plan Yapma', href: '/plans', icon: '📅' },
    ...(user?.role === 'ADMIN' ? [{ label: 'Admin Panel', href: '/admin', icon: '⚙️' }] : []),
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-blue-900 text-white transition-all duration-300 flex flex-col shadow-lg`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-blue-800">
          <h1 className={`font-bold ${sidebarOpen ? 'text-2xl' : 'text-lg'}`}>FF</h1>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault()
                navigate(item.href)
              }}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-800 transition"
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </a>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-blue-800">
          <div className="flex items-center justify-between mb-4">
            {sidebarOpen && <span className="text-xs truncate">{user?.email}</span>}
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm transition"
          >
            {sidebarOpen ? 'Çıkış' : '→'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm h-16 flex items-center px-6 justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:text-gray-900"
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-700">{user?.name}</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
              {user?.role === 'STUDENT' ? 'Öğrenci' : user?.role === 'VIP' ? 'VIP' : 'Admin'}
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
