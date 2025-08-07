import React, { useState } from 'react'
import { Typography, TextField, MenuItem, Box, Alert, Snackbar, Grid } from '@mui/material'
import CustomButton from '../basic/CustomButton'
import { tenantsApi } from '../../api/tenants'
import type { Tenant } from '../../api/tenants'

interface ReferencingStatusFormProps {
  tenant: Tenant
  onUpdate?: (updatedTenant: Tenant) => void
  disabled?: boolean
  textFieldStyles?: object
}

interface ReferencingData {
  status: 'not-started' | 'in-progress' | 'completed' | 'failed'
  provider?: string
  reference?: string
  outcome: 'pending' | 'pass' | 'pass-with-conditions' | 'fail'
  conditions?: string
  notes?: string
  completedDate?: string
}

const REFERENCING_STATUSES = [
  { value: 'not-started', label: 'Not Started', color: 'default' },
  { value: 'in-progress', label: 'In Progress', color: 'warning' },
  { value: 'completed', label: 'Completed', color: 'success' },
  { value: 'failed', label: 'Failed', color: 'error' },
]

const REFERENCING_OUTCOMES = [
  { value: 'pending', label: '⏳ Pending', color: 'warning' },
  { value: 'pass', label: '✅ Pass', color: 'success' },
  { value: 'pass-with-conditions', label: '⚠️ Pass with Conditions', color: 'warning' },
  { value: 'fail', label: '❌ Fail', color: 'error' },
]

