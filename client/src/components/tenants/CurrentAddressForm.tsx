import React from 'react'
import { TextField } from '@mui/material'
import Grid from '@mui/material/Grid'
import Card from '../basic/Card'

interface CurrentAddressFormProps {
  formData: {
    addressLine1: string
    addressLine2: string
    city: string
    county: string
    postcode: string
    country: string
  }
  onInputChange: (field: string, value: string | boolean) => void
  textFieldStyles: object
}

const CurrentAddressForm: React.FC<CurrentAddressFormProps> = ({
  formData,
  onInputChange,
  textFieldStyles,
}) => {
  return (
    <Card
      title="Current Address"
      subtitle="Where the tenant currently lives"
      padding={{ xs: 3, sm: 4, md: 5 }}
      marginBottom={4}
    >
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {/* Address Line 1 - Full Width */}
        <Grid size={12}>
          <TextField
            fullWidth
            label="Address Line 1"
            value={formData.addressLine1}
            onChange={(e) => onInputChange('addresses.current.addressLine1', e.target.value)}
            placeholder="e.g., 123 High Street"
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Address Line 2 - Full Width */}
        <Grid size={12}>
          <TextField
            fullWidth
            label="Address Line 2"
            value={formData.addressLine2}
            onChange={(e) => onInputChange('addresses.current.addressLine2', e.target.value)}
            placeholder="e.g., Flat 2A, Building Name (optional)"
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* City - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="City"
            value={formData.city}
            onChange={(e) => onInputChange('addresses.current.city', e.target.value)}
            placeholder="e.g., Manchester"
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* County - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="County"
            value={formData.county}
            onChange={(e) => onInputChange('addresses.current.county', e.target.value)}
            placeholder="e.g., Greater Manchester"
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Postcode - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Postcode"
            value={formData.postcode}
            onChange={(e) => onInputChange('addresses.current.postcode', e.target.value)}
            placeholder="e.g., M1 1AA"
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Country - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Country"
            value={formData.country}
            onChange={(e) => onInputChange('addresses.current.country', e.target.value)}
            placeholder="e.g., United Kingdom"
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>
      </Grid>
    </Card>
  )
}

export default CurrentAddressForm
