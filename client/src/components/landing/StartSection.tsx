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
              color: 'primary.main',
              fontWeight: 600,
              px: 5,
              py: 1.5,
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'common.white',
                opacity: 0.9,
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
              '&:hover': {
                borderColor: 'common.white',
                bgcolor: 'rgba(255,255,255,0.08)',
                color: 'common.white',
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
