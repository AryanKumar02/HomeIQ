import React, { useState, useRef } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  FormControlLabel,
  Checkbox,
  IconButton,
  InputAdornment,
} from '@mui/material'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useAuthWithActions } from '../../hooks/useAuthSimple'
import gsap from 'gsap'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import { useFormGsapAnimation } from '../../animation/useFormGsapAnimation'
import { useTheme } from '@mui/material/styles'

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const emailRef = useRef<HTMLDivElement>(null)
  const passwordRef = useRef<HTMLDivElement>(null)
  const forgotRef = useRef<HTMLDivElement>(null)
  const signupRef = useRef<HTMLDivElement>(null)
  const rememberMeRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()

  // Use simple auth hooks
  const { login, isLoginPending } = useAuthWithActions()

  // Memoize refs array to avoid triggering animation on every render
  const fieldRefs = [emailRef, passwordRef]
  const extraRefs = [rememberMeRef, forgotRef, signupRef]

  useFormGsapAnimation({
    formRef: formRef as React.RefObject<HTMLElement>,
    fieldRefs: fieldRefs.map((ref) => ref as React.RefObject<HTMLElement>),
    buttonRef: buttonRef as React.RefObject<HTMLElement>,
    extraRefs: extraRefs.map((ref) => ref as React.RefObject<HTMLElement>),
  })

  // Map backend error messages to user-friendly messages
  function getFriendlyErrorMessage(err: unknown): string {
    if (typeof err === 'object' && err !== null) {
      const customError = err as { response?: { status?: number; data?: { message?: string } } }
      if (
        customError.response?.status === 401 &&
        customError.response?.data?.message?.includes('verify your email')
      ) {
        return 'Please verify your email before logging in.'
      }
      if (
        customError.response?.status === 401 &&
        customError.response?.data?.message?.includes('Incorrect email or password')
      ) {
        return 'Incorrect email or password. Please try again.'
      }
      if (
        customError.response?.status === 423 &&
        customError.response?.data?.message?.includes('locked')
      ) {
        return 'Your account is temporarily locked due to too many failed attempts. Please try again later.'
      }
      if (customError.response?.status === 500) {
        return 'Something went wrong. Please try again later.'
      }
    }
    return 'Unable to log in. Please check your details and try again.'
  }

  // Get loading state
  const loading = isLoginPending

  // Submit logic using Zustand + React Query
  const handleSubmitLogic = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 0.96,
        duration: 0.12,
        yoyo: true,
        repeat: 1,
        ease: 'power1.inOut',
      })
    }

    try {
      await login(email, password, rememberMe)

      // Determine where to redirect after login
      const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard'
      void navigate(from, { replace: true })
    } catch (err: unknown) {
      setError(getFriendlyErrorMessage(err))
      console.error('Login failed:', err)
    }
  }

  // New synchronous wrapper for the form's onSubmit prop
  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault() // Keep preventDefault here as it relates to the form submission event directly
    void handleSubmitLogic(event)
  }

  const handleTogglePassword = () => {
    setShowPassword((show) => !show)
  }

  return (
    <Box
      ref={formRef}
      sx={{
        width: 360,
        maxWidth: '100%',
        position: 'relative',
      }}
    >
      {location.state && (location.state as { from?: string })?.from && (
        <IconButton
          onClick={() => void navigate(-1)}
          sx={{ position: 'absolute', left: 0, top: 0, mt: 1, ml: 1, color: 'black' }}
          aria-label="Back"
        >
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
      )}
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
        Log In to EstateLink
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{
          mb: { xs: 2, md: 3 },
          color: 'black',
          opacity: 0.4,
          textAlign: { xs: 'center', md: 'left' },
          fontSize: { xs: '1rem', md: '1.2rem' },
        }}
      >
        Your real estate management system
      </Typography>

      <Box component="form" onSubmit={handleFormSubmit}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box ref={emailRef} sx={{ mb: 2 }}>
          <Typography
            htmlFor="email"
            component="label"
            sx={{
              mb: 1,
              display: 'block',
              fontSize: { xs: '0.95rem', md: '1.1rem' },
              fontWeight: 600,
              color: 'black',
            }}
          >
            Email
          </Typography>
          <TextField
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            aria-label="Email address"
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
                borderColor: theme.palette.secondary.main,
                borderWidth: '2.5px',
              },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.secondary.main,
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

        <Box ref={passwordRef} sx={{ mb: 2 }}>
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
            Password
          </Typography>
          <TextField
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            aria-label="Password"
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
                borderColor: theme.palette.secondary.main,
                borderWidth: '2.5px',
              },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.secondary.main,
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
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={handleTogglePassword}
                    edge="end"
                    tabIndex={-1}
                    sx={{
                      p: 0,
                      borderRadius: 0,
                      mr: 0.5,
                      color: showPassword ? theme.palette.secondary.main : theme.palette.grey[500],
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                      minWidth: 0,
                      transition: 'color 0.18s',
                      '&:hover, &:focus': {
                        color: theme.palette.secondary.main,
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        transform: 'none',
                      },
                      '&:focus': {
                        outline: 'none',
                        boxShadow: 'none',
                      },
                      '&:focus-visible': {
                        outline: 'none',
                        boxShadow: 'none',
                      },
                    }}
                  >
                    {showPassword ? (
                      <VisibilityOff sx={{ fontSize: 20, strokeWidth: 1.5 }} />
                    ) : (
                      <Visibility sx={{ fontSize: 20, strokeWidth: 1.5 }} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <FormControlLabel
          ref={rememberMeRef}
          control={
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              color="secondary"
              sx={{ p: 0, pr: 1.2 }}
            />
          }
          label={
            <Box component="span" sx={{ fontWeight: 600, color: 'black', fontSize: '0.97rem' }}>
              Remember me
            </Box>
          }
          sx={{ alignItems: 'center', m: 0, pl: 0, mb: 1.5 }}
        />

        <Button
          ref={buttonRef}
          type="submit"
          variant="contained"
          color="secondary"
          fullWidth
          aria-label="Sign in to your account"
          sx={{
            mt: 4,
            mb: 2,
            fontSize: { xs: '1rem', md: '1.1rem' },
            fontWeight: 600,
            height: { xs: 44, md: 48 },
            borderRadius: 2,
            transition: 'box-shadow 0.3s, background 0.3s, transform 0.2s',
            boxShadow: '0 2px 8px 0 rgba(61, 130, 247, 0.08)',
            '&:hover': {
              background: 'secondary.dark',
              boxShadow: '0 4px 16px 0 rgba(61, 130, 247, 0.15)',
              transform: 'translateY(-2px) scale(1.03)',
            },
            '&:active': {
              background: 'secondary.main',
              boxShadow: '0 2px 8px 0 rgba(61, 130, 247, 0.12)',
              transform: 'scale(0.98)',
            },
          }}
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
      </Box>

      <Typography
        ref={forgotRef}
        sx={{
          mb: 1,
          fontSize: { xs: '0.85rem', md: '0.95rem' },
          color: 'black',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        Forgot your Password?
        <Button
          variant="text"
          component={RouterLink}
          to="/forgot-password"
          aria-label="Reset your password"
          sx={{
            fontWeight: 700,
            color: 'secondary.main',
            p: 0,
            minWidth: 0,
            '&:focus': { outline: 'none', boxShadow: 'none' },
            '&:focus-visible': { outline: 'none', boxShadow: 'none' },
          }}
          disableRipple
          disableFocusRipple
        >
          Reset here.
        </Button>
      </Typography>

      <Typography
        ref={signupRef}
        sx={{
          mt: { xs: 2, md: 2.5 },
          fontSize: { xs: '0.85rem', md: '0.95rem' },
          color: 'black',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        Don&apos;t have an account?{' '}
        <Button
          variant="text"
          component={RouterLink}
          to="/signup"
          state={{ from: location.pathname }}
          sx={{
            fontWeight: 700,
            color: 'secondary.main',
            textDecoration: 'none',
            p: 0,
            minWidth: 0,
            '&:hover': {
              textDecoration: 'underline',
            },
            '&:focus': { outline: 'none', boxShadow: 'none' },
            '&:focus-visible': { outline: 'none', boxShadow: 'none' },
          }}
          disableRipple
          disableFocusRipple
        >
          Sign Up.
        </Button>
      </Typography>
    </Box>
  )
}

export default LoginForm
