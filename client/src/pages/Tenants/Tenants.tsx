import React from 'react'
import { Box, Alert } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/common/Sidebar'
import Titlebar from '../../components/basic/Titlebar'
import { SkipLink } from '../../components/common'
import { TenantTable } from '../../components/TenantTable'
import { useTenantsTable } from '../../hooks/useTenantsTable'
import { useTenantSearch, useSearchState } from '../../hooks/useSearch'

const Tenants: React.FC = () => {
  const navigate = useNavigate()
  const { searchTerm, setSearchTerm, clearSearch } = useSearchState('', 'tenants')

  const handleAddTenant = () => {
    console.log('Add tenant clicked')
    void navigate('/tenants/add')
  }

  // Get all tenants for client-side filtering
  const { tenants: allTenants = [], isLoading, error } = useTenantsTable({
    page: 1,
    limit: 1000, // Get all tenants for client-side filtering
    search: '',
  })

  // Client-side search filtering
  const filters = {} // No additional filters for now
  const { data: searchResults = [] } = useTenantSearch(
    allTenants,
    searchTerm,
    filters
  )

  // Use all tenants when no search term and no filters, otherwise use search results
  const hasActiveFilters = Object.values(filters).some(value => value !== null)
  const filteredTenants = (searchTerm.trim() || hasActiveFilters) ? searchResults : allTenants

  const handleSearchTenants = (term: string) => {
    console.log('Search tenants:', term)
    setSearchTerm(term)
  }

  const handleTenantView = (tenantId: string) => {
    console.log('View tenant:', tenantId)
    void navigate(`/tenants/${tenantId}`)
  }

  const handleTenantEdit = (tenantId: string) => {
    console.log('Edit tenant:', tenantId)
    void navigate(`/tenants/${tenantId}/edit`)
  }

  const handleTenantDelete = (tenantId: string) => {
    console.log('Delete tenant:', tenantId)
    // The actual deletion is handled by the TenantTable component
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
          searchTerm={searchTerm}
          onAdd={handleAddTenant}
          onSearch={handleSearchTenants}
          onClearSearch={clearSearch}
        />
      </Box>

      {/* Main layout with sidebar and content */}
      <Box sx={{ display: 'flex', flexGrow: 1, pt: { xs: '70px', md: '70px' } }}>
        <Sidebar />
        <Box
          component="main"
          id="main-content"
          tabIndex={-1}
          sx={{
            flexGrow: 1,
            p: { xs: 1, sm: 1.5, md: 2 }, // Reduced padding for more table width
            mt: 0,
          }}
        >
          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error instanceof Error
                ? error.message
                : 'Failed to load tenants. Please try again.'}
            </Alert>
          )}

          {/* Tenant Table */}
          <TenantTable
            tenants={filteredTenants}
            searchTerm={searchTerm}
            isLoading={isLoading}
            onTenantView={handleTenantView}
            onTenantEdit={handleTenantEdit}
            onTenantDelete={handleTenantDelete}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default Tenants
