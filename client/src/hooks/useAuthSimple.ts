import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/auth'
import { useAuthStore, useAuth } from '../stores/authStoreNew'
import type {
  LoginRequest,
  SignupRequest,
  ForgotPasswordRequest,
  ResendVerificationRequest,
} from '../api/auth'

// Hook for login mutation (simple Zustand integration)
export const useLogin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: async (data) => {
      console.log('🔐 Login API success, data:', data)
      
      // Handle login data based on what's provided
      if (data.token && data.user) {
        // Direct login with both token and user data
        const store = useAuthStore.getState()
        store.login(data.user, data.token)
        console.log('🔐 Store updated with user and token')
      } else if (data.token) {
        // If we have a token but no user data, fetch user data
        try {
          // Store token temporarily so getCurrentUser can use it
          localStorage.setItem('authToken', data.token)
          
          // Fetch user data with the token
          const userResponse = await authApi.getCurrentUser()
          console.log('🔐 Fetched user data:', userResponse)
          
          if (userResponse.user) {
            const store = useAuthStore.getState()
            store.login(userResponse.user, data.token)
            console.log('🔐 Store updated with user and token')
          }
        } catch (userError) {
          console.error('Failed to fetch user data after login:', userError)
          // Clear the temporarily stored token
          localStorage.removeItem('authToken')
          const store = useAuthStore.getState()
          store.clearAuth()
          throw userError
        }
      }

      // Clear React Query cache for fresh start
      queryClient.clear()
    },
    onError: (error) => {
      console.error('Login failed:', error)
      const store = useAuthStore.getState()
      store.clearAuth()
    },
  })
}

// Hook for logout mutation (simple Zustand integration)
export const useLogout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: async () => {
      // Update Zustand store directly
      const store = useAuthStore.getState()
      await store.logout()
      
      // Clear all queries
      queryClient.clear()
    },
    onError: async (error) => {
      console.error('Logout failed:', error)
      // Even if logout API fails, clear local data
      const store = useAuthStore.getState()
      await store.logout()
      queryClient.clear()
    },
  })
}

// Hook for signup mutation
export const useSignup = () => {
  return useMutation({
    mutationFn: (data: SignupRequest) => authApi.signup(data),
    onSuccess: (data) => {
      console.log('Signup successful:', data)
    },
    onError: (error) => {
      console.error('Signup failed:', error)
    },
  })
}

// Hook for email verification mutation
export const useVerifyEmail = () => {

  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
    onSuccess: (data) => {
      console.log('Email verification successful:', data)

      // If verification returns auth data, update Zustand store
      if (data.token && data.user) {
        const store = useAuthStore.getState()
        store.login(data.user, data.token)
      }
    },
    onError: (error) => {
      console.error('Email verification failed:', error)
    },
  })
}

// Hook for forgot password mutation
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
    onSuccess: (data) => {
      console.log('Password reset email sent:', data)
    },
    onError: (error) => {
      console.error('Forgot password failed:', error)
    },
  })
}

// Hook for reset password mutation
export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authApi.resetPassword(token, { password }),
    onSuccess: (data) => {
      console.log('Password reset successful:', data)
    },
    onError: (error) => {
      console.error('Password reset failed:', error)
    },
  })
}

// Hook for resend verification mutation
export const useResendVerification = () => {
  return useMutation({
    mutationFn: (data: ResendVerificationRequest) => authApi.resendVerification(data),
    onSuccess: (data) => {
      console.log('Verification email resent:', data)
    },
    onError: (error) => {
      console.error('Resend verification failed:', error)
    },
  })
}

// Simple auth hook that combines Zustand state with login/logout actions
export const useAuthWithActions = () => {
  const auth = useAuth()
  const loginMutation = useLogin()
  const logoutMutation = useLogout()

  // Enhanced login function
  const login = async (email: string, password: string, rememberMe = false): Promise<void> => {
    try {
      await loginMutation.mutateAsync({
        email,
        password,
        rememberMe,
      })
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // Enhanced logout function
  const logout = () => {
    logoutMutation.mutate()
  }

  const updateUser = useAuthStore((state) => state.updateUser)

  return {
    ...auth,
    login,
    logout,
    updateUser,
    // Expose query states
    isLoginPending: loginMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
  }
}