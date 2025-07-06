import React from 'react'
import { Box, TextField, Typography, Divider } from '@mui/material'
import Grid from '@mui/material/Grid'
import Card from './Card'

interface FinancialInformationFormProps {
  formData: {
    financials: {
      propertyValue: string | number
      purchasePrice: string | number
      purchaseDate: string
      monthlyRent: string | number
      securityDeposit: string | number
      petDeposit: string | number
      monthlyMortgage: string | number
      propertyTaxes: string | number
      insurance: string | number
      maintenance: string | number
      utilities: string | number
    }
    status: string
    propertyType: string
  }
  onInputChange: (field: string, value: string) => void
  textFieldStyles: object
  currencySymbol: string
}

const FinancialInformationForm: React.FC<FinancialInformationFormProps> = ({
  formData,
  onInputChange,
  textFieldStyles,
  currencySymbol,
}) => {
  // Helper function to determine if rental fields should be shown
  const shouldShowRentalFields = (status: string) => {
    return status === 'occupied' || status === 'pending'
  }

  return (
    <Card
      title="Financial Information"
      subtitle="Property value, rental income, and expense details"
      padding={{ xs: 3, sm: 4, md: 5 }}
    >
      {/* Property Value & Purchase Section */}
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          fontWeight: 600,
          fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.25rem' },
          color: 'text.primary',
        }}
      >
        Property Value & Purchase
      </Typography>
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: 4 }}>
        {/* Property Value - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Property Value"
            type="number"
            value={formData.financials.propertyValue}
            onChange={(e) => onInputChange('financials.propertyValue', e.target.value)}
            placeholder="e.g., 450000"
            variant="outlined"
            sx={textFieldStyles}
            slotProps={{
              htmlInput: { min: 0 },
            }}
          />
        </Grid>

        {/* Purchase Price - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Purchase Price"
            type="number"
            value={formData.financials.purchasePrice}
            onChange={(e) => onInputChange('financials.purchasePrice', e.target.value)}
            placeholder="e.g., 420000"
            variant="outlined"
            sx={textFieldStyles}
            slotProps={{
              htmlInput: { min: 0 },
            }}
          />
        </Grid>

        {/* Purchase Date - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Purchase Date"
            type="date"
            value={formData.financials.purchaseDate}
            onChange={(e) => onInputChange('financials.purchaseDate', e.target.value)}
            variant="outlined"
            sx={textFieldStyles}
            slotProps={{
              inputLabel: { shrink: true },
            }}
          />
        </Grid>
      </Grid>

      {/* Rental Income Section - only show when property is occupied/pending AND not multi-unit */}
      {shouldShowRentalFields(formData.status) &&
        formData.propertyType !== 'apartment' &&
        formData.propertyType !== 'duplex' && (
          <>
            {/* Divider */}
            <Divider sx={{ my: 4 }} />

            {/* Rental Income Section */}
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.25rem' },
                color: 'text.primary',
              }}
            >
              Rental Income
            </Typography>

            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Monthly Rent"
                  type="number"
                  value={formData.financials.monthlyRent}
                  onChange={(e) => onInputChange('financials.monthlyRent', e.target.value)}
                  placeholder="2500"
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <Box sx={{ mr: 1, color: 'text.secondary' }}>{currencySymbol}</Box>
                      ),
                    },
                  }}
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Security Deposit"
                  type="number"
                  value={formData.financials.securityDeposit}
                  onChange={(e) => onInputChange('financials.securityDeposit', e.target.value)}
                  placeholder="2500"
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <Box sx={{ mr: 1, color: 'text.secondary' }}>{currencySymbol}</Box>
                      ),
                    },
                  }}
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Pet Deposit"
                  type="number"
                  value={formData.financials.petDeposit}
                  onChange={(e) => onInputChange('financials.petDeposit', e.target.value)}
                  placeholder="500"
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <Box sx={{ mr: 1, color: 'text.secondary' }}>{currencySymbol}</Box>
                      ),
                    },
                  }}
                  sx={textFieldStyles}
                />
              </Grid>
            </Grid>

            {/* Divider */}
            <Divider sx={{ my: 4 }} />
          </>
        )}

      {/* Monthly Expenses Section */}
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          fontWeight: 600,
          fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.25rem' },
          color: 'text.primary',
        }}
      >
        Monthly Expenses
      </Typography>
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {/* Monthly Mortgage - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Monthly Mortgage"
            type="number"
            value={formData.financials.monthlyMortgage}
            onChange={(e) => onInputChange('financials.monthlyMortgage', e.target.value)}
            placeholder="e.g., 1800"
            variant="outlined"
            sx={textFieldStyles}
            slotProps={{
              htmlInput: { min: 0 },
            }}
          />
        </Grid>

        {/* Property Taxes - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Property Taxes (Monthly)"
            type="number"
            value={formData.financials.propertyTaxes}
            onChange={(e) => onInputChange('financials.propertyTaxes', e.target.value)}
            placeholder="e.g., 450"
            variant="outlined"
            sx={textFieldStyles}
            slotProps={{
              htmlInput: { min: 0 },
            }}
          />
        </Grid>

        {/* Insurance - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Insurance (Monthly)"
            type="number"
            value={formData.financials.insurance}
            onChange={(e) => onInputChange('financials.insurance', e.target.value)}
            placeholder="e.g., 120"
            variant="outlined"
            sx={textFieldStyles}
            slotProps={{
              htmlInput: { min: 0 },
            }}
          />
        </Grid>

        {/* Maintenance - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Maintenance"
            type="number"
            value={formData.financials.maintenance}
            onChange={(e) => onInputChange('financials.maintenance', e.target.value)}
            placeholder="e.g., 200"
            variant="outlined"
            sx={textFieldStyles}
            slotProps={{
              htmlInput: { min: 0 },
            }}
          />
        </Grid>

        {/* Utilities - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Utilities"
            type="number"
            value={formData.financials.utilities}
            onChange={(e) => onInputChange('financials.utilities', e.target.value)}
            placeholder="e.g., 150"
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

export default FinancialInformationForm
