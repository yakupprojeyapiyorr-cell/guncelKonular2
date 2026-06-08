import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setUser: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: !!user && !!token,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),

      getAuthHeader: () => {
        const state = get()
        return state.token ? { Authorization: `Bearer ${state.token}` } : {}
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
