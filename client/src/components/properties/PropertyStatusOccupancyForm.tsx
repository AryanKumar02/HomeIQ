/* eslint-disable react/prop-types */
import { useState } from 'react'
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Switch,
  FormControlLabel,
  Autocomplete,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import { useTheme } from '@mui/material/styles'
import { Person } from '@mui/icons-material'
import Card from '../basic/Card'
import { useTenants } from '../../hooks/useTenants'
import { tenantsApi } from '../../api/tenants'

interface PropertyStatusOccupancyFormProps {
  formData: {
    _id?: string
    status: string
    propertyType: string
    occupancy: {
      isOccupied: boolean
      tenant?: string
      leaseStart: string
      leaseEnd: string
      leaseType: string
      rentDueDate: string | number
    }
    financials?: {
      monthlyRent?: string | number
      securityDeposit?: string | number
      [key: string]: unknown
    }
  }
  onInputChange: (field: string, value: string | boolean) => void
  textFieldStyles: object
  onPropertyUpdate?: () => void
}

const PropertyStatusOccupancyForm: React.FC<PropertyStatusOccupancyFormProps> = ({
  formData,
  onInputChange,
  textFieldStyles,
  onPropertyUpdate,
}) => {
  const theme = useTheme()
  const [selectedTenant, setSelectedTenant] = useState<{
    _id: string
    personalInfo: { firstName: string; lastName: string }
  } | null>(null)
  const [leaseDialogOpen, setLeaseDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'warning' | 'info'
  }>({
    open: false,
    message: '',
    severity: 'info',
  })

  // Fetch tenants
  const { data: tenants = [], refetch: refetchTenants } = useTenants()

  // Get qualification status for a tenant
  const getQualificationStatus = (tenant: {
    qualificationStatus?: { status?: string; issues?: unknown[] }
  }) => {
    // Use the computed qualification status from backend
    const qualification = tenant.qualificationStatus
    if (!qualification) {
      return { status: 'unknown', color: 'default', label: 'Unknown' }
    }

    switch (qualification.status) {
      case 'qualified':
        return {
          status: 'qualified',
          color: 'success',
          label: 'Qualified',
          icon: '✓',
          issues: qualification.issues,
        }
      case 'needs-review':
        return {
          status: 'needs-review',
          color: 'warning',
          label: 'Needs Review',
          icon: '⚠',
          issues: qualification.issues,
        }
      case 'not-qualified':
        return {
          status: 'not-qualified',
          color: 'error',
          label: 'Not Qualified',
          icon: '✗',
          issues: qualification.issues,
        }
      default:
        return { status: 'unknown', color: 'default', label: 'Unknown' }
    }
  }

  // Filter available tenants (qualified or approved, and not currently leased)
  const availableTenants = tenants.filter(
    (
      tenant
    ): tenant is typeof tenant & {
      leases?: { status: string }[]
      applicationStatus: { status: string }
    } => {
      const hasNoActiveLease =
        !tenant.leases ||
        !Array.isArray(tenant.leases) ||
        !(tenant.leases as { status: string }[]).some(
          (lease: { status: string }) => lease.status === 'active'
        )
      const qualification = getQualificationStatus(tenant)

      // Include tenants that are either manually approved or automatically qualified
      const isApproved = tenant.applicationStatus?.status === 'approved'
      const isQualified = qualification.status === 'qualified'
      const needsReview = qualification.status === 'needs-review'

      return hasNoActiveLease && (isApproved || isQualified || needsReview)
    }
  )

  // Helper function to determine if rental fields should be shown
  const shouldShowRentalFields = (status: string) => {
    return status === 'occupied' || status === 'pending'
  }

  const showNotification = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info'
  ) => {
    setNotification({ open: true, message, severity })
  }

  const getTenantName = (tenant: { personalInfo: { firstName: string; lastName: string } }) => {
    return `${tenant.personalInfo.firstName} ${tenant.personalInfo.lastName}`
  }

  const getCurrentTenant = () => {
    if (!formData.occupancy.tenant) return null
    return tenants.find((t) => t._id === formData.occupancy.tenant)
  }

  const handleTenantSelect = (
    tenant: { _id: string; personalInfo: { firstName: string; lastName: string } } | null
  ) => {
    if (!tenant) {
      setSelectedTenant(null)
      onInputChange('occupancy.tenant', '')
      return
    }

    setSelectedTenant(tenant)
    setLeaseDialogOpen(true)
  }

  const handleAssignTenant = async () => {
    if (!selectedTenant || !formData._id) {
      showNotification('Property ID and tenant selection required', 'error')
      return
    }

    // Validate lease dates
    const startDate = new Date(formData.occupancy.leaseStart)
    const endDate = new Date(formData.occupancy.leaseEnd)
    const today = new Date()

    if (startDate >= endDate) {
      showNotification('Lease start date must be before end date', 'error')
      return
    }

    if (endDate <= today) {
      showNotification('Lease end date must be in the future', 'error')
      return
    }

    // Use provided dates or reasonable defaults
    const defaultStartDate = new Date().toISOString().split('T')[0] // Today
    const defaultEndDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0] // 1 year from now

    const leaseStartDate = formData.occupancy.leaseStart || defaultStartDate
    const leaseEndDate = formData.occupancy.leaseEnd || defaultEndDate

    setLoading(true)
    try {
      await tenantsApi.assignToProperty({
        tenantId: selectedTenant._id,
        propertyId: formData._id,
        leaseData: {
          startDate: leaseStartDate,
          endDate: leaseEndDate,
          monthlyRent: Number(formData.financials?.monthlyRent) || 0,
          securityDeposit: Number(formData.financials?.securityDeposit) || 0,
          tenancyType: 'assured-shorthold',
        },
      })

      onInputChange('occupancy.tenant', selectedTenant._id)
      onInputChange('occupancy.isOccupied', true)
      onInputChange('status', 'occupied')
      setLeaseDialogOpen(false)
      void refetchTenants()

      // Refresh property data to get latest occupancy info
      if (onPropertyUpdate) {
        onPropertyUpdate()
      }

      showNotification(`${getTenantName(selectedTenant)} assigned successfully!`, 'success')
    } catch (error: unknown) {
      console.error('Assignment error:', error)
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to assign tenant'
      showNotification(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUnassignTenant = async () => {
    const currentTenant = getCurrentTenant()
    if (!currentTenant || !formData._id) return

    setLoading(true)
    try {
      await tenantsApi.unassignFromProperty({
        tenantId: currentTenant._id,
        propertyId: formData._id,
      })

      onInputChange('occupancy.tenant', null)
      onInputChange('occupancy.isOccupied', false)
      onInputChange('status', 'available')
      void refetchTenants()
      showNotification(`${getTenantName(currentTenant)} unassigned successfully!`, 'success')
    } catch (error) {
      console.error('Unassignment error:', error)
      showNotification('Failed to unassign tenant', 'error')
    } finally {
      setLoading(false)
    }
  }

  const leaseTypes = [
    { value: 'month-to-month', label: 'Month-to-Month' },
    { value: 'fixed-term', label: 'Fixed Term' },
    { value: 'week-to-week', label: 'Week-to-Week' },
  ]

  // Only show for single-unit properties when occupied/pending
  if (
    formData.propertyType === 'apartment' ||
    formData.propertyType === 'duplex' ||
    !shouldShowRentalFields(formData.status)
  ) {
    return null
  }

  return (
    <Card padding={{ xs: 3, sm: 4, md: 5 }} marginBottom={4}>
      {/* Header with title and switch */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
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
            Property Status & Occupancy
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'grey.600',
              fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.95rem' },
            }}
          >
            Current status and occupancy information
          </Typography>
        </Box>
        {shouldShowRentalFields(formData.status) && (
          <FormControlLabel
            control={
              <Switch
                checked={formData.occupancy.isOccupied}
                onChange={(e) => onInputChange('occupancy.isOccupied', e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: theme.palette.secondary.main,
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: theme.palette.secondary.main,
                  },
                }}
              />
            }
            label="Currently Occupied"
            labelPlacement="start"
            sx={{ m: 0 }}
          />
        )}
      </Box>

      {shouldShowRentalFields(formData.status) && formData.occupancy.isOccupied && (
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
          {/* Tenant Assignment - Full Width */}
          <Grid size={{ xs: 12 }}>
            {getCurrentTenant() ? (
              <Box
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: 'grey.300',
                  borderRadius: 1,
                  bgcolor: 'grey.50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Person color="primary" />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {getTenantName(getCurrentTenant())}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Assigned Tenant
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => void handleUnassignTenant()}
                  disabled={loading}
                >
                  Remove Tenant
                </Button>
              </Box>
            ) : (
              <Autocomplete
                options={availableTenants}
                getOptionLabel={(tenant) => getTenantName(tenant)}
                value={selectedTenant}
                onChange={(event, newValue) => handleTenantSelect(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Assign Tenant"
                    placeholder="Select a tenant..."
                    variant="outlined"
                    sx={textFieldStyles}
                    slotProps={{
                      input: {
                        ...params.InputProps,
                        endAdornment: <>{params.InputProps.endAdornment}</>,
                      },
                    }}
                  />
                )}
                renderOption={(props, tenant) => {
                  const qualification = getQualificationStatus(tenant)
                  return (
                    <Box component="li" {...props}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Person fontSize="small" color="action" />
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="body1">{getTenantName(tenant)}</Typography>
                            <Chip
                              label={qualification.label}
                              size="small"
                              color={
                                qualification.color as 'success' | 'error' | 'warning' | 'default'
                              }
                              icon={
                                <span
                                  style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    width: '12px',
                                    height: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  {qualification.icon}
                                </span>
                              }
                              sx={{
                                fontSize: '0.7rem',
                                height: 22,
                                fontWeight: 500,
                                letterSpacing: '0.02em',
                                borderRadius: '12px',
                                '& .MuiChip-label': {
                                  paddingLeft: '6px',
                                  paddingRight: '8px',
                                },
                                '& .MuiChip-icon': {
                                  marginLeft: '6px',
                                  marginRight: '-2px',
                                },
                                boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  transform: 'translateY(-1px)',
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                                },
                              }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {tenant.contactInfo?.email}
                          </Typography>
                          {qualification.issues && qualification.issues.length > 0 && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block', fontStyle: 'italic' }}
                            >
                              {qualification.issues.slice(0, 2).join(', ')}
                              {qualification.issues.length > 2 && '...'}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  )
                }}
                noOptionsText="No approved tenants available"
              />
            )}
          </Grid>

          {/* Lease Start Date - Left Column */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Lease Start Date"
              type="date"
              value={formData.occupancy.leaseStart}
              onChange={(e) => onInputChange('occupancy.leaseStart', e.target.value)}
              variant="outlined"
              sx={textFieldStyles}
              slotProps={{
                inputLabel: { shrink: true },
              }}
            />
          </Grid>

          {/* Lease End Date - Right Column */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Lease End Date"
              type="date"
              value={formData.occupancy.leaseEnd}
              onChange={(e) => onInputChange('occupancy.leaseEnd', e.target.value)}
              variant="outlined"
              sx={textFieldStyles}
              slotProps={{
                inputLabel: { shrink: true },
              }}
            />
          </Grid>

          {/* Lease Type - Left Column */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              select
              label="Lease Type"
              value={formData.occupancy.leaseType}
              onChange={(e) => onInputChange('occupancy.leaseType', e.target.value)}
              variant="outlined"
              sx={textFieldStyles}
            >
              {leaseTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Rent Due Date - Right Column */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Rent Due Date"
              type="number"
              value={formData.occupancy.rentDueDate}
              onChange={(e) => void onInputChange('occupancy.rentDueDate', e.target.value)}
              placeholder="1"
              variant="outlined"
              sx={textFieldStyles}
              slotProps={{
                htmlInput: { min: 1, max: 31 },
              }}
            />
          </Grid>
        </Grid>
      )}

      {/* Lease Assignment Dialog */}
      <Dialog
        open={leaseDialogOpen}
        onClose={() => setLeaseDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Assign {selectedTenant && getTenantName(selectedTenant)} to Property
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              This will create a new lease agreement with the current property details:
            </Typography>
            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Lease Start:</strong> {formData.occupancy.leaseStart || 'Today'}
              </Typography>
              <Typography variant="body2">
                <strong>Lease End:</strong> {formData.occupancy.leaseEnd || '1 year from start'}
              </Typography>
              <Typography variant="body2">
                <strong>Lease Type:</strong> {formData.occupancy.leaseType || 'month-to-month'}
              </Typography>
              {formData.financials?.monthlyRent && (
                <Typography variant="body2">
                  <strong>Monthly Rent:</strong> £{formData.financials.monthlyRent}
                </Typography>
              )}
              {formData.financials?.securityDeposit && (
                <Typography variant="body2">
                  <strong>Security Deposit:</strong> £{formData.financials.securityDeposit}
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaseDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={() => void handleAssignTenant()} disabled={loading} variant="contained">
            {loading ? 'Assigning...' : 'Assign Tenant'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Card>
  )
}

export default PropertyStatusOccupancyForm
