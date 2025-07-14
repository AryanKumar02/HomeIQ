import React, { useState, useEffect } from 'react'
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
  Snackbar
} from '@mui/material'
import Grid from '@mui/material/Grid'
import { useTheme } from '@mui/material/styles'
import { Person, Add } from '@mui/icons-material'
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
      monthlyRent?: number
      securityDeposit?: number
    }
  }
  onInputChange: (field: string, value: string | boolean) => void
  textFieldStyles: object
}

const PropertyStatusOccupancyForm: React.FC<PropertyStatusOccupancyFormProps> = ({
  formData,
  onInputChange,
  textFieldStyles,
}) => {
  const theme = useTheme()
  const [selectedTenant, setSelectedTenant] = useState<any>(null)
  const [leaseDialogOpen, setLeaseDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'warning' | 'info'
  }>({
    open: false,
    message: '',
    severity: 'info'
  })

  // Fetch tenants
  const { data: tenants = [], refetch: refetchTenants } = useTenants()

  // Filter available tenants (approved and not currently leased)
  const availableTenants = tenants.filter(tenant => 
    tenant.applicationStatus.status === 'approved' &&
    !tenant.leases?.some(lease => lease.status === 'active')
  )

  // Helper function to determine if rental fields should be shown
  const shouldShowRentalFields = (status: string) => {
    return status === 'occupied' || status === 'pending'
  }

  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({ open: true, message, severity })
  }

  const getTenantName = (tenant: any) => {
    return `${tenant.personalInfo.firstName} ${tenant.personalInfo.lastName}`
  }

  const getCurrentTenant = () => {
    if (!formData.occupancy.tenant) return null
    return tenants.find(t => t._id === formData.occupancy.tenant)
  }

  const handleTenantSelect = (tenant: any) => {
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

    setLoading(true)
    try {
      await tenantsApi.assignToProperty({
        tenantId: selectedTenant._id,
        propertyId: formData._id,
        leaseData: {
          startDate: formData.occupancy.leaseStart,
          endDate: formData.occupancy.leaseEnd,
          monthlyRent: formData.financials?.monthlyRent || 0,
          securityDeposit: formData.financials?.securityDeposit || 0,
          tenancyType: 'assured-shorthold'
        }
      })

      onInputChange('occupancy.tenant', selectedTenant._id)
      onInputChange('occupancy.isOccupied', true)
      setLeaseDialogOpen(false)
      refetchTenants()
      showNotification(`${getTenantName(selectedTenant)} assigned successfully!`, 'success')
    } catch (error) {
      console.error('Assignment error:', error)
      showNotification('Failed to assign tenant', 'error')
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
        propertyId: formData._id
      })

      onInputChange('occupancy.tenant', '')
      onInputChange('occupancy.isOccupied', false)
      refetchTenants()
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
              <Box sx={{ 
                p: 2, 
                border: 1, 
                borderColor: 'grey.300', 
                borderRadius: 1, 
                bgcolor: 'grey.50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
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
                  onClick={handleUnassignTenant}
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
                        endAdornment: (
                          <>
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      },
                    }}
                  />
                )}
                renderOption={(props, tenant) => (
                  <Box component="li" {...props}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Person fontSize="small" color="action" />
                      <Box>
                        <Typography variant="body1">
                          {getTenantName(tenant)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {tenant.contactInfo?.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
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
              onChange={(e) => onInputChange('occupancy.rentDueDate', e.target.value)}
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
      <Dialog open={leaseDialogOpen} onClose={() => setLeaseDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Assign {selectedTenant && getTenantName(selectedTenant)} to Property
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              This will create a new lease agreement with the current property details:
            </Typography>
            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
              <Typography variant="body2"><strong>Lease Start:</strong> {formData.occupancy.leaseStart}</Typography>
              <Typography variant="body2"><strong>Lease End:</strong> {formData.occupancy.leaseEnd}</Typography>
              <Typography variant="body2"><strong>Lease Type:</strong> {formData.occupancy.leaseType}</Typography>
              {formData.financials?.monthlyRent && (
                <Typography variant="body2"><strong>Monthly Rent:</strong> £{formData.financials.monthlyRent}</Typography>
              )}
              {formData.financials?.securityDeposit && (
                <Typography variant="body2"><strong>Security Deposit:</strong> £{formData.financials.securityDeposit}</Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaseDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssignTenant}
            disabled={loading}
            variant="contained"
          >
            {loading ? 'Assigning...' : 'Assign Tenant'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
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
