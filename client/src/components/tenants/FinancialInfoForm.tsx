import React from 'react'
import { TextField, MenuItem, Typography, Divider, Box } from '@mui/material'
import Grid from '@mui/material/Grid'
import Card from '../basic/Card'

interface FinancialInfoFormProps {
  formData: {
    bankAccount: {
      bankName: string
      accountType: string
      sortCode: string
      verified: boolean
      verificationDate?: string
    }
    guarantor: {
      required: boolean
      provided: boolean
      name?: string
      relationship?: string
      phone?: string
      email?: string
      address?: string
      incomeVerified?: boolean
    }
    affordabilityAssessment: {
      monthlyIncome: number
      monthlyExpenses: number
      monthlyCommitments: number
      disposableIncome?: number
      rentToIncomeRatio?: number
    }
  }
  onInputChange: (field: string, value: string | boolean | number) => void
  textFieldStyles: Record<string, unknown>
}

const FinancialInfoForm: React.FC<FinancialInfoFormProps> = ({
  formData,
  onInputChange,
  textFieldStyles,
}) => {
  const accountTypeOptions = [
    { value: 'current', label: 'Current Account' },
    { value: 'savings', label: 'Savings Account' },
    { value: 'business', label: 'Business Account' },
    { value: 'student', label: 'Student Account' },
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
    { value: 'employer', label: 'Employer' },
    { value: 'other', label: 'Other' },
  ]

  // Calculate disposable income automatically
  React.useEffect(() => {
    const { monthlyIncome, monthlyExpenses, monthlyCommitments } = formData.affordabilityAssessment
    const disposable = monthlyIncome - monthlyExpenses - monthlyCommitments
    if (disposable !== formData.affordabilityAssessment.disposableIncome) {
      onInputChange('financialInfo.affordabilityAssessment.disposableIncome', disposable)
    }
  }, [
    formData.affordabilityAssessment.monthlyIncome,
    formData.affordabilityAssessment.monthlyExpenses,
    formData.affordabilityAssessment.monthlyCommitments,
  ])

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
          Financial Information
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'grey.600',
            fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.95rem' },
          }}
        >
          Bank details, guarantor information and affordability assessment
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {/* Bank Account Section */}
        <Grid size={12}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: '1.1rem',
              color: 'grey.800',
              mb: 2,
            }}
          >
            Bank Account Details
          </Typography>
        </Grid>

        {/* Bank Name - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Bank Name"
            value={formData.bankAccount.bankName}
            onChange={(e) => onInputChange('financialInfo.bankAccount.bankName', e.target.value)}
            placeholder="e.g., Barclays, HSBC, Lloyds"
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Account Type - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            select
            label="Account Type"
            value={formData.bankAccount.accountType}
            onChange={(e) => onInputChange('financialInfo.bankAccount.accountType', e.target.value)}
            variant="outlined"
            sx={textFieldStyles}
          >
            {accountTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Sort Code - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Sort Code"
            value={formData.bankAccount.sortCode}
            onChange={(e) => onInputChange('financialInfo.bankAccount.sortCode', e.target.value)}
            placeholder="e.g., 12-34-56"
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Bank Verified - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            select
            label="Bank Account Verified"
            value={formData.bankAccount.verified ? 'yes' : 'no'}
            onChange={(e) =>
              onInputChange('financialInfo.bankAccount.verified', e.target.value === 'yes')
            }
            variant="outlined"
            sx={textFieldStyles}
          >
            <MenuItem value="no">No</MenuItem>
            <MenuItem value="yes">Yes</MenuItem>
          </TextField>
        </Grid>

        {/* Verification Date - Full Width (only if verified) */}
        {formData.bankAccount.verified && (
          <Grid size={12}>
            <TextField
              fullWidth
              type="date"
              label="Verification Date"
              value={formData.bankAccount.verificationDate || ''}
              onChange={(e) =>
                onInputChange('financialInfo.bankAccount.verificationDate', e.target.value)
              }
              variant="outlined"
              slotProps={{ inputLabel: { shrink: true } }}
              sx={textFieldStyles}
            />
          </Grid>
        )}

        {/* Guarantor Section */}
        <Grid size={12}>
          <Box sx={{ my: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: '1.1rem',
                color: 'grey.800',
                mb: 2,
              }}
            >
              Guarantor Information
            </Typography>
          </Box>
        </Grid>

        {/* Guarantor Required - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            select
            label="Guarantor Required"
            value={formData.guarantor.required ? 'yes' : 'no'}
            onChange={(e) =>
              onInputChange('financialInfo.guarantor.required', e.target.value === 'yes')
            }
            variant="outlined"
            sx={textFieldStyles}
          >
            <MenuItem value="no">No</MenuItem>
            <MenuItem value="yes">Yes</MenuItem>
          </TextField>
        </Grid>

        {/* Guarantor Provided - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            select
            label="Guarantor Provided"
            value={formData.guarantor.provided ? 'yes' : 'no'}
            onChange={(e) =>
              onInputChange('financialInfo.guarantor.provided', e.target.value === 'yes')
            }
            disabled={!formData.guarantor.required}
            variant="outlined"
            sx={textFieldStyles}
          >
            <MenuItem value="no">No</MenuItem>
            <MenuItem value="yes">Yes</MenuItem>
          </TextField>
        </Grid>

        {/* Guarantor Details - Only show if provided */}
        {formData.guarantor.provided && (
          <>
            {/* Guarantor Name - Left Column */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Guarantor Name"
                value={formData.guarantor.name || ''}
                onChange={(e) => onInputChange('financialInfo.guarantor.name', e.target.value)}
                placeholder="e.g., John Smith"
                required={formData.guarantor.provided}
                variant="outlined"
                sx={textFieldStyles}
              />
            </Grid>

            {/* Guarantor Relationship - Right Column */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                select
                label="Relationship to Tenant"
                value={formData.guarantor.relationship || ''}
                onChange={(e) =>
                  onInputChange('financialInfo.guarantor.relationship', e.target.value)
                }
                required={formData.guarantor.provided}
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

            {/* Guarantor Phone - Left Column */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Guarantor Phone"
                value={formData.guarantor.phone || ''}
                onChange={(e) => onInputChange('financialInfo.guarantor.phone', e.target.value)}
                placeholder="e.g., 07123 456789"
                required={formData.guarantor.provided}
                variant="outlined"
                sx={textFieldStyles}
              />
            </Grid>

            {/* Guarantor Email - Right Column */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="email"
                label="Guarantor Email"
                value={formData.guarantor.email || ''}
                onChange={(e) => onInputChange('financialInfo.guarantor.email', e.target.value)}
                placeholder="e.g., guarantor@email.com"
                variant="outlined"
                sx={textFieldStyles}
              />
            </Grid>

            {/* Guarantor Address - Full Width */}
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Guarantor Address"
                value={formData.guarantor.address || ''}
                onChange={(e) => onInputChange('financialInfo.guarantor.address', e.target.value)}
                placeholder="Full address of the guarantor"
                variant="outlined"
                sx={textFieldStyles}
              />
            </Grid>

            {/* Guarantor Income Verified */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                select
                label="Guarantor Income Verified"
                value={formData.guarantor.incomeVerified ? 'yes' : 'no'}
                onChange={(e) =>
                  onInputChange('financialInfo.guarantor.incomeVerified', e.target.value === 'yes')
                }
                variant="outlined"
                sx={textFieldStyles}
              >
                <MenuItem value="no">No</MenuItem>
                <MenuItem value="yes">Yes</MenuItem>
              </TextField>
            </Grid>
          </>
        )}

        {/* Affordability Assessment Section */}
        <Grid size={12}>
          <Box sx={{ my: 3 }}>
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
              Affordability Assessment
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'grey.600',
                fontSize: '0.875rem',
                mb: 2,
              }}
            >
              Monthly income and expense breakdown for affordability calculation
            </Typography>
          </Box>
        </Grid>

        {/* Monthly Income - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            type="number"
            label="Total Monthly Income"
            value={formData.affordabilityAssessment.monthlyIncome}
            onChange={(e) =>
              onInputChange(
                'financialInfo.affordabilityAssessment.monthlyIncome',
                parseFloat(e.target.value) || 0
              )
            }
            placeholder="e.g., 4500"
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Monthly Expenses - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            type="number"
            label="Monthly Expenses"
            value={formData.affordabilityAssessment.monthlyExpenses}
            onChange={(e) =>
              onInputChange(
                'financialInfo.affordabilityAssessment.monthlyExpenses',
                parseFloat(e.target.value) || 0
              )
            }
            placeholder="e.g., 800 (food, transport, etc.)"
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Monthly Commitments - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            type="number"
            label="Monthly Financial Commitments"
            value={formData.affordabilityAssessment.monthlyCommitments}
            onChange={(e) =>
              onInputChange(
                'financialInfo.affordabilityAssessment.monthlyCommitments',
                parseFloat(e.target.value) || 0
              )
            }
            placeholder="e.g., 500 (loans, credit cards, etc.)"
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Disposable Income - Right Column (Calculated) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            type="number"
            label="Disposable Income (Calculated)"
            value={formData.affordabilityAssessment.disposableIncome || 0}
            disabled
            variant="outlined"
            sx={{
              ...textFieldStyles,
              '& .MuiOutlinedInput-root': {
                ...(textFieldStyles['& .MuiOutlinedInput-root'] as Record<string, unknown>),
                backgroundColor: '#f5f5f5',
              },
            }}
          />
        </Grid>

        {/* Affordability Summary */}
        {formData.affordabilityAssessment.monthlyIncome > 0 && (
          <Grid size={12}>
            <Box
              sx={{
                p: 3,
                mt: 2,
                backgroundColor: 'grey.50',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'grey.300',
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: 'grey.800',
                  mb: 1,
                }}
              >
                Affordability Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="grey.600">
                    Total Monthly Income: £
                    {formData.affordabilityAssessment.monthlyIncome.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="grey.600">
                    Total Monthly Outgoings: £
                    {(
                      formData.affordabilityAssessment.monthlyExpenses +
                      formData.affordabilityAssessment.monthlyCommitments
                    ).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                    Available for Rent: £
                    {(formData.affordabilityAssessment.disposableIncome || 0).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="grey.600">
                    Income Multiple Available:{' '}
                    {formData.affordabilityAssessment.monthlyIncome > 0
                      ? `${(((formData.affordabilityAssessment.disposableIncome || 0) / formData.affordabilityAssessment.monthlyIncome) * 100).toFixed(1)}%`
                      : '0%'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        )}
      </Grid>
    </Card>
  )
}

export default FinancialInfoForm
