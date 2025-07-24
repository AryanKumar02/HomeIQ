import React from 'react'
import { TextField, MenuItem, Typography, Divider, Box } from '@mui/material'
import Grid from '@mui/material/Grid'
import Card from '../basic/Card'

interface EmploymentInfoFormProps {
  formData: {
    current: {
      status: string
      employer?: {
        name: string
        position: string
        contractType: string
        startDate: string
        address: {
          addressLine1: string
          addressLine2: string
          city: string
          county: string
          postcode: string
          country: string
        }
        phone: string
        hrContactName: string
        hrContactPhone: string
        hrContactEmail: string
      }
      income: {
        gross: {
          monthly: number
          annual: number
        }
        net: {
          monthly: number
          annual: number
        }
        currency: string
        payFrequency: string
        verified: boolean
        verificationDate?: string
        verificationMethod?: string
        probationPeriod: {
          inProbation: boolean
          endDate?: string
        }
      }
      benefits: {
        receives: boolean
        types: string[]
        monthlyAmount: number
      }
    }
    previous: Array<{
      employer: string
      position: string
      startDate: string
      endDate: string
      reasonForLeaving: string
      contactName: string
      contactPhone: string
      contactEmail: string
    }>
  }
  onInputChange: (field: string, value: string | boolean | number | string[]) => void
  textFieldStyles: object
}

