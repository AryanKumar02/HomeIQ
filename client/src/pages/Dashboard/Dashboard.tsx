import React from 'react'
import { Box } from '@mui/material'
import Sidebar from '../../components/common/Sidebar'
import Titlebar from '../../components/basic/Titlebar'
import InDevelopment from '../../components/common/InDevelopment'

const Dashboard: React.FC = () => {
  const handleAddDashboardItem = () => {
  }

  const handleSearchDashboard = () => {
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
          <InDevelopment
            pageName="Dashboard"
            description="Your comprehensive property management dashboard with analytics, overview widgets, and key metrics is currently being developed."
            estimatedCompletion="Q2 2025"
          />
        </Box>
      </Box>
    </Box>
  )
}

export default Dashboard
