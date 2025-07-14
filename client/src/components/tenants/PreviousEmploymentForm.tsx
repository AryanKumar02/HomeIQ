import React from 'react'
import { TextField, Typography, IconButton, Box } from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material'
import Grid from '@mui/material/Grid'
import Card from '../basic/Card'

interface PreviousEmployment {
  employer: string
  position: string
  startDate: string
  endDate: string
  reasonForLeaving: string
  contactName: string
  contactPhone: string
  contactEmail: string
}

interface PreviousEmploymentFormProps {
  previousEmployment: PreviousEmployment[]
  onInputChange: (field: string, value: string) => void
  onAddEmployment: () => void
  onRemoveEmployment: (index: number) => void
  textFieldStyles: object
}

const PreviousEmploymentForm: React.FC<PreviousEmploymentFormProps> = ({
  previousEmployment,
  onInputChange,
  onAddEmployment,
  onRemoveEmployment,
  textFieldStyles,
}) => {
  return (
    <Card padding={{ xs: 3, sm: 4, md: 5 }} marginBottom={4}>
      {/* Custom Title with Add Button */}
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}
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
            Previous Employment History
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'grey.600',
              fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.95rem' },
            }}
          >
            Details of previous jobs and employment history
          </Typography>
        </Box>
        <IconButton
          onClick={onAddEmployment}
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            ml: 2,
          }}
          size="small"
        >
          <AddIcon />
        </IconButton>
      </Box>
      {previousEmployment.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            color: 'grey.500',
          }}
        >
          <Typography variant="body2">
            No previous employment added yet. Click the + button to add your employment history.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {previousEmployment.map((employment, index) => (
            <Box
              key={index}
              sx={{
                p: 3,
                border: '1px solid',
                borderColor: 'grey.300',
                borderRadius: 2,
                backgroundColor: 'grey.50',
                position: 'relative',
              }}
            >
              {/* Remove Button */}
              <IconButton
                onClick={() => onRemoveEmployment(index)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'error.light',
                    color: 'white',
                  },
                }}
                size="small"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>

              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: 'grey.800',
                }}
              >
                Employment #{index + 1}
              </Typography>

              <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                {/* Employer Name - Left Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Employer Name"
                    value={employment.employer}
                    onChange={(e) =>
                      onInputChange(`employment.previous.${index}.employer`, e.target.value)
                    }
                    placeholder="e.g., Previous Company Ltd"
                    required
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* Position - Right Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Position/Job Title"
                    value={employment.position}
                    onChange={(e) =>
                      onInputChange(`employment.previous.${index}.position`, e.target.value)
                    }
                    placeholder="e.g., Marketing Manager"
                    required
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
                    value={employment.startDate}
                    onChange={(e) =>
                      onInputChange(`employment.previous.${index}.startDate`, e.target.value)
                    }
                    required
                    variant="outlined"
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* End Date - Right Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="End Date"
                    value={employment.endDate}
                    onChange={(e) =>
                      onInputChange(`employment.previous.${index}.endDate`, e.target.value)
                    }
                    required
                    variant="outlined"
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* Reason for Leaving - Full Width */}
                <Grid size={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Reason for Leaving"
                    value={employment.reasonForLeaving}
                    onChange={(e) =>
                      onInputChange(`employment.previous.${index}.reasonForLeaving`, e.target.value)
                    }
                    placeholder="e.g., Career progression, relocation, company closure"
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* Reference Contact Section */}
                <Grid size={12}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      color: 'grey.700',
                      mt: 1,
                      mb: 1,
                    }}
                  >
                    Reference Contact
                  </Typography>
                </Grid>

                {/* Contact Name - Left Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Reference Contact Name"
                    value={employment.contactName}
                    onChange={(e) =>
                      onInputChange(`employment.previous.${index}.contactName`, e.target.value)
                    }
                    placeholder="e.g., John Smith (Manager)"
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* Contact Phone - Right Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Reference Contact Phone"
                    value={employment.contactPhone}
                    onChange={(e) =>
                      onInputChange(`employment.previous.${index}.contactPhone`, e.target.value)
                    }
                    placeholder="e.g., 020 1234 5678"
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* Contact Email - Full Width */}
                <Grid size={12}>
                  <TextField
                    fullWidth
                    type="email"
                    label="Reference Contact Email"
                    value={employment.contactEmail}
                    onChange={(e) =>
                      onInputChange(`employment.previous.${index}.contactEmail`, e.target.value)
                    }
                    placeholder="e.g., john.smith@previouscompany.com"
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

export default PreviousEmploymentForm
