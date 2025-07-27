import { create } from 'zustand'
import type { User } from '../types/user'

interface AuthState {
  // State
  user: User | null
  token: string | null
  isInitialized: boolean
  isLoading: boolean
  isAuthenticated: boolean

  // Actions
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setIsInitialized: (initialized: boolean) => void
  setIsLoading: (loading: boolean) => void

  // Complex actions
  initializeAuth: () => void
  clearAuth: () => void
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  token: null,
  isInitialized: false,
  isLoading: true,
  isAuthenticated: false,

  // Basic setters
  setUser: (user) =>
    set((state) => ({
      user,
      isAuthenticated: !!user && !!state.token,
    })),
  setToken: (token) =>
    set((state) => ({
      token,
      isAuthenticated: !!state.user && !!token,
    })),
  setIsInitialized: (isInitialized) => set({ isInitialized }),
  setIsLoading: (isLoading) => set({ isLoading }),

  // Initialize auth state from localStorage
  initializeAuth: () => {
    console.log('🔧 Initializing auth...')
    try {
      const storedToken = localStorage.getItem('authToken')
      const storedUser = localStorage.getItem('userData')
      console.log('📦 Stored token:', !!storedToken, 'Stored user:', !!storedUser)

      // Clear any corrupted data
      if (storedUser === 'undefined' || storedUser === 'null') {
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
        set({ isInitialized: true, isLoading: false, isAuthenticated: false })
        console.log('🧹 Cleared corrupted data')
        return
      }

      if (storedToken && storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        try {
          const parsedUser = JSON.parse(storedUser) as User
          set({
            token: storedToken,
            user: parsedUser,
            isInitialized: true,
            isLoading: false,
            isAuthenticated: true,
          })
          console.log('✅ Auth initialized with stored data:', parsedUser.email)
        } catch (parseError) {
          console.error('Error parsing stored user data:', parseError)
          // Clear invalid data
          localStorage.removeItem('authToken')
          localStorage.removeItem('userData')
          set({ isInitialized: true, isLoading: false, isAuthenticated: false })
        }
      } else {
        set({ isInitialized: true, isLoading: false, isAuthenticated: false })
        console.log('🏁 Auth initialized with no stored data')
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
      set({ isInitialized: true, isLoading: false, isAuthenticated: false })
    }
  },

  // Login action
  login: (user, token) => {
    localStorage.setItem('authToken', token)
    localStorage.setItem('userData', JSON.stringify(user))
    set({ user, token, isLoading: false, isAuthenticated: true })
  },

  // Logout action
  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    set({ user: null, token: null, isLoading: false, isAuthenticated: false })
  },

  // Clear auth completely
  clearAuth: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    set({
      user: null,
      token: null,
      isInitialized: true,
      isLoading: false,
      isAuthenticated: false,
    })
  },

  // Update user data (optimistic updates)
  updateUser: (userData) => {
    const currentUser = get().user
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData }
      localStorage.setItem('userData', JSON.stringify(updatedUser))
      set({ user: updatedUser })
    }
  },
}))

// Selectors for optimal performance
export const useAuth = () =>
  useAuthStore((state) => ({
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    isInitialized: state.isInitialized,
  }))

export const useAuthActions = () =>
  useAuthStore((state) => ({
    login: state.login,
    logout: state.logout,
    updateUser: state.updateUser,
    clearAuth: state.clearAuth,
    initializeAuth: state.initializeAuth,
    setIsLoading: state.setIsLoading,
    setUser: state.setUser,
  }))

// Individual selectors for maximum granularity
export const useAuthUser = () => useAuthStore((state) => state.user)
export const useAuthToken = () => useAuthStore((state) => state.token)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useAuthLoading = () => useAuthStore((state) => state.isLoading)
export const useAuthInitialized = () => useAuthStore((state) => state.isInitialized)

// Subscribe to localStorage changes from other tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'authToken' || e.key === 'userData') {
      const store = useAuthStore.getState()
      if (e.key === 'authToken' && !e.newValue) {
        // Token was removed, logout
        store.clearAuth()
      } else if (e.key === 'userData' && e.newValue) {
        // User data was updated
        try {
          const user = JSON.parse(e.newValue) as User
          store.setUser(user)
        } catch (error) {
          console.error('Error parsing updated user data:', error)
        }
      }
    }
  })
}
