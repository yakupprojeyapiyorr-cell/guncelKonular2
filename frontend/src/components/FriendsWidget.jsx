import React, { useState, useEffect } from 'react'
import apiClient from '../lib/api'
import ChatWindow from './ChatWindow'

export default function FriendsWidget() {
  const [friends, setFriends] = useState([])
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('friends')
  const [activeChatFriendId, setActiveChatFriendId] = useState(null)
  const [activeChatFriendName, setActiveChatFriendName] = useState(null)

  useEffect(() => {
    loadFriends()
  }, [])

  const loadFriends = async () => {
    try {
      const [friendRes, pendingRes] = await Promise.all([
        apiClient.get('/friends/list'),
        apiClient.get('/friends/pending')
      ])
      setFriends(friendRes.data || [])
      setPending(pendingRes.data || [])
    } catch (err) {
      console.error('Arkadaş listesi yüklenemedi:', err)
    } finally {
      setLoading(false)
    }
  }

  const acceptFriend = async (friendshipId) => {
    try {
      await apiClient.post(`/friends/accept/${friendshipId}`)
      loadFriends()
    } catch (err) {
      console.error('Arkadaş isteği kabul edilemedi:', err)
    }
  }

  const rejectFriend = async (friendshipId) => {
    try {
      await apiClient.delete(`/friends/${friendshipId}`)
      loadFriends()
    } catch (err) {
      console.error('Arkadaş isteği reddedilemedi:', err)
    }
  }

  if (loading) return <div className="p-4 text-slate-400">Yükleniyor...</div>

  return (
    <>
    <div className="bg-[#111620]/60 border border-white/5 rounded-3xl p-6">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
        👥 Arkadaşlar
      </h3>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-white/10">
        <button
          onClick={() => setTab('friends')}
          className={`px-3 py-2 text-sm font-bold transition ${
            tab === 'friends'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Arkadaşlar ({friends.length})
        </button>
        <button
          onClick={() => setTab('pending')}
          className={`px-3 py-2 text-sm font-bold transition ${
            tab === 'pending'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          İstekler ({pending.length})
        </button>
      </div>

      {/* Friends List */}
      {tab === 'friends' && (
        <div className="space-y-2">
          {friends.length === 0 ? (
            <p className="text-slate-500 text-sm">Henüz arkadaşın yok</p>
          ) : (
            friends.map(f => {
              const friendName = f.requesterName === 'You' ? f.receiverName : f.requesterName
              const friendId = f.requesterName === 'You' ? f.receiverId : f.requesterId
              return (
                <div key={f.id} className="bg-white/5 p-3 rounded-2xl flex items-center justify-between group">
                  <div>
                    <p className="text-white text-sm font-bold">{friendName}</p>
                    <p className="text-xs text-slate-500">Arkadaş ✅</p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveChatFriendId(friendId)
                      setActiveChatFriendName(friendName)
                    }}
                    className="opacity-0 group-hover:opacity-100 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-bold transition"
                  >
                    💬
                  </button>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Pending Requests */}
      {tab === 'pending' && (
        <div className="space-y-2">
          {pending.length === 0 ? (
            <p className="text-slate-500 text-sm">Beklemede istek yok</p>
          ) : (
            pending.map(p => (
              <div key={p.id} className="bg-white/5 p-3 rounded-2xl">
                <p className="text-white text-sm font-bold mb-2">{p.requesterName} seni eklemek istiyor</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptFriend(p.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-bold"
                  >
                    Kabul Et
                  </button>
                  <button
                    onClick={() => rejectFriend(p.id)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-full text-xs font-bold"
                  >
                    Reddet
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>

    {activeChatFriendId && (
      <ChatWindow
        friendId={activeChatFriendId}
        friendName={activeChatFriendName}
        onClose={() => {
          setActiveChatFriendId(null)
          setActiveChatFriendName(null)
        }}
      />
    )}
    </>
  )
}
