import React from 'react'
import { TextField, MenuItem, IconButton, Box, Typography, Button } from '@mui/material'
import Grid from '@mui/material/Grid'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import Card from '../basic/Card'

interface PreviousAddress {
  addressLine1: string
  addressLine2: string
  city: string
  county: string
  postcode: string
  country: string
  startDate: string
  endDate: string
  landlordName: string
  landlordPhone: string
  monthlyRent: string
  currency: string
  payFrequency: string
  reasonForLeaving: string
}

interface PreviousAddressFormProps {
  previousAddresses: PreviousAddress[]
  onInputChange: (field: string, value: string | boolean) => void
  onAddAddress: () => void
  onRemoveAddress: (index: number) => void
  textFieldStyles: object
}

const PreviousAddressForm: React.FC<PreviousAddressFormProps> = ({
  previousAddresses,
  onInputChange,
  onAddAddress,
  onRemoveAddress,
  textFieldStyles,
}) => {
  const payFrequencyOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'annually', label: 'Annually' },
  ]

  const currencyOptions = [
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'USD', label: 'USD ($)' },
  ]

  return (
    <Card
      title="Previous Addresses"
      subtitle="Rental history and previous residences (last 3-5 years recommended)"
      padding={{ xs: 3, sm: 4, md: 5 }}
      marginBottom={4}
    >
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onAddAddress}
          sx={{
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              borderColor: 'primary.dark',
              backgroundColor: 'primary.50',
            },
          }}
        >
          Add Previous Address
        </Button>
      </Box>

      {previousAddresses.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            backgroundColor: 'grey.50',
            borderRadius: 2,
            border: '2px dashed',
            borderColor: 'grey.300',
          }}
        >
          <Typography variant="body1" sx={{ color: 'grey.600', mb: 1 }}>
            No previous addresses added
          </Typography>
          <Typography variant="body2" sx={{ color: 'grey.500' }}>
            Click &quot;Add Previous Address&quot; to include rental history
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {previousAddresses.map((address, index) => (
            <Box
              key={index}
              sx={{
                border: '1px solid',
                borderColor: 'grey.200',
                backgroundColor: 'grey.25',
                borderRadius: 2,
                p: { xs: 3, sm: 4, md: 4 },
              }}
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
                  Previous Address {index + 1}
                </Typography>
                <IconButton
                  onClick={() => onRemoveAddress(index)}
                  color="error"
                  size="small"
                  sx={{
                    '&:hover': {
                      backgroundColor: 'error.50',
                    },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>

              <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                {/* Address Line 1 - Full Width */}
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Address Line 1"
                    value={address.addressLine1}
                    onChange={(e) =>
                      onInputChange(`addresses.previous.${index}.addressLine1`, e.target.value)
                    }
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
                    value={address.addressLine2}
                    onChange={(e) =>
                      onInputChange(`addresses.previous.${index}.addressLine2`, e.target.value)
                    }
                    placeholder="e.g., Flat 2A"
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* City - Left Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="City"
                    value={address.city}
                    onChange={(e) =>
                      onInputChange(`addresses.previous.${index}.city`, e.target.value)
                    }
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
                    value={address.county}
                    onChange={(e) =>
                      onInputChange(`addresses.previous.${index}.county`, e.target.value)
                    }
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
                    value={address.postcode}
                    onChange={(e) =>
                      onInputChange(`addresses.previous.${index}.postcode`, e.target.value)
                    }
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
                    value={address.country}
                    onChange={(e) =>
                      onInputChange(`addresses.previous.${index}.country`, e.target.value)
                    }
                    placeholder="e.g., United Kingdom"
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* Start Date - Left Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Start Date"
                    value={address.startDate}
                    onChange={(e) =>
                      onInputChange(`addresses.previous.${index}.startDate`, e.target.value)
                    }
                    variant="outlined"
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* End Date - Right Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="End Date"
                    value={address.endDate}
                    onChange={(e) =>
                      onInputChange(`addresses.previous.${index}.endDate`, e.target.value)
                    }
                    variant="outlined"
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* Landlord Name - Left Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Landlord Name"
                    value={address.landlordName}
                    onChange={(e) =>
                      onInputChange(`addresses.previous.${index}.landlordName`, e.target.value)
                    }
                    placeholder="e.g., John Smith"
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* Landlord Phone - Right Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Landlord Phone"
                    value={address.landlordPhone}
                    onChange={(e) =>
                      onInputChange(`addresses.previous.${index}.landlordPhone`, e.target.value)
                    }
                    placeholder="e.g., 07123 456789"
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* Monthly Rent - First Column */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    label="Monthly Rent"
                    value={address.monthlyRent}
                    onChange={(e) =>
                      onInputChange(`addresses.previous.${index}.monthlyRent`, e.target.value)
                    }
                    placeholder="e.g., 1200"
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* Currency - Second Column */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    select
                    label="Currency"
                    value={address.currency}
                    onChange={(e) =>
                      onInputChange(`addresses.previous.${index}.currency`, e.target.value)
                    }
                    variant="outlined"
                    sx={textFieldStyles}
                  >
                    {currencyOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Pay Frequency - Third Column */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    fullWidth
                    select
                    label="Pay Frequency"
                    value={address.payFrequency}
                    onChange={(e) =>
                      onInputChange(`addresses.previous.${index}.payFrequency`, e.target.value)
                    }
                    variant="outlined"
                    sx={textFieldStyles}
                  >
                    {payFrequencyOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Reason for Leaving - Full Width */}
                <Grid size={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Reason for Leaving"
                    value={address.reasonForLeaving}
                    onChange={(e) =>
                      onInputChange(`addresses.previous.${index}.reasonForLeaving`, e.target.value)
                    }
                    placeholder="e.g., End of tenancy, relocation for work, etc."
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

export default PreviousAddressForm
