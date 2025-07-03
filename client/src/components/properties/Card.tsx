import React from 'react'
import { Box, Typography, useTheme } from '@mui/material'

interface CardProps {
  title?: string
  subtitle?: string
  children: React.ReactNode
  padding?: { xs: number | string; sm: number | string; md: number | string } | number | string
  marginBottom?: number | string
  elevation?: number
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  padding = { xs: 2, sm: 2.5, md: 3 },
  marginBottom = 3,
  elevation = 1
}) => {
  const theme = useTheme()

  const getBoxShadow = () => {
    switch (elevation) {
      case 0:
        return 'none'
      case 1:
        return '0 2px 8px 0 rgba(0, 0, 0, 0.1)'
      case 2:
        return '0 4px 12px 0 rgba(0, 0, 0, 0.15)'
      case 3:
        return '0 6px 16px 0 rgba(0, 0, 0, 0.2)'
      default:
        return '0 2px 8px 0 rgba(0, 0, 0, 0.1)'
    }
  }

  return (
    <Box
      sx={{
        backgroundColor: 'white',
        borderRadius: 2,
        p: padding,
        mb: marginBottom,
        boxShadow: getBoxShadow(),
        transition: 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: elevation > 0 ? '0 4px 12px 0 rgba(0, 0, 0, 0.15)' : 'none',
        },
      }}
    >
      {(title || subtitle) && (
        <Box sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}>
          {title && (
            <Typography
              variant="h5"
              sx={{
                fontFamily: theme.typography.fontFamily,
                fontWeight: 700,
                fontSize: { xs: '1.25rem', sm: '1.35rem', md: '1.5rem' },
                letterSpacing: '0.02em',
                color: theme.palette.grey[900],
                mb: subtitle ? 0.5 : 0,
              }}
            >
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                fontFamily: theme.typography.fontFamily,
                color: theme.palette.grey[600],
                fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.95rem' },
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
      {children}
    </Box>
  )
}

export default Card
