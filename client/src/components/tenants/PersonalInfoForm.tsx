import React from 'react'
import {
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
  Box,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import Card from '../basic/Card'

interface PersonalInfoFormProps {
  formData: {
    title?: string
    firstName: string
    lastName: string
    middleName?: string
    preferredName?: string
    dateOfBirth: string
    nationalInsuranceNumber?: string
    passportNumber?: string
    drivingLicenceNumber?: string
    nationality?: string
    immigrationStatus?: string
    rightToRent: {
      verified: boolean
      verificationDate?: string
      documentType?: string
      documentExpiryDate?: string
      recheckRequired?: boolean
      recheckDate?: string
      notes?: string
    }
  }
  onInputChange: (field: string, value: string | boolean) => void
  textFieldStyles: object
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  formData,
  onInputChange,
  textFieldStyles,
}) => {
  const titleOptions = [
    { value: '', label: 'Select Title' },
    { value: 'Mr', label: 'Mr' },
    { value: 'Mrs', label: 'Mrs' },
    { value: 'Miss', label: 'Miss' },
    { value: 'Ms', label: 'Ms' },
    { value: 'Dr', label: 'Dr' },
    { value: 'Prof', label: 'Prof' },
    { value: 'Rev', label: 'Rev' },
    { value: 'Other', label: 'Other' },
  ]

  const immigrationStatusOptions = [
    { value: 'british-citizen', label: 'British Citizen' },
    { value: 'british-national', label: 'British National' },
    { value: 'irish-citizen', label: 'Irish Citizen' },
    { value: 'eu-settled-status', label: 'EU Settled Status' },
    { value: 'eu-pre-settled-status', label: 'EU Pre-Settled Status' },
    { value: 'indefinite-leave-to-remain', label: 'Indefinite Leave to Remain' },
    { value: 'work-visa', label: 'Work Visa' },
    { value: 'student-visa', label: 'Student Visa' },
    { value: 'spouse-visa', label: 'Spouse Visa' },
    { value: 'family-visa', label: 'Family Visa' },
    { value: 'refugee-status', label: 'Refugee Status' },
    { value: 'other', label: 'Other' },
  ]

  const documentTypeOptions = [
    { value: '', label: 'Select Document Type' },
    { value: 'uk-passport', label: 'UK Passport' },
    { value: 'eu-passport', label: 'EU Passport' },
    { value: 'other-passport', label: 'Other Passport' },
    { value: 'uk-driving-licence', label: 'UK Driving Licence' },
    { value: 'birth-certificate', label: 'Birth Certificate' },
    { value: 'brp-card', label: 'BRP Card' },
    { value: 'visa', label: 'Visa' },
    { value: 'settlement-document', label: 'Settlement Document' },
    { value: 'other', label: 'Other' },
  ]

  return (
    <Card
      title="Personal Information"
      subtitle="Basic personal details and identification information"
      padding={{ xs: 3, sm: 4, md: 5 }}
      marginBottom={4}
    >
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {/* Title - First Column */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            select
            label="Title"
            value={formData.title || ''}
            onChange={(e) => onInputChange('personalInfo.title', e.target.value)}
            variant="outlined"
            sx={textFieldStyles}
          >
            {titleOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* First Name - Second Column */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            label="First Name"
            value={formData.firstName}
            onChange={(e) => onInputChange('personalInfo.firstName', e.target.value)}
            placeholder="e.g., John"
            required
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Middle Name - Third Column */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            label="Middle Name"
            value={formData.middleName || ''}
            onChange={(e) => onInputChange('personalInfo.middleName', e.target.value)}
            placeholder="e.g., Michael"
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Last Name - Fourth Column */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => onInputChange('personalInfo.lastName', e.target.value)}
            placeholder="e.g., Smith"
            required
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Preferred Name - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Preferred Name"
            value={formData.preferredName || ''}
            onChange={(e) => onInputChange('personalInfo.preferredName', e.target.value)}
            placeholder="Name you prefer to be called (if different from first name)"
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Date of Birth - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            type="date"
            label="Date of Birth"
            value={formData.dateOfBirth}
            onChange={(e) => onInputChange('personalInfo.dateOfBirth', e.target.value)}
            required
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            sx={textFieldStyles}
          />
        </Grid>

        {/* National Insurance Number - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="National Insurance Number"
            value={formData.nationalInsuranceNumber || ''}
            onChange={(e) => onInputChange('personalInfo.nationalInsuranceNumber', e.target.value)}
            placeholder="e.g., AB123456C"
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Passport Number - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Passport Number"
            value={formData.passportNumber || ''}
            onChange={(e) => onInputChange('personalInfo.passportNumber', e.target.value)}
            placeholder="e.g., 123456789"
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Driving Licence Number - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="UK Driving Licence Number"
            value={formData.drivingLicenceNumber || ''}
            onChange={(e) => onInputChange('personalInfo.drivingLicenceNumber', e.target.value)}
            placeholder="e.g., MORGA657054SM9IJ"
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Nationality - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Nationality"
            value={formData.nationality || ''}
            onChange={(e) => onInputChange('personalInfo.nationality', e.target.value)}
            placeholder="e.g., British"
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Immigration Status - Full Width */}
        <Grid size={12}>
          <TextField
            fullWidth
            select
            label="Immigration Status"
            value={formData.immigrationStatus || ''}
            onChange={(e) => onInputChange('personalInfo.immigrationStatus', e.target.value)}
            required
            variant="outlined"
            sx={textFieldStyles}
          >
            {immigrationStatusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Right to Rent Section Divider */}
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
              Right to Rent Verification
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'grey.600',
                fontSize: '0.875rem',
                mb: 2,
              }}
            >
              Mandatory UK right to rent documentation and verification
            </Typography>
          </Box>
        </Grid>

        {/* Right to Rent Verified Checkbox */}
        <Grid size={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.rightToRent.verified}
                onChange={(e) =>
                  onInputChange('personalInfo.rightToRent.verified', e.target.checked)
                }
                color="primary"
              />
            }
            label="Right to Rent Verified (Mandatory UK requirement)"
          />
        </Grid>

        {/* Verification Date */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            type="date"
            label="Verification Date"
            value={formData.rightToRent.verificationDate || ''}
            onChange={(e) =>
              onInputChange('personalInfo.rightToRent.verificationDate', e.target.value)
            }
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            sx={textFieldStyles}
          />
        </Grid>

        {/* Document Type */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            select
            label="Right to Rent Document Type"
            value={formData.rightToRent.documentType || ''}
            onChange={(e) => onInputChange('personalInfo.rightToRent.documentType', e.target.value)}
            variant="outlined"
            sx={textFieldStyles}
          >
            {documentTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Document Expiry Date */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            type="date"
            label="Document Expiry Date"
            value={formData.rightToRent.documentExpiryDate || ''}
            onChange={(e) =>
              onInputChange('personalInfo.rightToRent.documentExpiryDate', e.target.value)
            }
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            sx={textFieldStyles}
          />
        </Grid>

        {/* Recheck Required */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.rightToRent.recheckRequired || false}
                onChange={(e) =>
                  onInputChange('personalInfo.rightToRent.recheckRequired', e.target.checked)
                }
                color="primary"
              />
            }
            label="Recheck Required"
          />
        </Grid>

        {/* Recheck Date */}
        {formData.rightToRent.recheckRequired && (
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="date"
              label="Recheck Date"
              value={formData.rightToRent.recheckDate || ''}
              onChange={(e) =>
                onInputChange('personalInfo.rightToRent.recheckDate', e.target.value)
              }
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
              sx={textFieldStyles}
            />
          </Grid>
        )}

        {/* Right to Rent Notes */}
        <Grid size={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Right to Rent Notes"
            value={formData.rightToRent.notes || ''}
            onChange={(e) => onInputChange('personalInfo.rightToRent.notes', e.target.value)}
            placeholder="Additional notes about right to rent verification..."
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>
      </Grid>
    </Card>
  )
}

export default PersonalInfoForm
