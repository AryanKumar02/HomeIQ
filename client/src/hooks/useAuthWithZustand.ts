import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/auth'
import { useAuthStore, useAuthActions } from '../stores/authStore'
import type {
  LoginRequest,
  SignupRequest,
  ForgotPasswordRequest,
  ResendVerificationRequest,
} from '../api/auth'

// Query keys for auth operations
export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'currentUser'] as const,
}

// Hook for getting current user data (integrates with Zustand)
export const useCurrentUser = (enabled = true) => {
  const token = useAuthStore((state) => state.token)
  const isInitialized = useAuthStore((state) => state.isInitialized)

  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: authApi.getCurrentUser,
    enabled: enabled && isInitialized && !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 errors (unauthorized)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } }
        if (axiosError.response?.status === 401) {
          return false
        }
      }
      return failureCount < 1
    },
  })
}

// Hook for login mutation (integrates with Zustand)
export const useLogin = () => {
  const queryClient = useQueryClient()
  const { login: zustandLogin, setIsLoading } = useAuthActions()

  return useMutation({
    mutationFn: (data: LoginRequest) => {
      setIsLoading(true)
      return authApi.login(data)
    },
    onSuccess: (data) => {
      // Update Zustand store
      if (data.token && data.user) {
        zustandLogin(data.user, data.token)
      }

      // Set user data in React Query cache
      if (data.user) {
        queryClient.setQueryData(authKeys.currentUser(), { user: data.user })
      }

      // Invalidate current user query to refresh data
      void queryClient.invalidateQueries({ queryKey: authKeys.currentUser() })
      setIsLoading(false)
    },
    onError: (error) => {
      console.error('Login failed:', error)
      const { clearAuth } = useAuthStore.getState()
      clearAuth()
      queryClient.removeQueries({ queryKey: authKeys.currentUser() })
      setIsLoading(false)
    },
  })
}

// Hook for logout mutation (integrates with Zustand)
export const useLogout = () => {
  const queryClient = useQueryClient()
  const { logout: zustandLogout } = useAuthActions()

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Update Zustand store
      zustandLogout()

      // Clear all queries (fresh start after logout)
      queryClient.clear()
    },
    onError: (error) => {
      console.error('Logout failed:', error)
      // Even if logout API fails, clear local data
      zustandLogout()
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
      // Note: Don't auto-login after signup since email verification might be required
    },
    onError: (error) => {
      console.error('Signup failed:', error)
    },
  })
}

// Hook for email verification mutation (integrates with Zustand)
export const useVerifyEmail = () => {
  const queryClient = useQueryClient()
  const { login: zustandLogin } = useAuthActions()

  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
    onSuccess: (data) => {
      console.log('Email verification successful:', data)

      // If verification returns auth data, update Zustand store
      if (data.token && data.user) {
        zustandLogin(data.user, data.token)
        queryClient.setQueryData(authKeys.currentUser(), { user: data.user })
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

// New hooks specifically for Zustand integration
export const useAuthWithReactQuery = () => {
  const auth = useAuthStore((state) => ({
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    isInitialized: state.isInitialized,
  }))

  const actions = useAuthActions()
  const currentUserQuery = useCurrentUser(auth.isInitialized && !!auth.token)
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

  // Refresh user data
  const refreshUserData = async (): Promise<void> => {
    try {
      await currentUserQuery.refetch()
    } catch (error) {
      console.error('Error refreshing user data:', error)
      throw error
    }
  }

  return {
    ...auth,
    login,
    logout,
    refreshUserData,
    updateUser: actions.updateUser,
    // Expose query states for more granular control
    isLoginPending: loginMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
    isUserLoading: currentUserQuery.isLoading,
    userError: currentUserQuery.error,
  }
}
