import React from 'react'
import { TextField, MenuItem, Typography, Divider, Switch, FormControlLabel } from '@mui/material'
import Grid from '@mui/material/Grid'
import { useTheme } from '@mui/material/styles'
import Card from './Card'

interface PropertyFeaturesFormProps {
  formData: {
    propertyType: string
    features: {
      parking: string
      airConditioning: boolean
      heating: string
      laundry: string
      petPolicy: {
        allowed: boolean
        types: string[]
        maxPets: string | number
      }
    }
  }
  onInputChange: (field: string, value: string | boolean | string[]) => void
  textFieldStyles: object
}

const PropertyFeaturesForm: React.FC<PropertyFeaturesFormProps> = ({
  formData,
  onInputChange,
  textFieldStyles,
}) => {
  const theme = useTheme()

  return (
    <Card
      title="Property Features"
      subtitle={
        formData.propertyType === 'apartment' || formData.propertyType === 'duplex'
          ? 'Building-wide features and amenities'
          : 'Property features and amenities'
      }
      padding={{ xs: 3, sm: 4, md: 5 }}
      marginBottom={4}
    >
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {/* Parking - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            select
            label={
              formData.propertyType === 'apartment' || formData.propertyType === 'duplex'
                ? 'Building Parking'
                : 'Parking'
            }
            value={formData.features.parking}
            onChange={(e) => onInputChange('features.parking', e.target.value)}
            variant="outlined"
            sx={textFieldStyles}
          >
            <MenuItem value="none">None</MenuItem>
            <MenuItem value="street">Street Parking</MenuItem>
            <MenuItem value="driveway">Driveway</MenuItem>
            <MenuItem value="garage">Garage</MenuItem>
            <MenuItem value="covered">Covered Parking</MenuItem>
          </TextField>
        </Grid>

        {/* Air Conditioning - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.features.airConditioning}
                onChange={(e) => onInputChange('features.airConditioning', e.target.checked)}
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
            label="Air Conditioning"
            sx={{ mt: 2 }}
          />
        </Grid>

        {/* Heating - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            select
            label="Heating"
            value={formData.features.heating}
            onChange={(e) => onInputChange('features.heating', e.target.value)}
            variant="outlined"
            sx={textFieldStyles}
          >
            <MenuItem value="none">None</MenuItem>
            <MenuItem value="central">Central</MenuItem>
            <MenuItem value="baseboard">Baseboard</MenuItem>
            <MenuItem value="radiator">Radiator</MenuItem>
            <MenuItem value="fireplace">Fireplace</MenuItem>
          </TextField>
        </Grid>

        {/* Laundry - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            select
            label="Laundry"
            value={formData.features.laundry}
            onChange={(e) => onInputChange('features.laundry', e.target.value)}
            variant="outlined"
            sx={textFieldStyles}
          >
            <MenuItem value="none">None</MenuItem>
            <MenuItem value="in-unit">In-Unit</MenuItem>
            <MenuItem value="shared">Shared</MenuItem>
            <MenuItem value="hookups">Hookups Only</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      {/* Pet Policy Section */}
      <Divider sx={{ my: 4 }} />
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          fontWeight: 600,
          fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.25rem' },
          color: 'text.primary',
        }}
      >
        Pet Policy
      </Typography>
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {/* Pets Allowed - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.features.petPolicy.allowed}
                onChange={(e) => onInputChange('features.petPolicy.allowed', e.target.checked)}
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
            label="Pets Allowed"
          />
        </Grid>

        {formData.features.petPolicy.allowed && (
          <>
            {/* Max Pets - Right Column */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Maximum Number of Pets"
                type="number"
                value={formData.features.petPolicy.maxPets}
                onChange={(e) => onInputChange('features.petPolicy.maxPets', e.target.value)}
                placeholder="2"
                variant="outlined"
                sx={textFieldStyles}
                slotProps={{
                  htmlInput: { min: 0, max: 10 },
                }}
              />
            </Grid>

            {/* Pet Types - Full Width */}
            <Grid size={12}>
              <TextField
                fullWidth
                select
                label="Allowed Pet Types"
                value={formData.features.petPolicy.types}
                onChange={(e) => {
                  const value =
                    typeof e.target.value === 'string'
                      ? e.target.value.split(',')
                      : (e.target.value as string[])
                  onInputChange('features.petPolicy.types', value)
                }}
                slotProps={{
                  select: {
                    multiple: true,
                    renderValue: (selected) => (selected as string[]).join(', '),
                  },
                }}
                variant="outlined"
                sx={textFieldStyles}
              >
                <MenuItem value="dogs">Dogs</MenuItem>
                <MenuItem value="cats">Cats</MenuItem>
                <MenuItem value="birds">Birds</MenuItem>
                <MenuItem value="fish">Fish</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
          </>
        )}
      </Grid>
    </Card>
  )
}

export default PropertyFeaturesForm
