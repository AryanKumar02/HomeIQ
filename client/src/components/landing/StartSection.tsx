import React from 'react'
import { Box, Container, Typography, Button, Stack } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const StartSection: React.FC = () => {
  const navigate = useNavigate()

  const handleSignupClick = () => {
    void navigate('/signup')
  }

  return (
    <Box
      component="section"
      sx={{
        bgcolor: 'secondary.main',
        py: { xs: 8, md: 10 },
        textAlign: 'center',
        color: 'common.white',
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h4" component="h2" fontWeight={700} sx={{ mb: 2 }}>
          Ready to simplify your property management?
        </Typography>

        <Typography variant="subtitle1" sx={{ mb: { xs: 5, md: 6 }, opacity: 0.9 }}>
          Join thousands of property managers who have already made the switch to Estate&nbsp;Link.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Button
            variant="contained"
            onClick={handleSignupClick}
            sx={{
              bgcolor: 'common.white',
              color: 'secondary.main',
              fontWeight: 600,
              px: 5,
              py: 1.5,
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                bgcolor: 'common.white',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  pointerEvents: 'none',
                },
              },
              '&:active': {
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  pointerEvents: 'none',
                },
              },
            }}
          >
            Start Free Trial
          </Button>

          <Button
            variant="outlined"
            color="inherit"
            component="a"
            href="mailto:sales@homeiq.com?subject=Request Demo - EstateLink"
            sx={{
              borderColor: 'rgba(255,255,255,0.85)',
              color: 'common.white',
              fontWeight: 600,
              px: 5,
              py: 1.5,
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                borderColor: 'common.white',
                color: 'common.white',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  pointerEvents: 'none',
                },
              },
              '&:active': {
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  pointerEvents: 'none',
                },
              },
            }}
          >
            Schedule Demo
          </Button>
        </Stack>
      </Container>
    </Box>
  )
}

export default StartSection
