import React, { useState, useEffect } from 'react'
import { Box, Typography, Alert } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/common/Sidebar'
import Titlebar from '../../components/basic/Titlebar'
import PropertyCard from '../../components/properties/PropertyCard'
import PropertyFilters from '../../components/properties/PropertyFilters'
import ErrorBoundary from '../../components/common/ErrorBoundary'
import { PropertyCardSkeletonGrid, SkipLink } from '../../components/common'
import { useProperties, useDeleteProperty } from '../../hooks/useProperties'

const PropertyDetails: React.FC = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<{
    type: string | null
    status: string | null
  }>({
    type: null,
    status: null,
  })
  const propertiesPerPage = 6 // 3 per row × 2 rows

  // Use React Query hooks
  const { data: properties = [], isLoading, error } = useProperties()
  const deletePropertyMutation = useDeleteProperty()

  const handleAddProperty = () => {
    console.log('Add property clicked')
    void navigate('/properties/add')
  }

  const handleSearchProperties = (searchTerm: string) => {
    console.log('Search properties:', searchTerm)
    setSearchTerm(searchTerm)
  }

  const handleViewDetails = (propertyId: string) => {
    void navigate(`/properties/${propertyId}`)
  }

  const handleEdit = (propertyId: string) => {
    void navigate(`/properties/edit/${propertyId}`)
  }

  const handleDelete = (propertyId: string) => {
    deletePropertyMutation.mutate(propertyId, {
      onSuccess: () => {
        // Adjust current page if necessary
        const remainingProperties = properties.filter((p) => p._id !== propertyId)
        const newTotalPages = Math.ceil(remainingProperties.length / propertiesPerPage)
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages)
        }
        console.log('Property deleted successfully')
      },
      onError: (error) => {
        console.error('Error deleting property:', error)
      },
    })
  }

  // Filter properties based on search term and filters
  const filteredProperties = properties.filter((property) => {
    // Search filter
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.city.toLowerCase().includes(searchTerm.toLowerCase())

    // Type filter
    const matchesType = filters.type === null || property.propertyType === filters.type

    // Status filter
    const matchesStatus = filters.status === null || property.status === filters.status

    return matchesSearch && matchesType && matchesStatus
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage)
  const startIndex = (currentPage - 1) * propertiesPerPage
  const currentProperties = filteredProperties.slice(startIndex, startIndex + propertiesPerPage)

  // Handle pagination change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle filter changes
  const handleFilterChange = (filterType: 'type' | 'status', value: string | null) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filters])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Skip Links for Accessibility */}
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#properties-list">Skip to properties</SkipLink>

      {/* Titlebar and Filters at the top */}
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
        <PropertyFilters
          properties={properties}
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
        <Box component="main" id="main-content" tabIndex={-1} sx={{ flexGrow: 1, p: 3, mt: 2 }}>
          {/* Properties content */}

          {/* Loading State */}
          {isLoading && <PropertyCardSkeletonGrid count={propertiesPerPage} />}

          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error instanceof Error
                ? error.message
                : 'Failed to load properties. Please try again.'}
            </Alert>
          )}

          {/* Delete Error State */}
          {deletePropertyMutation.isError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {deletePropertyMutation.error instanceof Error
                ? deletePropertyMutation.error.message
                : 'Failed to delete property. Please try again.'}
            </Alert>
          )}

          {/* Properties Grid */}
          {!isLoading && !error && (
            <>
              {filteredProperties.length === 0 ? (
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
                    {searchTerm ? 'No properties found' : 'No properties yet'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.500' }}>
                    {searchTerm
                      ? 'Try adjusting your search terms'
                      : 'Get started by adding your first property'}
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* Properties Grid - Flexbox layout */}
                  <Box
                    component="section"
                    id="properties-list"
                    aria-label="Properties list"
                    tabIndex={-1}
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 3,
                      mb: 4,
                      justifyContent: { xs: 'center', sm: 'flex-start' },
                    }}
                  >
                    {currentProperties.map((property) => (
                      <ErrorBoundary key={property._id}>
                        <PropertyCard
                          property={property}
                          onViewDetails={handleViewDetails}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      </ErrorBoundary>
                    ))}
                  </Box>
                </>
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default PropertyDetails
