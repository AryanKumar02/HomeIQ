import React, { useState } from 'react'
import { Box, Chip, Dialog, IconButton, Typography, Slide, Divider, Button } from '@mui/material'
import type { TransitionProps } from '@mui/material/transitions'
import { useTheme } from '@mui/material/styles'
import FilterListIcon from '@mui/icons-material/FilterList'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import type { TenantTableData } from '../../types/tenantTable'
import { getDaysUntilLeaseEnd } from '../../utils/dateUtils'

interface MobileFiltersProps {
  tenants: TenantTableData[]
  selectedFilters: {
    status: string | null
    property: string | null
    leaseExpiry: string | null
  }
  onFilterChange: (filterType: 'status' | 'property' | 'leaseExpiry', value: string | null) => void
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />
})

const MobileFilters: React.FC<MobileFiltersProps> = ({
  tenants,
  selectedFilters,
  onFilterChange,
}) => {
  const theme = useTheme()
  const [open, setOpen] = useState(false)

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

  const tenantStatuses = [
    { value: 'approved', label: 'Approved' },
    { value: 'pending', label: 'Pending' },
    { value: 'under-review', label: 'Under Review' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'active', label: 'Active' },
    { value: 'expiring', label: 'Expiring' },
  ]

  const propertyOptions = [
    { value: 'assigned', label: 'Assigned' },
    { value: 'unassigned', label: 'Unassigned' },
  ]

  const leaseExpiryOptions = [
    { value: 'expiring-soon', label: 'Expiring Soon' },
    { value: 'expired', label: 'Expired' },
    { value: 'long-term', label: 'Long Term' },
  ]

  // Check if any filters are active
  const hasActiveFilters =
    selectedFilters.status !== null ||
    selectedFilters.property !== null ||
    selectedFilters.leaseExpiry !== null

  const activeFilterCount = [
    selectedFilters.status,
    selectedFilters.property,
    selectedFilters.leaseExpiry,
  ].filter(Boolean).length

  const handleClearAll = () => {
    onFilterChange('status', null)
    onFilterChange('property', null)
    onFilterChange('leaseExpiry', null)
  }

  const FilterSection = ({
    title,
    options,
    counts,
    selectedValue,
    filterType,
  }: {
    title: string
    options: { value: string; label: string }[]
    counts: Record<string, number>
    selectedValue: string | null
    filterType: 'status' | 'property' | 'leaseExpiry'
  }) => (
    <Box sx={{ mb: 3 }}>
      <Typography
        variant="subtitle2"
        sx={{
          mb: 2,
          fontWeight: 600,
          color: theme.palette.text.primary,
          fontSize: '0.9rem',
        }}
      >
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {options.map((option) => {
          const count = counts[option.value] || 0
          if (count === 0) return null

          const isSelected = selectedValue === option.value

          return (
            <Chip
              key={option.value}
              label={`${option.label} (${count})`}
              clickable
              onClick={() => {
                onFilterChange(filterType, isSelected ? null : option.value)
              }}
              variant={isSelected ? 'filled' : 'outlined'}
              icon={isSelected ? <CheckIcon sx={{ fontSize: '0.8rem' }} /> : undefined}
              sx={{
                backgroundColor: isSelected ? theme.palette.secondary.main : 'transparent',
                color: isSelected ? 'white' : theme.palette.text.primary,
                borderColor: isSelected ? theme.palette.secondary.main : theme.palette.divider,
                fontSize: '0.8rem',
                height: '36px',
                '&:hover': {
                  backgroundColor: isSelected
                    ? theme.palette.secondary.dark
                    : `${theme.palette.secondary.main}15`,
                },
                '& .MuiChip-label': {
                  px: 1.5,
                },
              }}
            />
          )
        })}
      </Box>
    </Box>
  )

  return (
    <>
      {/* Filter Trigger Button */}
      <Box sx={{ position: 'relative' }}>
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            backgroundColor: hasActiveFilters ? theme.palette.secondary.main : 'transparent',
            color: hasActiveFilters ? 'white' : theme.palette.text.primary,
            border: `1px solid ${hasActiveFilters ? theme.palette.secondary.main : theme.palette.divider}`,
            borderRadius: 2,
            px: 2,
            py: 1,
            '&:hover': {
              backgroundColor: hasActiveFilters
                ? theme.palette.secondary.dark
                : `${theme.palette.secondary.main}15`,
            },
          }}
        >
          <FilterListIcon sx={{ fontSize: '1.1rem', mr: 1 }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Filter
          </Typography>
        </IconButton>

        {/* Active Filter Count Badge */}
        {activeFilterCount > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: -4,
              right: -4,
              backgroundColor: theme.palette.error.main,
              color: 'white',
              borderRadius: '50%',
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            {activeFilterCount}
          </Box>
        )}
      </Box>

      {/* Bottom Sheet Modal */}
      <Dialog
        fullScreen
        open={open}
        onClose={() => setOpen(false)}
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.default,
            backgroundImage: 'none',
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            backgroundColor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filter Tenants
          </Typography>
          <IconButton onClick={() => setOpen(false)} sx={{ p: 1 }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Filter Content */}
        <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
          <FilterSection
            title="Tenant Status"
            options={tenantStatuses}
            counts={statusCounts}
            selectedValue={selectedFilters.status}
            filterType="status"
          />

          <Divider sx={{ my: 2 }} />

          <FilterSection
            title="Property Assignment"
            options={propertyOptions}
            counts={propertyCounts}
            selectedValue={selectedFilters.property}
            filterType="property"
          />

          <Divider sx={{ my: 2 }} />

          <FilterSection
            title="Lease Expiry"
            options={leaseExpiryOptions}
            counts={leaseExpiryCounts}
            selectedValue={selectedFilters.leaseExpiry}
            filterType="leaseExpiry"
          />
        </Box>

        {/* Footer Actions */}
        <Box
          sx={{
            p: 2,
            backgroundColor: theme.palette.background.paper,
            borderTop: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            onClick={handleClearAll}
            disabled={!hasActiveFilters}
            sx={{ flex: 1 }}
          >
            Clear All
          </Button>
          <Button variant="contained" onClick={() => setOpen(false)} sx={{ flex: 1 }}>
            Apply Filters
          </Button>
        </Box>
      </Dialog>
    </>
  )
}

export default MobileFilters
