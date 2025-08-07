import React, { useMemo } from 'react'
import { Box, Typography, Card, CardContent, Chip, LinearProgress } from '@mui/material'
import { styled } from '@mui/material/styles'
import { PeopleOutlined, WorkOutlined, AccessTimeOutlined, TrendingUpOutlined } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import useRealTimeAnalytics from '../../hooks/useRealTimeAnalytics'
import { useCurrency } from '../../hooks/useCurrency'
import { tenantsApi } from '../../api'
import type { Tenant } from '../../types/tenant'

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

const DemographicItem = styled(Box)<{ isLast?: boolean }>(({ isLast }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 0',
  borderBottom: isLast ? 'none' : '1px solid #f0f0f0',
}))

const CategoryChip = styled(Chip)<{ categorycolor: string }>(({ categorycolor }) => ({
  backgroundColor: `${categorycolor}20`,
  color: categorycolor,
  fontWeight: 600,
  fontSize: '0.65rem',
  height: 24,
  '& .MuiChip-label': {
    padding: '0 8px',
  },
}))

interface DemographicData {
  category: string
  label: string
  count: number
  percentage: number
  averageRent: number
  renewalRate: number
  color: string
  icon: React.ReactElement
}

const TenantDemographicsCard: React.FC = () => {
  const { analytics, isConnected } = useRealTimeAnalytics()
  const { formatPrice } = useCurrency()

  // Fetch tenants data with real-time updates
  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ['tenants'],
    queryFn: tenantsApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // Process tenant demographics from real data
  const demographicData = useMemo(() => {
    if (!tenants.length) {
      return []
    }

    const activeTenants = tenants.filter((tenant: Tenant) =>
      tenant.leases?.some(lease => lease.status === 'active')
    )

    if (!activeTenants.length) {
      return []
    }

    // Age group analysis
    const ageGroups = {
      '18-25': { count: 0, totalRent: 0, renewals: 0, totalLeases: 0 },
      '26-35': { count: 0, totalRent: 0, renewals: 0, totalLeases: 0 },
      '36-45': { count: 0, totalRent: 0, renewals: 0, totalLeases: 0 },
      '46-60': { count: 0, totalRent: 0, renewals: 0, totalLeases: 0 },
      '60+': { count: 0, totalRent: 0, renewals: 0, totalLeases: 0 },
    }

    // Employment type analysis
    const employmentTypes = {
      'Full-time': { count: 0, totalRent: 0, renewals: 0, totalLeases: 0 },
      'Part-time': { count: 0, totalRent: 0, renewals: 0, totalLeases: 0 },
      'Self-employed': { count: 0, totalRent: 0, renewals: 0, totalLeases: 0 },
      'Student': { count: 0, totalRent: 0, renewals: 0, totalLeases: 0 },
      'Retired': { count: 0, totalRent: 0, renewals: 0, totalLeases: 0 },
    }

    activeTenants.forEach((tenant: Tenant) => {
      const activeLease = tenant.leases?.find(lease => lease.status === 'active')
      if (!activeLease) return

      const monthlyRent = Number(activeLease.monthlyRent) || 0
      const totalLeases = tenant.leases?.length || 0
      const renewedLeases = tenant.leases?.filter(l => l.status === 'renewed').length || 0

      // Age group categorization
      if (tenant.personalInfo?.dateOfBirth) {
        const age = new Date().getFullYear() - new Date(tenant.personalInfo.dateOfBirth).getFullYear()
        let ageGroup: keyof typeof ageGroups
        
        if (age <= 25) ageGroup = '18-25'
        else if (age <= 35) ageGroup = '26-35'
        else if (age <= 45) ageGroup = '36-45'
        else if (age <= 60) ageGroup = '46-60'
        else ageGroup = '60+'

        ageGroups[ageGroup].count++
        ageGroups[ageGroup].totalRent += monthlyRent
        ageGroups[ageGroup].renewals += renewedLeases
        ageGroups[ageGroup].totalLeases += totalLeases
      }

      // Employment type categorization
      if (tenant.employment?.current?.status) {
        let empType: keyof typeof employmentTypes
        const status = tenant.employment.current.status
        
        if (status === 'employed-full-time') empType = 'Full-time'
        else if (status === 'employed-part-time') empType = 'Part-time'
        else if (status === 'self-employed') empType = 'Self-employed'
        else if (status === 'student') empType = 'Student'
        else if (status === 'retired') empType = 'Retired'
        else empType = 'Full-time' // Default

        employmentTypes[empType].count++
        employmentTypes[empType].totalRent += monthlyRent
        employmentTypes[empType].renewals += renewedLeases
        employmentTypes[empType].totalLeases += totalLeases
      }
    })

    // Convert to demographic data array
    const demographics: DemographicData[] = []

    // Age groups (top 3)
    Object.entries(ageGroups)
      .filter(([, data]) => data.count > 0)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 3)
      .forEach(([ageGroup, data]) => {
        demographics.push({
          category: 'age',
          label: `Age ${ageGroup}`,
          count: data.count,
          percentage: (data.count / activeTenants.length) * 100,
          averageRent: data.count > 0 ? data.totalRent / data.count : 0,
          renewalRate: data.totalLeases > 0 ? (data.renewals / data.totalLeases) * 100 : 0,
          color: ageGroup === '18-25' ? '#3d82f7' : 
                 ageGroup === '26-35' ? '#06b6d4' : 
                 ageGroup === '36-45' ? '#10b981' :
                 ageGroup === '46-60' ? '#f59e0b' : '#f97316',
          icon: <AccessTimeOutlined sx={{ fontSize: 14 }} />
        })
      })

    // Employment types (top 3)
    Object.entries(employmentTypes)
      .filter(([, data]) => data.count > 0)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 3)
      .forEach(([empType, data]) => {
        demographics.push({
          category: 'employment',
          label: empType,
          count: data.count,
          percentage: (data.count / activeTenants.length) * 100,
          averageRent: data.count > 0 ? data.totalRent / data.count : 0,
          renewalRate: data.totalLeases > 0 ? (data.renewals / data.totalLeases) * 100 : 0,
          color: empType === 'Full-time' ? '#10b981' : 
                 empType === 'Part-time' ? '#f59e0b' : 
                 empType === 'Self-employed' ? '#3d82f7' :
                 empType === 'Student' ? '#06b6d4' : '#f97316',
          icon: <WorkOutlined sx={{ fontSize: 14 }} />
        })
      })

    return demographics.sort((a, b) => b.count - a.count).slice(0, 6)
  }, [tenants])

  const totalTenants = Number(analytics?.activeTenants) || 0

  if (isLoading) {
    return (
      <StyledCard>
        <CardContent sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Loading tenant demographics...
          </Typography>
        </CardContent>
      </StyledCard>
    )
  }

  return (
    <StyledCard>
      <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PeopleOutlined sx={{ fontSize: 16, color: 'secondary.main', mr: 1 }} />
            <Typography
              variant="h6"
              sx={{
                color: 'text.primary',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              Tenant Demographics
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.65rem',
              }}
            >
              Total: {totalTenants}
            </Typography>
            {isConnected && (
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: 'success.main',
                }}
              />
            )}
          </Box>
        </Box>

        {/* Demographics List */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {demographicData.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                No tenant data available
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {demographicData.map((demo, index) => (
                <DemographicItem key={`${demo.category}-${demo.label}`} isLast={index === demographicData.length - 1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: `${demo.color}20`,
                        color: demo.color,
                        mr: 1,
                        flexShrink: 0,
                      }}
                    >
                      {demo.icon}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '0.7rem',
                            color: 'text.primary',
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {demo.label}
                        </Typography>
                        <CategoryChip
                          categorycolor={demo.color}
                          label={`${demo.count} (${demo.percentage.toFixed(1)}%)`}
                          size="small"
                        />
                      </Box>
                      
                      {/* Progress bar */}
                      <Box sx={{ mb: 0.5 }}>
                        <StyledLinearProgress
                          variant="determinate"
                          value={demo.percentage}
                          progresscolor={demo.color}
                        />
                      </Box>
                      
                      {/* Metrics row */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.6rem',
                            color: 'text.secondary',
                          }}
                        >
                          Avg Rent: <span style={{ color: demo.color, fontWeight: 600 }}>{formatPrice(demo.averageRent)}</span>
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                          <TrendingUpOutlined sx={{ fontSize: 10, color: 'success.main' }} />
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: '0.6rem',
                              color: 'success.main',
                              fontWeight: 600,
                            }}
                          >
                            {demo.renewalRate.toFixed(0)}% renewal
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </DemographicItem>
              ))}
            </Box>
          )}
        </Box>

        {/* Connection Status */}
        {!isConnected && (
          <Typography
            variant="caption"
            sx={{
              color: 'warning.main',
              fontSize: '0.7rem',
              textAlign: 'center',
              mt: 1,
            }}
          >
            Connecting...
          </Typography>
        )}
      </CardContent>
    </StyledCard>
  )
}

export default TenantDemographicsCard