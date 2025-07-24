import axios from 'axios'
import type { User } from '../types/user'

// Auth API response types
export interface AuthResponse {
  success: boolean
  message?: string
  token?: string
  user?: User
  userId?: string
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface SignupRequest {
  firstName: string
  secondName: string
  email: string
  password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  password: string
}

export interface ResendVerificationRequest {
  email: string
}

// Create axios instance with default configuration for auth
const authApiClient = axios.create({
  withCredentials: true,
})

// Get auth token from localStorage for authenticated requests
const getAuthToken = () => {
  return localStorage.getItem('authToken')
}

// Add auth header to requests that need it
authApiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token && config.url?.includes('/me')) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authApi = {
  // Login user
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      console.log('LOGIN API CALL:', '/api/v1/auth/login', {
        email: data.email,
        rememberMe: data.rememberMe,
      })
      const response = await authApiClient.post<AuthResponse>('/api/v1/auth/login', data)
      console.log('LOGIN API RESPONSE:', response.data)
      return response.data
    } catch (error) {
      console.error('LOGIN API ERROR:', error)
      throw error
    }
  },

  // Logout user
  logout: async (): Promise<AuthResponse> => {
    try {
      console.log('LOGOUT API CALL:', '/api/v1/auth/logout')
      const response = await authApiClient.post<AuthResponse>('/api/v1/auth/logout', {})
      console.log('LOGOUT API RESPONSE:', response.data)
      return response.data
    } catch (error) {
      console.error('LOGOUT API ERROR:', error)
      throw error
    }
  },

  // Register new user
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    try {
      console.log('SIGNUP API CALL:', '/api/v1/auth/register', {
        firstName: data.firstName,
        secondName: data.secondName,
        email: data.email,
      })
      const response = await authApiClient.post<AuthResponse>('/api/v1/auth/register', data)
      console.log('SIGNUP API RESPONSE:', response.data)
      return response.data
    } catch (error) {
      console.error('SIGNUP API ERROR:', error)
      throw error
    }
  },

  // Get current user data
  getCurrentUser: async (): Promise<{ user: User }> => {
    try {
      console.log('GET CURRENT USER API CALL:', '/api/v1/auth/me')
      const response = await authApiClient.get<{ user: User }>('/api/v1/auth/me')
      console.log('GET CURRENT USER API RESPONSE:', response.data)
      return response.data
    } catch (error) {
      console.error('GET CURRENT USER API ERROR:', error)
      throw error
    }
  },

  // Verify email with token
  verifyEmail: async (token: string): Promise<AuthResponse> => {
    try {
      console.log('VERIFY EMAIL API CALL:', `/api/v1/auth/verify-email/${token}`)
      const response = await authApiClient.get<AuthResponse>(`/api/v1/auth/verify-email/${token}`)
      console.log('VERIFY EMAIL API RESPONSE:', response.data)
      return response.data
    } catch (error) {
      console.error('VERIFY EMAIL API ERROR:', error)
      throw error
    }
  },

  // Request password reset
  forgotPassword: async (data: ForgotPasswordRequest): Promise<AuthResponse> => {
    try {
      console.log('FORGOT PASSWORD API CALL:', '/api/v1/auth/forgot-password', {
        email: data.email,
      })
      const response = await authApiClient.post<AuthResponse>('/api/v1/auth/forgot-password', data)
      console.log('FORGOT PASSWORD API RESPONSE:', response.data)
      return response.data
    } catch (error) {
      console.error('FORGOT PASSWORD API ERROR:', error)
      throw error
    }
  },

  // Reset password with token
  resetPassword: async (token: string, data: ResetPasswordRequest): Promise<AuthResponse> => {
    try {
      console.log('RESET PASSWORD API CALL:', `/api/v1/auth/reset-password/${token}`)
      const response = await authApiClient.post<AuthResponse>(
        `/api/v1/auth/reset-password/${token}`,
        data
      )
      console.log('RESET PASSWORD API RESPONSE:', response.data)
      return response.data
    } catch (error) {
      console.error('RESET PASSWORD API ERROR:', error)
      throw error
    }
  },

  // Resend email verification
  resendVerification: async (data: ResendVerificationRequest): Promise<AuthResponse> => {
    try {
      console.log('RESEND VERIFICATION API CALL:', '/api/v1/auth/resend-verification', {
        email: data.email,
      })
      const response = await authApiClient.post<AuthResponse>(
        '/api/v1/auth/resend-verification',
        data
      )
      console.log('RESEND VERIFICATION API RESPONSE:', response.data)
      return response.data
    } catch (error) {
      console.error('RESEND VERIFICATION API ERROR:', error)
      throw error
    }
  },
}
