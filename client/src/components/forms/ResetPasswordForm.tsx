import React, { useState, useRef } from 'react'
import { Box, Typography, TextField, Button, Alert } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { resetPassword } from '../../services/auth'
import { useFormGsapAnimation } from '../../animation/useFormGsapAnimation'

interface ResetPasswordFormProps {
  token: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token, onSuccess, onError }) => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const navigate = useNavigate()

  // GSAP refs
  const formRef = useRef<HTMLDivElement>(null)
  const passwordFieldRef = useRef<HTMLDivElement>(null)
  const confirmPasswordFieldRef = useRef<HTMLDivElement>(null)
  const submitButtonRef = useRef<HTMLButtonElement>(null)
  const requestLinkRef = useRef<HTMLParagraphElement>(null)

  // Apply GSAP animation
  useFormGsapAnimation({
    formRef: formRef as React.RefObject<HTMLElement>,
    fieldRefs: [
      passwordFieldRef as React.RefObject<HTMLElement>,
      confirmPasswordFieldRef as React.RefObject<HTMLElement>,
    ],
    buttonRef: submitButtonRef as React.RefObject<HTMLElement>,
    extraRefs: [requestLinkRef as React.RefObject<HTMLElement>],
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setMessage(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Passwords do not match.',
      })
      return
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=]{8,}$/
    if (!passwordRegex.test(password)) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 8 characters and contain at least one letter and one number.',
      })
      return
    }

    setLoading(true)

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _authResponse = await resetPassword(token, password)
      // console.log('Password reset successful', _authResponse); // Optional for debugging
      setMessage({
        type: 'success',
        text: 'Password reset successful! Redirecting to login...',
      })
      onSuccess?.()

      // Redirect to login after 2 seconds
      setTimeout(() => {
        void navigate('/login')
      }, 2000)
    } catch (error: unknown) {
      let errorMessage = 'Invalid or expired reset link. Please request a new one.'
      if (typeof error === 'object' && error !== null) {
        const customError = error as {
          response?: { data?: { message?: string } }
          message?: string
        }
        if (customError.response?.data?.message) {
          errorMessage = customError.response.data.message
        } else if (customError.message) {
          errorMessage = customError.message
        }
      }
      setMessage({
        type: 'error',
        text: errorMessage,
      })
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box ref={formRef} sx={{ width: '100%' }}>
      <Typography
        variant="h4"
        sx={{
          mb: 2,
          color: 'black',
          textAlign: { xs: 'center', md: 'left' },
          fontSize: { xs: '1.7rem', md: '2rem' },
          fontWeight: 700,
        }}
      >
        Reset Your Password
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{
          mb: 3,
          color: 'black',
          opacity: 0.6,
          textAlign: { xs: 'center', md: 'left' },
          fontSize: { xs: '0.95rem', md: '1.1rem' },
        }}
      >
        Enter your new password below
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault()
          void handleSubmit(e)
        }}
      >
        <Box ref={passwordFieldRef} sx={{ mb: 2 }}>
          <Typography
            htmlFor="password"
            component="label"
            sx={{
              mb: 1,
              display: 'block',
              fontSize: { xs: '0.95rem', md: '1.1rem' },
              fontWeight: 600,
              color: 'black',
            }}
          >
            New Password
          </Typography>
          <TextField
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                background: '#f7f8fa',
                boxShadow: 'none',
                transition:
                  'border-color 0.35s cubic-bezier(0.4,0,0.2,1), box-shadow 0.35s cubic-bezier(0.4,0,0.2,1)',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: '1.5px',
                borderColor: '#e0e3e7',
                transition:
                  'border-color 0.35s cubic-bezier(0.4,0,0.2,1), border-width 0.25s cubic-bezier(0.4,0,0.2,1)',
              },
              '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#036CA3',
                borderWidth: '2.5px',
              },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#036CA3',
                borderWidth: '2.5px',
              },
              input: {
                px: 2,
                py: 0,
                height: { xs: 44, md: 48 },
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                background: 'transparent',
                color: '#222',
                fontWeight: 500,
                letterSpacing: 0.01,
              },
            }}
          />
        </Box>

        <Box ref={confirmPasswordFieldRef} sx={{ mb: 2 }}>
          <Typography
            htmlFor="confirmPassword"
            component="label"
            sx={{
              mb: 1,
              display: 'block',
              fontSize: { xs: '0.95rem', md: '1.1rem' },
              fontWeight: 600,
              color: 'black',
            }}
          >
            Confirm Password
          </Typography>
          <TextField
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                background: '#f7f8fa',
                boxShadow: 'none',
                transition:
                  'border-color 0.35s cubic-bezier(0.4,0,0.2,1), box-shadow 0.35s cubic-bezier(0.4,0,0.2,1)',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: '1.5px',
                borderColor: '#e0e3e7',
                transition:
                  'border-color 0.35s cubic-bezier(0.4,0,0.2,1), border-width 0.25s cubic-bezier(0.4,0,0.2,1)',
              },
              '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#036CA3',
                borderWidth: '2.5px',
              },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#036CA3',
                borderWidth: '2.5px',
              },
              input: {
                px: 2,
                py: 0,
                height: { xs: 44, md: 48 },
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                background: 'transparent',
                color: '#222',
                fontWeight: 500,
                letterSpacing: 0.01,
              },
            }}
          />
        </Box>

        <Button
          ref={submitButtonRef}
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{
            mt: 3,
            mb: 2,
            fontSize: { xs: '1rem', md: '1.1rem' },
            fontWeight: 600,
            height: { xs: 44, md: 48 },
            borderRadius: 2,
            transition: 'box-shadow 0.3s, background 0.3s, transform 0.2s',
            boxShadow: '0 2px 8px 0 rgba(3,108,163,0.08)',
            '&:hover': {
              background: 'primary.dark',
              boxShadow: '0 4px 16px 0 rgba(3,108,163,0.15)',
              transform: 'translateY(-2px) scale(1.03)',
            },
            '&:active': {
              background: 'primary.main',
              boxShadow: '0 2px 8px 0 rgba(3,108,163,0.12)',
              transform: 'scale(0.98)',
            },
          }}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </Box>

      <Typography
        ref={requestLinkRef}
        sx={{
          textAlign: 'left',
          fontSize: { xs: '0.85rem', md: '0.95rem' },
          color: 'black',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        Need a new reset link?
        <Button
          variant="text"
          component={RouterLink}
          to="/forgot-password"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            p: 0,
            minWidth: 0,
            '&:focus': { outline: 'none', boxShadow: 'none' },
            '&:focus-visible': { outline: 'none', boxShadow: 'none' },
          }}
          disableRipple
          disableFocusRipple
        >
          Request here
        </Button>
      </Typography>
    </Box>
  )
}

export default ResetPasswordForm