const ReferencingStatusForm: React.FC<ReferencingStatusFormProps> = ({
  tenant,
  onUpdate,
  disabled = false,
  textFieldStyles = {},
}) => {
  const [formData, setFormData] = useState<ReferencingData>({
    status: tenant.referencing?.status || 'not-started',
    provider: tenant.referencing?.provider || '',
    reference: tenant.referencing?.reference || '',
    outcome: tenant.referencing?.outcome || 'pending',
    conditions: tenant.referencing?.conditions || '',
    notes: tenant.referencing?.notes || '',
    completedDate: tenant.referencing?.completedDate || '',
  })

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

  const showNotification = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info'
  ) => {
    setNotification({ open: true, message, severity })
  }

  const handleInputChange = (field: keyof ReferencingData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Auto-set completed date when status changes to completed
    if (field === 'status' && value === 'completed' && !formData.completedDate) {
      setFormData((prev) => ({
        ...prev,
        completedDate: new Date().toISOString().split('T')[0],
      }))
    }
  }

  const handleSubmit = async () => {
    if (!tenant._id) {
      showNotification('Tenant ID is required', 'error')
      return
    }

    setLoading(true)
    try {
      // Prepare the update data
      const updateData: Partial<ReferencingData> = {}

      // Always include outcome to satisfy server validator
      updateData.outcome = formData.outcome

      // Include other fields only if changed or meaningful
      if (formData.status !== tenant.referencing?.status) updateData.status = formData.status
      if (formData.provider && formData.provider !== tenant.referencing?.provider)
        updateData.provider = formData.provider
      if (formData.reference && formData.reference !== tenant.referencing?.reference)
        updateData.reference = formData.reference
      if (formData.conditions !== tenant.referencing?.conditions)
        updateData.conditions = formData.conditions
      if (formData.notes !== tenant.referencing?.notes) updateData.notes = formData.notes
      if (formData.completedDate && formData.completedDate !== tenant.referencing?.completedDate)
        updateData.completedDate = formData.completedDate

      // Call the API to update referencing status
      const updatedTenant = await tenantsApi.updateReferencingStatus(tenant._id, updateData)

      showNotification('Referencing status updated successfully!', 'success')

      // Call the parent update handler if provided
      if (onUpdate) {
        onUpdate(updatedTenant)
      }
    } catch (error) {
      console.error('Error updating referencing status:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update referencing status'
      showNotification(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const getCurrentOutcome = () => {
    return (
      REFERENCING_OUTCOMES.find((outcome) => outcome.value === formData.outcome) ||
      REFERENCING_OUTCOMES[0]
    )
  }

  const getCurrentStatus = () => {
    return (
      REFERENCING_STATUSES.find((status) => status.value === formData.status) ||
      REFERENCING_STATUSES[0]
    )
  }

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Overall Referencing Status
        </Typography>

        <Grid container spacing={3}>
          {/* Referencing Status */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              select
              label="Referencing Status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              disabled={disabled || loading}
              helperText="Overall progress of referencing process"
              sx={textFieldStyles}
            >
              {REFERENCING_STATUSES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Referencing Outcome - THIS IS THE KEY FIELD */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              select
              label="Referencing Outcome"
              value={formData.outcome}
              onChange={(e) => handleInputChange('outcome', e.target.value)}
              disabled={disabled || loading}
              helperText="Final outcome that affects tenant qualification"
              sx={{
                ...textFieldStyles,
                '& .MuiInputBase-root': {
                  backgroundColor:
                    formData.outcome === 'pass'
                      ? 'success.lighter'
                      : formData.outcome === 'fail'
                        ? 'error.lighter'
                        : 'warning.lighter',
                },
              }}
            >
              {REFERENCING_OUTCOMES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Provider */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Referencing Provider"
              value={formData.provider}
              onChange={(e) => handleInputChange('provider', e.target.value)}
              disabled={disabled || loading}
              placeholder="e.g., HomeLet, Rightmove, etc."
              helperText="Name of referencing company"
              sx={textFieldStyles}
            />
          </Grid>

          {/* Reference Number */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Reference Number"
              value={formData.reference}
              onChange={(e) => handleInputChange('reference', e.target.value)}
              disabled={disabled || loading}
              placeholder="Reference ID or case number"
              helperText="Reference number from provider"
              sx={textFieldStyles}
            />
          </Grid>

          {/* Conditions (shown only for pass-with-conditions) */}
          {formData.outcome === 'pass-with-conditions' && (
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Conditions"
                value={formData.conditions}
                onChange={(e) => handleInputChange('conditions', e.target.value)}
                disabled={disabled || loading}
                placeholder="Specify the conditions for approval..."
                helperText="Required conditions for this tenant"
                sx={textFieldStyles}
              />
            </Grid>
          )}

          {/* Completed Date */}
          {formData.status === 'completed' && (
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Completion Date"
                value={formData.completedDate}
                onChange={(e) => handleInputChange('completedDate', e.target.value)}
                disabled={disabled || loading}
                InputLabelProps={{ shrink: true }}
                helperText="Date referencing was completed"
                sx={textFieldStyles}
              />
            </Grid>
          )}

          {/* Notes */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              disabled={disabled || loading}
              placeholder="Additional notes about referencing..."
              helperText="Internal notes about referencing process"
              sx={textFieldStyles}
            />
          </Grid>
        </Grid>

        {/* Current Status Summary */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Current Status:</strong> {getCurrentStatus().label} • <strong>Outcome:</strong>{' '}
            {getCurrentOutcome().label}
          </Typography>
          {formData.outcome === 'pending' && (
            <Typography variant="body2" color="warning.main">
              ⚠️ Tenant will remain &quot;under-review&quot; until outcome is set to
              &quot;pass&quot;
            </Typography>
          )}
          {formData.outcome === 'pass' && (
            <Typography variant="body2" color="success.main">
              ✅ Tenant will be auto-promoted to &quot;approved&quot; status
            </Typography>
          )}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <CustomButton
            text={loading ? 'Updating...' : 'Update Status'}
            onClick={() => void handleSubmit()}
            disabled={disabled || loading}
            variant="contained"
          />

          {formData.outcome === 'pending' && (
            <CustomButton
              text="✅ Quick Approve"
              onClick={() => {
                setFormData((prev) => ({ ...prev, outcome: 'pass', status: 'completed' }))
              }}
              disabled={disabled || loading}
              variant="outlined"
              textColor="#4CAF50"
              borderColor="#4CAF50"
              hoverBorderColor="#45a049"
              hoverBackgroundColor="rgba(76, 175, 80, 0.04)"
            />
          )}
        </Box>
      </Box>

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
    </>
  )
}

export default ReferencingStatusForm
