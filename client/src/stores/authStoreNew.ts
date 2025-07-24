import { create } from 'zustand'
import type { User } from '../types/user'
import { authApi } from '../api/auth'

interface AuthState {
  user: User | null
  token: string | null
  isInitialized: boolean
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthActions {
  initialize: () => Promise<void>
  validateToken: () => Promise<boolean>
  refreshUserData: () => Promise<void>
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  login: (user: User, token: string) => void
  logout: () => Promise<void>
  clearAuth: () => void
  updateUser: (userData: Partial<User>) => void
}

type AuthStore = AuthState & AuthActions

const initialState: AuthState = {
  user: null,
  token: null,
  isInitialized: false,
  isLoading: true,
  isAuthenticated: false,
}

// Memoization variables declared at module level
let cachedAuthResult: ReturnType<typeof getAuthState> | null = null
let lastStateSnapshot: string | null = null
let cachedActionsResult: ReturnType<typeof getAuthActions> | null = null

export const useAuthStore = create<AuthStore>((set, get) => {
  // Wrap set to clear cache on state changes
  const debugSet = (newState: Partial<AuthState>) => {
    // Clear cache when state changes
    cachedAuthResult = null
    lastStateSnapshot = null
    cachedActionsResult = null
    set(newState)
  }
  
  return {
  ...initialState,

  initialize: async () => {
    try {
      const storedToken = localStorage.getItem('authToken')
      const storedUser = localStorage.getItem('userData')

      // Clear corrupted data
      if (storedUser === 'undefined' || storedUser === 'null') {
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
        debugSet({
          user: null,
          token: null,
          isInitialized: true,
          isLoading: false,
          isAuthenticated: false,
        })
        return
      }

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as User
          
          // Set temporary state with stored data
          debugSet({
            user: parsedUser,
            token: storedToken,
            isInitialized: false,
            isLoading: true,
            isAuthenticated: false,
          })

          // Validate token with server
          const isValid = await get().validateToken()
          
          if (isValid) {
            debugSet({
              isInitialized: true,
              isLoading: false,
              isAuthenticated: true,
            })
          } else {
            // Token is invalid, clear auth
            localStorage.removeItem('authToken')
            localStorage.removeItem('userData')
            debugSet({
              user: null,
              token: null,
              isInitialized: true,
              isLoading: false,
              isAuthenticated: false,
            })
          }
        } catch {
          localStorage.removeItem('authToken')
          localStorage.removeItem('userData')
          debugSet({
            user: null,
            token: null,
            isInitialized: true,
            isLoading: false,
            isAuthenticated: false,
          })
        }
      } else {
        debugSet({
          user: null,
          token: null,
          isInitialized: true,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      debugSet({
        user: null,
        token: null,
        isInitialized: true,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  },

  validateToken: async () => {
    try {
      const { token } = get()
      if (!token) {
        return false
      }

      // Call the API to validate token and get fresh user data
      const response = await authApi.getCurrentUser()
      
      if (response.user) {
        // Update user data with fresh data from server
        localStorage.setItem('userData', JSON.stringify(response.user))
        debugSet({
          user: response.user,
        })
        return true
      }
      
      return false
    } catch (error) {
      console.error('Token validation failed:', error)
      return false
    }
  },

  setUser: (user) => {
    const { token } = get()
    debugSet({
      user,
      isAuthenticated: !!user && !!token,
    })
  },

  setToken: (token) => {
    const { user } = get()
    debugSet({
      token,
      isAuthenticated: !!user && !!token,
    })
  },

  setLoading: (isLoading) => {
    debugSet({ isLoading })
  },

  login: (user, token) => {
    localStorage.setItem('authToken', token)
    localStorage.setItem('userData', JSON.stringify(user))
    debugSet({
      user,
      token,
      isLoading: false,
      isAuthenticated: true,
    })
  },

  logout: async () => {
    try {
      // Call server logout endpoint to invalidate server-side session
      await authApi.logout()
    } catch (error) {
      console.error('Server logout failed:', error)
      // Continue with local logout even if server call fails
    } finally {
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
      debugSet({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  },

  refreshUserData: async () => {
    try {
      const { isAuthenticated } = get()
      if (!isAuthenticated) {
        return
      }

      const response = await authApi.getCurrentUser()
      
      if (response.user) {
        // Update user data with fresh data from server
        localStorage.setItem('userData', JSON.stringify(response.user))
        debugSet({
          user: response.user,
        })
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error)
      // If refresh fails, it might mean token is invalid
      // Clear auth to force re-login
      get().clearAuth()
    }
  },

  clearAuth: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    debugSet({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    })
  },

  updateUser: (userData) => {
    const { user } = get()
    if (user) {
      const updatedUser = { ...user, ...userData }
      localStorage.setItem('userData', JSON.stringify(updatedUser))
      debugSet({ user: updatedUser })
    }
  },
}
})

// Initialize auth immediately when the store is created
useAuthStore.getState().initialize().catch(console.error)

// Memoized auth selector to prevent infinite re-renders
const getAuthState = (state: AuthState) => ({
  user: state.user,
  token: state.token,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  isInitialized: state.isInitialized,
})

export const useAuth = () => {
  return useAuthStore((state) => {
    // Create a snapshot of the relevant state values
    const currentSnapshot = JSON.stringify({
      userId: state.user?.id,
      token: state.token,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      isInitialized: state.isInitialized,
    })

    // If the snapshot hasn't changed, return the cached result
    if (lastStateSnapshot === currentSnapshot && cachedAuthResult) {
      return cachedAuthResult
    }

    // State has changed, create new result and cache it
    lastStateSnapshot = currentSnapshot
    cachedAuthResult = getAuthState(state)
    
    return cachedAuthResult
  })
}

// Memoized actions selector
const getAuthActions = (state: AuthStore) => ({
  login: state.login,
  logout: state.logout,
  updateUser: state.updateUser,
  setLoading: state.setLoading,
  validateToken: state.validateToken,
  refreshUserData: state.refreshUserData,
})

export const useAuthActions = () =>
  useAuthStore((state) => {
    // Actions don't change, so we can always return the same cached result
    if (!cachedActionsResult) {
      cachedActionsResult = getAuthActions(state)
    }
    return cachedActionsResult
  })

export const useAuthUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useAuthLoading = () => useAuthStore((state) => state.isLoading)