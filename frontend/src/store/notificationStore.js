import { create } from 'zustand'
import apiClient from '../lib/api'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

const normalizeNotifications = (data) => {
  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.content)) {
    return data.content
  }

  return []
}

const resolveUnreadCount = (data, notifications) => {
  if (typeof data?.unreadCount === 'number') {
    return data.unreadCount
  }

  return notifications.filter((notification) => !notification.isRead).length
}

const decodeVapidKey = (key) => {
  const padding = '='.repeat((4 - (key.length % 4 || 4)) % 4)
  const base64 = `${key}${padding}`.replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from(rawData, (char) => char.charCodeAt(0))
}

export const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  isSubscribed: false,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.get('/notifications/history')
      const notifications = normalizeNotifications(response.data)
      set({
        notifications,
        unreadCount: resolveUnreadCount(response.data, notifications),
      })
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      set({ error: error?.response?.data?.message || 'Bildirimler yuklenemedi.' })
    } finally {
      set({ isLoading: false })
    }
  },

  subscribeToPush: async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      const error = 'Push messaging is not supported'
      console.error(error)
      set({ error })
      return false
    }

    if (!VAPID_PUBLIC_KEY) {
      const error = 'VITE_VAPID_PUBLIC_KEY is missing'
      console.error(error)
      set({ error })
      return false
    }

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decodeVapidKey(VAPID_PUBLIC_KEY),
      })

      const subJson = subscription.toJSON()
      await apiClient.post('/notifications/subscribe', {
        endpoint: subJson.endpoint,
        authKey: subJson.keys?.auth,
        p256dhKey: subJson.keys?.p256dh,
      })

      set({ isSubscribed: true, error: null })
      return true
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      set({ error: error?.response?.data?.message || 'Push aboneligi basarisiz oldu.' })
      return false
    }
  },

  markAsRead: async (id) => {
    try {
      await apiClient.post(`/notifications/${id}/mark-read`)
      set((state) => {
        const wasUnread = state.notifications.some((n) => n.id === id && !n.isRead)
        return {
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        }
      })
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      set({ error: error?.response?.data?.message || 'Bildirim guncellenemedi.' })
    }
  },
}))
