import { create } from "zustand"
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware"

interface AuthState {
  token: string | null
  name: string | null
  email: string | null
  _hasHydrated: boolean                       
  setToken: (token: string | null) => void
  setName: (name: string | null) => void
  setEmail: (email: string | null) => void
  setHasHydrated: (v: boolean) => void
}

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      name: null,
      email: null,
      _hasHydrated: false,
      setToken: (token) => set({ token }),
      setName: (name) => set({ name }),
      setEmail: (email) => set({ email }),
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : noopStorage
      ),
      partialize: (state) => ({ token: state.token, name: state.name }),

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)