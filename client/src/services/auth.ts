import axios from 'axios'

interface AuthResponse {
  success: boolean
  message?: string
  token?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any // Can be refined further if user structure is consistent
  userId?: string
}

export async function login(
  email: string,
  password: string,
  rememberMe: boolean = false
): Promise<AuthResponse> {
  try {
    console.log('LOGIN API CALL:', '/api/v1/auth/login', { email, rememberMe })
    const res = await axios.post<AuthResponse>(
      '/api/v1/auth/login',
      { email, password, rememberMe },
      {
        withCredentials: true,
      }
    )
    console.log('LOGIN API RESPONSE:', res)
    return res.data
  } catch (err) {
    console.error('LOGIN API ERROR:', err)
    throw err
  }
}

export async function logout(): Promise<AuthResponse> {
  try {
    console.log('LOGOUT API CALL:', '/api/v1/auth/logout')
    const res = await axios.post<AuthResponse>(
      '/api/v1/auth/logout',
      {},
      {
        withCredentials: true,
      }
    )
    console.log('LOGOUT API RESPONSE:', res)
    return res.data
  } catch (err) {
    console.error('LOGOUT API ERROR:', err)
    throw err
  }
}

export async function signup(
  firstName: string,
  secondName: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    console.log('SIGNUP API CALL:', '/api/v1/auth/register', { firstName, secondName, email })
    const res = await axios.post<AuthResponse>(
      '/api/v1/auth/register',
      { firstName, secondName, email, password },
      {
        withCredentials: true,
      }
    )
    console.log('SIGNUP API RESPONSE:', res)
    return res.data
  } catch (err) {
    console.error('SIGNUP API ERROR:', err)
    throw err
  }
}

export async function verifyEmail(token: string): Promise<AuthResponse> {
  try {
    console.log('VERIFY EMAIL API CALL:', `/api/v1/auth/verify-email/${token}`)
    const res = await axios.get<AuthResponse>(`/api/v1/auth/verify-email/${token}`)
    console.log('VERIFY EMAIL API RESPONSE:', res)
    return res.data
  } catch (err) {
    console.error('VERIFY EMAIL API ERROR:', err)
    throw err
  }
}

export async function forgotPassword(email: string): Promise<AuthResponse> {
  try {
    console.log('FORGOT PASSWORD API CALL:', '/api/v1/auth/forgot-password', { email })
    const res = await axios.post<AuthResponse>('/api/v1/auth/forgot-password', { email })
    console.log('FORGOT PASSWORD API RESPONSE:', res)
    return res.data
  } catch (err) {
    console.error('FORGOT PASSWORD API ERROR:', err)
    throw err
  }
}

export async function resetPassword(token: string, password: string): Promise<AuthResponse> {
  try {
    console.log('RESET PASSWORD API CALL:', `/api/v1/auth/reset-password/${token}`)
    const res = await axios.post<AuthResponse>(`/api/v1/auth/reset-password/${token}`, { password })
    console.log('RESET PASSWORD API RESPONSE:', res)
    return res.data
  } catch (err) {
    console.error('RESET PASSWORD API ERROR:', err)
    throw err
  }
}

export async function resendVerification(email: string): Promise<AuthResponse> {
  try {
    console.log('RESEND VERIFICATION API CALL:', '/api/v1/auth/resend-verification', { email })
    const res = await axios.post<AuthResponse>('/api/v1/auth/resend-verification', { email })
    console.log('RESEND VERIFICATION API RESPONSE:', res)
    return res.data
  } catch (err) {
    console.error('RESEND VERIFICATION API ERROR:', err)
    throw err
  }
}
