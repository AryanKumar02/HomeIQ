import React from 'react'
import { TextField, MenuItem } from '@mui/material'
import Grid from '@mui/material/Grid'
import Card from './Card'

interface PropertyBasicInfoFormProps {
  formData: {
    title: string
    propertyType: string
    description: string
    status: string
    address: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
  }
  onInputChange: (field: string, value: string) => void
  textFieldStyles: object
}

const PropertyBasicInfoForm: React.FC<PropertyBasicInfoFormProps> = ({
  formData,
  onInputChange,
  textFieldStyles,
}) => {
  const propertyTypes = [
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'duplex', label: 'Duplex' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'land', label: 'Land' },
    { value: 'other', label: 'Other' },
  ]

  const propertyStatuses = [
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'off-market', label: 'Off Market' },
    { value: 'pending', label: 'Pending' },
  ]

  return (
    <Card
      title="Basic Information"
      subtitle="Required information about your property"
      padding={{ xs: 3, sm: 4, md: 5 }}
      marginBottom={4}
    >
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {/* Property Title - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Property Title"
            value={formData.title}
            onChange={(e) => onInputChange('title', e.target.value)}
            placeholder="e.g., Beautiful 3BR House in Downtown"
            required
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Property Type - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            select
            label="Property Type"
            value={formData.propertyType}
            onChange={(e) => onInputChange('propertyType', e.target.value)}
            required
            variant="outlined"
            sx={textFieldStyles}
          >
            {propertyTypes.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Property Description - Full Width */}
        <Grid size={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Property Description"
            value={formData.description}
            onChange={(e) => onInputChange('description', e.target.value)}
            placeholder="Describe your property..."
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Property Status - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            select
            label="Property Status"
            value={formData.status}
            onChange={(e) => onInputChange('status', e.target.value)}
            required
            variant="outlined"
            sx={textFieldStyles}
          >
            {propertyStatuses.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Street Address - Full Width */}
        <Grid size={12}>
          <TextField
            fullWidth
            label="Street Address"
            value={formData.address.street}
            onChange={(e) => onInputChange('address.street', e.target.value)}
            placeholder="e.g., 123 Main Street"
            required
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* City - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="City"
            value={formData.address.city}
            onChange={(e) => onInputChange('address.city', e.target.value)}
            placeholder="e.g., London"
            required
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* State - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="County"
            value={formData.address.state}
            onChange={(e) => onInputChange('address.state', e.target.value)}
            placeholder="e.g., West Midlands"
            required
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* ZIP Code - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Post Code"
            value={formData.address.zipCode}
            onChange={(e) => onInputChange('address.zipCode', e.target.value)}
            placeholder="e.g., WA1 1AA"
            required
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Country - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Country"
            value={formData.address.country}
            onChange={(e) => onInputChange('address.country', e.target.value)}
            placeholder="e.g., United Kingdom"
            required
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>
      </Grid>
    </Card>
  )
}

export default PropertyBasicInfoForm
