import React from 'react'
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Button,
  IconButton,
  Switch,
  FormControlLabel,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import Card from './Card'
import type { Unit } from '../../services/property'

interface UnitManagementProps {
  units: Unit[]
  propertyType: string
  onAddUnit: () => void
  onRemoveUnit: (index: number) => void
  onInputChange: (field: string, value: string | boolean) => void
  textFieldStyles: object
}

const UnitManagement: React.FC<UnitManagementProps> = ({
  units,
  propertyType,
  onAddUnit,
  onRemoveUnit,
  onInputChange,
  textFieldStyles,
}) => {
  const theme = useTheme()

  // Helper function to determine if rental fields should be shown
  const shouldShowRentalFields = (status: string) => {
    return status === 'occupied' || status === 'pending'
  }

  // Unit status options
  const unitStatuses = [
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'off-market', label: 'Off Market' },
  ]

  // Unit parking options
  const unitParkingOptions = [
    { value: 'none', label: 'None' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'shared', label: 'Shared' },
    { value: 'garage', label: 'Garage' },
  ]

  // Lease type options
  const leaseTypes = [
    { value: 'month-to-month', label: 'Month-to-Month' },
    { value: 'fixed-term', label: 'Fixed Term' },
    { value: 'week-to-week', label: 'Week-to-Week' },
  ]

  // Only show if property type is apartment or duplex
  if (propertyType !== 'apartment' && propertyType !== 'duplex') {
    return null
  }

  return (
    <Card
      title="Units Management"
      subtitle={`Manage individual units for this ${propertyType}`}
      padding={{ xs: 3, sm: 4, md: 5 }}
      marginBottom={4}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Units ({units.length})
        </Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={onAddUnit}
          variant="outlined"
          sx={{
            borderColor: theme.palette.secondary.main,
            color: theme.palette.secondary.main,
            '&:hover': {
              borderColor: theme.palette.secondary.main,
              backgroundColor: `${theme.palette.secondary.main}10`,
            },
          }}
        >
          Add Unit
        </Button>
      </Box>

      {units.map((unit, index) => (
        <Box key={index} sx={{ mb: 4, p: 3, border: '1px solid #e0e3e7', borderRadius: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Unit {index + 1}
            </Typography>
            {units.length > 1 && (
              <IconButton
                onClick={() => onRemoveUnit(index)}
                size="small"
                sx={{ color: 'error.main' }}
              >
                <RemoveIcon />
              </IconButton>
            )}
          </Box>

          {/* Basic Unit Information */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {(propertyType === 'apartment' || propertyType === 'duplex') && (
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Unit Number"
                  value={unit.unitNumber}
                  onChange={(e) => onInputChange(`units.${index}.unitNumber`, e.target.value)}
                  placeholder={
                    propertyType === 'duplex' ? 'e.g., A, B, Upper, Lower' : 'e.g., 101, A, 1A'
                  }
                  required
                  variant="outlined"
                  sx={textFieldStyles}
                  slotProps={{
                    htmlInput: { maxLength: 20 },
                  }}
                />
              </Grid>
            )}

            <Grid
              size={{
                xs: 12,
                md: propertyType === 'apartment' || propertyType === 'duplex' ? 6 : 3,
              }}
            >
              <TextField
                fullWidth
                label="Bedrooms"
                type="number"
                value={unit.bedrooms}
                onChange={(e) => onInputChange(`units.${index}.bedrooms`, e.target.value)}
                placeholder="0"
                variant="outlined"
                sx={textFieldStyles}
                slotProps={{
                  htmlInput: { min: 0, max: 50 },
                }}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: propertyType === 'apartment' || propertyType === 'duplex' ? 6 : 3,
              }}
            >
              <TextField
                fullWidth
                label="Bathrooms"
                type="number"
                value={unit.bathrooms}
                onChange={(e) => onInputChange(`units.${index}.bathrooms`, e.target.value)}
                placeholder="0"
                variant="outlined"
                sx={textFieldStyles}
                slotProps={{
                  htmlInput: { min: 0, max: 50, step: 0.5 },
                }}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: propertyType === 'apartment' || propertyType === 'duplex' ? 6 : 3,
              }}
            >
              <TextField
                fullWidth
                label="Square Footage"
                type="number"
                value={unit.squareFootage}
                onChange={(e) => onInputChange(`units.${index}.squareFootage`, e.target.value)}
                placeholder="e.g., 800"
                variant="outlined"
                sx={textFieldStyles}
                slotProps={{
                  htmlInput: { min: 1, max: 10000 },
                }}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: propertyType === 'apartment' || propertyType === 'duplex' ? 6 : 3,
              }}
            >
              <TextField
                fullWidth
                select
                label="Status"
                value={unit.status}
                onChange={(e) => onInputChange(`units.${index}.status`, e.target.value)}
                variant="outlined"
                sx={textFieldStyles}
              >
                {unitStatuses.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          {/* Rental Information - only show when unit is occupied/pending */}
          {shouldShowRentalFields(unit.status) && (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Rental Information
              </Typography>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Monthly Rent"
                    type="number"
                    value={unit.monthlyRent}
                    onChange={(e) => onInputChange(`units.${index}.monthlyRent`, e.target.value)}
                    placeholder="e.g., 1200"
                    variant="outlined"
                    sx={textFieldStyles}
                    slotProps={{
                      htmlInput: { min: 0 },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Security Deposit"
                    type="number"
                    value={unit.securityDeposit}
                    onChange={(e) =>
                      onInputChange(`units.${index}.securityDeposit`, e.target.value)
                    }
                    placeholder="e.g., 1200"
                    variant="outlined"
                    sx={textFieldStyles}
                    slotProps={{
                      htmlInput: { min: 0 },
                    }}
                  />
                </Grid>
              </Grid>
            </>
          )}

          {/* Lease Information - only show when unit is occupied/pending */}
          {shouldShowRentalFields(unit.status) && (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Lease Information
              </Typography>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Lease Start Date"
                    type="date"
                    value={unit.occupancy?.leaseStart ?? ''}
                    onChange={(e) =>
                      onInputChange(`units.${index}.occupancy.leaseStart`, e.target.value)
                    }
                    variant="outlined"
                    sx={textFieldStyles}
                    slotProps={{
                      inputLabel: { shrink: true },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Lease End Date"
                    type="date"
                    value={unit.occupancy?.leaseEnd ?? ''}
                    onChange={(e) =>
                      onInputChange(`units.${index}.occupancy.leaseEnd`, e.target.value)
                    }
                    variant="outlined"
                    sx={textFieldStyles}
                    slotProps={{
                      inputLabel: { shrink: true },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label="Lease Type"
                    value={unit.occupancy?.leaseType ?? 'month-to-month'}
                    onChange={(e) =>
                      onInputChange(`units.${index}.occupancy.leaseType`, e.target.value)
                    }
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

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Rent Due Date"
                    type="number"
                    value={unit.occupancy?.rentDueDate ?? '1'}
                    onChange={(e) =>
                      onInputChange(`units.${index}.occupancy.rentDueDate`, e.target.value)
                    }
                    placeholder="1"
                    variant="outlined"
                    sx={textFieldStyles}
                    slotProps={{
                      htmlInput: { min: 1, max: 31 },
                    }}
                  />
                </Grid>
              </Grid>
            </>
          )}

          {/* Features */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Features
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                select
                label="Parking"
                value={unit.features.parking}
                onChange={(e) => onInputChange(`units.${index}.features.parking`, e.target.value)}
                variant="outlined"
                sx={textFieldStyles}
              >
                {unitParkingOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={unit.features.balcony}
                    onChange={(e) =>
                      onInputChange(`units.${index}.features.balcony`, e.target.checked)
                    }
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
                label="Has Balcony"
              />
            </Grid>
          </Grid>
        </Box>
      ))}
    </Card>
  )
}

export default UnitManagement
