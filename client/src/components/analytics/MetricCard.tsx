import React from 'react'
import { Box, Typography, Card, CardContent } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useCurrency } from '../../hooks/useCurrency'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'red' | 'purple' | 'orange'
}

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: 16,
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease-in-out',
  border: 'none',
  height: 140,
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    height: 120,
    borderRadius: 12,
  },
  '&:hover': {
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)',
  },
}))

const IconContainer = styled(Box)<{ iconColor?: string }>(({ iconColor }) => ({
  width: 32,
  height: 32,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: iconColor || '#f5f5f5',
  '& svg': {
    fontSize: 16,
    color: '#ffffff',
  },
}))

const ValueTypography = styled(Typography)(({ theme }) => ({
  fontSize: '1.75rem',
  fontWeight: 700,
  lineHeight: 1.2,
  color: theme.palette.text.primary,
  marginBottom: 4,
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.4rem',
  },
  [theme.breakpoints.down('xs')]: {
    fontSize: '1.2rem',
  },
}))

const TrendText = styled(Typography)<{ isPositive?: boolean }>(({ isPositive }) => ({
  fontSize: '0.75rem',
  fontWeight: 500,
  color: isPositive ? '#10b981' : '#ef4444',
  display: 'flex',
  alignItems: 'center',
  gap: 4,
}))

const colorMap = {
  blue: '#3b82f6',
  green: '#10b981',
  red: '#ef4444',
  purple: '#8b5cf6',
  orange: '#f59e0b',
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = 'blue',
}) => {
  const iconColor = colorMap[color]
  const { formatPrice } = useCurrency()

  const formatTrendValue = (trendValue: number, label: string) => {
    const sign = trendValue >= 0 ? '+' : ''

    // If label contains "this month", format as count (+0, +4, etc.)
    // If label contains "from last month", format as percentage (+0.0%, +4.5%, etc.)
    if (label.includes('this month')) {
      return `${sign}${Math.round(trendValue)}`
    } else {
      return `${sign}${trendValue.toFixed(1)}%`
    }
  }

  const formatValue = (val: string | number) => {
    // Check if this is a currency value based on the title
    const isCurrencyValue =
      title.toLowerCase().includes('revenue') ||
      title.toLowerCase().includes('expense') ||
      title.toLowerCase().includes('income') ||
      title.toLowerCase().includes('cost') ||
      title.toLowerCase().includes('rent') ||
      title.toLowerCase().includes('value') ||
      title.toLowerCase().includes('portfolio')

    if (typeof val === 'number' && val >= 0 && isCurrencyValue) {
      return formatPrice(val)
    }

    // For non-currency numbers, just format with commas
    if (typeof val === 'number') {
      return val.toLocaleString()
    }

    return val
  }

  return (
    <StyledCard>
      <CardContent
        sx={{
          p: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Header with title and icon */}
        <Box
          sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              fontSize: '0.8rem',
              textTransform: 'none',
              lineHeight: 1.3,
            }}
          >
            {title}
          </Typography>
          {icon && <IconContainer iconColor={iconColor}>{icon}</IconContainer>}
        </Box>

        {/* Main content area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Main value */}
          <ValueTypography>{formatValue(value)}</ValueTypography>

          {/* Subtitle if provided */}
          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
                mb: 0.5,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Trend indicator */}
        {trend && (
          <TrendText isPositive={trend.isPositive ?? trend.value >= 0}>
            {formatTrendValue(trend.value, trend.label)} {trend.label}
          </TrendText>
        )}
      </CardContent>
    </StyledCard>
  )
}

export default MetricCard
