import React from 'react'
import Navbar from '../../components/navigation/Navbar'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import HeroSection from '../../components/landing/HeroSection'
import FeaturesSection from '../../components/landing/FeaturesSection'
import StatsSection from '../../components/landing/StatsSection'
import PricingPlansSection from '../../components/landing/PricingSection'
import StartSection from '../../components/landing/StartSection'
import Footer from '../../components/navigation/Footer'

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
          },
        }}
      >
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <PricingPlansSection />
        <StartSection />
      </Box>
      <Footer />
    </Box>
  )
}

export default LandingPage
