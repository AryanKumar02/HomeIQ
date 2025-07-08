import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { useCurrentUser, useLogin, useLogout } from '../hooks/useAuth'

// Types for user data
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role?: string
  avatar?: string
  createdAt: string
  emailVerified: boolean
}

// Auth context type
interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  logout: () => void
  refreshUserData: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider props
interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // React Query hooks
  const loginMutation = useLogin()
  const logoutMutation = useLogout()

  // Get current user data with React Query
  const {
    data: currentUserData,
    isLoading: isLoadingUser,
    refetch: refetchUser,
    error: userError,
  } = useCurrentUser(isInitialized && !!token)

  const user = currentUserData?.user || null

  // Logout function using React Query
  const handleLogout = useCallback(() => {
    setToken(null)
    logoutMutation.mutate()
  }, [logoutMutation])

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('authToken')
        const storedUser = localStorage.getItem('userData')

        // Clear any corrupted data
        if (storedUser === 'undefined' || storedUser === 'null') {
          localStorage.removeItem('authToken')
          localStorage.removeItem('userData')
          setIsInitialized(true)
          return
        }

        if (storedToken && storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
          try {
            setToken(storedToken)
            // React Query will automatically fetch user data once token is set and isInitialized is true
          } catch (parseError) {
            console.error('Error parsing stored user data:', parseError)
            // Clear invalid data
            localStorage.removeItem('authToken')
            localStorage.removeItem('userData')
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setIsInitialized(true)
      }
    }

    initializeAuth()
  }, [])

  // Handle user query errors (like 401)
  useEffect(() => {
    if (userError && token) {
      // If there's an error fetching user data and we have a token, it's likely invalid
      console.error('Error fetching user data:', userError)

      // Check if it's a 401 error
      if (userError && typeof userError === 'object' && 'response' in userError) {
        const axiosError = userError as { response?: { status?: number } }
        if (axiosError.response?.status === 401) {
          // Token is invalid, clear auth data
          handleLogout()
        }
      }
    }
  }, [userError, token, handleLogout])

  // Login function using React Query
  const login = async (email: string, password: string, rememberMe = false): Promise<void> => {
    try {
      const result = await loginMutation.mutateAsync({
        email,
        password,
        rememberMe,
      })

      if (result.token) {
        setToken(result.token)
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // Refresh user data
  const refreshUserData = async (): Promise<void> => {
    try {
      await refetchUser()
    } catch (error) {
      console.error('Error refreshing user data:', error)
      throw error
    }
  }

  // Update user data locally (for optimistic updates)
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      localStorage.setItem('userData', JSON.stringify(updatedUser))
      // Note: React Query will handle the cache update
    }
  }

  // Calculate loading state
  const isLoading =
    !isInitialized || (isInitialized && token && isLoadingUser) || loginMutation.isPending

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout: handleLogout,
    refreshUserData,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

// HOC for protected routes
export const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  const WrappedComponent = (props: P) => {
    const { isAuthenticated, isLoading } = useAuthContext()

    if (isLoading) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          Loading...
        </div>
      )
    }

    if (!isAuthenticated) {
      // Redirect to login or show login component
      window.location.href = '/login'
      return null
    }

    return <Component {...props} />
  }

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`
  return WrappedComponent
}

export default AuthContext
