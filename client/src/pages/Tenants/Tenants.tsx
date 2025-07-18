import React, { useState } from 'react'
import { Box, Typography, CircularProgress, Alert } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/common/Sidebar'
import Titlebar from '../../components/basic/Titlebar'
import { SkipLink } from '../../components/common'
import { useTenants } from '../../hooks/useTenants'

const Tenants: React.FC = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch tenants from backend
  const { data: tenants = [], isLoading, error } = useTenants()

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
          {/* Loading State */}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error instanceof Error ? error.message : 'Failed to load tenants'}
            </Alert>
          )}

          {/* Tenants content */}
          {!isLoading && !error && (
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
                {tenants.length === 0
                  ? searchTerm
                    ? 'No tenants found'
                    : 'No tenants yet'
                  : `${tenants.length} tenant${tenants.length === 1 ? '' : 's'} found`}
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.500' }}>
                {tenants.length === 0
                  ? searchTerm
                    ? 'Try adjusting your search terms'
                    : 'Get started by adding your first tenant'
                  : 'Tenant list and assignment available in property forms'}
              </Typography>
              {searchTerm && (
                <Typography variant="body2" sx={{ color: 'grey.500', mt: 1 }}>
                  Searching for: &quot;{searchTerm}&quot;
                </Typography>
              )}
              <Typography variant="body2" sx={{ color: 'grey.500', mt: 2, fontStyle: 'italic' }}>
                💡 To assign tenants to properties, edit a property and mark it as
                &quot;occupied&quot;
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default Tenants
