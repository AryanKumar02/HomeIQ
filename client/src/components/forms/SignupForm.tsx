import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Checkbox,
  FormControlLabel,
  FormControl,
  IconButton,
  InputAdornment,
} from '@mui/material'
import gsap from 'gsap'
import { useSignup } from '../../hooks/useAuth'
import { Link as RouterLink } from 'react-router-dom'
import { useFormGsapAnimation } from '../../animation/useFormGsapAnimation'
import CheckIcon from '@mui/icons-material/Check'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useTheme } from '@mui/material/styles'

// Custom animated checkbox icons
const AnimatedCheckboxIcon = ({ checked }: { checked: boolean }) => {
  const theme = useTheme()
  return (
    <Box
      sx={{
        width: 22,
        height: 22,
        borderRadius: 2,
        border: '2px solid',
        borderColor: checked ? theme.palette.secondary.main : '#b0b8c1',
        background: checked ? theme.palette.secondary.main : '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'border-color 0.25s, background 0.25s',
        boxShadow: checked ? `0 2px 8px 0 ${theme.palette.secondary.main}26` : 'none',
      }}
    >
      <Box
        component="span"
        sx={{
          opacity: checked ? 1 : 0,
          transform: checked ? 'scale(1)' : 'scale(0.7)',
          transition:
            'opacity 0.22s cubic-bezier(.4,1.3,.6,1), transform 0.22s cubic-bezier(.4,1.3,.6,1)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
        }}
      >
        <CheckIcon fontSize="inherit" />
      </Box>
    </Box>
  )
}

// Common styles for TextFields
const commonTextFieldStyles = {
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
  input: {
    px: 2,
    py: 0,
    height: { xs: 38, md: 40 },
    fontSize: { xs: '0.95rem', md: '1.05rem' },
    background: 'transparent',
    color: '#222',
    fontWeight: 500,
    letterSpacing: 0.01,
  },
}

