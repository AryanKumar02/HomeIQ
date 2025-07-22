import React from 'react'
import { Chip, useTheme, type Theme } from '@mui/material'
import type { StatusBadgeProps, TenantStatus } from '../../types/tenantTable'

/**
 * Determines the appropriate styling and icon for a tenant status
 * @param status - The tenant's application/lease status
 * @param theme - MUI theme object
 * @returns Configuration object with color, icon, and label
 */
const getStatusConfig = (status: TenantStatus, theme: Theme) => {
  const statusLower = status.toLowerCase()
  
  // Approved status - green
  if (status === 'approved') {
    return {
      color: theme.palette.success.main,
      backgroundColor: theme.palette.success.light,
      icon: '✓',
      label: 'Approved',
      textColor: theme.palette.success.contrastText
    }
  }
  
  // Active lease - green
  if (status === 'active') {
    return {
      color: theme.palette.success.main,
      backgroundColor: theme.palette.success.light,
      icon: '✓',
      label: 'Active',
      textColor: theme.palette.success.contrastText
    }
  }
  
  // Pending application - blue
  if (status === 'pending') {
    return {
      color: theme.palette.info.main,
      backgroundColor: theme.palette.info.light,
      icon: '○',
      label: 'Pending',
      textColor: theme.palette.info.contrastText
    }
  }
  
  // Under review - orange
  if (status === 'under-review') {
    return {
      color: theme.palette.warning.main,
      backgroundColor: theme.palette.warning.light,
      icon: '⚠',
      label: 'Under Review',
      textColor: theme.palette.warning.contrastText
    }
  }
  
  // Rejected - red
  if (status === 'rejected') {
    return {
      color: theme.palette.error.main,
      backgroundColor: theme.palette.error.light,
      icon: '✗',
      label: 'Rejected',
      textColor: theme.palette.error.contrastText
    }
  }
  
  // Expiring or expired lease - warning
  if (statusLower.includes('expiring') || statusLower.includes('expired')) {
    return {
      color: theme.palette.warning.main,
      backgroundColor: theme.palette.warning.light,
      icon: '⚠',
      label: status,
      textColor: theme.palette.warning.contrastText
    }
  }
  
  // Default/unknown status - gray
  return {
    color: theme.palette.grey[600],
    backgroundColor: theme.palette.grey[200],
    icon: '?',
    label: status,
    textColor: theme.palette.grey[800]
  }
}

/**
 * StatusBadge component displays a tenant's status with appropriate styling
 * Supports application statuses (approved, pending, under-review, rejected) 
 * and lease statuses (active, expiring, expired)
 * 
 * @param props - Component props
 * @returns Styled status badge component
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const theme = useTheme()
  const config = getStatusConfig(status, theme)
  
  return (
    <Chip
      icon={
        config.icon ? (
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
            {config.icon}
          </span>
        ) : undefined
      }
      label={config.label}
      size="small"
      aria-label={`Status: ${config.label}`}
      sx={{
        backgroundColor: config.backgroundColor,
        color: config.textColor,
        fontWeight: 500,
        fontSize: '0.7rem',
        height: 22,
        letterSpacing: '0.02em',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        },
        '& .MuiChip-label': {
          paddingLeft: '6px',
          paddingRight: '8px',
          color: config.textColor,
        },
        '& .MuiChip-icon': {
          marginLeft: '6px',
          marginRight: '-2px',
          color: config.color,
        },
        // Custom styling for urgent status badges
        ...(status.toLowerCase().includes('rejected') && {
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '3px',
            backgroundColor: config.color,
            borderRadius: '12px 0 0 12px'
          }
        }),
        // Enhanced animation for expiring/expired statuses
        ...(status.toLowerCase().includes('expired') && {
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': {
              opacity: 1,
              transform: 'scale(1)',
            },
            '50%': {
              opacity: 0.8,
              transform: 'scale(1.02)',
            },
            '100%': {
              opacity: 1,
              transform: 'scale(1)',
            },
          },
        })
      }}
    />
  )
}

export default StatusBadge