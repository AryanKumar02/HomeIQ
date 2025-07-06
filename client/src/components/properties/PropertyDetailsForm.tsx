import React from 'react'
import { TextField } from '@mui/material'
import Grid from '@mui/material/Grid'
import Card from './Card'

interface PropertyDetailsFormProps {
  formData: {
    bedrooms: string | number
    bathrooms: string | number
    squareFootage: string | number
    yearBuilt: string | number
    lotSize: string | number
  }
  onInputChange: (field: string, value: string) => void
  textFieldStyles: object
}

const PropertyDetailsForm: React.FC<PropertyDetailsFormProps> = ({
  formData,
  onInputChange,
  textFieldStyles,
}) => {
  const currentYear = new Date().getFullYear()

  return (
    <Card
      title="Property Details"
      subtitle="Specific information about the property"
      padding={{ xs: 3, sm: 4, md: 5 }}
      marginBottom={4}
    >
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {/* Bedrooms - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Bedrooms"
            type="number"
            value={formData.bedrooms}
            onChange={(e) => onInputChange('bedrooms', e.target.value)}
            placeholder="0"
            required
            variant="outlined"
            sx={textFieldStyles}
            slotProps={{
              htmlInput: { min: 0, max: 50 },
            }}
          />
        </Grid>

        {/* Bathrooms - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Bathrooms"
            type="number"
            value={formData.bathrooms}
            onChange={(e) => onInputChange('bathrooms', e.target.value)}
            placeholder="0"
            required
            variant="outlined"
            sx={textFieldStyles}
            slotProps={{
              htmlInput: { min: 0, max: 50, step: 0.5 },
            }}
            error={parseFloat(formData.bathrooms as string) > 50}
            helperText={
              parseFloat(formData.bathrooms as string) > 50
                ? 'Bathrooms must be between 0 and 50'
                : ''
            }
          />
        </Grid>

        {/* Square Footage - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Square Footage"
            type="number"
            value={formData.squareFootage}
            onChange={(e) => onInputChange('squareFootage', e.target.value)}
            placeholder="e.g., 1200"
            required
            variant="outlined"
            sx={textFieldStyles}
            slotProps={{
              htmlInput: { min: 1, max: 1000000 },
            }}
          />
        </Grid>

        {/* Year Built - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Year Built"
            type="number"
            value={formData.yearBuilt}
            onChange={(e) => onInputChange('yearBuilt', e.target.value)}
            placeholder="e.g., 1995"
            variant="outlined"
            sx={textFieldStyles}
            slotProps={{
              htmlInput: { min: 1800, max: currentYear + 5 },
            }}
            error={
              parseFloat(formData.yearBuilt as string) < 1800 ||
              parseFloat(formData.yearBuilt as string) > currentYear + 5
            }
            helperText={
              parseFloat(formData.yearBuilt as string) < 1800 ||
              parseFloat(formData.yearBuilt as string) > currentYear + 5
                ? `Year built must be between 1800 and ${currentYear + 5}`
                : ''
            }
          />
        </Grid>

        {/* Lot Size - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Lot Size (sq ft)"
            type="number"
            value={formData.lotSize}
            onChange={(e) => onInputChange('lotSize', e.target.value)}
            placeholder="e.g., 5000"
            variant="outlined"
            sx={textFieldStyles}
            slotProps={{
              htmlInput: { min: 0 },
            }}
          />
        </Grid>
      </Grid>
    </Card>
  )
}

export default PropertyDetailsForm
