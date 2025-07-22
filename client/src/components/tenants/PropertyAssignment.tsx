import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Chip,
  Avatar,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  IconButton,
  Paper,
  Alert,
  Snackbar,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import { Home, Person, AttachMoney, Close, Add } from '@mui/icons-material'
import { tenantsApi } from '../../api/tenants'
import type { Property } from '../../api/properties'
import type { Tenant } from '../../api/tenants'

interface PropertyAssignmentProps {
  properties: Property[]
  tenants: Tenant[]
  onAssignmentChange: () => void
}

interface AssignmentFormData {
  tenantId: string
  propertyId: string
  unitId?: string
  startDate: string
  endDate: string
  monthlyRent: number
  securityDeposit: number
  tenancyType: string
}

export default function PropertyAssignment({
  properties,
  tenants,
  onAssignmentChange,
}: PropertyAssignmentProps) {
  const [selectedProperty, setSelectedProperty] = useState<string>('')
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false)
  const [unassignDialogOpen, setUnassignDialogOpen] = useState(false)
  const [currentAssignment, setCurrentAssignment] = useState<{
    property: Property
    tenant: Tenant
    unitId?: string
  } | null>(null)
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
  const [formData, setFormData] = useState<AssignmentFormData>({
    tenantId: '',
    propertyId: '',
    unitId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    monthlyRent: 0,
    securityDeposit: 0,
    tenancyType: 'assured-shorthold',
  })

  // Helper function to get qualification status
  const getQualificationStatus = (tenant: Tenant) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    const qualification = (tenant as any).qualificationStatus
    if (!qualification) {
      return { status: 'unknown' }
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return qualification
  }

  const availableTenants = tenants.filter((tenant) => {
    const tenantLeases = (tenant as { leases?: { status: string }[] }).leases
    const hasNoActiveLeases =
      !tenantLeases ||
      !Array.isArray(tenantLeases) ||
      !tenantLeases.some((lease) => lease.status === 'active')
    
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const qualification = getQualificationStatus(tenant)
    
    // Include tenants that are either manually approved or automatically qualified
    const isApproved = (tenant as { applicationStatus?: { status?: string } }).applicationStatus?.status === 'approved'
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const isQualified = qualification.status === 'qualified'
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const needsReview = qualification.status === 'needs-review'

    return hasNoActiveLeases && (isApproved || isQualified || needsReview)
  })

  const filteredProperties = selectedProperty
    ? properties.filter((p) => p._id === selectedProperty)
    : properties

  const getPropertyStatus = (property: Property) => {
    if (property.occupancy?.isOccupied) {
      return 'occupied'
    }
    if (property.status === 'maintenance') {
      return 'maintenance'
    }
    return 'available'
  }

  const handleAssignTenant = (property: Property, unitId?: string) => {
    const unit = unitId ? property.units?.find((u) => u._id === unitId) : null
    const monthlyRent = Number(unit?.monthlyRent || property.financials?.monthlyRent || 0)
    const securityDeposit = Number(
      unit?.securityDeposit || property.financials?.securityDeposit || 0
    )

    setFormData({
      ...formData,
      propertyId: property._id!,
      unitId: unitId || '',
      monthlyRent,
      securityDeposit,
    })
    setAssignmentDialogOpen(true)
  }

  const handleUnassignTenant = (property: Property, tenant: Tenant, unitId?: string) => {
    setCurrentAssignment({ property, tenant, unitId })
    setUnassignDialogOpen(true)
  }

  const showNotification = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info'
  ) => {
    setNotification({ open: true, message, severity })
  }

  const submitAssignment = async () => {
    if (!formData.tenantId || !formData.propertyId) {
      showNotification('Please select both tenant and property', 'error')
      return
    }

    setLoading(true)
    try {
      await tenantsApi.assignToProperty({
        tenantId: formData.tenantId,
        propertyId: formData.propertyId,
        unitId: formData.unitId || undefined,
        leaseData: {
          startDate: formData.startDate,
          endDate: formData.endDate,
          monthlyRent: formData.monthlyRent,
          securityDeposit: formData.securityDeposit,
          tenancyType: formData.tenancyType,
        },
      })

      showNotification('Tenant assigned successfully!', 'success')
      setAssignmentDialogOpen(false)
      onAssignmentChange()

      // Reset form
      setFormData({
        tenantId: '',
        propertyId: '',
        unitId: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        monthlyRent: 0,
        securityDeposit: 0,
        tenancyType: 'assured-shorthold',
      })
    } catch (error) {
      console.error('Assignment error:', error)
      showNotification('Failed to assign tenant', 'error')
    } finally {
      setLoading(false)
    }
  }

  const submitUnassignment = async () => {
    if (!currentAssignment) return

    setLoading(true)
    try {
      await tenantsApi.unassignFromProperty({
        tenantId: currentAssignment.tenant._id!,
        propertyId: currentAssignment.property._id!,
        unitId: currentAssignment.unitId,
      })

      showNotification('Tenant unassigned successfully!', 'success')
      setUnassignDialogOpen(false)
      setCurrentAssignment(null)
      onAssignmentChange()
    } catch (error) {
      console.error('Unassignment error:', error)
      showNotification('Failed to unassign tenant', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getTenantName = (tenant: Tenant) => {
    return `${tenant.personalInfo.firstName} ${tenant.personalInfo.lastName}`
  }

  return (
    <Box sx={{ py: 2 }}>
      {/* Header with filters */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h2" fontWeight="bold">
          Property-Tenant Assignment
        </Typography>
        <FormControl sx={{ minWidth: 250 }}>
          <InputLabel>Filter by property</InputLabel>
          <Select
            value={selectedProperty}
            label="Filter by property"
            onChange={(e) => setSelectedProperty(e.target.value)}
          >
            <MenuItem value="">All Properties</MenuItem>
            {properties.map((property) => (
              <MenuItem key={property._id} value={property._id}>
                {property.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Property Grid */}
      <Grid container spacing={3}>
        {filteredProperties.map((property) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={property._id}>
            <Card sx={{ height: 'fit-content' }}>
              <CardHeader>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Typography variant="h6" component="h3">
                    {property.title}
                  </Typography>
                  <Chip
                    label={getPropertyStatus(property)}
                    color={
                      getPropertyStatus(property) === 'occupied'
                        ? 'error'
                        : getPropertyStatus(property) === 'available'
                          ? 'success'
                          : 'warning'
                    }
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {property.address.street}, {property.address.city}
                </Typography>
              </CardHeader>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Property Details */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Home fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {property.bedrooms}bed • {property.bathrooms}bath • {property.squareFootage}sq
                      ft
                    </Typography>
                  </Box>

                  {property.financials?.monthlyRent && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttachMoney fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        £{property.financials.monthlyRent}/month
                      </Typography>
                    </Box>
                  )}

                  {/* Single Unit Property */}
                  {(!property.units || property.units.length === 0) && (
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      {property.occupancy?.isOccupied && property.occupancy?.tenant ? (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32 }}>T</Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                Occupied
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Tenant assigned
                              </Typography>
                            </Box>
                          </Box>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              const tenant = tenants.find(
                                (t: Tenant) => t._id === property.occupancy?.tenant
                              )
                              if (tenant) handleUnassignTenant(property, tenant)
                            }}
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, backgroundColor: 'grey.300' }}>
                              <Person sx={{ color: 'grey.500' }} />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Available
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                No tenant assigned
                              </Typography>
                            </Box>
                          </Box>
                          {getPropertyStatus(property) === 'available' && (
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleAssignTenant(property)}
                            >
                              <Add fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      )}
                    </Paper>
                  )}

                  {/* Multi-Unit Property */}
                  {property.units && property.units.length > 0 && (
                    <Box>
                      <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                        Units:
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {property.units.map((unit) => (
                          <Paper key={unit._id} variant="outlined" sx={{ p: 2 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 1,
                              }}
                            >
                              <Typography variant="body2" fontWeight="medium">
                                Unit {unit.unitNumber}
                              </Typography>
                              <Chip
                                label={unit.status || 'available'}
                                size="small"
                                color={
                                  unit.status === 'occupied'
                                    ? 'error'
                                    : unit.status === 'available'
                                      ? 'success'
                                      : 'warning'
                                }
                              />
                            </Box>

                            {unit.occupancy?.isOccupied && unit.occupancy?.tenant ? (
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar sx={{ width: 24, height: 24 }}>T</Avatar>
                                  <Typography variant="caption" color="text.secondary">
                                    Occupied
                                  </Typography>
                                </Box>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    const tenant = tenants.find(
                                      (t: Tenant) => t._id === unit.occupancy?.tenant
                                    )
                                    if (tenant) handleUnassignTenant(property, tenant, unit._id)
                                  }}
                                >
                                  <Close fontSize="small" />
                                </IconButton>
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <Typography variant="caption" color="text.secondary">
                                  Available
                                </Typography>
                                {unit.status === 'available' && (
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() => handleAssignTenant(property, unit._id)}
                                  >
                                    <Add fontSize="small" />
                                  </IconButton>
                                )}
                              </Box>
                            )}
                          </Paper>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Assignment Dialog */}
      <Dialog
        open={assignmentDialogOpen}
        onClose={() => setAssignmentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Tenant to Property</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Select Tenant</InputLabel>
              <Select
                value={formData.tenantId}
                label="Select Tenant"
                onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
              >
                {availableTenants.map((tenant) => (
                  <MenuItem key={tenant._id} value={tenant._id}>
                    {getTenantName(tenant)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Monthly Rent (£)"
                  type="number"
                  value={formData.monthlyRent}
                  onChange={(e) =>
                    setFormData({ ...formData, monthlyRent: Number(e.target.value) })
                  }
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Security Deposit (£)"
                  type="number"
                  value={formData.securityDeposit}
                  onChange={(e) =>
                    setFormData({ ...formData, securityDeposit: Number(e.target.value) })
                  }
                />
              </Grid>
            </Grid>

            <FormControl fullWidth>
              <InputLabel>Tenancy Type</InputLabel>
              <Select
                value={formData.tenancyType}
                label="Tenancy Type"
                onChange={(e) => setFormData({ ...formData, tenancyType: e.target.value })}
              >
                <MenuItem value="assured-shorthold">Assured Shorthold</MenuItem>
                <MenuItem value="assured">Assured</MenuItem>
                <MenuItem value="regulated">Regulated</MenuItem>
                <MenuItem value="contractual">Contractual</MenuItem>
                <MenuItem value="periodic">Periodic</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignmentDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={() => void submitAssignment()} disabled={loading} variant="contained">
            {loading ? 'Assigning...' : 'Assign Tenant'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unassignment Dialog */}
      <Dialog
        open={unassignDialogOpen}
        onClose={() => setUnassignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Unassign Tenant</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography>
              Are you sure you want to unassign{' '}
              <strong>
                {currentAssignment?.tenant && getTenantName(currentAssignment.tenant)}
              </strong>{' '}
              from <strong>{currentAssignment?.property?.title}</strong>
              {currentAssignment?.unitId && (
                <span>
                  {' '}
                  (Unit{' '}
                  {
                    currentAssignment.property.units?.find(
                      (u: { _id?: string; unitNumber?: string }) =>
                        u._id === currentAssignment.unitId
                    )?.unitNumber
                  }
                  )
                </span>
              )}
              ?
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              This will terminate the active lease and mark the property/unit as available.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnassignDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={() => void submitUnassignment()}
            disabled={loading}
            variant="contained"
            color="error"
          >
            {loading ? 'Unassigning...' : 'Unassign Tenant'}
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
    </Box>
  )
}
