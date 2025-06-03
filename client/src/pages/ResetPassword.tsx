import React from 'react'
import { Box, Typography } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { useParams } from 'react-router-dom'
import ResetPasswordForm from '../components/forms/ResetPasswordForm'

const ResetPassword: React.FC = () => {
  const theme = useTheme()
  const { token } = useParams<{ token: string }>()

  /**
   * Show the hero image only on large (lg ≥ 1200 px) screens.
   * On smaller viewports we collapse to a single, centred form.
   */
  const showImage = useMediaQuery(theme.breakpoints.up('lg'))

  const handleSuccess = () => {
    // Optional: Add any additional success handling here
    console.log('Password reset successfully')
  }

  const handleError = (error: string) => {
    // Optional: Add any additional error handling here
    console.error('Reset password error:', error)
  }

  if (!token) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          backgroundColor: 'background.default',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ color: 'black', mb: 2 }}>
            Invalid Reset Link
          </Typography>
          <Typography sx={{ color: 'black', opacity: 0.6 }}>
            Please request a new password reset link.
          </Typography>
        </Box>
      </Box>
    )
  }

  return showImage ? (
    /* ─────────── Large screens: two‑column layout ─────────── */
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        flexDirection: 'row',
        backgroundColor: 'background.default',
      }}
    >
      {/* Left: hero image */}
      <Box
        sx={{
          flex: 1.4,
          minWidth: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src="/assets/splashes/resetpasswordsplash.png"
          alt="Reset password splash"
          sx={{
            width: '100%',
            height: '100vh',
            objectPosition: '55%',
            objectFit: 'cover',
            borderRadius: '0 16px 16px 0',
          }}
        />
      </Box>

      {/* Right: form */}
      <Box
        sx={{
          flex: 0.9,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: 675,
          width: '100%',
          px: 2,
        }}
      >
        <Box sx={{ maxWidth: 380, width: '100%' }}>
          <ResetPasswordForm token={token} onSuccess={handleSuccess} onError={handleError} />
        </Box>
      </Box>
    </Box>
  ) : (
    /* ─────────── Small screens: centred form only ─────────── */
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        backgroundColor: 'background.default',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 380, mx: 'auto' }}>
        <ResetPasswordForm token={token} onSuccess={handleSuccess} onError={handleError} />
      </Box>
    </Box>
  )
}

export default ResetPassword
