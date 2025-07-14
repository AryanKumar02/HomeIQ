import React from 'react'
import { TextField, MenuItem, Typography, Divider, Box } from '@mui/material'
import Grid from '@mui/material/Grid'
import Card from '../basic/Card'

interface ContactInfoFormProps {
  formData: {
    email: string
    phone: {
      primary: {
        number: string
        type: string
      }
      secondary?: {
        number: string
        type: string
      }
    }
    emergencyContact: {
      name: string
      relationship: string
      phone: string
      email?: string
      address?: string
    }
  }
  onInputChange: (field: string, value: string | boolean) => void
  textFieldStyles: object
}

const ContactInfoForm: React.FC<ContactInfoFormProps> = ({
  formData,
  onInputChange,
  textFieldStyles,
}) => {
  const phoneTypeOptions = [
    { value: 'mobile', label: 'Mobile' },
    { value: 'home', label: 'Home' },
    { value: 'work', label: 'Work' },
  ]

  const relationshipOptions = [
    { value: 'parent', label: 'Parent' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'partner', label: 'Partner' },
    { value: 'child', label: 'Child' },
    { value: 'relative', label: 'Relative' },
    { value: 'friend', label: 'Friend' },
    { value: 'colleague', label: 'Colleague' },
    { value: 'other', label: 'Other' },
  ]

  return (
    <Card
      title="Contact Information"
      subtitle="Email, phone numbers and emergency contact details"
      padding={{ xs: 3, sm: 4, md: 5 }}
      marginBottom={4}
    >
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {/* Email - Full Width */}
        <Grid size={12}>
          <TextField
            fullWidth
            type="email"
            label="Email Address"
            value={formData.email}
            onChange={(e) => onInputChange('contactInfo.email', e.target.value)}
            placeholder="e.g., john.smith@email.com"
            required
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Primary Phone Number - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Primary Phone Number"
            value={formData.phone.primary.number}
            onChange={(e) => onInputChange('contactInfo.phone.primary.number', e.target.value)}
            placeholder="e.g., 07700900123 or 02071234567"
            required
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Primary Phone Type - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            select
            label="Primary Phone Type"
            value={formData.phone.primary.type}
            onChange={(e) => onInputChange('contactInfo.phone.primary.type', e.target.value)}
            variant="outlined"
            sx={textFieldStyles}
          >
            {phoneTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Secondary Phone Number - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Secondary Phone Number"
            value={formData.phone.secondary?.number || ''}
            onChange={(e) => onInputChange('contactInfo.phone.secondary.number', e.target.value)}
            placeholder="e.g., 0161 123 4567 (optional)"
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Secondary Phone Type - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            select
            label="Secondary Phone Type"
            value={formData.phone.secondary?.type || 'mobile'}
            onChange={(e) => onInputChange('contactInfo.phone.secondary.type', e.target.value)}
            variant="outlined"
            sx={textFieldStyles}
          >
            {phoneTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Emergency Contact Section Divider */}
        <Grid size={12}>
          <Box sx={{ my: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: '1.1rem',
                color: 'grey.800',
                mb: 1,
              }}
            >
              Emergency Contact
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'grey.600',
                fontSize: '0.875rem',
                mb: 2,
              }}
            >
              Person to contact in case of emergency
            </Typography>
          </Box>
        </Grid>

        {/* Emergency Contact Name - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Emergency Contact Name"
            value={formData.emergencyContact.name}
            onChange={(e) => onInputChange('contactInfo.emergencyContact.name', e.target.value)}
            placeholder="e.g., Jane Smith"
            required
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Emergency Contact Relationship - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            select
            label="Relationship"
            value={formData.emergencyContact.relationship}
            onChange={(e) =>
              onInputChange('contactInfo.emergencyContact.relationship', e.target.value)
            }
            required
            variant="outlined"
            sx={textFieldStyles}
          >
            {relationshipOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Emergency Contact Phone - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Emergency Contact Phone"
            value={formData.emergencyContact.phone}
            onChange={(e) => onInputChange('contactInfo.emergencyContact.phone', e.target.value)}
            placeholder="e.g., 07700900124 or 02071234568"
            required
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Emergency Contact Email - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            type="email"
            label="Emergency Contact Email"
            value={formData.emergencyContact.email || ''}
            onChange={(e) => onInputChange('contactInfo.emergencyContact.email', e.target.value)}
            placeholder="e.g., jane.smith@email.com (optional)"
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Emergency Contact Address - Full Width */}
        <Grid size={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Emergency Contact Address"
            value={formData.emergencyContact.address || ''}
            onChange={(e) => onInputChange('contactInfo.emergencyContact.address', e.target.value)}
            placeholder="Full address of emergency contact (optional)"
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>
      </Grid>
    </Card>
  )
}

export default ContactInfoForm
