import React, { useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  Alert,
  AlertTitle,
  Chip,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import Card from '../basic/Card'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import type { Reference } from '../../api/tenants'

// Form-specific interfaces (unused)

interface ReferenceChecksFormProps {
  references: Reference[]
  onInputChange: (field: string, value: unknown) => void
  textFieldStyles: object
  readOnly?: boolean
  showContactActions?: boolean
}

// Reference type configuration type
interface ReferenceTypeConfig {
  label: string;
  description: string;
  icon: React.ComponentType<{ fontSize?: string; sx?: object }>;
  color: string;
  requiredFields: string[];
  optionalFields: string[];
  hideFields: string[];
  relationshipSuggestions?: string[];
  defaultRelationship?: string;
}

// Reference type configuration
const REFERENCE_TYPE_CONFIG: Record<string, ReferenceTypeConfig> = {
  'personal': {
    label: 'Personal Reference',
    description: 'Friend, family member, or personal acquaintance',
    icon: PersonIcon,
    color: '#4CAF50',
    requiredFields: ['name', 'relationship', 'phone'],
    optionalFields: ['email', 'yearsKnown', 'notes'],
    hideFields: ['company'],
    relationshipSuggestions: ['Friend', 'Family Member', 'Neighbor', 'Personal Acquaintance']
  },
  'professional': {
    label: 'Professional Reference',
    description: 'Colleague, supervisor, or business contact',
    icon: BusinessIcon,
    color: '#2196F3',
    requiredFields: ['name', 'relationship', 'phone', 'company'],
    optionalFields: ['email', 'yearsKnown', 'notes'],
    relationshipSuggestions: ['Supervisor', 'Manager', 'Colleague', 'Business Partner', 'Client']
  },
  'previous-landlord': {
    label: 'Previous Landlord',
    description: 'Previous rental property landlord or letting agent',
    icon: HomeIcon,
    color: '#FF9800',
    requiredFields: ['name', 'phone'],
    optionalFields: ['email', 'company', 'yearsKnown', 'notes'],
    hideFields: ['relationship'],
    defaultRelationship: 'Previous Landlord'
  },
  'employer': {
    label: 'Employer Reference',
    description: 'Current or previous employer HR or supervisor',
    icon: WorkIcon,
    color: '#9C27B0',
    requiredFields: ['name', 'relationship', 'phone', 'company'],
    optionalFields: ['email', 'yearsKnown', 'notes'],
    relationshipSuggestions: ['HR Manager', 'Direct Supervisor', 'Department Manager', 'Director']
  }
} as const

const RECOMMENDATION_OPTIONS = [
  { value: 'strongly-recommend', label: 'Strongly Recommend', color: '#4CAF50' },
  { value: 'recommend', label: 'Recommend', color: '#8BC34A' },
  { value: 'neutral', label: 'Neutral', color: '#FFC107' },
  { value: 'not-recommend', label: 'Do Not Recommend', color: '#FF5722' },
  { value: 'strongly-not-recommend', label: 'Strongly Do Not Recommend', color: '#F44336' },
]

// Validation functions
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^\S+@\S+\.\S+$/
  return emailRegex.test(email)
}

const isValidUKPhone = (phone: string): boolean => {
  const ukPhoneRegex = /^(\+44\s?)?(\(?0\d{4}\)?\s?\d{6}|\(?0\d{3}\)?\s?\d{7}|\(?0\d{2}\)?\s?\d{8}|07\d{9})$/
  return ukPhoneRegex.test(phone.replace(/\s/g, ''))
}