const SignupForm: React.FC = () => {
  const [firstName, setFirstName] = useState('')
  const [secondName, setSecondName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const firstNameRef = useRef<HTMLDivElement>(null)
  const secondNameRef = useRef<HTMLDivElement>(null)
  const emailRef = useRef<HTMLDivElement>(null)
  const passwordRef = useRef<HTMLDivElement>(null)
  const checkboxRef = useRef<HTMLFieldSetElement>(null)
  const loginRef = useRef<HTMLParagraphElement>(null)
  const theme = useTheme()
  const [showPassword, setShowPassword] = useState(false)

  // React Query hook
  const signupMutation = useSignup()
  const loading = signupMutation.isPending

  useFormGsapAnimation({
    formRef: formRef as React.RefObject<HTMLElement>,
    fieldRefs: [
      firstNameRef as React.RefObject<HTMLElement>,
      secondNameRef as React.RefObject<HTMLElement>,
      emailRef as React.RefObject<HTMLElement>,
      passwordRef as React.RefObject<HTMLElement>,
    ],
    buttonRef: buttonRef as React.RefObject<HTMLElement>,
    extraRefs: [
      checkboxRef as React.RefObject<HTMLElement>,
      loginRef as React.RefObject<HTMLElement>,
    ],
  })

  // Handle signup mutation results
  useEffect(() => {
    if (signupMutation.isSuccess) {
      setSuccess(true)
      setError(null)
      // Clear form fields on success
      setFirstName('')
      setSecondName('')
      setEmail('')
      setPassword('')
      setAcceptTerms(false)
    }
    if (signupMutation.error) {
      setError(getFriendlyErrorMessage(signupMutation.error))
      setSuccess(false)
    }
  }, [signupMutation.isSuccess, signupMutation.error])

  // Shake animation on error
  useEffect(() => {
    if (error && formRef.current) {
      const tl = gsap.timeline()
      tl.to(formRef.current, { x: -14, duration: 0.07, ease: 'power1.inOut' })
        .to(formRef.current, { x: 12, duration: 0.07, ease: 'power1.inOut' })
        .to(formRef.current, { x: -8, duration: 0.06, ease: 'power1.inOut' })
        .to(formRef.current, { x: 6, duration: 0.06, ease: 'power1.inOut' })
        .to(formRef.current, { x: -3, duration: 0.05, ease: 'power1.inOut' })
        .to(formRef.current, { x: 0, duration: 0.05, ease: 'power1.inOut' })
    }
  }, [error])

  // Map backend error messages to user-friendly messages
  function getFriendlyErrorMessage(err: unknown): string {
    if (typeof err === 'object' && err !== null) {
      const customError = err as { response?: { status?: number; data?: { message?: string } } }
      if (
        customError.response?.status === 409 &&
        customError.response?.data?.message?.includes('already registered')
      ) {
        return 'An account with this email already exists.'
      }
      if (
        customError.response?.status === 400 &&
        customError.response?.data?.message?.includes('Password must')
      ) {
        return 'Password must be at least 8 characters and contain at least one letter and one number.'
      }
      if (customError.response?.status === 500) {
        return 'Something went wrong. Please try again later.'
      }
    }
    return 'Unable to sign up. Please check your details and try again.'
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(false)

    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        scale: 0.96,
        duration: 0.12,
        yoyo: true,
        repeat: 1,
        ease: 'power1.inOut',
      })
    }

    signupMutation.mutate({
      firstName,
      secondName,
      email,
      password,
    })
  }

  const handleTogglePassword = () => {
    setShowPassword((show) => !show)
  }

  const dynamicTextFieldSx = {
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.secondary.main,
      borderWidth: '2.5px',
    },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.secondary.main,
      borderWidth: '2.5px',
    },
  }

  return (
    <Box
      ref={formRef}
      sx={{
        width: { xs: 300, sm: 320, md: 340 },
        maxWidth: '100%',
        position: 'relative',
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 2,
          color: 'black',
          textAlign: 'center',
          fontSize: { xs: '1.7rem', md: '2rem' },
          fontWeight: 700,
        }}
      >
        Sign Up for EstateLink
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{
          mb: { xs: 1.5, md: 2 },
          color: 'black',
          opacity: 0.4,
          textAlign: 'center',
          fontSize: { xs: '0.92rem', md: '1.05rem' },
        }}
      >
        Create your real estate management account
      </Typography>

      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault()
          void handleSubmit(e)
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 1.5 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 1.5 }}>
            Account created successfully! Please check your email to verify your account.
          </Alert>
        )}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 1.1 }}>
          <Box ref={firstNameRef} sx={{ flex: 1 }}>
            <Typography
              htmlFor="firstName"
              component="label"
              sx={{
                mb: 0.7,
                display: 'block',
                fontSize: { xs: '0.89rem', md: '1.01rem' },
                fontWeight: 600,
                color: 'black',
              }}
            >
              First Name
            </Typography>
            <TextField
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              fullWidth
              required
              aria-label="First name"
              sx={{ ...commonTextFieldStyles, ...dynamicTextFieldSx }}
            />
          </Box>
          <Box ref={secondNameRef} sx={{ flex: 1 }}>
            <Typography
              htmlFor="secondName"
              component="label"
              sx={{
                mb: 0.7,
                display: 'block',
                fontSize: { xs: '0.89rem', md: '1.01rem' },
                fontWeight: 600,
                color: 'black',
              }}
            >
              Second Name
            </Typography>
            <TextField
              id="secondName"
              type="text"
              value={secondName}
              onChange={(e) => setSecondName(e.target.value)}
              fullWidth
              required
              aria-label="Second name"
              sx={{ ...commonTextFieldStyles, ...dynamicTextFieldSx }}
            />
          </Box>
        </Box>
        <Box ref={emailRef} sx={{ mb: 1.5 }}>
          <Typography
            htmlFor="email"
            component="label"
            sx={{
              mb: 0.7,
              display: 'block',
              fontSize: { xs: '0.89rem', md: '1.01rem' },
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
            sx={{ ...commonTextFieldStyles, ...dynamicTextFieldSx }}
          />
        </Box>
        <Box ref={passwordRef} sx={{ mb: 1.5 }}>
          <Typography
            htmlFor="password"
            component="label"
            sx={{
              mb: 0.7,
              display: 'block',
              fontSize: { xs: '0.89rem', md: '1.01rem' },
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
            sx={{ ...commonTextFieldStyles, ...dynamicTextFieldSx }}
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
        <FormControl
          ref={checkboxRef}
          sx={{ mb: 2, alignItems: 'flex-start', width: '100%', padding: 0, margin: 0 }}
          component="fieldset"
          variant="standard"
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                color="primary"
                sx={{ ml: 0, p: 0, pr: 1.2 }}
                icon={<AnimatedCheckboxIcon checked={false} />}
                checkedIcon={<AnimatedCheckboxIcon checked={true} />}
              />
            }
            label={
              <Box
                component="span"
                sx={{ fontWeight: 700, color: 'black', fontSize: '0.97rem', display: 'inline' }}
              >
                I{' '}
                <Box
                  component="span"
                  sx={{ color: theme.palette.secondary.main, fontWeight: 700, display: 'inline' }}
                >
                  agree
                </Box>{' '}
                to the{' '}
                <Box
                  component={RouterLink}
                  to="/terms-of-service"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: theme.palette.secondary.main,
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline',
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Terms of Service
                </Box>{' '}
                and{' '}
                <Box
                  component={RouterLink}
                  to="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: theme.palette.secondary.main,
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline',
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Privacy Policy
                </Box>
              </Box>
            }
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginLeft: '-4px',
              paddingLeft: 0,
              textAlign: 'left',
              '.MuiFormControlLabel-label': {
                lineHeight: 1.45,
              },
            }}
          />
        </FormControl>
        <Button
          ref={buttonRef}
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          aria-label="Sign up for an account"
          sx={{
            mt: 3,
            mb: 2,
            fontSize: { xs: '1rem', md: '1.1rem' },
            fontWeight: 600,
            height: { xs: 42, md: 46 },
            borderRadius: 2,
            transition: 'box-shadow 0.3s, background 0.3s, transform 0.2s',
            boxShadow: `0 2px 8px 0 ${theme.palette.secondary.main}26`,
            '&:hover': {
              background: theme.palette.primary.dark,
              boxShadow: `0 4px 16px 0 ${theme.palette.secondary.main}3d`,
              transform: 'translateY(-2px) scale(1.03)',
            },
            '&:active': {
              background: theme.palette.secondary.main,
              boxShadow: `0 2px 8px 0 ${theme.palette.secondary.main}33`,
              transform: 'scale(0.98)',
            },
          }}
          disabled={loading || !acceptTerms}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </Box>
      <Typography
        ref={loginRef}
        sx={{
          mt: 0,
          fontSize: { xs: '0.85rem', md: '0.95rem' },
          color: 'black',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
        }}
      >
        Already have an account?
        <Button
          variant="text"
          aria-label="Log in to your account"
          sx={{
            fontWeight: 700,
            color: theme.palette.secondary.main,
            p: 0,
            minWidth: 0,
            '&:focus': { outline: 'none', boxShadow: 'none' },
            '&:focus-visible': { outline: 'none', boxShadow: 'none' },
          }}
          disableRipple
          disableFocusRipple
          component={RouterLink}
          to="/login"
        >
          Log In.
        </Button>
      </Typography>
    </Box>
  )
}

export default SignupForm
