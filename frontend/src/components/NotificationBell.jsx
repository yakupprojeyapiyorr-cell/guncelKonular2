import React, { useEffect, useState } from 'react'
import { useNotificationStore } from '../store/notificationStore'

export default function NotificationBell() {
  const { notifications, unreadCount, fetchNotifications, markAsRead } = useNotificationStore()
  const [showList, setShowList] = useState(false)

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(() => {
      fetchNotifications()
    }, 60000)

    return () => clearInterval(interval)
  }, [fetchNotifications])

  return (
    <div className="relative">
      <button
        onClick={() => setShowList(!showList)}
        className="relative p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95"
      >
        <span className="text-xl">Bildirim</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0a0f18] shadow-lg animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {showList && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowList(false)} />
          <div className="absolute right-0 mt-3 w-80 bg-[#111620] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeUp">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h3 className="font-bold text-white">Bildirimler</h3>
              <button className="text-xs text-blue-400 hover:text-blue-300 font-bold">Hepsini Oku</button>
            </div>
            <div className="max-h-96 overflow-y-auto no-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 italic">Henuz bildiriminiz yok.</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`p-4 border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer ${!n.isRead ? 'bg-blue-500/5' : ''}`}
                  >
                    <div className="flex gap-3">
                      <span className="text-xl mt-1">{n.type}</span>
                      <div className="flex-1">
                        <p className={`text-sm ${!n.isRead ? 'text-white font-bold' : 'text-slate-300'}`}>{n.title}</p>
                        <p className="text-xs text-slate-500 line-clamp-2">{n.body}</p>
                        <p className="text-[10px] text-slate-600 mt-1">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
