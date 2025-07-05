import React from 'react'
import { Box, Typography } from '@mui/material'
import Sidebar from '../components/properties/Sidebar'
import Titlebar from '../components/properties/Titlebar'

const Dashboard: React.FC = () => {
  const handleAddDashboardItem = () => {
    console.log('Add dashboard item clicked')
    // Add your dashboard item creation logic here
  }

  const handleSearchDashboard = (searchTerm: string) => {
    console.log('Dashboard search:', searchTerm)
    // Add your dashboard search logic here
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Titlebar at the top */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: { xs: 0, md: '280px' }, // Start after sidebar on desktop
          right: 0,
          zIndex: 1200,
          backgroundColor: 'background.paper',
          borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
        }}
      >
        <Titlebar
          title="Dashboard"
          searchPlaceholder="Search dashboard..."
          addButtonText="Add Widget"
          onAdd={handleAddDashboardItem}
          onSearch={handleSearchDashboard}
        />
      </Box>

      {/* Main layout with sidebar and content */}
      <Box sx={{ display: 'flex', flexGrow: 1, pt: { xs: '80px', md: '100px' } }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          {/* Dashboard content */}
          <Box
            sx={{
              backgroundColor: 'white',
              borderRadius: 2,
              p: 3,
              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.1)',
            }}
          >
            <Typography variant="h4" sx={{ mb: 3 }}>
              Dashboard Overview
            </Typography>
            <Typography>Welcome to your property management dashboard!</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Dashboard
