import React from 'react'
import { Box, Typography, Paper } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/properties/Sidebar'
import Titlebar from '../components/properties/Titlebar'
import CustomButton from '../components/properties/CustomButton'

const EditProperty: React.FC = () => {
  const navigate = useNavigate()

  const handleSaveProperty = () => {
    console.log('Save property clicked')
    // Add your property save logic here
  }

  const handleCancel = () => {
    console.log('Cancel clicked')
    void navigate('/properties') // Navigate back to properties page
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
          title="Edit Property"
          showSearch={false}
        >
          <CustomButton
            text="Cancel"
            variant="outlined"
            onClick={handleCancel}
          />

          <CustomButton
            text="Save Property"
            onClick={handleSaveProperty}
          />
        </Titlebar>
      </Box>

      {/* Main layout with sidebar and content */}
      <Box sx={{ display: 'flex', flexGrow: 1, pt: { xs: '80px', md: '100px' } }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          {/* Edit Property Form */}
          <Paper
            sx={{
              p: 4,
              borderRadius: 2,
              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.1)',
            }}
          >
            <Typography variant="h5" sx={{ mb: 3 }}>
              Add New Property
            </Typography>

            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
              Fill in the property details below to add it to your portfolio.
            </Typography>

            {/* Property form will go here */}
            <Box sx={{
              p: 4,
              backgroundColor: 'grey.50',
              borderRadius: 1,
              textAlign: 'center'
            }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Property Form
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Property form components will be added here
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}

export default EditProperty
