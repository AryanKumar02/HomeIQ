/* eslint-disable react/prop-types */
import { useState } from 'react'
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Button,
  IconButton,
  Switch,
  FormControlLabel,
  Autocomplete,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import { Add as AddIcon, Remove as RemoveIcon, Person } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import Card from '../basic/Card'
import type { Unit } from '../../services/property'
import { useTenants } from '../../hooks/useTenants'
import { tenantsApi } from '../../api/tenants'

interface UnitManagementProps {
  units: Unit[]
  propertyType: string
  propertyId?: string
  onAddUnit: () => void
  onRemoveUnit: (index: number) => void
  onInputChange: (field: string, value: string | boolean) => void
  textFieldStyles: object
  onPropertyUpdate?: () => void
}

const UnitManagement: React.FC<UnitManagementProps> = ({
  units,
  propertyType,
  propertyId,
  onAddUnit,
  onRemoveUnit,
  onInputChange,
  textFieldStyles,
  onPropertyUpdate,
}) => {
  const theme = useTheme()

  // State for tenant assignment
  const [selectedTenant, setSelectedTenant] = useState<{
    _id: string
    personalInfo: { firstName: string; lastName: string }
  } | null>(null)
  const [selectedUnitIndex, setSelectedUnitIndex] = useState<number | null>(null)
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

  // Helper function to determine if rental fields should be shown
  const shouldShowRentalFields = (status: string) => {
    return status === 'occupied' || status === 'pending'
  }

  // Helper functions from PropertyStatusOccupancyForm
  const getTenantName = (tenant: { personalInfo: { firstName: string; lastName: string } }) => {
    return `${tenant.personalInfo.firstName} ${tenant.personalInfo.lastName}`
  }

  const getQualificationStatus = (tenant: {
    qualificationStatus?: { status?: string; issues?: unknown[] }
  }) => {
    if (!tenant.qualificationStatus) {
      return { status: 'unknown', color: 'default', label: 'Unknown' }
    }

    const qualification = tenant.qualificationStatus

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

  const getCurrentTenant = (unit: Unit) => {
    if (!unit.occupancy.tenant) return null
    return (tenants as { _id: string }[]).find((t) => t._id === unit.occupancy.tenant)
  }

  // Filter available tenants (qualified or approved, and not currently leased)
  const availableTenants = (
    tenants as { leases?: { status: string }[]; applicationStatus?: { status: string } }[]
  ).filter((tenant) => {
    const hasNoActiveLease =
      !tenant.leases ||
      !Array.isArray(tenant.leases) ||
      !tenant.leases.some((lease) => lease.status === 'active')
    const qualification = getQualificationStatus(tenant as unknown as { qualificationStatus?: { status?: string; issues?: unknown[] } })

    // Include tenants that are either manually approved or automatically qualified
    const isApproved = tenant.applicationStatus?.status === 'approved'
    const isQualified = qualification.status === 'qualified'
    const needsReview = qualification.status === 'needs-review'

    return hasNoActiveLease && (isApproved || isQualified || needsReview)
  })

  const showNotification = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info'
  ) => {
    setNotification({ open: true, message, severity })
  }

  const handleTenantSelect = (
    unitIndex: number,
    tenant: { _id: string; personalInfo: { firstName: string; lastName: string } } | null
  ) => {
    if (!tenant) {
      setSelectedTenant(null)
      onInputChange(`units.${unitIndex}.occupancy.tenant`, '')
      return
    }

    setSelectedTenant(tenant)
    setSelectedUnitIndex(unitIndex)
    setLeaseDialogOpen(true)
  }

  const handleAssignTenant = async () => {
    if (!selectedTenant || selectedUnitIndex === null || !propertyId) return

    const unit = units[selectedUnitIndex]
    const startDate = new Date(unit.occupancy.leaseStart || new Date()).toISOString().split('T')[0]
    const endDate = new Date(
      unit.occupancy.leaseEnd || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    )
      .toISOString()
      .split('T')[0]

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      showNotification('Lease start date must be before end date', 'error')
      return
    }

    if (new Date(endDate) <= new Date()) {
      showNotification('Lease end date must be in the future', 'error')
      return
    }

    setLoading(true)
    try {
      await tenantsApi.assignToProperty({
        tenantId: selectedTenant._id,
        propertyId: propertyId,
        unitId: unit._id,
        leaseData: {
          startDate: startDate,
          endDate: endDate,
          monthlyRent: Number(unit.monthlyRent) || 0,
          securityDeposit: Number(unit.securityDeposit) || 0,
          tenancyType: 'assured-shorthold',
        },
      })

      onInputChange(`units.${selectedUnitIndex}.occupancy.tenant`, selectedTenant._id)
      onInputChange(`units.${selectedUnitIndex}.occupancy.isOccupied`, true)
      onInputChange(`units.${selectedUnitIndex}.status`, 'occupied')
      setLeaseDialogOpen(false)
      void refetchTenants()

      // Refresh property data to get latest occupancy info
      if (onPropertyUpdate) {
        onPropertyUpdate()
      }

      showNotification(
        `${getTenantName(selectedTenant as unknown as { personalInfo: { firstName: string; lastName: string } })} assigned to unit ${unit.unitNumber} successfully!`,
        'success'
      )
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

  const handleUnassignTenant = async (unitIndex: number) => {
    const unit = units[unitIndex]
    const currentTenant = getCurrentTenant(unit)
    if (!currentTenant || !propertyId || !unit._id) return

    setLoading(true)
    try {
      await tenantsApi.unassignFromProperty({
        tenantId: currentTenant._id,
        propertyId: propertyId,
        unitId: unit._id,
      })

      onInputChange(`units.${unitIndex}.occupancy.tenant`, '')
      onInputChange(`units.${unitIndex}.occupancy.isOccupied`, false)
      onInputChange(`units.${unitIndex}.status`, 'available')
      void refetchTenants()

      // Refresh property data
      if (onPropertyUpdate) {
        onPropertyUpdate()
      }

      showNotification(
        `${getTenantName(currentTenant as unknown as { personalInfo: { firstName: string; lastName: string } })} unassigned from unit ${unit.unitNumber} successfully!`,
        'success'
      )
    } catch (error) {
      console.error('Unassignment error:', error)
      showNotification('Failed to unassign tenant', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Unit status options
  const unitStatuses = [
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'off-market', label: 'Off Market' },
  ]

  // Unit parking options
  const unitParkingOptions = [
    { value: 'none', label: 'None' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'shared', label: 'Shared' },
    { value: 'garage', label: 'Garage' },
  ]

  // Lease type options
  const leaseTypes = [
    { value: 'month-to-month', label: 'Month-to-Month' },
    { value: 'fixed-term', label: 'Fixed Term' },
    { value: 'week-to-week', label: 'Week-to-Week' },
  ]

  // Only show if property type is apartment or duplex
  if (propertyType !== 'apartment' && propertyType !== 'duplex') {
    return null
  }

  return (
    <Card
      title="Units Management"
      subtitle={`Manage individual units for this ${propertyType}`}
      padding={{ xs: 3, sm: 4, md: 5 }}
      marginBottom={4}
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
          Units ({units.length})
        </Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={onAddUnit}
          variant="outlined"
          sx={{
            borderColor: theme.palette.secondary.main,
            color: theme.palette.secondary.main,
            '&:hover': {
              borderColor: theme.palette.secondary.main,
              backgroundColor: `${theme.palette.secondary.main}10`,
            },
          }}
        >
          Add Unit
        </Button>
      </Box>

      {units.map((unit, index) => (
        <Box key={index} sx={{ mb: 4, p: 3, border: '1px solid', borderColor: 'border.light', borderRadius: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Unit {index + 1}
            </Typography>
            {units.length > 1 && (
              <IconButton
                onClick={() => onRemoveUnit(index)}
                size="small"
                sx={{ color: 'error.main' }}
              >
                <RemoveIcon />
              </IconButton>
            )}
          </Box>

          {/* Basic Unit Information */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {(propertyType === 'apartment' || propertyType === 'duplex') && (
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Unit Number"
                  value={unit.unitNumber}
                  onChange={(e) => onInputChange(`units.${index}.unitNumber`, e.target.value)}
                  placeholder={
                    propertyType === 'duplex' ? 'e.g., A, B, Upper, Lower' : 'e.g., 101, A, 1A'
                  }
                  required
                  variant="outlined"
                  sx={textFieldStyles}
                  slotProps={{
                    htmlInput: { maxLength: 20 },
                  }}
                />
              </Grid>
            )}

            <Grid
              size={{
                xs: 12,
                md: propertyType === 'apartment' || propertyType === 'duplex' ? 6 : 3,
              }}
            >
              <TextField
                fullWidth
                label="Bedrooms"
                type="number"
                value={unit.bedrooms}
                onChange={(e) => onInputChange(`units.${index}.bedrooms`, e.target.value)}
                placeholder="0"
                variant="outlined"
                sx={textFieldStyles}
                slotProps={{
                  htmlInput: { min: 0, max: 50 },
                }}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: propertyType === 'apartment' || propertyType === 'duplex' ? 6 : 3,
              }}
            >
              <TextField
                fullWidth
                label="Bathrooms"
                type="number"
                value={unit.bathrooms}
                onChange={(e) => onInputChange(`units.${index}.bathrooms`, e.target.value)}
                placeholder="0"
                variant="outlined"
                sx={textFieldStyles}
                slotProps={{
                  htmlInput: { min: 0, max: 50, step: 0.5 },
                }}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: propertyType === 'apartment' || propertyType === 'duplex' ? 6 : 3,
              }}
            >
              <TextField
                fullWidth
                label="Square Footage"
                type="number"
                value={unit.squareFootage}
                onChange={(e) => onInputChange(`units.${index}.squareFootage`, e.target.value)}
                placeholder="e.g., 800"
                variant="outlined"
                sx={textFieldStyles}
                slotProps={{
                  htmlInput: { min: 1, max: 10000 },
                }}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: propertyType === 'apartment' || propertyType === 'duplex' ? 6 : 3,
              }}
            >
              <TextField
                fullWidth
                select
                label="Status"
                value={unit.status}
                onChange={(e) => onInputChange(`units.${index}.status`, e.target.value)}
                variant="outlined"
                sx={textFieldStyles}
              >
                {unitStatuses.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          {/* Tenant Assignment - only show when unit is occupied/pending */}
          {shouldShowRentalFields(unit.status) && (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Tenant Assignment
              </Typography>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12 }}>
                  {getCurrentTenant(unit) ? (
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
                            {getTenantName(getCurrentTenant(unit)! as unknown as { personalInfo: { firstName: string; lastName: string } })}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Assigned to Unit {unit.unitNumber}
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => void handleUnassignTenant(index)}
                        disabled={loading}
                      >
                        Remove Tenant
                      </Button>
                    </Box>
                  ) : (
                    <Autocomplete
                      options={availableTenants}
                      getOptionLabel={(tenant) => getTenantName(tenant as unknown as { personalInfo: { firstName: string; lastName: string } })}
                      onChange={(_, tenant) => handleTenantSelect(index, tenant as unknown as { _id: string; personalInfo: { firstName: string; lastName: string } } | null)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Tenant"
                          placeholder="Search for qualified tenants..."
                          variant="outlined"
                          sx={textFieldStyles}
                        />
                      )}
                      renderOption={(props, tenant) => {
                        const qualification = getQualificationStatus(tenant as unknown as { qualificationStatus?: { status?: string; issues?: unknown[] } })
                        return (
                          <Box
                            component="li"
                            {...props}
                            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                          >
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="body1">{getTenantName(tenant as unknown as { personalInfo: { firstName: string; lastName: string } })}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {
                                  (tenant as { contactInfo?: { email?: string } }).contactInfo
                                    ?.email
                                }
                              </Typography>
                            </Box>
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
                        )
                      }}
                      noOptionsText="No qualified tenants available"
                    />
                  )}
                </Grid>
              </Grid>
            </>
          )}

          {/* Rental Information - only show when unit is occupied/pending */}
          {shouldShowRentalFields(unit.status) && (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Rental Information
              </Typography>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Monthly Rent"
                    type="number"
                    value={unit.monthlyRent}
                    onChange={(e) => onInputChange(`units.${index}.monthlyRent`, e.target.value)}
                    placeholder="e.g., 1200"
                    variant="outlined"
                    sx={textFieldStyles}
                    slotProps={{
                      htmlInput: { min: 0 },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Security Deposit"
                    type="number"
                    value={unit.securityDeposit}
                    onChange={(e) =>
                      onInputChange(`units.${index}.securityDeposit`, e.target.value)
                    }
                    placeholder="e.g., 1200"
                    variant="outlined"
                    sx={textFieldStyles}
                    slotProps={{
                      htmlInput: { min: 0 },
                    }}
                  />
                </Grid>
              </Grid>
            </>
          )}

          {/* Lease Information - only show when unit is occupied/pending */}
          {shouldShowRentalFields(unit.status) && (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Lease Information
              </Typography>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Lease Start Date"
                    type="date"
                    value={unit.occupancy?.leaseStart ?? ''}
                    onChange={(e) =>
                      onInputChange(`units.${index}.occupancy.leaseStart`, e.target.value)
                    }
                    variant="outlined"
                    sx={textFieldStyles}
                    slotProps={{
                      inputLabel: { shrink: true },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Lease End Date"
                    type="date"
                    value={unit.occupancy?.leaseEnd ?? ''}
                    onChange={(e) =>
                      onInputChange(`units.${index}.occupancy.leaseEnd`, e.target.value)
                    }
                    variant="outlined"
                    sx={textFieldStyles}
                    slotProps={{
                      inputLabel: { shrink: true },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label="Lease Type"
                    value={unit.occupancy?.leaseType ?? 'month-to-month'}
                    onChange={(e) =>
                      onInputChange(`units.${index}.occupancy.leaseType`, e.target.value)
                    }
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

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Rent Due Date"
                    type="number"
                    value={unit.occupancy?.rentDueDate ?? '1'}
                    onChange={(e) =>
                      onInputChange(`units.${index}.occupancy.rentDueDate`, e.target.value)
                    }
                    placeholder="1"
                    variant="outlined"
                    sx={textFieldStyles}
                    slotProps={{
                      htmlInput: { min: 1, max: 31 },
                    }}
                  />
                </Grid>
              </Grid>
            </>
          )}

          {/* Features */}
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Features
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                select
                label="Parking"
                value={unit.features.parking}
                onChange={(e) => onInputChange(`units.${index}.features.parking`, e.target.value)}
                variant="outlined"
                sx={textFieldStyles}
              >
                {unitParkingOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={unit.features.balcony}
                    onChange={(e) =>
                      onInputChange(`units.${index}.features.balcony`, e.target.checked)
                    }
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
                label="Has Balcony"
              />
            </Grid>
          </Grid>
        </Box>
      ))}

      {/* Lease Assignment Dialog */}
      <Dialog
        open={leaseDialogOpen}
        onClose={() => setLeaseDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Assign {selectedTenant && getTenantName(selectedTenant as unknown as { personalInfo: { firstName: string; lastName: string } })} to Unit{' '}
          {selectedUnitIndex !== null ? units[selectedUnitIndex]?.unitNumber : ''}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              This will create a new lease agreement with the current unit details:
            </Typography>
            {selectedUnitIndex !== null && (
              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Unit:</strong> {units[selectedUnitIndex]?.unitNumber}
                </Typography>
                <Typography variant="body2">
                  <strong>Lease Start:</strong>{' '}
                  {units[selectedUnitIndex]?.occupancy.leaseStart || 'Today'}
                </Typography>
                <Typography variant="body2">
                  <strong>Lease End:</strong>{' '}
                  {units[selectedUnitIndex]?.occupancy.leaseEnd || '1 year from start'}
                </Typography>
                <Typography variant="body2">
                  <strong>Lease Type:</strong>{' '}
                  {units[selectedUnitIndex]?.occupancy.leaseType || 'month-to-month'}
                </Typography>
                {units[selectedUnitIndex]?.monthlyRent && (
                  <Typography variant="body2">
                    <strong>Monthly Rent:</strong> £{units[selectedUnitIndex]?.monthlyRent}
                  </Typography>
                )}
                {units[selectedUnitIndex]?.securityDeposit && (
                  <Typography variant="body2">
                    <strong>Security Deposit:</strong> £{units[selectedUnitIndex]?.securityDeposit}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaseDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleAssignTenant()}
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: theme.palette.secondary.main,
              '&:hover': {
                backgroundColor: theme.palette.secondary.dark,
              },
            }}
          >
            {loading ? 'Assigning...' : 'Assign Tenant'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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

export default UnitManagement
