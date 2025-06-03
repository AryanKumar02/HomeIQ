import React from 'react'
import Navbar from '../components/navigation/Navbar'
import Box from '@mui/material/Box'
import HeroSection from '../components/landing/HeroSection'

const LandingPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <Box
        sx={{
          width: '100%',
          minHeight: '100vh',
          paddingTop: '64px',
          boxSizing: 'border-box',
          backgroundColor: 'background.section',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <HeroSection />
      </Box>
    </>
  )
}

export default LandingPage
