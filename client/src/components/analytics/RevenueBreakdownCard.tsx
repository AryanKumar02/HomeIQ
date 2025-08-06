import React, { useState } from 'react'
import { Box, Typography, Card, CardContent, IconButton } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useQuery } from '@tanstack/react-query'
import {
  HomeOutlined,
  AccountBalanceOutlined,
  SecurityOutlined,
  BuildOutlined,
  FlashOnOutlined,
  ArrowBackOutlined,
  AnalyticsOutlined,
} from '@mui/icons-material'
import useRealTimeAnalytics from '../../hooks/useRealTimeAnalytics'
import { useCurrency } from '../../hooks/useCurrency'
import { propertiesApi } from '../../api'
import type { Property } from '../../types/property'

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: 16,
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease-in-out',
  border: 'none',
  height: 320,
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    height: 320,
    borderRadius: 12,
  },
  '&:hover': {
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)',
  },
}))

const ProgressFill = styled(Box)<{ width: number }>(({ theme, width }) => ({
  height: '100%',
  width: `${width}%`,
  backgroundColor: theme.palette.secondary.main,
  borderRadius: 'inherit',
  transition: 'width 0.3s ease-in-out',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
    animation: 'shimmer 2s infinite',
  },
  '@keyframes shimmer': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' },
  },
}))

const ExpenseItem = styled(Box)<{ clickable?: boolean }>(({ clickable }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 2,
  padding: '3px 5px',
  borderRadius: 8,
  backgroundColor: 'rgba(0,0,0,0.02)',
  transition: 'all 0.2s ease-in-out',
  cursor: clickable ? 'pointer' : 'default',
  '&:hover': {
    backgroundColor: clickable ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.04)',
    transform: clickable ? 'translateX(2px)' : 'translateX(1px)',
    boxShadow: clickable ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
  },
  '& .expense-icon': {
    fontSize: 12,
    marginRight: 4,
    padding: 1,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
}))

