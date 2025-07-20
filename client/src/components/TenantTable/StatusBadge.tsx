import React from 'react'
import { Chip, useTheme, type Theme } from '@mui/material'
import { 
  CheckCircle as ApprovedIcon,
  Schedule as PendingIcon,
  RateReview as ReviewIcon,
  Cancel as RejectedIcon,
  Home as ActiveIcon,
  Warning as ExpiringIcon 
} from '@mui/icons-material'
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
      icon: <ApprovedIcon sx={{ fontSize: '0.875rem' }} />,
      label: 'Approved',
      textColor: theme.palette.success.contrastText
    }
  }
  
  // Active lease - green
  if (status === 'active') {
    return {
      color: theme.palette.success.main,
      backgroundColor: theme.palette.success.light,
      icon: <ActiveIcon sx={{ fontSize: '0.875rem' }} />,
      label: 'Active',
      textColor: theme.palette.success.contrastText
    }
  }
  
  // Pending application - blue
  if (status === 'pending') {
    return {
      color: theme.palette.info.main,
      backgroundColor: theme.palette.info.light,
      icon: <PendingIcon sx={{ fontSize: '0.875rem' }} />,
      label: 'Pending',
      textColor: theme.palette.info.contrastText
    }
  }
  
  // Under review - orange
  if (status === 'under-review') {
    return {
      color: theme.palette.warning.main,
      backgroundColor: theme.palette.warning.light,
      icon: <ReviewIcon sx={{ fontSize: '0.875rem' }} />,
      label: 'Under Review',
      textColor: theme.palette.warning.contrastText
    }
  }
  
  // Rejected - red
  if (status === 'rejected') {
    return {
      color: theme.palette.error.main,
      backgroundColor: theme.palette.error.light,
      icon: <RejectedIcon sx={{ fontSize: '0.875rem' }} />,
      label: 'Rejected',
      textColor: theme.palette.error.contrastText
    }
  }
  
  // Expiring or expired lease - warning
  if (statusLower.includes('expiring') || statusLower.includes('expired')) {
    return {
      color: theme.palette.warning.main,
      backgroundColor: theme.palette.warning.light,
      icon: <ExpiringIcon sx={{ fontSize: '0.875rem' }} />,
      label: status,
      textColor: theme.palette.warning.contrastText
    }
  }
  
  // Default/unknown status - gray
  return {
    color: theme.palette.grey[600],
    backgroundColor: theme.palette.grey[200],
    icon: undefined,
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
      icon={config.icon || undefined}
      label={config.label}
      size="small"
      aria-label={`Status: ${config.label}`}
      sx={{
        backgroundColor: config.backgroundColor,
        color: config.textColor,
        fontWeight: 600,
        fontSize: '0.75rem',
        height: 24,
        '& .MuiChip-label': {
          px: 1,
          color: config.textColor,
        },
        '& .MuiChip-icon': {
          color: config.color,
          marginLeft: '4px'
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
        // Animation for expiring/expired statuses
        ...(status.toLowerCase().includes('expired') && {
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': {
              opacity: 1,
            },
            '50%': {
              opacity: 0.7,
            },
            '100%': {
              opacity: 1,
            },
          },
        })
      }}
    />
  )
}

export default StatusBadge