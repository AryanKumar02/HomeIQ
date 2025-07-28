import React from 'react'
import { Box, Chip, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import type { Property } from '../../types/property'
import PageNavigation from './PageNavigation'
import MobilePropertyFilters from './MobilePropertyFilters'

interface PropertyFiltersProps {
  properties: Property[]
  selectedFilters: {
    type: string | null
    status: string | null
  }
  onFilterChange: (filterType: 'type' | 'status', value: string | null) => void
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
}

const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  properties,
  selectedFilters,
  onFilterChange,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Calculate counts for property types
  const typeCounts = properties.reduce(
    (acc, property) => {
      acc[property.propertyType] = (acc[property.propertyType] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Calculate counts for property statuses
  const statusCounts = properties.reduce(
    (acc, property) => {
      acc[property.status] = (acc[property.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Property type options
  const propertyTypes = [
    { value: 'house', label: 'Houses' },
    { value: 'apartment', label: 'Apartments' },
    { value: 'condo', label: 'Condos' },
    { value: 'townhouse', label: 'Townhouses' },
    { value: 'duplex', label: 'Duplexes' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'land', label: 'Land' },
    { value: 'other', label: 'Other' },
  ]

  // Property status options
  const propertyStatuses = [
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'off-market', label: 'Off Market' },
    { value: 'pending', label: 'Pending' },
  ]

  const chipStyles = {
    fontWeight: 600,
    fontSize: '0.85rem',
    height: '32px',
    '&:hover': {
      backgroundColor: `${theme.palette.secondary.main}15`,
    },
    '& .MuiChip-label': {
      px: 1.5,
    },
  }

  const selectedChipStyles = {
    ...chipStyles,
    backgroundColor: theme.palette.secondary.main,
    color: 'white',
    '&:hover': {
      backgroundColor: theme.palette.secondary.dark,
    },
    '&:focus': {
      backgroundColor: theme.palette.secondary.dark,
    },
  }

  // Check if any filters are active
  const hasActiveFilters = selectedFilters.type !== null || selectedFilters.status !== null

  // Use mobile component on mobile devices
  if (isMobile) {
    return (
      <Box
        sx={{
          px: 2,
          py: 1.5,
          backgroundColor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <MobilePropertyFilters
          properties={properties}
          selectedFilters={selectedFilters}
          onFilterChange={onFilterChange}
        />

        {/* Mobile Pagination */}
        {currentPage !== undefined && totalPages !== undefined && onPageChange && (
          <PageNavigation
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </Box>
    )
  }

  // Desktop version
  return (
    <Box
      sx={{
        px: 3,
        py: 2,
        backgroundColor: 'background.paper',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          {/* All Properties - First */}
          <Chip
            label={`All Properties (${properties.length})`}
            clickable
            onClick={() => {
              onFilterChange('type', null)
              onFilterChange('status', null)
            }}
            variant={!hasActiveFilters ? 'filled' : 'outlined'}
            sx={!hasActiveFilters ? selectedChipStyles : chipStyles}
          />

          {/* Property Types */}
          {propertyTypes.map((type) => {
            const count = typeCounts[type.value] || 0
            if (count === 0) return null

            return (
              <Chip
                key={type.value}
                label={`${type.label} (${count})`}
                clickable
                onClick={() => {
                  onFilterChange('type', type.value)
                  onFilterChange('status', null) // Clear status filter when selecting type
                }}
                variant={selectedFilters.type === type.value ? 'filled' : 'outlined'}
                sx={selectedFilters.type === type.value ? selectedChipStyles : chipStyles}
              />
            )
          })}

          {/* Property Status */}
          {propertyStatuses.map((status) => {
            const count = statusCounts[status.value] || 0
            if (count === 0) return null

            return (
              <Chip
                key={status.value}
                label={`${status.label} (${count})`}
                clickable
                onClick={() => {
                  onFilterChange('status', status.value)
                  onFilterChange('type', null) // Clear type filter when selecting status
                }}
                variant={selectedFilters.status === status.value ? 'filled' : 'outlined'}
                sx={selectedFilters.status === status.value ? selectedChipStyles : chipStyles}
              />
            )
          })}
        </Box>

        {/* Page Navigation on the right */}
        {currentPage !== undefined && totalPages !== undefined && onPageChange && (
          <PageNavigation
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </Box>
    </Box>
  )
}

export default PropertyFilters
