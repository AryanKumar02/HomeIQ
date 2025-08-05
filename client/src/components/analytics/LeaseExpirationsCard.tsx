import React, { useMemo } from 'react'
import { Box, Typography, Card, CardContent, Chip, LinearProgress } from '@mui/material'
import { styled } from '@mui/material/styles'
import { CalendarTodayOutlined } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { tenantsApi } from '../../api'

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: 16,
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease-in-out',
  border: 'none',
  height: 350,
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    height: 330,
    borderRadius: 12,
  },
  '&:hover': {
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)',
  },
}))

const StyledLinearProgress = styled(LinearProgress)<{ progresscolor: string }>(
  ({ progresscolor }) => ({
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f5f5f5',
    '& .MuiLinearProgress-bar': {
      backgroundColor: progresscolor,
      borderRadius: 3,
    },
  })
)

const ProgressItem = styled(Box)({
  marginBottom: 12,
})

const LeaseItem = styled(Box)<{ isLast?: boolean }>(({ isLast }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 0',
  borderBottom: isLast ? 'none' : '1px solid #f0f0f0',
}))

interface LeaseExpirationData {
  period: string
  count: number
  color: string
  progress: number
}

interface UpcomingLease {
  tenant: string
  unit: string
  daysRemaining: number
  isUrgent: boolean
}

interface Tenant {
  _id?: string
  personalInfo?: {
    firstName?: string
    lastName?: string
  }
  leases?: Array<{
    _id?: string
    property?: string
    unit?: string
    startDate?: string
    endDate?: string
    status?: string
    monthlyRent?: string | number
  }>
}

const LeaseExpirationsCard: React.FC = () => {
  // Fetch tenants data
  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: tenantsApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Calculate lease expiration data from real tenants
  const { progressData, upcomingLeases } = useMemo(() => {
    if (!tenants.length) {
      return {
        progressData: [
          { period: 'This Month', count: 0, color: '#ff5252', progress: 0 },
          { period: 'Next Month', count: 0, color: '#ff9800', progress: 0 },
          { period: 'Next 3 Months', count: 0, color: '#2196f3', progress: 0 },
        ],
        upcomingLeases: [],
      }
    }

    const now = new Date()
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0)
    const threeMonthsEnd = new Date(now.getFullYear(), now.getMonth() + 4, 0)

    // Get all active leases with expiration dates
    const activeLeases: Array<{
      tenant: Tenant
      lease: NonNullable<Tenant['leases']>[0]
      daysRemaining: number
      endDate: Date
    }> = []

    tenants.forEach((tenant: Tenant) => {
      tenant.leases?.forEach((lease) => {
        if (lease.status === 'active' && lease.endDate) {
          const endDate = new Date(lease.endDate)
          const daysRemaining = Math.ceil(
            (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          )

          // Only include leases expiring in the future within 3 months
          if (daysRemaining >= 0 && daysRemaining <= 90) {
            activeLeases.push({
              tenant,
              lease,
              daysRemaining,
              endDate,
            })
          }
        }
      })
    })

    // Sort by days remaining (most urgent first)
    activeLeases.sort((a, b) => a.daysRemaining - b.daysRemaining)

    // Count by periods
    const thisMonthCount = activeLeases.filter((l) => l.endDate <= thisMonthEnd).length
    const nextMonthCount = activeLeases.filter(
      (l) => l.endDate <= nextMonthEnd && l.endDate > thisMonthEnd
    ).length
    const threeMonthsCount = activeLeases.filter(
      (l) => l.endDate <= threeMonthsEnd && l.endDate > nextMonthEnd
    ).length

    const totalCount = Math.max(activeLeases.length, 1) // Avoid division by zero

    const progressData: LeaseExpirationData[] = [
      {
        period: 'This Month',
        count: thisMonthCount,
        color: '#ff5252',
        progress: (thisMonthCount / totalCount) * 100,
      },
      {
        period: 'Next Month',
        count: nextMonthCount,
        color: '#ff9800',
        progress: (nextMonthCount / totalCount) * 100,
      },
      {
        period: 'Next 2 Months',
        count: threeMonthsCount,
        color: '#2196f3',
        progress: (threeMonthsCount / totalCount) * 100,
      },
    ]

    // Get all upcoming leases for display (no limit)
    const upcomingLeases: UpcomingLease[] = activeLeases.map(
      ({ tenant, lease, daysRemaining }) => ({
        tenant:
          `${tenant.personalInfo?.firstName || ''} ${tenant.personalInfo?.lastName || ''}`.trim() ||
          'Unknown Tenant',
        unit: lease?.unit || 'Main Unit',
        daysRemaining,
        isUrgent: daysRemaining <= 15,
      })
    )

    return { progressData, upcomingLeases }
  }, [tenants])

  const getDaysChipStyle = (days: number) => {
    if (days <= 15) return { backgroundColor: '#ff5252', color: '#ffffff' }
    if (days <= 30) return { backgroundColor: '#ff9800', color: '#ffffff' }
    return { backgroundColor: '#757575', color: '#ffffff' }
  }

  return (
    <StyledCard>
      <CardContent sx={{ p: 2, pb: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CalendarTodayOutlined sx={{ color: 'text.secondary', fontSize: '1rem', mr: 0.5 }} />
          <Typography
            variant="h6"
            sx={{
              color: 'text.primary',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            Lease Expirations
          </Typography>
        </Box>

        {/* Progress Bars Section */}
        <Box sx={{ mb: 2 }}>
          {progressData.map((item, index) => (
            <ProgressItem key={index}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 0.5,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.7rem',
                  }}
                >
                  {item.period}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.primary',
                    fontSize: '0.7rem',
                    fontWeight: 500,
                  }}
                >
                  {item.count} {item.count === 1 ? 'lease' : 'leases'}
                </Typography>
              </Box>
              <StyledLinearProgress
                variant="determinate"
                value={item.progress}
                progresscolor={item.color}
              />
            </ProgressItem>
          ))}
        </Box>

        {/* Upcoming Section */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: 'text.secondary',
              fontSize: '0.7rem',
              fontWeight: 600,
              mb: 0.5,
            }}
          >
            Upcoming
          </Typography>

          <Box
            sx={{
              maxHeight: 200,
              overflowY: 'auto',
              pr: 0.5,
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(0,0,0,0.1)',
                borderRadius: '2px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '2px',
                '&:hover': {
                  background: 'rgba(0,0,0,0.4)',
                },
              },
            }}
          >
            {isLoading ? (
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', fontSize: '0.7rem', textAlign: 'center', py: 2 }}
              >
                Loading...
              </Typography>
            ) : upcomingLeases.length === 0 ? (
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', fontSize: '0.7rem', textAlign: 'center', py: 2 }}
              >
                No upcoming expirations
              </Typography>
            ) : (
              upcomingLeases.map((lease, index) => (
                <LeaseItem key={index} isLast={index === upcomingLeases.length - 1}>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.primary',
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        lineHeight: 1.2,
                      }}
                    >
                      {lease.tenant}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.6rem',
                      }}
                    >
                      {lease.unit}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${lease.daysRemaining} days`}
                    size="small"
                    sx={{
                      ...getDaysChipStyle(lease.daysRemaining),
                      fontSize: '0.6rem',
                      fontWeight: 500,
                      height: 20,
                    }}
                  />
                </LeaseItem>
              ))
            )}
          </Box>
        </Box>
      </CardContent>
    </StyledCard>
  )
}

export default LeaseExpirationsCard
