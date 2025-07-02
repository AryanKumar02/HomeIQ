import React from 'react'
import { Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/properties/Sidebar'
import Titlebar from '../components/properties/Titlebar'

const PropertyDetails: React.FC = () => {
  const navigate = useNavigate()

  const handleAddProperty = () => {
    console.log('Add property clicked')
    void navigate('/properties/add')
  }

  const handleSearchProperties = (searchTerm: string) => {
    console.log('Search properties:', searchTerm)
    // Add your property search logic here
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
          title="Properties"
          searchPlaceholder="Search properties..."
          addButtonText="Add Property"
          onAdd={handleAddProperty}
          onSearch={handleSearchProperties}
        />
      </Box>

      {/* Main layout with sidebar and content */}
      <Box sx={{ display: 'flex', flexGrow: 1, pt: { xs: '80px', md: '100px' } }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          {/* Properties content only */}
          <Box
            sx={{
              backgroundColor: 'white',
              borderRadius: 2,
              p: 3,
              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.1)',
            }}
          >
            <h2>Property Management</h2>
            <p>This page is dedicated to managing your properties.</p>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default PropertyDetails
