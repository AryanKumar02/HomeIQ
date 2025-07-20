import React from 'react'
import {
  TableRow,
  TableCell,
  Avatar,
  Typography,
  Box,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  Home as PropertyIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material'
import type { TenantRowProps } from '../../types/tenantTable'
import StatusBadge from './StatusBadge'
import ActionsMenu from './ActionsMenu'
import {
  formatLeaseEndDate,
  formatCurrency,
  generateInitials,
  generateAvatarColor,
  getDaysUntilLeaseEnd
} from '../../utils/dateUtils'

/**
 * TenantRow component displays a single tenant's information in a table row
 * Includes avatar, tenant details, status, and actions
 *
 * @param props - Component props
 * @returns Table row component for a tenant
 */
const TenantRow: React.FC<TenantRowProps> = ({
  tenant,
  onView,
  onEdit,
  onDelete
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'))

  const initials = generateInitials(tenant.name)
  const avatarColor = generateAvatarColor(tenant.name)
  const formattedLeaseEnd = formatLeaseEndDate(tenant.leaseEnds)
  const formattedRent = formatCurrency(tenant.monthlyRent)
  const daysUntilLeaseEnd = getDaysUntilLeaseEnd(tenant.leaseEnds)

  // Determine if lease is expiring soon for visual emphasis
  const isExpiringSoon = daysUntilLeaseEnd <= 30 && daysUntilLeaseEnd >= 0
  const isOverdue = daysUntilLeaseEnd < 0

  const handleRowClick = () => {
    onView(tenant.id)
  }

  return (
    <TableRow
      hover
      onClick={handleRowClick}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${tenant.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleRowClick()
        }
      }}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          background: `linear-gradient(135deg,
            ${theme.palette.primary.main}08 0%,
            ${theme.palette.secondary.main}04 50%,
            ${theme.palette.primary.main}06 100%)`,
          transform: 'translateY(-1px)',
          boxShadow: `0 4px 12px rgba(3, 108, 163, 0.12),
                      0 2px 8px rgba(61, 130, 247, 0.08)`,
          borderLeft: `3px solid ${theme.palette.primary.main}`,
        },
        '&:focus': {
          backgroundColor: theme.palette.action.focus,
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: '2px',
        },
        // Add visual emphasis for urgent statuses
        ...(isOverdue && {
          borderLeft: `4px solid ${theme.palette.error.main}`,
        }),
        ...(isExpiringSoon && {
          borderLeft: `4px solid ${theme.palette.warning.main}`,
        })
      }}
    >
      {/* Tenant Info Column - Always visible */}
      <TableCell sx={{ minWidth: 200, width: '30%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title={tenant.name} arrow>
            <Avatar
              sx={{
                bgcolor: avatarColor,
                color: 'white',
                fontWeight: 600,
                fontSize: '0.9rem',
                width: 40,
                height: 40,
                // Add border for better visual separation
                border: `2px solid ${theme.palette.background.paper}`,
                boxShadow: theme.shadows[2]
              }}
              aria-label={`Avatar for ${tenant.name}`}
            >
              {initials}
            </Avatar>
          </Tooltip>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {tenant.name}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <EmailIcon
                sx={{
                  fontSize: '0.75rem',
                  color: theme.palette.grey[500]
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.grey[600],
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {tenant.email}
              </Typography>
            </Box>
          </Box>
        </Box>
      </TableCell>

      {/* Property Column - Hidden on mobile */}
      {!isMobile && (
        <TableCell sx={{ minWidth: 180, width: '25%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PropertyIcon
              sx={{
                fontSize: '1rem',
                color: theme.palette.grey[500]
              }}
            />
            <Tooltip title={tenant.property} arrow>
              <Typography
                variant="body2"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: isTablet ? 120 : 200
                }}
              >
                {tenant.property}
              </Typography>
            </Tooltip>
          </Box>
        </TableCell>
      )}

      {/* Lease End Column - Hidden on mobile */}
      {!isMobile && (
        <TableCell sx={{ width: '20%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarIcon
              sx={{
                fontSize: '1rem',
                color: isOverdue
                  ? theme.palette.error.main
                  : isExpiringSoon
                    ? theme.palette.warning.main
                    : theme.palette.grey[500]
              }}
            />
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: isOverdue
                    ? theme.palette.error.main
                    : isExpiringSoon
                      ? theme.palette.warning.main
                      : theme.palette.text.primary,
                  fontWeight: (isOverdue || isExpiringSoon) ? 600 : 400
                }}
              >
                {formattedLeaseEnd}
              </Typography>
              {(isOverdue || isExpiringSoon) && (
                <Typography
                  variant="caption"
                  sx={{
                    color: isOverdue
                      ? theme.palette.error.main
                      : theme.palette.warning.main,
                    fontWeight: 500
                  }}
                >
                  {isOverdue
                    ? `${Math.abs(daysUntilLeaseEnd)} days overdue`
                    : `${daysUntilLeaseEnd} days left`
                  }
                </Typography>
              )}
            </Box>
          </Box>
        </TableCell>
      )}

      {/* Rent Column - Hidden on tablet and mobile */}
      {!isTablet && (
        <TableCell align="right" sx={{ width: '15%' }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary
            }}
          >
            {formattedRent}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.grey[600],
              display: 'block'
            }}
          >
            /month
          </Typography>
        </TableCell>
      )}

      {/* Status Column - Always visible */}
      <TableCell sx={{ width: '15%' }}>
        <StatusBadge status={tenant.status} />
      </TableCell>

      {/* Actions Column - Always visible */}
      <TableCell align="right" sx={{ width: '80px' }}>
        <ActionsMenu
          tenantId={tenant.id}
          onView={onView}
          onEdit={onEdit}

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  )
}

export default TenantRow
