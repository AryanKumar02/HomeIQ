import React from 'react'
import { Box, Chip, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import type { TenantTableData } from '../../types/tenantTable'
import { getDaysUntilLeaseEnd } from '../../utils/dateUtils'
import MobileFilters from './MobileFilters'

interface TenantFiltersProps {
  tenants: TenantTableData[]
  selectedFilters: {
    status: string | null
    property: string | null
    leaseExpiry: string | null
  }
  onFilterChange: (filterType: 'status' | 'property' | 'leaseExpiry', value: string | null) => void
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
}

const TenantFilters: React.FC<TenantFiltersProps> = ({
  tenants,
  selectedFilters,
  onFilterChange,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Calculate counts for tenant statuses
  const statusCounts = tenants.reduce(
    (acc, tenant) => {
      acc[tenant.status] = (acc[tenant.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Calculate counts for property assignments
  const propertyCounts = tenants.reduce(
    (acc, tenant) => {
      const isAssigned = tenant.property !== 'No property assigned'
      acc[isAssigned ? 'assigned' : 'unassigned'] =
        (acc[isAssigned ? 'assigned' : 'unassigned'] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Calculate counts for lease expiry
  const leaseExpiryCounts = tenants.reduce(
    (acc, tenant) => {
      const daysUntilEnd = getDaysUntilLeaseEnd(tenant.leaseEnds)
      if (daysUntilEnd < 0) {
        acc['expired'] = (acc['expired'] || 0) + 1
      } else if (daysUntilEnd <= 30) {
        acc['expiring-soon'] = (acc['expiring-soon'] || 0) + 1
      } else {
        acc['long-term'] = (acc['long-term'] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>
  )

  // Tenant status options
  const tenantStatuses = [
    { value: 'approved', label: 'Approved' },
    { value: 'pending', label: 'Pending' },
    { value: 'under-review', label: 'Under Review' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'active', label: 'Active' },
    { value: 'expiring', label: 'Expiring' },
  ]

  // Property assignment options
  const propertyOptions = [
    { value: 'assigned', label: 'Assigned' },
    { value: 'unassigned', label: 'Unassigned' },
  ]

  // Lease expiry options
  const leaseExpiryOptions = [
    { value: 'expiring-soon', label: 'Expiring Soon' },
    { value: 'expired', label: 'Expired' },
    { value: 'long-term', label: 'Long Term' },
  ]

  const chipStyles = {
    fontWeight: 600,
    fontSize: isMobile ? '0.75rem' : '0.85rem',
    height: isMobile ? '28px' : '32px',
    '&:hover': {
      backgroundColor: `${theme.palette.secondary.main}15`,
    },
    '& .MuiChip-label': {
      px: isMobile ? 1 : 1.5,
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
  const hasActiveFilters =
    selectedFilters.status !== null ||
    selectedFilters.property !== null ||
    selectedFilters.leaseExpiry !== null

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
        <MobileFilters
          tenants={tenants}
          selectedFilters={selectedFilters}
          onFilterChange={onFilterChange}
        />

        {/* Mobile Pagination */}
        {currentPage !== undefined &&
          totalPages !== undefined &&
          onPageChange &&
          totalPages > 1 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Chip
                label="Previous"
                clickable={currentPage > 1}
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                variant="outlined"
                size="small"
                sx={{
                  ...chipStyles,
                  opacity: currentPage > 1 ? 1 : 0.5,
                  cursor: currentPage > 1 ? 'pointer' : 'not-allowed',
                }}
              />
              <Box
                sx={{
                  px: 1,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {currentPage} of {totalPages}
              </Box>
              <Chip
                label="Next"
                clickable={currentPage < totalPages}
                onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                variant="outlined"
                size="small"
                sx={{
                  ...chipStyles,
                  opacity: currentPage < totalPages ? 1 : 0.5,
                  cursor: currentPage < totalPages ? 'pointer' : 'not-allowed',
                }}
              />
            </Box>
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
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            alignItems: 'center',
          }}
        >
          {/* All Tenants - First */}
          <Chip
            label={`All Tenants (${tenants.length})`}
            clickable
            onClick={() => {
              onFilterChange('status', null)
              onFilterChange('property', null)
              onFilterChange('leaseExpiry', null)
            }}
            variant={!hasActiveFilters ? 'filled' : 'outlined'}
            sx={!hasActiveFilters ? selectedChipStyles : chipStyles}
          />

          {/* Tenant Statuses */}
          {tenantStatuses.map((status) => {
            const count = statusCounts[status.value] || 0
            if (count === 0) return null

            return (
              <Chip
                key={status.value}
                label={`${status.label} (${count})`}
                clickable
                onClick={() => {
                  onFilterChange('status', status.value)
                  onFilterChange('property', null) // Clear other filters when selecting status
                  onFilterChange('leaseExpiry', null)
                }}
                variant={selectedFilters.status === status.value ? 'filled' : 'outlined'}
                sx={selectedFilters.status === status.value ? selectedChipStyles : chipStyles}
              />
            )
          })}

          {/* Property Assignment */}
          {propertyOptions.map((property) => {
            const count = propertyCounts[property.value] || 0
            if (count === 0) return null

            return (
              <Chip
                key={property.value}
                label={`${property.label} (${count})`}
                clickable
                onClick={() => {
                  onFilterChange('property', property.value)
                  onFilterChange('status', null) // Clear other filters when selecting property
                  onFilterChange('leaseExpiry', null)
                }}
                variant={selectedFilters.property === property.value ? 'filled' : 'outlined'}
                sx={selectedFilters.property === property.value ? selectedChipStyles : chipStyles}
              />
            )
          })}

          {/* Lease Expiry */}
          {leaseExpiryOptions.map((expiry) => {
            const count = leaseExpiryCounts[expiry.value] || 0
            if (count === 0) return null

            return (
              <Chip
                key={expiry.value}
                label={`${expiry.label} (${count})`}
                clickable
                onClick={() => {
                  onFilterChange('leaseExpiry', expiry.value)
                  onFilterChange('status', null) // Clear other filters when selecting lease expiry
                  onFilterChange('property', null)
                }}
                variant={selectedFilters.leaseExpiry === expiry.value ? 'filled' : 'outlined'}
                sx={selectedFilters.leaseExpiry === expiry.value ? selectedChipStyles : chipStyles}
              />
            )
          })}
        </Box>

        {/* Page Navigation on the right - using simple pagination since we don't have PageNavigation component */}
        {currentPage !== undefined &&
          totalPages !== undefined &&
          onPageChange &&
          totalPages > 1 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Chip
                label="Previous"
                clickable={currentPage > 1}
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                variant="outlined"
                size="small"
                sx={{
                  ...chipStyles,
                  opacity: currentPage > 1 ? 1 : 0.5,
                  cursor: currentPage > 1 ? 'pointer' : 'not-allowed',
                }}
              />
              <Box
                sx={{
                  px: isMobile ? 0.75 : 1,
                  fontSize: isMobile ? '0.75rem' : '0.85rem',
                  fontWeight: 600,
                }}
              >
                {currentPage} of {totalPages}
              </Box>
              <Chip
                label="Next"
                clickable={currentPage < totalPages}
                onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                variant="outlined"
                size="small"
                sx={{
                  ...chipStyles,
                  opacity: currentPage < totalPages ? 1 : 0.5,
                  cursor: currentPage < totalPages ? 'pointer' : 'not-allowed',
                }}
              />
            </Box>
          )}
      </Box>
    </Box>
  )
}

export default TenantFilters
