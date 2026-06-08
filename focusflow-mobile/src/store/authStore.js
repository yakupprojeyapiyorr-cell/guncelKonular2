import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false, // AsyncStorage'dan veri yüklenip yüklenmediği

      setHasHydrated: (state) => set({ hasHydrated: state }),

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
        const state = get();
        return state.token ? { Authorization: `Bearer ${state.token}` } : {};
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        // AsyncStorage'dan veri yüklenince hasHydrated'ı true yap
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
