import React from 'react'
import { TextField, MenuItem, Typography, Box, FormControlLabel, Checkbox } from '@mui/material'
import Grid from '@mui/material/Grid'
import Card from '../basic/Card'

interface PrivacyConsentFormProps {
  formData: {
    profileVisibility?: string
    allowBackgroundCheck?: boolean
    allowCreditCheck?: boolean
    dataRetentionConsent: boolean
    consentDate?: string
  }
  onInputChange: (field: string, value: string | boolean) => void
  textFieldStyles: Record<string, unknown>
}

const PrivacyConsentForm: React.FC<PrivacyConsentFormProps> = ({
  formData,
  onInputChange,
  textFieldStyles,
}) => {
  const profileVisibilityOptions = [
    { value: 'public', label: 'Public' },
    { value: 'landlords-only', label: 'Landlords Only' },
    { value: 'private', label: 'Private' },
  ]

  return (
    <Card padding={{ xs: 3, sm: 4, md: 5 }} marginBottom={4}>
      {/* Custom Title */}
      <Box sx={{ mb: 3 }}>
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
          Privacy & Consent
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'grey.600',
            fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.95rem' },
          }}
        >
          Privacy settings and required data consent
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {/* Profile Visibility */}
        <Grid size={12}>
          <TextField
            fullWidth
            select
            label="Profile Visibility"
            value={formData.profileVisibility || ''}
            onChange={(e) => onInputChange('privacy.profileVisibility', e.target.value)}
            variant="outlined"
            sx={textFieldStyles}
          >
            {profileVisibilityOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Background Check Consent */}
        <Grid size={12}>
          <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.allowBackgroundCheck || false}
                  onChange={(e) => onInputChange('privacy.allowBackgroundCheck', e.target.checked)}
                  sx={{
                    color: 'secondary.main',
                    '&.Mui-checked': {
                      color: 'secondary.main',
                    },
                  }}
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Allow Background Check
                  </Typography>
                  <Typography variant="body2" color="grey.600">
                    Consent to background verification checks by potential landlords
                  </Typography>
                </Box>
              }
            />
          </Box>
        </Grid>

        {/* Credit Check Consent */}
        <Grid size={12}>
          <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.allowCreditCheck || false}
                  onChange={(e) => onInputChange('privacy.allowCreditCheck', e.target.checked)}
                  sx={{
                    color: 'secondary.main',
                    '&.Mui-checked': {
                      color: 'secondary.main',
                    },
                  }}
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Allow Credit Check
                  </Typography>
                  <Typography variant="body2" color="grey.600">
                    Consent to credit history checks by potential landlords
                  </Typography>
                </Box>
              }
            />
          </Box>
        </Grid>

        {/* Data Retention Consent - REQUIRED */}
        <Grid size={12}>
          <Box
            sx={{
              p: 2,
              backgroundColor: 'warning.50',
              borderRadius: 1,
              border: '1px solid',
              borderColor: formData.dataRetentionConsent ? 'success.main' : 'warning.main',
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.dataRetentionConsent}
                  onChange={(e) => {
                    onInputChange('privacy.dataRetentionConsent', e.target.checked)
                    if (e.target.checked) {
                      onInputChange('privacy.consentDate', new Date().toISOString().split('T')[0])
                    }
                  }}
                  required
                  sx={{
                    color: 'secondary.main',
                    '&.Mui-checked': {
                      color: 'success.main',
                    },
                  }}
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Data Retention Consent (Required) *
                  </Typography>
                  <Typography variant="body2" color="grey.700">
                    I consent to the processing and retention of my personal data for tenant
                    application purposes in accordance with UK GDPR requirements. This data will be
                    used to assess my suitability as a tenant and may be shared with relevant
                    parties (landlords, letting agents, referencing companies) as part of the
                    application process.
                  </Typography>
                  <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
                    This consent is required to proceed with your tenant application
                  </Typography>
                </Box>
              }
            />
          </Box>
        </Grid>

        {/* Consent Date (Auto-populated) */}
        {formData.dataRetentionConsent && (
          <Grid size={12}>
            <TextField
              fullWidth
              type="date"
              label="Consent Date"
              value={formData.consentDate || new Date().toISOString().split('T')[0]}
              disabled
              variant="outlined"
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{
                ...textFieldStyles,
                '& .MuiOutlinedInput-root': {
                  ...(textFieldStyles['& .MuiOutlinedInput-root'] as Record<string, unknown>),
                  backgroundColor: '#f5f5f5',
                },
              }}
            />
          </Grid>
        )}

        {/* Compliance Notice */}
        <Grid size={12}>
          <Box
            sx={{
              p: 2,
              backgroundColor: 'info.50',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'info.200',
            }}
          >
            <Typography variant="caption" color="info.800">
              <strong>Data Protection Notice:</strong> Your personal data will be processed in
              accordance with UK GDPR and Data Protection Act 2018. You have the right to access,
              rectify, erase, or restrict processing of your data. For more information about how we
              handle your data, please refer to our Privacy Policy.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Card>
  )
}

export default PrivacyConsentForm
