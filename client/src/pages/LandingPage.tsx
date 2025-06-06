import React from 'react'
import Navbar from '../components/navigation/Navbar'
import Box from '@mui/material/Box'
import HeroSection from '../components/landing/HeroSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import { useTheme } from '@mui/material/styles'

const LandingPage: React.FC = () => {
  const theme = useTheme()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          paddingTop: `${theme.mixins.toolbar.minHeight}px`,
          [theme.breakpoints.up('sm')]: {
            paddingTop: `calc(${theme.mixins.toolbar.minHeight}px + ${theme.spacing(1)})`,
          }
        }}
      >
        <HeroSection />
        <FeaturesSection />
      </Box>
    </Box>
  )
}

export default LandingPage
