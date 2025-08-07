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
  baseURL: (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3001/api/v1',
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
      const response = await authApiClient.post<AuthResponse>('/auth/login', data)
      return response.data
    } catch (error) {
      console.error('LOGIN API ERROR:', error)
      throw error
    }
  },

  // Logout user
  logout: async (): Promise<AuthResponse> => {
    try {
      const response = await authApiClient.post<AuthResponse>('/auth/logout', {})
      return response.data
    } catch (error) {
      console.error('LOGOUT API ERROR:', error)
      throw error
    }
  },

  // Register new user
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    try {
      const response = await authApiClient.post<AuthResponse>('/auth/register', data)
      return response.data
    } catch (error) {
      console.error('SIGNUP API ERROR:', error)
      throw error
    }
  },

  // Get current user data
  getCurrentUser: async (): Promise<{ user: User }> => {
    try {
      const response = await authApiClient.get<{ user: User }>('/auth/me')
      return response.data
    } catch (error) {
      console.error('GET CURRENT USER API ERROR:', error)
      throw error
    }
  },

  // Verify email with token
  verifyEmail: async (token: string): Promise<AuthResponse> => {
    try {
      const response = await authApiClient.get<AuthResponse>(`/auth/verify-email/${token}`)
      return response.data
    } catch (error) {
      console.error('VERIFY EMAIL API ERROR:', error)
      throw error
    }
  },

  // Request password reset
  forgotPassword: async (data: ForgotPasswordRequest): Promise<AuthResponse> => {
    try {
      const response = await authApiClient.post<AuthResponse>('/auth/forgot-password', data)
      return response.data
    } catch (error) {
      console.error('FORGOT PASSWORD API ERROR:', error)
      throw error
    }
  },

  // Reset password with token
  resetPassword: async (token: string, data: ResetPasswordRequest): Promise<AuthResponse> => {
    try {
      const response = await authApiClient.post<AuthResponse>(`/auth/reset-password/${token}`, data)
      return response.data
    } catch (error) {
      console.error('RESET PASSWORD API ERROR:', error)
      throw error
    }
  },

  // Resend email verification
  resendVerification: async (data: ResendVerificationRequest): Promise<AuthResponse> => {
    try {
      const response = await authApiClient.post<AuthResponse>('/auth/resend-verification', data)
      return response.data
    } catch (error) {
      console.error('RESEND VERIFICATION API ERROR:', error)
      throw error
    }
  },
}
