import React from 'react'
import { Box, Typography, Container, Paper, useTheme, useMediaQuery } from '@mui/material'
import { Build, Code, Schedule } from '@mui/icons-material'

interface InDevelopmentProps {
  /** The name of the page/feature being developed */
  pageName: string
  /** Optional description of what's coming */
  description?: string
  /** Estimated completion timeframe */
  estimatedCompletion?: string
}

const InDevelopment: React.FC<InDevelopmentProps> = ({
  pageName,
  description = "We're working hard to bring you this feature.",
  estimatedCompletion,
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Container
      maxWidth="md"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: { xs: '50vh', md: '60vh' },
        py: { xs: 3, md: 4 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 6 },
          textAlign: 'center',
          backgroundColor: 'background.paper',
          borderRadius: 3,
          border: `1px solid ${theme.palette.border.light}`,
          width: '100%',
          maxWidth: 500,
        }}
        role="main"
        aria-labelledby="in-development-title"
        aria-describedby="in-development-description"
      >
        {/* Icon Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1,
            mb: 3,
            flexWrap: 'wrap',
          }}
        >
          <Build
            sx={{
              fontSize: { xs: 40, md: 48 },
              color: 'primary.main',
              opacity: 0.8,
            }}
            aria-hidden="true"
          />
          <Code
            sx={{
              fontSize: { xs: 32, md: 40 },
              color: 'secondary.main',
              opacity: 0.6,
            }}
            aria-hidden="true"
          />
        </Box>

        {/* Title */}
        <Typography
          id="in-development-title"
          variant={isMobile ? 'h4' : 'h3'}
          component="h1"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            mb: 2,
            letterSpacing: '-0.02em',
          }}
        >
          {pageName} Coming Soon
        </Typography>

        {/* Description */}
        <Typography
          id="in-development-description"
          variant="body1"
          sx={{
            color: 'text.secondary',
            mb: estimatedCompletion ? 2 : 0,
            fontSize: { xs: '1rem', md: '1.125rem' },
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>

        {/* Estimated Completion */}
        {estimatedCompletion && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              mt: 3,
              p: 2,
              backgroundColor: 'grey.50',
              borderRadius: 2,
              border: `1px solid ${theme.palette.grey[200]}`,
            }}
          >
            <Schedule
              sx={{
                fontSize: 20,
                color: 'text.secondary',
              }}
              aria-hidden="true"
            />
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
              }}
            >
              Expected: {estimatedCompletion}
            </Typography>
          </Box>
        )}

        {/* Progress Indicator */}
        <Box
          sx={{
            mt: 4,
            pt: 3,
            borderTop: `1px solid ${theme.palette.grey[200]}`,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'text.disabled',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 500,
            }}
          >
            Development in Progress
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}

export default InDevelopment
