import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserSession } from '@shared/types'
import { authService } from '@/services/authService'

interface AuthState {
  session: UserSession | null
  isLoading: boolean
  error: string | null
  signIn: (identifier: string, password: string) => Promise<boolean>
  register: (email: string, username: string, password: string, name: string) => Promise<boolean>
  resetPassword: (identifier: string, newPassword: string) => Promise<boolean>
  setSession: (session: UserSession | null) => void
  clearError: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      isLoading: false,
      error: null,

      signIn: async (identifier, password) => {
        set({ isLoading: true, error: null })
        const result = await authService.signIn(identifier, password)
        if (result.error || !result.session) {
          set({ isLoading: false, error: result.error ?? 'Login failed' })
          return false
        }
        set({ session: result.session, isLoading: false, error: null })
        return true
      },

      register: async (email, username, password, name) => {
        set({ isLoading: true, error: null })
        const result = await authService.register(email, username, password, name)
        if (result.error || !result.session) {
          set({ isLoading: false, error: result.error ?? 'Registration failed' })
          return false
        }
        set({ session: result.session, isLoading: false, error: null })
        return true
      },

      resetPassword: async (identifier, newPassword) => {
        set({ isLoading: true, error: null })
        const result = await authService.resetPassword(identifier, newPassword)
        if (result.error || !result.session) {
          set({ isLoading: false, error: result.error ?? 'Password reset failed' })
          return false
        }
        set({ session: result.session, isLoading: false, error: null })
        return true
      },

      setSession: (session) => set({ session, isLoading: false }),
      clearError: () => set({ error: null }),
      logout: () => set({ session: null, isLoading: false, error: null })
    }),
    {
      name: 'meditrack-auth'
    }
  )
)
