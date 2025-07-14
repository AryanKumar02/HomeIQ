import React from 'react'
import { TextField, MenuItem, Typography, IconButton, Box } from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material'
import Grid from '@mui/material/Grid'
import Card from '../basic/Card'

interface Pet {
  name: string
  type: string
  breed?: string
  age?: number
  weight?: number
  weightUnit?: string
  color?: string
  isServiceAnimal?: boolean
  vaccinationStatus?: string
  lastVetVisit?: string
  specialNeeds?: string
}

interface PetsInfoFormProps {
  pets: Pet[]
  onInputChange: (field: string, value: string | boolean | number) => void
  onAddPet: () => void
  onRemovePet: (index: number) => void
  textFieldStyles: object
}

const PetsInfoForm: React.FC<PetsInfoFormProps> = ({
  pets,
  onInputChange,
  onAddPet,
  onRemovePet,
  textFieldStyles,
}) => {
  const petTypeOptions = [
    { value: 'dog', label: 'Dog' },
    { value: 'cat', label: 'Cat' },
    { value: 'bird', label: 'Bird' },
    { value: 'fish', label: 'Fish' },
    { value: 'rabbit', label: 'Rabbit' },
    { value: 'hamster', label: 'Hamster' },
    { value: 'reptile', label: 'Reptile' },
    { value: 'other', label: 'Other' },
  ]

  const vaccinationStatusOptions = [
    { value: 'up-to-date', label: 'Up to Date' },
    { value: 'expired', label: 'Expired' },
    { value: 'unknown', label: 'Unknown' },
  ]

  const weightUnitOptions = [
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'lbs', label: 'Pounds (lbs)' },
  ]

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
            Pet Information
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'grey.600',
              fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.95rem' },
            }}
          >
            Details about pets that will be living in the property
          </Typography>
        </Box>
        <IconButton
          onClick={onAddPet}
          sx={{
            backgroundColor: 'primary.main',
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

      {pets.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            color: 'grey.500',
          }}
        >
          <Typography variant="body2">
            No pets added yet. Click the + button to add pet information.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {pets.map((pet, index) => (
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
                onClick={() => onRemovePet(index)}
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
                Pet #{index + 1}
              </Typography>

              <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                {/* Pet Name - Left Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Pet Name"
                    value={pet.name}
                    onChange={(e) => onInputChange(`pets.${index}.name`, e.target.value)}
                    placeholder="e.g., Max, Fluffy"
                    required
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* Pet Type - Right Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label="Pet Type"
                    value={pet.type}
                    onChange={(e) => onInputChange(`pets.${index}.type`, e.target.value)}
                    required
                    variant="outlined"
                    sx={textFieldStyles}
                  >
                    {petTypeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Breed - Left Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Breed"
                    value={pet.breed || ''}
                    onChange={(e) => onInputChange(`pets.${index}.breed`, e.target.value)}
                    placeholder="e.g., Golden Retriever, Tabby"
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* Age - Right Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Age (years)"
                    value={pet.age || 0}
                    onChange={(e) =>
                      onInputChange(`pets.${index}.age`, parseFloat(e.target.value) || 0)
                    }
                    placeholder="e.g., 3"
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* Weight - Left Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Weight"
                    value={pet.weight || 0}
                    onChange={(e) =>
                      onInputChange(`pets.${index}.weight`, parseFloat(e.target.value) || 0)
                    }
                    placeholder="e.g., 25"
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* Weight Unit - Right Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label="Weight Unit"
                    value={pet.weightUnit || 'kg'}
                    onChange={(e) => onInputChange(`pets.${index}.weightUnit`, e.target.value)}
                    variant="outlined"
                    sx={textFieldStyles}
                  >
                    {weightUnitOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Color - Left Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Color/Markings"
                    value={pet.color || ''}
                    onChange={(e) => onInputChange(`pets.${index}.color`, e.target.value)}
                    placeholder="e.g., Brown, Black and white"
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* Service Animal - Right Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label="Service Animal"
                    value={pet.isServiceAnimal ? 'yes' : 'no'}
                    onChange={(e) =>
                      onInputChange(`pets.${index}.isServiceAnimal`, e.target.value === 'yes')
                    }
                    variant="outlined"
                    sx={textFieldStyles}
                  >
                    <MenuItem value="no">No</MenuItem>
                    <MenuItem value="yes">Yes</MenuItem>
                  </TextField>
                </Grid>

                {/* Vaccination Status - Left Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label="Vaccination Status"
                    value={pet.vaccinationStatus || 'unknown'}
                    onChange={(e) =>
                      onInputChange(`pets.${index}.vaccinationStatus`, e.target.value)
                    }
                    variant="outlined"
                    sx={textFieldStyles}
                  >
                    {vaccinationStatusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Last Vet Visit - Right Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Last Vet Visit"
                    value={pet.lastVetVisit || ''}
                    onChange={(e) => onInputChange(`pets.${index}.lastVetVisit`, e.target.value)}
                    variant="outlined"
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* Special Needs - Full Width */}
                <Grid size={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Special Needs/Medical Conditions"
                    value={pet.specialNeeds || ''}
                    onChange={(e) => onInputChange(`pets.${index}.specialNeeds`, e.target.value)}
                    placeholder="Any special dietary requirements, medications, or medical conditions"
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>
              </Grid>
            </Box>
          ))}
        </Box>
      )}
    </Card>
  )
}

export default PetsInfoForm
