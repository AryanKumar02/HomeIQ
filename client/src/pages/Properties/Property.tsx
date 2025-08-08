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
import { usePropertySearch, useSearchState } from '../../hooks/useSearch'

const PropertyDetails: React.FC = () => {
  const navigate = useNavigate()
  const { searchTerm, setSearchTerm, clearSearch } = useSearchState('', 'properties')
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
  const { data: allProperties = [], isLoading, error } = useProperties()
  const deletePropertyMutation = useDeleteProperty()

  // Enhanced search with React Query
  const { data: searchResults = [], isLoading: isSearching } = usePropertySearch(
    allProperties,
    searchTerm,
    filters
  )

  const handleAddProperty = () => {
    void navigate('/properties/add')
  }

  const handleSearchProperties = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1) // Reset to first page when searching
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
        // Calculate remaining properties after deletion (excluding the deleted one)
        const remainingCount = filteredProperties.length - 1
        const newTotalPages = Math.ceil(remainingCount / propertiesPerPage)

        // If current page becomes empty and there are other pages, go to the last page
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages)
        }
        // If we're deleting the last item and on page 1, stay on page 1
        else if (remainingCount === 0) {
          setCurrentPage(1)
        }

        // Property deleted successfully
      },
      onError: () => {
        // Handle delete error
      },
    })
  }

  // Use all properties when no search term and no filters, otherwise use search results
  const hasActiveFilters = filters.type !== null || filters.status !== null
  const hasActiveSearchOrFilters = searchTerm.trim() || hasActiveFilters

  // Handle loading and error states properly
  const filteredProperties = hasActiveSearchOrFilters
    ? isSearching
      ? []
      : searchResults // Show empty during search loading, results when done
    : allProperties // Show all properties when no search/filters

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

  // Reset page when filters change (search is handled in handleSearchProperties)
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

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
          searchTerm={searchTerm}
          onAdd={handleAddProperty}
          onSearch={handleSearchProperties}
          onClearSearch={clearSearch}
        />
        <PropertyFilters
          properties={allProperties}
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
            p: { xs: 1, sm: 1.5, md: 3 },
            px: { xs: 1, sm: 1.5, md: 4 }, // More horizontal padding on desktop
            mt: 2,
          }}
        >
          {/* Properties content */}

          {/* Loading State */}
          {(isLoading || (hasActiveSearchOrFilters && isSearching)) && (
            <PropertyCardSkeletonGrid count={propertiesPerPage} />
          )}

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
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(3, 1fr)',
                        md: 'repeat(3, 1fr)',
                      },
                      gap: { xs: 1.5, sm: 2, md: 2.5 },
                      mb: 4,
                      justifyItems: 'center',
                      px: { xs: 0, sm: 2, md: 3, lg: 4, xl: 6 }, // Progressive padding for different screen sizes
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
