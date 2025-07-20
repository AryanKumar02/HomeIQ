import React, { useState } from 'react'
import { Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/common/Sidebar'
import Titlebar from '../../components/basic/Titlebar'
import { SkipLink } from '../../components/common'
import { TenantTable, TenantFilters } from '../../components/TenantTable'
import { useTenantsTable } from '../../hooks/useTenantsTable'

const Tenants: React.FC = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<{
    status: string | null
    property: string | null
    leaseExpiry: string | null
  }>({
    status: null,
    property: null,
    leaseExpiry: null,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const tenantsPerPage = 10

  // Get tenant data for filters
  const { tenants: allTenants } = useTenantsTable({
    page: 1,
    limit: 1000, // Get all tenants for filtering
    search: '',
  })

  // Calculate pagination for filtered tenants
  const filteredTenants = allTenants.filter(tenant => {
    // Search filter
    const matchesSearch = !searchTerm || 
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.property.toLowerCase().includes(searchTerm.toLowerCase())

    // Status filter
    const matchesStatus = !filters.status || tenant.status === filters.status

    // Property filter
    const matchesProperty = !filters.property || 
      (filters.property === 'assigned' && tenant.property !== 'No property assigned') ||
      (filters.property === 'unassigned' && tenant.property === 'No property assigned')

    // Lease expiry filter (simplified for now)
    const matchesLeaseExpiry = !filters.leaseExpiry // TODO: implement lease expiry logic

    return matchesSearch && matchesStatus && matchesProperty && matchesLeaseExpiry
  })

  const totalPages = Math.ceil(filteredTenants.length / tenantsPerPage)

  const handleAddTenant = () => {
    console.log('Add tenant clicked')
    void navigate('/tenants/add')
  }

  const handleSearchTenants = (searchTerm: string) => {
    console.log('Search tenants:', searchTerm)
    setSearchTerm(searchTerm)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleFilterChange = (filterType: 'status' | 'property' | 'leaseExpiry', value: string | null) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
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
          onAdd={handleAddTenant}
          onSearch={handleSearchTenants}
        />
        <TenantFilters
          tenants={allTenants}
          selectedFilters={filters}
          onFilterChange={handleFilterChange}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </Box>

      {/* Main layout with sidebar and content */}
      <Box sx={{ display: 'flex', flexGrow: 1, pt: { xs: '120px', md: '120px' } }}>
        <Sidebar />
        <Box 
          component="main" 
          id="main-content" 
          tabIndex={-1} 
          sx={{ 
            flexGrow: 1, 
            p: { xs: 1, sm: 1.5, md: 2 }, // Reduced padding for more table width
            mt: 2 
          }}
        >
          {/* Tenant Table */}
          <TenantTable
            searchTerm="" // Pass empty since filtering is done at page level
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