const validateReference = (reference: Reference): string[] => {
  const errors: string[] = []
  const config: ReferenceTypeConfig = REFERENCE_TYPE_CONFIG[reference.type]

  // Required field validation
  config.requiredFields.forEach(field => {
    if (!reference[field as keyof Reference] || reference[field as keyof Reference] === '') {
      errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`)
    }
  })

  // Email validation
  if (reference.email && !isValidEmail(reference.email)) {
    errors.push('Please provide a valid email address')
  }

  // Phone validation
  if (reference.phone && !isValidUKPhone(reference.phone)) {
    errors.push('Please provide a valid UK phone number')
  }

  // Years known validation
  if (reference.yearsKnown !== undefined && (reference.yearsKnown < 0 || reference.yearsKnown > 50)) {
    errors.push('Years known must be between 0 and 50')
  }

  return errors
}

// Reference Requirements Info Component
const ReferenceRequirementsInfo: React.FC = () => {
  const theme = useTheme()
  
  return (
    <Paper
      sx={{
        p: 3,
        mb: 4,
        background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}05 100%)`,
        border: `1px solid ${theme.palette.primary.main}20`,
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
        Reference Requirements
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Please provide at least 2-3 references to support your tenancy application. A good mix includes:
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
        {Object.entries(REFERENCE_TYPE_CONFIG).map(([type, config]) => {
          const IconComponent = config.icon
          return (
            <Chip
              key={type}
              icon={<IconComponent fontSize="small" />}
              label={config.label}
              variant="outlined"
              size="small"
              sx={{
                borderColor: config.color,
                color: config.color,
                '& .MuiChip-icon': { color: config.color }
              }}
            />
          )
        })}
      </Box>
    </Paper>
  )
}

// Reference Type Selector Component
const ReferenceTypeSelector: React.FC<{
  value: Reference['type']
  onChange: (type: Reference['type']) => void
  disabled?: boolean
  textFieldStyles: object
}> = ({ value, onChange, disabled, textFieldStyles }) => {
  return (
    <TextField
      fullWidth
      select
      label="Reference Type"
      value={value}
      onChange={(e) => onChange(e.target.value as Reference['type'])}
      disabled={disabled}
      required
      sx={{ ...textFieldStyles, mb: 3 }}
    >
      {Object.entries(REFERENCE_TYPE_CONFIG).map(([type, config]) => {
        const IconComponent = config.icon
        return (
          <MenuItem key={type} value={type}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconComponent fontSize="small" sx={{ color: config.color }} />
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  {config.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {config.description}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        )
      })}
    </TextField>
  )
}

// Reference Contact Actions Component
const ReferenceContactActions: React.FC<{
  reference: Reference
  onUpdateReference: (field: string, value: unknown) => void
}> = ({ reference, onUpdateReference }) => {
  const [isContacting, setIsContacting] = useState(false)
  const [isContacted, setIsContacted] = useState(false)
  const [contactedDate, setContactedDate] = useState<string | null>(null)
  
  // Use local state if contactedDate exists in props OR if we've marked as contacted locally
  const hasBeenContacted = reference.contactedDate || isContacted
  const displayContactedDate = reference.contactedDate || contactedDate
  
  // Debug: Log when component re-renders with new reference data (removed for cleaner console)

  const handleMarkAsContacted = () => {
    console.log('🔴 BUTTON CLICKED - Mark as Contacted')
    console.log('🔴 Current reference before update:', reference)
    
    setIsContacting(true)
    const newContactedDate = new Date().toISOString()
    console.log('🔴 Generated contactedDate:', newContactedDate)
    
    // Update local state immediately for instant UI feedback
    setIsContacted(true)
    setContactedDate(newContactedDate)
    
    // Update the parent form state
    onUpdateReference('contactedDate', newContactedDate)
    // Note: contactedBy field removed as it requires ObjectId which we don't have in client
    
    console.log('🔴 Updates sent, setting timeout...')
    
    // Show the loading state briefly for better UX
    setTimeout(() => {
      console.log('🔴 Timeout complete, setting isContacting to false')
      setIsContacting(false)
    }, 800)
  }

  return (
    <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
        Reference Contact Status
      </Typography>

      {!hasBeenContacted ? (
        <Button
          variant="outlined"
          size="small"
          onClick={handleMarkAsContacted}
          disabled={isContacting}
          startIcon={<PhoneIcon />}
          sx={{ mt: 1 }}
        >
          {isContacting ? 'Marking as Contacted...' : 'Mark as Contacted'}
        </Button>
      ) : (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CheckCircleIcon fontSize="small" sx={{ color: 'success.main' }} />
            <Typography variant="body2" color="success.main" fontWeight={500}>
              Contacted on {displayContactedDate ? new Date(displayContactedDate).toLocaleDateString() : 'Unknown'}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Reference Response"
                value={reference.response || ''}
                onChange={(e) => onUpdateReference('response', e.target.value)}
                placeholder="Enter the feedback received from this reference..."
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                select
                label="Recommendation Level"
                value={reference.recommendation || ''}
                onChange={(e) => onUpdateReference('recommendation', e.target.value)}
              >
                {RECOMMENDATION_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: option.color
                        }}
                      />
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Additional Notes"
                value={reference.notes || ''}
                onChange={(e) => onUpdateReference('notes', e.target.value)}
                placeholder="Any additional notes about this reference..."
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  )
}

// Individual Reference Card Component
const ReferenceCard: React.FC<{
  reference: Reference
  index: number
  onUpdate: (field: string, value: unknown) => void
  onRemove: () => void
  textFieldStyles: object
  readOnly?: boolean
  showContactActions?: boolean
}> = ({ reference, onUpdate, onRemove, textFieldStyles, readOnly, showContactActions }) => {
  const config: ReferenceTypeConfig = REFERENCE_TYPE_CONFIG[reference.type]
  const IconComponent = config.icon
  const [expanded, setExpanded] = useState(true)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Validate on blur
  const handleBlur = () => {
    const errors = validateReference(reference)
    setValidationErrors(errors)
  }

  const getStatusIcon = () => {
    if (reference.recommendation) {
      return <CheckCircleIcon sx={{ color: 'success.main' }} />
    }
    if (reference.contactedDate) {
      return <PendingIcon sx={{ color: 'warning.main' }} />
    }
    return <PendingIcon sx={{ color: 'grey.400' }} />
  }

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      sx={{
        mb: 2,
        border: `1px solid ${config.color}40`,
        borderRadius: 2,
        '&:before': { display: 'none' },
        boxShadow: 'none',
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          bgcolor: `${config.color}08`,
          borderRadius: '8px 8px 0 0',
          '& .MuiAccordionSummary-content': {
            alignItems: 'center',
            gap: 2
          }
        }}
      >
        <IconComponent sx={{ color: config.color }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {reference.name || `New ${config.label}`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {config.label}
            {reference.company && ` • ${reference.company}`}
          </Typography>
        </Box>
        {getStatusIcon()}
      </AccordionSummary>

      <AccordionDetails sx={{ p: 3 }}>
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Please fix the following errors:</AlertTitle>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {validationErrors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Reference Type Selection */}
        <ReferenceTypeSelector
          value={reference.type}
          onChange={(type) => onUpdate('type', type)}
          disabled={readOnly}
          textFieldStyles={textFieldStyles}
        />

        {/* Dynamic Fields Based on Type */}
        <Grid container spacing={3}>
          {/* Name Field */}
          {config.requiredFields.includes('name') && (
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Reference Name"
                value={reference.name || ''}
                onChange={(e) => onUpdate('name', e.target.value)}
                onBlur={handleBlur}
                required
                disabled={readOnly}
                sx={textFieldStyles}
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
          )}

          {/* Relationship Field (conditional) */}
          {config.requiredFields.includes('relationship') && (
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                select={config.relationshipSuggestions ? true : false}
                label="Relationship"
                value={reference.relationship || config.defaultRelationship || ''}
                onChange={(e) => onUpdate('relationship', e.target.value)}
                onBlur={handleBlur}
                required
                disabled={readOnly}
                sx={textFieldStyles}
              >
                {config.relationshipSuggestions?.map((suggestion: string) => (
                  <MenuItem key={suggestion} value={suggestion}>
                    {suggestion}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}

          {/* Phone Field */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Phone Number"
              value={reference.phone || ''}
              onChange={(e) => onUpdate('phone', e.target.value)}
              onBlur={handleBlur}
              required
              disabled={readOnly}
              sx={textFieldStyles}
              placeholder="07XXX XXXXXX or +44 XXX XXXX XXXX"
              InputProps={{
                startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>

          {/* Email Field */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={reference.email || ''}
              onChange={(e) => onUpdate('email', e.target.value)}
              onBlur={handleBlur}
              disabled={readOnly}
              sx={textFieldStyles}
              placeholder="reference@example.com"
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>

          {/* Company Field (conditional) */}
          {config.requiredFields.includes('company') && (
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Company/Organization"
                value={reference.company || ''}
                onChange={(e) => onUpdate('company', e.target.value)}
                onBlur={handleBlur}
                required
                disabled={readOnly}
                sx={textFieldStyles}
                InputProps={{
                  startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
          )}

          {/* Years Known Field */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Years Known"
              type="number"
              value={reference.yearsKnown || ''}
              onChange={(e) => onUpdate('yearsKnown', parseInt(e.target.value) || undefined)}
              onBlur={handleBlur}
              disabled={readOnly}
              sx={textFieldStyles}
              inputProps={{ min: 0, max: 50 }}
            />
          </Grid>
        </Grid>

        {/* Contact Actions */}
        {showContactActions && (
          <ReferenceContactActions
            reference={reference}
            onUpdateReference={onUpdate}
          />
        )}
        
        {/* Debug: Show contact actions status */}
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ mt: 1, p: 1, bgcolor: 'info.light', borderRadius: 1, fontSize: '0.75rem' }}>
            Debug: showContactActions = {showContactActions ? 'true' : 'false'}, 
            contactedDate = {reference.contactedDate || 'null'}
          </Box>
        )}

        {/* Remove Button */}
        {!readOnly && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={onRemove}
              startIcon={<DeleteIcon />}
            >
              Remove Reference
            </Button>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

// Reference Summary Component
const ReferenceSummary: React.FC<{ references: Reference[] }> = ({ references }) => {
  
  const summary = {
    total: references.length,
    contacted: references.filter(ref => ref.contactedDate).length,
    completed: references.filter(ref => ref.response && ref.recommendation).length,
    positive: references.filter(ref => 
      ['strongly-recommend', 'recommend'].includes(ref.recommendation || '')
    ).length
  }

  if (references.length === 0) return null

  return (
    <Paper sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Reference Summary
      </Typography>
      <Grid container spacing={3}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {summary.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total References
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {summary.contacted}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Contacted
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="info.main" fontWeight="bold">
              {summary.completed}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {summary.positive}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Positive
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  )
}

// Add Reference Button Component
const AddReferenceButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const theme = useTheme()
  
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      startIcon={<AddIcon />}
      fullWidth
      sx={{
        py: 2,
        mb: 3,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: theme.palette.secondary.main,
        color: theme.palette.secondary.main,
        '&:hover': {
          borderStyle: 'solid',
          bgcolor: `${theme.palette.secondary.main}08`,
        }
      }}
    >
      Add Reference
    </Button>
  )
}

// Main Reference Checks Form Component
const ReferenceChecksForm: React.FC<ReferenceChecksFormProps> = ({
  references = [],
  onInputChange,
  textFieldStyles,
  readOnly = false,
  showContactActions = false
}) => {

  const addReference = () => {
    console.log('🔵 ADD REFERENCE CLICKED')
    const newReference: Reference = {
      type: 'personal',
      name: 'New Reference', // Temporary name to avoid validation error
      relationship: 'Friend', // Default relationship
      phone: '07000000000', // Placeholder phone
      email: '',
    }
    const updatedReferences = [...references, newReference]
    onInputChange('references', updatedReferences)
  }

  const removeReference = (index: number) => {
    const updatedReferences = references.filter((_, i) => i !== index)
    onInputChange('references', updatedReferences)
  }

  const updateReference = (index: number, field: string, value: unknown) => {
    const updatedReferences = [...references]
    updatedReferences[index] = { ...updatedReferences[index], [field]: value }
    onInputChange('references', updatedReferences)
  }

  return (
    <Card
      title="Reference Checks"
      subtitle="Personal and professional references to verify tenant suitability and character"
      padding={{ xs: 3, sm: 4, md: 5 }}
      marginBottom={4}
    >
      {/* Reference Requirements Info */}
      <ReferenceRequirementsInfo />

      {/* Existing References */}
      {references.map((reference, index) => (
        <ReferenceCard
          key={index}
          reference={reference}
          index={index}
          onUpdate={(field, value) => updateReference(index, field, value)}
          onRemove={() => removeReference(index)}
          textFieldStyles={textFieldStyles}
          readOnly={readOnly}
          showContactActions={showContactActions}
        />
      ))}

      {/* Add Reference Button */}
      {!readOnly && <AddReferenceButton onClick={addReference} />}

      {/* Reference Summary */}
      <ReferenceSummary references={references} />
    </Card>
  )
}

export default ReferenceChecksForm