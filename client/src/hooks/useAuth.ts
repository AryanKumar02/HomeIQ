import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/auth'
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

// Hook for getting current user data
export const useCurrentUser = (enabled = true) => {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: authApi.getCurrentUser,
    enabled: enabled && !!localStorage.getItem('authToken'),
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

// Hook for login mutation
export const useLogin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token)
      }

      // Store user data if returned
      if (data.user) {
        localStorage.setItem('userData', JSON.stringify(data.user))
        // Set user data in React Query cache
        queryClient.setQueryData(authKeys.currentUser(), { user: data.user })
      }

      // Invalidate current user query to refresh data
      void queryClient.invalidateQueries({ queryKey: authKeys.currentUser() })
    },
    onError: (error) => {
      console.error('Login failed:', error)
      // Clear any existing auth data on login failure
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
      queryClient.removeQueries({ queryKey: authKeys.currentUser() })
    },
  })
}

// Hook for logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear all auth-related data
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')

      // Clear all queries (fresh start after logout)
      queryClient.clear()
    },
    onError: (error) => {
      console.error('Logout failed:', error)
      // Even if logout API fails, clear local data
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
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

// Hook for email verification mutation
export const useVerifyEmail = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
    onSuccess: (data) => {
      console.log('Email verification successful:', data)

      // If verification returns auth data, store it
      if (data.token) {
        localStorage.setItem('authToken', data.token)
      }
      if (data.user) {
        localStorage.setItem('userData', JSON.stringify(data.user))
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
