import React, { useState } from 'react'
import { Box, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/common/Sidebar'
import Titlebar from '../../components/basic/Titlebar'
import { SkipLink } from '../../components/common'

const Tenants: React.FC = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  const handleAddTenant = () => {
    console.log('Add tenant clicked')
    void navigate('/tenants/add')
  }

  const handleSearchTenants = (searchTerm: string) => {
    console.log('Search tenants:', searchTerm)
    setSearchTerm(searchTerm)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Skip Links for Accessibility */}
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#tenants-list">Skip to tenants</SkipLink>

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
          title="Tenants"
          searchPlaceholder="Search tenants..."
          addButtonText="Add Tenant"
          onAdd={handleAddTenant}
          onSearch={handleSearchTenants}
        />
      </Box>

      {/* Main layout with sidebar and content */}
      <Box sx={{ display: 'flex', flexGrow: 1, pt: { xs: '80px', md: '80px' } }}>
        <Sidebar />
        <Box component="main" id="main-content" tabIndex={-1} sx={{ flexGrow: 1, p: 3, mt: 2 }}>
          {/* Tenants content */}
          <Box
            role="status"
            aria-live="polite"
            sx={{
              textAlign: 'center',
              py: 8,
              backgroundColor: 'grey.50',
              borderRadius: 2,
              border: '2px dashed',
              borderColor: 'grey.300',
            }}
          >
            <Typography variant="h6" sx={{ mb: 1, color: 'grey.600' }}>
              {searchTerm ? 'No tenants found' : 'No tenants yet'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.500' }}>
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Get started by adding your first tenant'}
            </Typography>
            {searchTerm && (
              <Typography variant="body2" sx={{ color: 'grey.500', mt: 1 }}>
                Searching for: &quot;{searchTerm}&quot;
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Tenants