const RevenueBreakdownCard: React.FC = () => {
  const { analytics, isConnected } = useRealTimeAnalytics()
  const { formatPrice } = useCurrency()

  // View state management
  const [currentView, setCurrentView] = useState<
    | 'breakdown'
    | 'mortgage-pie'
    | 'taxes-bar'
    | 'insurance-donut'
    | 'maintenance-bar'
    | 'utilities-area'
  >('breakdown')

  // React Query for properties data
  const { data: properties = [], isLoading: isLoadingProperties } = useQuery({
    queryKey: ['properties'],
    queryFn: propertiesApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  })

  // Consistent color palette for all properties
  const propertyColors = [
    '#8b5cf6', // Purple
    '#f59e0b', // Orange
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#f97316', // Orange-red
    '#ef4444', // Red
    '#3b82f6', // Blue
    '#8b5cf6', // Purple (repeat)
    '#14b8a6', // Teal
    '#f59e0b', // Orange (repeat)
  ]

  // Create consistent color mapping for all properties
  const propertyColorMap = React.useMemo(() => {
    const colorMap = new Map()
    properties.forEach((property, index) => {
      colorMap.set(property._id, propertyColors[index % propertyColors.length])
    })
    return colorMap
  }, [properties])

  // Process properties data for different views
  const propertyMortgages = React.useMemo(() => {
    return properties
      .map((property: Property) => ({
        id: property._id || '',
        name: property.address?.street || `Property ${property._id?.slice(-4) || ''}`,
        mortgage: Number(property.financials?.monthlyMortgage) || 0,
        color: String(propertyColorMap.get(property._id || '') ?? '#8b5cf6'),
      }))
      .filter((p) => p.mortgage > 0)
      .sort((a, b) => b.mortgage - a.mortgage)
      .slice(0, 6)
  }, [properties, propertyColorMap])

  const propertyTaxes = React.useMemo(() => {
    return properties
      .map((property: Property) => ({
        id: property._id || '',
        name: property.address?.street || `Property ${property._id?.slice(-4) || ''}`,
        taxes: Number(property.financials?.propertyTaxes) || 0,
        color: String(propertyColorMap.get(property._id || '') ?? '#f59e0b'),
      }))
      .filter((p) => p.taxes > 0)
      .sort((a, b) => b.taxes - a.taxes)
      .slice(0, 6)
  }, [properties, propertyColorMap])

  const propertyInsurance = React.useMemo(() => {
    return properties
      .map((property: Property) => ({
        id: property._id || '',
        name: property.address?.street || `Property ${property._id?.slice(-4) || ''}`,
        insurance: Number(property.financials?.insurance) || 0,
        color: String(propertyColorMap.get(property._id || '') ?? '#06b6d4'),
      }))
      .filter((p) => p.insurance > 0)
      .sort((a, b) => b.insurance - a.insurance)
      .slice(0, 6)
  }, [properties, propertyColorMap])

  const propertyMaintenance = React.useMemo(() => {
    return properties
      .map((property: Property) => ({
        id: property._id || '',
        name: property.address?.street || `Property ${property._id?.slice(-4) || ''}`,
        maintenance: Number(property.financials?.maintenance) || 0,
        color: String(propertyColorMap.get(property._id || '') ?? '#10b981'),
      }))
      .filter((p) => p.maintenance > 0)
      .sort((a, b) => b.maintenance - a.maintenance)
      .slice(0, 6)
  }, [properties, propertyColorMap])

  const propertyUtilities = React.useMemo(() => {
    return properties
      .map((property: Property) => ({
        id: property._id || '',
        name: property.address?.street || `Property ${property._id?.slice(-4) || ''}`,
        utilities: Number(property.financials?.utilities) || 0,
        color: String(propertyColorMap.get(property._id || '') ?? '#f97316'),
      }))
      .filter((p) => p.utilities > 0)
      .sort((a, b) => b.utilities - a.utilities)
      .slice(0, 6)
  }, [properties, propertyColorMap])

  const totalRevenue = Number(analytics?.monthlyRevenue ?? 0)
  const totalExpenses = Number(analytics?.monthlyExpenses ?? 0)
  const netProfit = totalRevenue - totalExpenses

  // Get expense breakdown from legacy structure
  const expenses = analytics?.expenses?.breakdown || {
    mortgage: 0,
    taxes: 0,
    insurance: 0,
    maintenance: 0,
    utilities: 0,
  }

  // Calculate percentages
  const revenuePercentage =
    totalRevenue + totalExpenses > 0 ? (totalRevenue / (totalRevenue + totalExpenses)) * 100 : 50
  const expensePercentage = 100 - revenuePercentage

  const expenseItems = [
    {
      key: 'mortgage',
      label: 'Mortgage',
      amount: expenses.mortgage,
      icon: <HomeOutlined className="expense-icon" style={{ color: '#8b5cf6' }} />,
      color: '#8b5cf6',
      clickable: true,
      onClick: () => setCurrentView('mortgage-pie'),
    },
    {
      key: 'taxes',
      label: 'Taxes',
      amount: expenses.taxes,
      icon: <AccountBalanceOutlined className="expense-icon" style={{ color: '#f59e0b' }} />,
      color: '#f59e0b',
      clickable: true,
      onClick: () => setCurrentView('taxes-bar'),
    },
    {
      key: 'insurance',
      label: 'Insurance',
      amount: expenses.insurance,
      icon: <SecurityOutlined className="expense-icon" style={{ color: '#06b6d4' }} />,
      color: '#06b6d4',
      clickable: true,
      onClick: () => setCurrentView('insurance-donut'),
    },
    {
      key: 'maintenance',
      label: 'Maintenance',
      amount: expenses.maintenance,
      icon: <BuildOutlined className="expense-icon" style={{ color: '#10b981' }} />,
      color: '#10b981',
      clickable: true,
      onClick: () => setCurrentView('maintenance-bar'),
    },
    {
      key: 'utilities',
      label: 'Utilities',
      amount: expenses.utilities,
      icon: <FlashOnOutlined className="expense-icon" style={{ color: '#f97316' }} />,
      color: '#f97316',
      clickable: true,
      onClick: () => setCurrentView('utilities-area'),
    },
  ]

  const getExpensePercentage = (amount: number) => {
    return totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
  }

  // Pie chart component for mortgage breakdown
  const MortgagePieChart = () => {
    const totalMortgage = propertyMortgages.reduce((sum, p) => sum + p.mortgage, 0)

    if (propertyMortgages.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {isLoadingProperties ? 'Loading mortgage data...' : 'No mortgage data available'}
          </Typography>
        </Box>
      )
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Pie Chart */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <g transform="translate(60,60)">
              {propertyMortgages.map((property, index) => {
                const percentage = (property.mortgage / totalMortgage) * 100
                const angle = (percentage / 100) * 360
                const startAngle = propertyMortgages
                  .slice(0, index)
                  .reduce((acc, p) => acc + (p.mortgage / totalMortgage) * 360, 0)
                const endAngle = startAngle + angle

                // Calculate path for pie slice
                const startAngleRad = (startAngle * Math.PI) / 180
                const endAngleRad = (endAngle * Math.PI) / 180
                const largeArcFlag = angle > 180 ? 1 : 0

                const x1 = 45 * Math.cos(startAngleRad)
                const y1 = 45 * Math.sin(startAngleRad)
                const x2 = 45 * Math.cos(endAngleRad)
                const y2 = 45 * Math.sin(endAngleRad)

                const pathData = [
                  `M 0 0`,
                  `L ${x1} ${y1}`,
                  `A 45 45 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  `Z`,
                ].join(' ')

                return (
                  <path
                    key={property.id}
                    d={pathData}
                    fill={property.color}
                    stroke="white"
                    strokeWidth="2"
                  />
                )
              })}
            </g>
          </svg>
        </Box>

        {/* Legend - Multi-column layout */}
        <Box
          sx={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: propertyMortgages.length > 3 ? 'repeat(2, 1fr)' : '1fr',
            gap: 0.8,
            columnGap: 1,
            alignContent: 'start',
          }}
        >
          {propertyMortgages.map((property) => {
            const percentage = (property.mortgage / totalMortgage) * 100
            return (
              <Box
                key={property.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: '24px',
                  p: 0.5,
                  borderRadius: 1,
                  backgroundColor: `${property.color}08`,
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: property.color,
                    mr: 0.5,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.65rem',
                    color: 'text.primary',
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.2,
                    mr: 1,
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {property.name}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.3,
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.6rem',
                      fontWeight: 600,
                      color: 'text.primary',
                      lineHeight: 1.1,
                    }}
                  >
                    {formatPrice(property.mortgage)}
                  </Typography>
                  <Box
                    sx={{
                      width: '1px',
                      height: '12px',
                      backgroundColor: 'rgba(0,0,0,0.2)',
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.55rem',
                      color: 'text.secondary',
                      lineHeight: 1,
                      fontWeight: 600,
                    }}
                  >
                    {percentage.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            )
          })}
        </Box>
      </Box>
    )
  }

  // Bar chart component for taxes breakdown
  const TaxesBarChart = () => {
    if (propertyTaxes.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {isLoadingProperties ? 'Loading tax data...' : 'No tax data available'}
          </Typography>
        </Box>
      )
    }

    const maxTax = Math.max(...propertyTaxes.map((p) => p.taxes))
    const totalTaxes = propertyTaxes.reduce((sum, p) => sum + p.taxes, 0)

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 1.5 }}>
        {propertyTaxes.map((property) => {
          const percentage = (property.taxes / totalTaxes) * 100
          const barWidth = (property.taxes / maxTax) * 100

          return (
            <Box key={property.id} sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
              {/* Property name and amount */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.65rem',
                    color: 'text.primary',
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                    mr: 1,
                  }}
                >
                  {property.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.6rem',
                      fontWeight: 600,
                      color: 'text.primary',
                    }}
                  >
                    {formatPrice(property.taxes)}
                  </Typography>
                  <Box sx={{ width: '1px', height: '12px', backgroundColor: 'rgba(0,0,0,0.2)' }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.55rem',
                      color: 'text.secondary',
                      fontWeight: 600,
                      minWidth: '35px',
                    }}
                  >
                    {percentage.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>

              {/* Bar */}
              <Box
                sx={{
                  height: 8,
                  backgroundColor: `${property.color}20`,
                  borderRadius: 1,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    width: `${barWidth}%`,
                    backgroundColor: property.color,
                    borderRadius: 'inherit',
                    transition: 'width 0.3s ease-in-out',
                  }}
                />
              </Box>
            </Box>
          )
        })}
      </Box>
    )
  }

  // Donut chart component for insurance breakdown
  const InsuranceDonutChart = () => {
    const totalInsurance = propertyInsurance.reduce((sum, p) => sum + p.insurance, 0)

    if (propertyInsurance.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {isLoadingProperties ? 'Loading insurance data...' : 'No insurance data available'}
          </Typography>
        </Box>
      )
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Donut Chart */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, position: 'relative' }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <g transform="translate(60,60)">
              {propertyInsurance.map((property, index) => {
                const percentage = (property.insurance / totalInsurance) * 100
                const angle = (percentage / 100) * 360
                const startAngle = propertyInsurance
                  .slice(0, index)
                  .reduce((acc, p) => acc + (p.insurance / totalInsurance) * 360, 0)
                const endAngle = startAngle + angle

                // Calculate path for donut slice (with inner hole)
                const startAngleRad = (startAngle * Math.PI) / 180
                const endAngleRad = (endAngle * Math.PI) / 180
                const largeArcFlag = angle > 180 ? 1 : 0

                const outerRadius = 45
                const innerRadius = 20

                const x1Outer = outerRadius * Math.cos(startAngleRad)
                const y1Outer = outerRadius * Math.sin(startAngleRad)
                const x2Outer = outerRadius * Math.cos(endAngleRad)
                const y2Outer = outerRadius * Math.sin(endAngleRad)

                const x1Inner = innerRadius * Math.cos(startAngleRad)
                const y1Inner = innerRadius * Math.sin(startAngleRad)
                const x2Inner = innerRadius * Math.cos(endAngleRad)
                const y2Inner = innerRadius * Math.sin(endAngleRad)

                const pathData = [
                  `M ${x1Inner} ${y1Inner}`,
                  `L ${x1Outer} ${y1Outer}`,
                  `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2Outer} ${y2Outer}`,
                  `L ${x2Inner} ${y2Inner}`,
                  `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner}`,
                  `Z`,
                ].join(' ')

                return (
                  <path
                    key={property.id}
                    d={pathData}
                    fill={property.color}
                    stroke="white"
                    strokeWidth="2"
                  />
                )
              })}
            </g>
            {/* Center text */}
            <text
              x="60"
              y="55"
              textAnchor="middle"
              fontSize="10"
              fill="rgba(0,0,0,0.6)"
              fontWeight="500"
            >
              Total
            </text>
            <text
              x="60"
              y="68"
              textAnchor="middle"
              fontSize="11"
              fill="rgba(0,0,0,0.8)"
              fontWeight="700"
            >
              {formatPrice(totalInsurance)}
            </text>
          </svg>
        </Box>

        {/* Legend */}
        <Box
          sx={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: propertyInsurance.length > 3 ? 'repeat(2, 1fr)' : '1fr',
            gap: 0.8,
            columnGap: 1,
            alignContent: 'start',
          }}
        >
          {propertyInsurance.map((property) => {
            const percentage = (property.insurance / totalInsurance) * 100
            return (
              <Box
                key={property.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: '24px',
                  p: 0.5,
                  borderRadius: 1,
                  backgroundColor: `${property.color}08`,
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: property.color,
                    mr: 0.5,
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.65rem',
                    color: 'text.primary',
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.2,
                    mr: 1,
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {property.name}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.3,
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.6rem',
                      fontWeight: 600,
                      color: 'text.primary',
                      lineHeight: 1.1,
                    }}
                  >
                    {formatPrice(property.insurance)}
                  </Typography>
                  <Box
                    sx={{
                      width: '1px',
                      height: '12px',
                      backgroundColor: 'rgba(0,0,0,0.2)',
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.55rem',
                      color: 'text.secondary',
                      lineHeight: 1,
                      fontWeight: 600,
                    }}
                  >
                    {percentage.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            )
          })}
        </Box>
      </Box>
    )
  }

  // Bar chart component for maintenance breakdown with trend indicators
  const MaintenanceBarChart = () => {
    if (propertyMaintenance.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {isLoadingProperties ? 'Loading maintenance data...' : 'No maintenance data available'}
          </Typography>
        </Box>
      )
    }

    const maxMaintenance = Math.max(...propertyMaintenance.map((p) => p.maintenance))
    const totalMaintenance = propertyMaintenance.reduce((sum, p) => sum + p.maintenance, 0)
    const avgMaintenance = totalMaintenance / propertyMaintenance.length

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0.8 }}>
        {/* Ultra-thin summary bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 0.4,
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            borderRadius: 1,
            minHeight: '20px',
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>
            Total:{' '}
            <span style={{ color: '#10b981', fontWeight: 700 }}>
              {formatPrice(totalMaintenance)}
            </span>
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>
            Avg:{' '}
            <span style={{ color: '#10b981', fontWeight: 700 }}>{formatPrice(avgMaintenance)}</span>
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>
            Count:{' '}
            <span style={{ color: '#10b981', fontWeight: 700 }}>{propertyMaintenance.length}</span>
          </Typography>
        </Box>

        {propertyMaintenance.map((property) => {
          const percentage = (property.maintenance / totalMaintenance) * 100
          const barWidth = (property.maintenance / maxMaintenance) * 100
          const isAboveAverage = property.maintenance > avgMaintenance

          return (
            <Box key={property.id} sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
              {/* Compact property row */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <Box
                    sx={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      backgroundColor: property.color,
                      mr: 0.5,
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.68rem',
                      color: 'text.primary',
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                      mr: 0.5,
                    }}
                  >
                    {property.name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.61rem',
                      fontWeight: 600,
                      color: isAboveAverage ? '#ef4444' : '#22c55e',
                    }}
                  >
                    {formatPrice(property.maintenance)}
                  </Typography>
                  <Box sx={{ width: '1px', height: '10px', backgroundColor: 'rgba(0,0,0,0.2)' }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.56rem',
                      color: 'text.secondary',
                      fontWeight: 600,
                      minWidth: '30px',
                    }}
                  >
                    {percentage.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>

              {/* Rounded modern bar */}
              <Box
                sx={{
                  height: 12,
                  backgroundColor: `${property.color}08`,
                  borderRadius: 2,
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: `inset 0 1px 2px rgba(0,0,0,0.05)`,
                  border: `1px solid ${property.color}20`,
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    width: `${barWidth}%`,
                    background: `linear-gradient(135deg, ${property.color} 0%, ${property.color}dd 100%)`,
                    borderRadius: 2,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    boxShadow: `0 1px 3px ${property.color}40`,
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '40%',
                      background:
                        'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
                      borderRadius: '2px 2px 0 0',
                    },
                  }}
                />
                {/* Modern average indicator */}
                {avgMaintenance > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: `${(avgMaintenance / maxMaintenance) * 100}%`,
                      top: -2,
                      bottom: -2,
                      width: '2px',
                      backgroundColor: '#64748b',
                      borderRadius: 1,
                      zIndex: 2,
                      boxShadow: '0 0 4px rgba(100,116,139,0.5)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -3,
                        left: -2,
                        width: 6,
                        height: 6,
                        backgroundColor: '#64748b',
                        borderRadius: '50%',
                        border: '2px solid white',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      },
                    }}
                  />
                )}
              </Box>
            </Box>
          )
        })}
      </Box>
    )
  }

  // Bar chart component for utilities breakdown with trend indicators
  const UtilitiesBarChart = () => {
    if (propertyUtilities.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {isLoadingProperties ? 'Loading utilities data...' : 'No utilities data available'}
          </Typography>
        </Box>
      )
    }

    const maxUtilities = Math.max(...propertyUtilities.map((p) => p.utilities))
    const totalUtilities = propertyUtilities.reduce((sum, p) => sum + p.utilities, 0)
    const avgUtilities = totalUtilities / propertyUtilities.length

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0.8 }}>
        {/* Ultra-thin summary bar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 0.4,
            backgroundColor: 'rgba(249, 115, 22, 0.05)',
            borderRadius: 1,
            minHeight: '20px',
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>
            Total:{' '}
            <span style={{ color: '#f97316', fontWeight: 700 }}>{formatPrice(totalUtilities)}</span>
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>
            Avg:{' '}
            <span style={{ color: '#f97316', fontWeight: 700 }}>{formatPrice(avgUtilities)}</span>
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>
            Count:{' '}
            <span style={{ color: '#f97316', fontWeight: 700 }}>{propertyUtilities.length}</span>
          </Typography>
        </Box>

        {propertyUtilities.map((property) => {
          const percentage = (property.utilities / totalUtilities) * 100
          const barWidth = (property.utilities / maxUtilities) * 100
          const isAboveAverage = property.utilities > avgUtilities

          return (
            <Box key={property.id} sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
              {/* Compact property row */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <Box
                    sx={{
                      width: 9,
                      height: 9,
                      borderRadius: '50%',
                      backgroundColor: property.color,
                      mr: 0.5,
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.68rem',
                      color: 'text.primary',
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                      mr: 0.5,
                    }}
                  >
                    {property.name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.61rem',
                      fontWeight: 600,
                      color: isAboveAverage ? '#ef4444' : '#22c55e',
                    }}
                  >
                    {formatPrice(property.utilities)}
                  </Typography>
                  <Box sx={{ width: '1px', height: '10px', backgroundColor: 'rgba(0,0,0,0.2)' }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.56rem',
                      color: 'text.secondary',
                      fontWeight: 600,
                      minWidth: '30px',
                    }}
                  >
                    {percentage.toFixed(1)}%
                  </Typography>
                </Box>
              </Box>

              {/* Rounded modern bar */}
              <Box
                sx={{
                  height: 12,
                  backgroundColor: `${property.color}08`,
                  borderRadius: 2,
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: `inset 0 1px 2px rgba(0,0,0,0.05)`,
                  border: `1px solid ${property.color}20`,
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    width: `${barWidth}%`,
                    background: `linear-gradient(135deg, ${property.color} 0%, ${property.color}dd 100%)`,
                    borderRadius: 2,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    boxShadow: `0 1px 3px ${property.color}40`,
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '40%',
                      background:
                        'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
                      borderRadius: '2px 2px 0 0',
                    },
                  }}
                />
                {/* Modern average indicator */}
                {avgUtilities > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: `${(avgUtilities / maxUtilities) * 100}%`,
                      top: -2,
                      bottom: -2,
                      width: '2px',
                      backgroundColor: '#64748b',
                      borderRadius: 1,
                      zIndex: 2,
                      boxShadow: '0 0 4px rgba(100,116,139,0.5)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -3,
                        left: -2,
                        width: 6,
                        height: 6,
                        backgroundColor: '#64748b',
                        borderRadius: '50%',
                        border: '2px solid white',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      },
                    }}
                  />
                )}
              </Box>
            </Box>
          )
        })}
      </Box>
    )
  }

  return (
    <StyledCard>
      <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header with back button */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AnalyticsOutlined sx={{ fontSize: 16, color: '#3d82f7', mr: 1 }} />
            <Typography
              variant="h6"
              sx={{
                color: 'text.primary',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              {currentView === 'breakdown'
                ? 'Revenue vs Expenses Breakdown'
                : currentView === 'mortgage-pie'
                  ? 'Mortgage Breakdown by Property'
                  : currentView === 'taxes-bar'
                    ? 'Property Tax Breakdown'
                    : currentView === 'insurance-donut'
                      ? 'Property Insurance Breakdown'
                      : currentView === 'maintenance-bar'
                        ? 'Property Maintenance Breakdown'
                        : 'Utilities Breakdown by Property'}
            </Typography>
          </Box>
          {(currentView === 'mortgage-pie' ||
            currentView === 'taxes-bar' ||
            currentView === 'insurance-donut' ||
            currentView === 'maintenance-bar' ||
            currentView === 'utilities-area') && (
            <IconButton
              size="small"
              onClick={() => setCurrentView('breakdown')}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.04)',
                  color: 'text.primary',
                },
              }}
            >
              <ArrowBackOutlined fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* Conditional Content Based on View */}
        {currentView === 'breakdown' ? (
          /* Two Column Layout */
          <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
            {/* Left Column - Summary & Progress */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Summary Cards */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1 }}>
                <Box
                  sx={{
                    p: 0.8,
                    borderRadius: 2,
                    backgroundColor: (theme) => `${theme.palette.secondary.main}20`,
                    textAlign: 'center',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.55rem',
                      textTransform: 'uppercase',
                      letterSpacing: 0.3,
                    }}
                  >
                    Revenue
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ color: 'secondary.main', fontWeight: 700, fontSize: '0.8rem' }}
                  >
                    {formatPrice(totalRevenue)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 0.8,
                    borderRadius: 2,
                    backgroundColor: 'rgba(230, 126, 34, 0.15)',
                    textAlign: 'center',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.55rem',
                      textTransform: 'uppercase',
                      letterSpacing: 0.3,
                    }}
                  >
                    Expenses
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ color: '#e67e22', fontWeight: 700, fontSize: '0.8rem' }}
                  >
                    {formatPrice(totalExpenses)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 0.8,
                    borderRadius: 2,
                    backgroundColor: (theme) =>
                      netProfit >= 0
                        ? `${theme.palette.secondary.main}20`
                        : 'rgba(230, 126, 34, 0.15)',
                    textAlign: 'center',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.55rem',
                      textTransform: 'uppercase',
                      letterSpacing: 0.3,
                    }}
                  >
                    Net Profit
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: netProfit >= 0 ? 'secondary.main' : '#e67e22',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                    }}
                  >
                    {formatPrice(netProfit)}
                  </Typography>
                </Box>
              </Box>

              {/* Modern Progress Bar */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: 'secondary.main', fontSize: '0.6rem', fontWeight: 600 }}
                  >
                    Revenue {revenuePercentage.toFixed(1)}%
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: '#e67e22', fontSize: '0.6rem', fontWeight: 600 }}
                  >
                    Expenses {expensePercentage.toFixed(1)}%
                  </Typography>
                </Box>
                <Box
                  sx={{
                    height: 10,
                    borderRadius: 2,
                    overflow: 'hidden',
                    position: 'relative',
                    backgroundColor: '#e67e22',
                  }}
                >
                  <ProgressFill width={revenuePercentage} />
                </Box>
              </Box>
            </Box>

            {/* Right Column - Expense Breakdown */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'text.primary',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  mb: 0.5,
                }}
              >
                Expense Breakdown
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                {expenseItems.map((item) => (
                  <ExpenseItem
                    key={item.key}
                    clickable={item.clickable}
                    onClick={item.clickable ? item.onClick : undefined}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                      {item.icon}
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.7rem',
                          color: 'text.primary',
                          fontWeight: 500,
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        {item.label}
                        {item.clickable && (
                          <Typography
                            component="span"
                            sx={{
                              fontSize: '0.6rem',
                              color: 'text.secondary',
                              ml: 0.5,
                            }}
                          >
                            (click to view)
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: 'text.primary',
                          mr: 0.5,
                        }}
                      >
                        {formatPrice(item.amount)}
                      </Typography>
                      <Box
                        sx={{
                          px: 0.5,
                          py: 0.2,
                          borderRadius: 2,
                          backgroundColor: `${item.color}20`,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.6rem',
                            color: item.color,
                            fontWeight: 600,
                            minWidth: '28px',
                            textAlign: 'center',
                            display: 'block',
                          }}
                        >
                          {getExpensePercentage(item.amount).toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>
                  </ExpenseItem>
                ))}
              </Box>
            </Box>
          </Box>
        ) : currentView === 'mortgage-pie' ? (
          /* Mortgage Pie Chart View */
          <Box sx={{ flex: 1 }}>
            <MortgagePieChart />
          </Box>
        ) : currentView === 'taxes-bar' ? (
          /* Taxes Bar Chart View */
          <Box sx={{ flex: 1 }}>
            <TaxesBarChart />
          </Box>
        ) : currentView === 'insurance-donut' ? (
          /* Insurance Donut Chart View */
          <Box sx={{ flex: 1 }}>
            <InsuranceDonutChart />
          </Box>
        ) : currentView === 'maintenance-bar' ? (
          /* Maintenance Bar Chart View */
          <Box sx={{ flex: 1 }}>
            <MaintenanceBarChart />
          </Box>
        ) : (
          /* Utilities Bar Chart View */
          <Box sx={{ flex: 1 }}>
            <UtilitiesBarChart />
          </Box>
        )}

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

export default RevenueBreakdownCard
