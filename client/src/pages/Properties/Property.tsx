import React, { useState, useEffect } from 'react'
import { Box, Typography, Alert } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/properties/Sidebar'
import Titlebar from '../../components/properties/Titlebar'
import PropertyCard from '../../components/properties/PropertyCard'
import ErrorBoundary from '../../components/ErrorBoundary'
import { Pagination, PropertyCardSkeletonGrid, SkipLink } from '../../components/common'
import { getAllProperties, deleteProperty } from '../../services/property'
import type { Property } from '../../services/property'

const PropertyDetails: React.FC = () => {
  const navigate = useNavigate()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const propertiesPerPage = 6 // 3 per row × 2 rows

  // Fetch properties on component mount
  useEffect(() => {
    void fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getAllProperties()

      if (response.properties) {
        setProperties(response.properties)
      } else if (response.data?.properties) {
        setProperties(response.data.properties)
      } else {
        setProperties([])
      }
    } catch (err) {
      console.error('Error fetching properties:', err)
      setError('Failed to load properties. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
    const deleteAsync = async () => {
      try {
        const response = await deleteProperty(propertyId)

        // Check if the API call was successful (including 204 No Content)
        if (response.success || response.status === 'success' || response === undefined) {
          // Remove property from state
          setProperties(prev => prev.filter(p => p._id !== propertyId))

          // Adjust current page if necessary
          const remainingProperties = properties.filter(p => p._id !== propertyId)
          const newTotalPages = Math.ceil(remainingProperties.length / propertiesPerPage)
          if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(newTotalPages)
          }

          console.log('Property deleted successfully from database')
        } else {
          throw new Error(response.message || 'Delete operation failed')
        }
      } catch (err) {
        console.error('Error deleting property:', err)

        // If we get a 404, the property might already be deleted - refresh the list
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosError = err as { response?: { status?: number } }
          if (axiosError.response?.status === 404) {
            // Property doesn't exist anymore, refresh the list
            console.log('Property not found, refreshing list...')
            await fetchProperties()
            return
          }
        }

        setError('Failed to delete property. Please try again.')

        // Clear error after 5 seconds
        setTimeout(() => setError(null), 5000)
      }
    }

    void deleteAsync()
  }

  // Filter properties based on search term
  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate pagination
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage)
  const startIndex = (currentPage - 1) * propertiesPerPage
  const currentProperties = filteredProperties.slice(startIndex, startIndex + propertiesPerPage)

  // Handle pagination change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Skip Links for Accessibility */}
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#properties-list">Skip to properties</SkipLink>

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
        <Box component="main" id="main-content" tabIndex={-1} sx={{ flexGrow: 1, p: 3 }}>
          {/* Properties content */}

          {/* Loading State */}
          {loading && (
            <PropertyCardSkeletonGrid count={propertiesPerPage} />
          )}

          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Properties Grid */}
          {!loading && !error && (
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
                      justifyContent: { xs: 'center', sm: 'flex-start' }
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

                  {/* Pagination */}
                  <Box sx={{ mt: 6, mb: 4 }}>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      showFirstLast={true}
                      size="large"
                    />
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
