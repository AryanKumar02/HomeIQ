import React from 'react'
import { TextField, Typography, IconButton, Box } from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material'
import Grid from '@mui/material/Grid'
import Card from '../basic/Card'

interface Vehicle {
  make?: string
  model?: string
  year?: number
  color?: string
  registrationNumber?: string
  parkingSpot?: string
}

interface VehiclesInfoFormProps {
  vehicles: Vehicle[]
  onInputChange: (field: string, value: string | number) => void
  onAddVehicle: () => void
  onRemoveVehicle: (index: number) => void
  textFieldStyles: object
}

const VehiclesInfoForm: React.FC<VehiclesInfoFormProps> = ({
  vehicles,
  onInputChange,
  onAddVehicle,
  onRemoveVehicle,
  textFieldStyles,
}) => {
  const currentYear = new Date().getFullYear()
  const yearOptions = []
  for (let year = currentYear + 2; year >= 1900; year--) {
    yearOptions.push({ value: year, label: year.toString() })
  }

  return (
    <Card padding={{ xs: 3, sm: 4, md: 5 }} marginBottom={4}>
      {/* Custom Title with Add Button */}
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}
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
            Vehicle Information
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'grey.600',
              fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.95rem' },
            }}
          >
            Details about vehicles that will be parked at the property
          </Typography>
        </Box>
        <IconButton
          onClick={onAddVehicle}
          sx={{
            backgroundColor: 'secondary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            ml: 2,
          }}
          size="small"
        >
          <AddIcon />
        </IconButton>
      </Box>

      {vehicles.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            color: 'grey.500',
          }}
        >
          <Typography variant="body2">
            No vehicles added yet. Click the + button to add vehicle information.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {vehicles.map((vehicle, index) => (
            <Box
              key={index}
              sx={{
                p: 3,
                border: '1px solid',
                borderColor: 'grey.300',
                borderRadius: 2,
                backgroundColor: 'grey.50',
                position: 'relative',
              }}
            >
              {/* Remove Button */}
              <IconButton
                onClick={() => onRemoveVehicle(index)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'error.light',
                    color: 'white',
                  },
                }}
                size="small"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>

              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: 'grey.800',
                }}
              >
                Vehicle #{index + 1}
              </Typography>

              <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                {/* Make - Left Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Make"
                    value={vehicle.make || ''}
                    onChange={(e) => onInputChange(`vehicles.${index}.make`, e.target.value)}
                    placeholder="e.g., Toyota, BMW, Ford"
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* Model - Right Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Model"
                    value={vehicle.model || ''}
                    onChange={(e) => onInputChange(`vehicles.${index}.model`, e.target.value)}
                    placeholder="e.g., Corolla, 3 Series, Focus"
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* Year - Left Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Year"
                    value={vehicle.year || ''}
                    onChange={(e) =>
                      onInputChange(
                        `vehicles.${index}.year`,
                        parseFloat(e.target.value) || currentYear
                      )
                    }
                    placeholder={`e.g., ${currentYear}`}
                    variant="outlined"
                    inputProps={{
                      min: 1900,
                      max: currentYear + 2,
                    }}
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* Color - Right Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Color"
                    value={vehicle.color || ''}
                    onChange={(e) => onInputChange(`vehicles.${index}.color`, e.target.value)}
                    placeholder="e.g., Blue, Red, Silver"
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* Registration Number - Left Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Registration Number"
                    value={vehicle.registrationNumber || ''}
                    onChange={(e) =>
                      onInputChange(
                        `vehicles.${index}.registrationNumber`,
                        e.target.value.toUpperCase()
                      )
                    }
                    placeholder="e.g., AB12 CDE"
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* Parking Spot - Right Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Assigned Parking Spot"
                    value={vehicle.parkingSpot || ''}
                    onChange={(e) => onInputChange(`vehicles.${index}.parkingSpot`, e.target.value)}
                    placeholder="e.g., Space 12, Garage A, Street parking"
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>
              </Grid>

              {/* Vehicle Summary */}
              {vehicle.make && vehicle.model && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    backgroundColor: 'primary.50',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'primary.200',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: 'primary.800',
                    }}
                  >
                    {vehicle.year && `${vehicle.year} `}
                    {vehicle.color && `${vehicle.color} `}
                    {vehicle.make} {vehicle.model}
                    {vehicle.registrationNumber && ` - ${vehicle.registrationNumber}`}
                    {vehicle.parkingSpot && ` (${vehicle.parkingSpot})`}
                  </Typography>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Card>
  )
}

export default VehiclesInfoForm
