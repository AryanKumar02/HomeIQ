import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

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

// API response types
interface ErrorResponse {
  message?: string
}

// Auth context type
interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
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

// API base URL - environment based for deployment
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3001/api/v1'

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Logout function (moved up so it can be used by refreshUserData)
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
  }

  // Refresh user data from server
  const refreshUserData = async (authToken?: string): Promise<void> => {
    const tokenToUse = authToken || token

    if (!tokenToUse) {
      throw new Error('No authentication token available')
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${tokenToUse}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, logout user
          logout()
          throw new Error('Session expired')
        }
        throw new Error('Failed to fetch user data')
      }

      const responseData = (await response.json()) as { user?: User } & User
      console.log('Auth/me response:', responseData)

      // Handle different response formats (backend might return {user: {...}} or just {...})
      const userData: User = responseData.user || responseData

      setUser(userData)
      localStorage.setItem('userData', JSON.stringify(userData))
    } catch (error) {
      console.error('Error refreshing user data:', error)
      throw error
    }
  }

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('authToken')
        const storedUser = localStorage.getItem('userData')

        // Clear any corrupted data
        if (storedUser === 'undefined' || storedUser === 'null') {
          localStorage.removeItem('authToken')
          localStorage.removeItem('userData')
          setIsLoading(false)
          return
        }

        if (storedToken && storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
          try {
            const parsedUser = JSON.parse(storedUser) as User
            // Set user data immediately for faster load
            setToken(storedToken)
            setUser(parsedUser)

            // Then verify token is still valid in the background
            try {
              await refreshUserData(storedToken)
            } catch (refreshError) {
              // Only clear data if it's a 401 (handled in refreshUserData)
              // For other errors (network, etc), keep the cached data
              console.error('Error refreshing user data:', refreshError)
            }
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
        setIsLoading(false)
      }
    }

    void initializeAuth()
  }, [])

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse
        throw new Error(errorData.message || 'Login failed')
      }

      const data = (await response.json()) as { success: boolean; token: string }

      console.log('Raw login response:', data)

      // Extract token from response
      const authToken = data.token

      console.log('Extracted token:', authToken)

      // Store token first
      setToken(authToken)
      localStorage.setItem('authToken', authToken)

      // Fetch user data using the token
      const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data after login')
      }

      const userDataResponse = (await userResponse.json()) as { user: User }
      const userData = userDataResponse.user

      console.log('Fetched user data:', userData)

      // Store user data
      setUser(userData)
      localStorage.setItem('userData', JSON.stringify(userData))

      console.log('Login successful, user data:', userData)
      console.log('Authentication state updated')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Update user data locally (for optimistic updates)
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem('userData', JSON.stringify(updatedUser))
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    refreshUserData,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// HOC for protected routes
export const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  const WrappedComponent = (props: P) => {
    const { isAuthenticated, isLoading } = useAuth()

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