const EmploymentInfoForm: React.FC<EmploymentInfoFormProps> = ({
  formData,
  onInputChange,
  textFieldStyles,
}) => {
  const employmentStatusOptions = [
    { value: 'employed-full-time', label: 'Employed (Full-time)' },
    { value: 'employed-part-time', label: 'Employed (Part-time)' },
    { value: 'self-employed', label: 'Self-employed' },
    { value: 'unemployed', label: 'Unemployed' },
    { value: 'student', label: 'Student' },
    { value: 'retired', label: 'Retired' },
    { value: 'on-benefits', label: 'On Benefits' },
    { value: 'contractor', label: 'Contractor' },
    { value: 'apprentice', label: 'Apprentice' },
    { value: 'other', label: 'Other' },
  ]

  const contractTypeOptions = [
    { value: 'permanent', label: 'Permanent' },
    { value: 'fixed-term', label: 'Fixed-term' },
    { value: 'zero-hours', label: 'Zero Hours' },
    { value: 'casual', label: 'Casual' },
    { value: 'agency', label: 'Agency' },
    { value: 'apprenticeship', label: 'Apprenticeship' },
  ]

  const payFrequencyOptions = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'fortnightly', label: 'Fortnightly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'annually', label: 'Annually' },
  ]

  const isEmployed = [
    'employed-full-time',
    'employed-part-time',
    'contractor',
    'apprentice',
  ].includes(formData.current.status)

  return (
    <Card
      title="Employment Information"
      subtitle="Employment status, income details and employer information"
      padding={{ xs: 3, sm: 4, md: 5 }}
      marginBottom={4}
    >
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        {/* Employment Status - Full Width */}
        <Grid size={12}>
          <TextField
            fullWidth
            select
            label="Employment Status"
            value={formData.current.status}
            onChange={(e) => onInputChange('employment.current.status', e.target.value)}
            required
            variant="outlined"
            sx={textFieldStyles}
          >
            {employmentStatusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Employment Details - Only show if employed */}
        {isEmployed && (
          <>
            {/* Employer Details Section */}
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
                  Employer Details
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'grey.600',
                    fontSize: '0.875rem',
                    mb: 2,
                  }}
                >
                  Information about current employer and position
                </Typography>
              </Box>
            </Grid>

            {/* Employer Name - Left Column */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Employer Name"
                value={formData.current.employer?.name || ''}
                onChange={(e) => onInputChange('employment.current.employer.name', e.target.value)}
                placeholder="e.g., ABC Company Ltd"
                required={isEmployed}
                variant="outlined"
                sx={textFieldStyles}
              />
            </Grid>

            {/* Job Title - Right Column */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Position/Job Title"
                value={formData.current.employer?.position || ''}
                onChange={(e) =>
                  onInputChange('employment.current.employer.position', e.target.value)
                }
                placeholder="e.g., Software Engineer"
                required={isEmployed}
                variant="outlined"
                sx={textFieldStyles}
              />
            </Grid>

            {/* Contract Type - Left Column */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                select
                label="Contract Type"
                value={formData.current.employer?.contractType || 'permanent'}
                onChange={(e) =>
                  onInputChange('employment.current.employer.contractType', e.target.value)
                }
                variant="outlined"
                sx={textFieldStyles}
              >
                {contractTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Start Date - Right Column */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={formData.current.employer?.startDate || ''}
                onChange={(e) =>
                  onInputChange('employment.current.employer.startDate', e.target.value)
                }
                variant="outlined"
                slotProps={{ inputLabel: { shrink: true } }}
                sx={textFieldStyles}
              />
            </Grid>

            {/* Work Address */}
            <Grid size={12}>
              <TextField
                fullWidth
                label="Work Address Line 1"
                value={formData.current.employer?.address.addressLine1 || ''}
                onChange={(e) =>
                  onInputChange('employment.current.employer.address.addressLine1', e.target.value)
                }
                placeholder="e.g., 123 Business Park"
                variant="outlined"
                sx={textFieldStyles}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                label="Work Address Line 2"
                value={formData.current.employer?.address.addressLine2 || ''}
                onChange={(e) =>
                  onInputChange('employment.current.employer.address.addressLine2', e.target.value)
                }
                placeholder="e.g., Suite 100 (optional)"
                variant="outlined"
                sx={textFieldStyles}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Work City"
                value={formData.current.employer?.address.city || ''}
                onChange={(e) =>
                  onInputChange('employment.current.employer.address.city', e.target.value)
                }
                placeholder="e.g., London"
                variant="outlined"
                sx={textFieldStyles}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Work County"
                value={formData.current.employer?.address.county || ''}
                onChange={(e) =>
                  onInputChange('employment.current.employer.address.county', e.target.value)
                }
                placeholder="e.g., Greater London"
                variant="outlined"
                sx={textFieldStyles}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Work Postcode"
                value={formData.current.employer?.address.postcode || ''}
                onChange={(e) =>
                  onInputChange('employment.current.employer.address.postcode', e.target.value)
                }
                placeholder="e.g., SW1A 1AA"
                variant="outlined"
                sx={textFieldStyles}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Work Country"
                value={formData.current.employer?.address.country || 'United Kingdom'}
                onChange={(e) =>
                  onInputChange('employment.current.employer.address.country', e.target.value)
                }
                variant="outlined"
                sx={textFieldStyles}
              />
            </Grid>

            {/* Employer Phone */}
            <Grid size={12}>
              <TextField
                fullWidth
                label="Employer Phone"
                value={formData.current.employer?.phone || ''}
                onChange={(e) => onInputChange('employment.current.employer.phone', e.target.value)}
                placeholder="e.g., 020 1234 5678"
                variant="outlined"
                sx={textFieldStyles}
              />
            </Grid>
          </>
        )}

        {/* Income Information Section */}
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
              Income Information
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'grey.600',
                fontSize: '0.875rem',
                mb: 2,
              }}
            >
              Salary and income details
            </Typography>
          </Box>
        </Grid>

        {/* Gross Annual Salary - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            type="number"
            label="Gross Annual Salary"
            value={formData.current.income.gross.annual}
            onChange={(e) =>
              onInputChange(
                'employment.current.income.gross.annual',
                parseFloat(e.target.value) || 0
              )
            }
            placeholder="e.g., 45000"
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Gross Monthly Salary - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            type="number"
            label="Gross Monthly Salary"
            value={formData.current.income.gross.monthly}
            onChange={(e) =>
              onInputChange(
                'employment.current.income.gross.monthly',
                parseFloat(e.target.value) || 0
              )
            }
            placeholder="e.g., 3750"
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Net Annual Salary - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            type="number"
            label="Net Annual Salary"
            value={formData.current.income.net.annual}
            onChange={(e) =>
              onInputChange('employment.current.income.net.annual', parseFloat(e.target.value) || 0)
            }
            placeholder="e.g., 36000"
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Net Monthly Salary - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            type="number"
            label="Net Monthly Salary"
            value={formData.current.income.net.monthly}
            onChange={(e) =>
              onInputChange(
                'employment.current.income.net.monthly',
                parseFloat(e.target.value) || 0
              )
            }
            placeholder="e.g., 3000"
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Currency - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Currency"
            value={formData.current.income.currency}
            onChange={(e) => onInputChange('employment.current.income.currency', e.target.value)}
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Pay Frequency - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            select
            label="Pay Frequency"
            value={formData.current.income.payFrequency}
            onChange={(e) =>
              onInputChange('employment.current.income.payFrequency', e.target.value)
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

        {/* Income Verification Section */}
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
              Income Verification
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'grey.600',
                fontSize: '0.875rem',
                mb: 2,
              }}
            >
              Verification status and documentation details
            </Typography>
          </Box>
        </Grid>

        {/* Income Verified - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            select
            label="Income Verified"
            value={formData.current.income.verified ? 'yes' : 'no'}
            onChange={(e) =>
              onInputChange('employment.current.income.verified', e.target.value === 'yes')
            }
            variant="outlined"
            sx={textFieldStyles}
          >
            <MenuItem value="no">No</MenuItem>
            <MenuItem value="yes">Yes</MenuItem>
          </TextField>
        </Grid>

        {/* Verification Date - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            type="date"
            label="Verification Date"
            value={formData.current.income.verificationDate || ''}
            onChange={(e) =>
              onInputChange('employment.current.income.verificationDate', e.target.value)
            }
            disabled={!formData.current.income.verified}
            variant="outlined"
            slotProps={{ inputLabel: { shrink: true } }}
            sx={textFieldStyles}
          />
        </Grid>

        {/* Verification Method - Full Width */}
        <Grid size={12}>
          <TextField
            fullWidth
            select
            label="Verification Method"
            value={formData.current.income.verificationMethod || ''}
            onChange={(e) =>
              onInputChange('employment.current.income.verificationMethod', e.target.value)
            }
            disabled={!formData.current.income.verified}
            variant="outlined"
            sx={textFieldStyles}
          >
            <MenuItem value="">Select verification method</MenuItem>
            <MenuItem value="payslip">Payslip</MenuItem>
            <MenuItem value="bank-statement">Bank Statement</MenuItem>
            <MenuItem value="employment-contract">Employment Contract</MenuItem>
            <MenuItem value="p60">P60 Tax Certificate</MenuItem>
            <MenuItem value="sa302">SA302 Tax Calculation</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>
        </Grid>

        {/* Probation Period Section */}
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
              Probation Period
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'grey.600',
                fontSize: '0.875rem',
                mb: 2,
              }}
            >
              Current probation status for employed positions
            </Typography>
          </Box>
        </Grid>

        {/* In Probation - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            select
            label="Currently in Probation Period"
            value={formData.current.income.probationPeriod.inProbation ? 'yes' : 'no'}
            onChange={(e) =>
              onInputChange(
                'employment.current.income.probationPeriod.inProbation',
                e.target.value === 'yes'
              )
            }
            disabled={!isEmployed}
            variant="outlined"
            sx={textFieldStyles}
          >
            <MenuItem value="no">No</MenuItem>
            <MenuItem value="yes">Yes</MenuItem>
          </TextField>
        </Grid>

        {/* Probation End Date - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            type="date"
            label="Probation End Date"
            value={formData.current.income.probationPeriod.endDate || ''}
            onChange={(e) =>
              onInputChange('employment.current.income.probationPeriod.endDate', e.target.value)
            }
            disabled={!formData.current.income.probationPeriod.inProbation}
            variant="outlined"
            slotProps={{ inputLabel: { shrink: true } }}
            sx={textFieldStyles}
          />
        </Grid>

        {/* Benefits Information Section */}
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
              Benefits Information
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'grey.600',
                fontSize: '0.875rem',
                mb: 2,
              }}
            >
              Government benefits and support payments
            </Typography>
          </Box>
        </Grid>

        {/* Receives Benefits - Left Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            select
            label="Receives Government Benefits"
            value={formData.current.benefits.receives ? 'yes' : 'no'}
            onChange={(e) =>
              onInputChange('employment.current.benefits.receives', e.target.value === 'yes')
            }
            variant="outlined"
            sx={textFieldStyles}
          >
            <MenuItem value="no">No</MenuItem>
            <MenuItem value="yes">Yes</MenuItem>
          </TextField>
        </Grid>

        {/* Monthly Benefits Amount - Right Column */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            type="number"
            label="Monthly Benefits Amount"
            value={formData.current.benefits.monthlyAmount}
            onChange={(e) =>
              onInputChange(
                'employment.current.benefits.monthlyAmount',
                parseFloat(e.target.value) || 0
              )
            }
            placeholder="e.g., 800"
            disabled={!formData.current.benefits.receives}
            variant="outlined"
            sx={textFieldStyles}
          />
        </Grid>

        {/* Benefits Types - Full Width */}
        {formData.current.benefits.receives && (
          <Grid size={12}>
            <TextField
              fullWidth
              select
              label="Types of Benefits"
              value={formData.current.benefits.types}
              onChange={(e) => {
                const value = e.target.value
                onInputChange('employment.current.benefits.types', value)
              }}
              SelectProps={{
                multiple: true,
                renderValue: (selected) => (selected as string[]).join(', '),
              }}
              variant="outlined"
              sx={textFieldStyles}
            >
              <MenuItem value="universal-credit">Universal Credit</MenuItem>
              <MenuItem value="housing-benefit">Housing Benefit</MenuItem>
              <MenuItem value="council-tax-support">Council Tax Support</MenuItem>
              <MenuItem value="child-benefit">Child Benefit</MenuItem>
              <MenuItem value="child-tax-credit">Child Tax Credit</MenuItem>
              <MenuItem value="working-tax-credit">Working Tax Credit</MenuItem>
              <MenuItem value="jobseekers-allowance">Jobseeker&apos;s Allowance</MenuItem>
              <MenuItem value="employment-support-allowance">Employment Support Allowance</MenuItem>
              <MenuItem value="disability-living-allowance">Disability Living Allowance</MenuItem>
              <MenuItem value="personal-independence-payment">
                Personal Independence Payment
              </MenuItem>
              <MenuItem value="pension-credit">Pension Credit</MenuItem>
              <MenuItem value="state-pension">State Pension</MenuItem>
              <MenuItem value="carers-allowance">Carer&apos;s Allowance</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
          </Grid>
        )}

        {/* HR Contact Section - Only for employed */}
        {isEmployed && (
          <>
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
                  HR Contact (Optional)
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'grey.600',
                    fontSize: '0.875rem',
                    mb: 2,
                  }}
                >
                  HR department contact for employment verification
                </Typography>
              </Box>
            </Grid>

            {/* HR Contact Name - Left Column */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="HR Contact Name"
                value={formData.current.employer?.hrContactName || ''}
                onChange={(e) =>
                  onInputChange('employment.current.employer.hrContactName', e.target.value)
                }
                placeholder="e.g., Sarah Johnson"
                variant="outlined"
                sx={textFieldStyles}
              />
            </Grid>

            {/* HR Contact Phone - Right Column */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="HR Contact Phone"
                value={formData.current.employer?.hrContactPhone || ''}
                onChange={(e) =>
                  onInputChange('employment.current.employer.hrContactPhone', e.target.value)
                }
                placeholder="e.g., 020 1234 5678"
                variant="outlined"
                sx={textFieldStyles}
              />
            </Grid>

            {/* HR Contact Email - Full Width */}
            <Grid size={12}>
              <TextField
                fullWidth
                type="email"
                label="HR Contact Email"
                value={formData.current.employer?.hrContactEmail || ''}
                onChange={(e) =>
                  onInputChange('employment.current.employer.hrContactEmail', e.target.value)
                }
                placeholder="e.g., hr@company.com"
                variant="outlined"
                sx={textFieldStyles}
              />
            </Grid>
          </>
        )}
      </Grid>
    </Card>
  )
}

export default EmploymentInfoForm
