import React from 'react'
import { Box } from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { useParams } from 'react-router-dom'
import VerifyEmailForm from '../../components/forms/VerifyEmailForm'

const VerifyEmail: React.FC = () => {
  const theme = useTheme()
  const { token } = useParams<{ token: string }>()
  const showImage = useMediaQuery(theme.breakpoints.up('lg'))

  return showImage ? (
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
          src="/assets/splashes/verifyemailsplash.png"
          alt="Verify email splash"
          sx={{
            width: '100%',
            height: '100vh',
            objectPosition: '50%',
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
        <Box sx={{ maxWidth: 500, width: '100%' }}>
          <VerifyEmailForm token={token} />
        </Box>
      </Box>
    </Box>
  ) : (
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
      <Box sx={{ width: '100%', maxWidth: 500, mx: 'auto' }}>
        <VerifyEmailForm token={token} />
      </Box>
    </Box>
  )
}

export default VerifyEmail
