import React from 'react'
import { Box, TextField, MenuItem, Typography, Switch, FormControlLabel } from '@mui/material'
import Grid from '@mui/material/Grid'
import { useTheme } from '@mui/material/styles'
import Card from '../basic/Card'

interface PropertyStatusOccupancyFormProps {
  formData: {
    status: string
    propertyType: string
    occupancy: {
      isOccupied: boolean
      leaseStart: string
      leaseEnd: string
      leaseType: string
      rentDueDate: string | number
    }
  }
  onInputChange: (field: string, value: string | boolean) => void
  textFieldStyles: object
}

const PropertyStatusOccupancyForm: React.FC<PropertyStatusOccupancyFormProps> = ({
  formData,
  onInputChange,
  textFieldStyles,
}) => {
  const theme = useTheme()

  // Helper function to determine if rental fields should be shown
  const shouldShowRentalFields = (status: string) => {
    return status === 'occupied' || status === 'pending'
  }

  const leaseTypes = [
    { value: 'month-to-month', label: 'Month-to-Month' },
    { value: 'fixed-term', label: 'Fixed Term' },
    { value: 'week-to-week', label: 'Week-to-Week' },
  ]

  // Only show for single-unit properties when occupied/pending
  if (
    formData.propertyType === 'apartment' ||
    formData.propertyType === 'duplex' ||
    !shouldShowRentalFields(formData.status)
  ) {
    return null
  }

  return (
    <Card padding={{ xs: 3, sm: 4, md: 5 }} marginBottom={4}>
      {/* Header with title and switch */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.25rem', sm: '1.35rem', md: '1.5rem' },
              letterSpacing: '0.02em',
              color: 'grey.900',
              mb: 0.5,
            }}
          >
            Property Status & Occupancy
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'grey.600',
              fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.95rem' },
            }}
          >
            Current status and occupancy information
          </Typography>
        </Box>
        {shouldShowRentalFields(formData.status) && (
          <FormControlLabel
            control={
              <Switch
                checked={formData.occupancy.isOccupied}
                onChange={(e) => onInputChange('occupancy.isOccupied', e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: theme.palette.secondary.main,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: theme.palette.secondary.main,
                  },
                }}
              />
            }
            label="Currently Occupied"
            labelPlacement="start"
            sx={{ m: 0 }}
          />
        )}
      </Box>

      {shouldShowRentalFields(formData.status) && formData.occupancy.isOccupied && (
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {/* Lease Start Date - Left Column */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Lease Start Date"
              type="date"
              value={formData.occupancy.leaseStart}
              onChange={(e) => onInputChange('occupancy.leaseStart', e.target.value)}
              variant="outlined"
              sx={textFieldStyles}
              slotProps={{
                inputLabel: { shrink: true },
              }}
            />
          </Grid>

          {/* Lease End Date - Right Column */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Lease End Date"
              type="date"
              value={formData.occupancy.leaseEnd}
              onChange={(e) => onInputChange('occupancy.leaseEnd', e.target.value)}
              variant="outlined"
              sx={textFieldStyles}
              slotProps={{
                inputLabel: { shrink: true },
              }}
            />
          </Grid>

          {/* Lease Type - Left Column */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              select
              label="Lease Type"
              value={formData.occupancy.leaseType}
              onChange={(e) => onInputChange('occupancy.leaseType', e.target.value)}
              variant="outlined"
              sx={textFieldStyles}
            >
              {leaseTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Rent Due Date - Right Column */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Rent Due Date"
              type="number"
              value={formData.occupancy.rentDueDate}
              onChange={(e) => onInputChange('occupancy.rentDueDate', e.target.value)}
              placeholder="1"
              variant="outlined"
              sx={textFieldStyles}
              slotProps={{
                htmlInput: { min: 1, max: 31 },
              }}
            />
          </Grid>
        </Grid>
      )}
    </Card>
  )
}

export default PropertyStatusOccupancyForm
