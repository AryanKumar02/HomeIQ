import React, { useState } from 'react'
import { Box, Typography, Card, CardContent } from '@mui/material'
import { styled } from '@mui/material/styles'
import { TrendingUpOutlined, TrendingDownOutlined } from '@mui/icons-material'
import useRealTimeAnalytics from '../../hooks/useRealTimeAnalytics'
import { useCurrency } from '../../hooks/useCurrency'

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

const ChartContainer = styled(Box)({
  height: 160,
  position: 'relative',
  margin: '16px 8px 8px 8px',
  border: '1px solid rgba(0,0,0,0.06)',
  borderRadius: 8,
  backgroundColor: 'rgba(0,0,0,0.01)',
})

const LineChart = styled('svg')({
  width: '100%',
  height: '100%',
  overflow: 'visible',
})

const DataPoint = styled('circle')<{ isPositive: boolean; isReal: boolean }>(
  ({ theme, isPositive, isReal }) => ({
    fill: !isReal ? 'rgba(0,0,0,0.4)' : isPositive ? theme.palette.secondary.main : '#e67e22',
    stroke: '#ffffff',
    strokeWidth: !isReal ? 3 : 2,
    r: 4,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    opacity: 1,
    '&:hover': {
      r: 6,
      strokeWidth: !isReal ? 4 : 3,
      opacity: 1,
    },
  })
)

const GridLine = styled('line')({
  stroke: 'rgba(0,0,0,0.08)',
  strokeWidth: 1,
  strokeDasharray: '2,2',
})

const CashFlowTrendsCard: React.FC = () => {
  const { analytics } = useRealTimeAnalytics()
  const { formatPrice } = useCurrency()
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

  const currentCashFlow = Number(analytics?.netOperatingIncome ?? 0)
  const currentRevenue = Number(analytics?.monthlyRevenue ?? 0)
  const currentExpenses = Number(analytics?.monthlyExpenses ?? 0)

  // Generate trend data using real analytics data
  const generateTrendData = () => {
    const now = new Date()
    const months = []

    // Generate last 6 months including current month
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' })
      const year = monthDate.getFullYear()
      const month = monthDate.getMonth() + 1
      const isCurrentMonth = i === 0

      months.push({
        monthName,
        year,
        month,
        isCurrentMonth,
      })
    }

    return months.map((monthInfo, index) => {
      if (monthInfo.isCurrentMonth && analytics) {
        // Use real current month data
        return {
          month: monthInfo.monthName,
          cashFlow: currentCashFlow,
          revenue: currentRevenue,
          expenses: currentExpenses,
          index,
          isReal: true,
        }
      } else {
        // For historical months, show 0 since no data exists yet
        // In the future, this would query MonthlyAnalytics collection
        return {
          month: monthInfo.monthName,
          cashFlow: 0,
          revenue: 0,
          expenses: 0,
          index,
          isReal: false,
        }
      }
    })
  }

  const trendsData = generateTrendData()

  // Calculate chart dimensions and scaling
  const chartWidth = 280
  const chartHeight = 120
  const padding = { top: 20, right: 20, bottom: 20, left: 20 }
  const plotWidth = chartWidth - padding.left - padding.right
  const plotHeight = chartHeight - padding.top - padding.bottom

  // Find min/max for scaling
  const cashFlows = trendsData.map((d) => Number(d.cashFlow))
  const nonZeroFlows = cashFlows.filter((flow) => flow !== 0)

  // If we only have zeros, create a small range around zero for better visualization
  const minValue = nonZeroFlows.length > 0 ? Math.min(...cashFlows, 0) * 1.1 : -1000
  const maxValue = nonZeroFlows.length > 0 ? Math.max(...cashFlows, 0) * 1.1 : 1000
  const valueRange = maxValue - minValue

  // Calculate points for line chart
  const points = trendsData.map((data, index) => {
    const x = padding.left + (index / (trendsData.length - 1)) * plotWidth
    const y = padding.top + ((maxValue - data.cashFlow) / valueRange) * plotHeight
    return { x, y, data }
  })

  // Calculate trend - find first non-zero value for meaningful comparison
  const firstNonZeroIndex = trendsData.findIndex((d) => d.cashFlow !== 0)
  const lastNonZeroIndex = trendsData
    .slice()
    .reverse()
    .findIndex((d) => d.cashFlow !== 0)
  const lastIndex = lastNonZeroIndex !== -1 ? trendsData.length - 1 - lastNonZeroIndex : -1

  let trendPercentage = 0
  let isPositiveTrend = true
  const lastValue = Number(trendsData[trendsData.length - 1]?.cashFlow || 0)

  if (firstNonZeroIndex !== -1 && lastIndex !== -1 && firstNonZeroIndex !== lastIndex) {
    const firstValue = Number(trendsData[firstNonZeroIndex].cashFlow)
    const lastValueForTrend = Number(trendsData[lastIndex].cashFlow)
    trendPercentage = ((lastValueForTrend - firstValue) / Math.abs(firstValue)) * 100
    isPositiveTrend = trendPercentage >= 0
  } else if (lastIndex !== -1) {
    // Only one data point - show if it's positive or negative
    const lastValueForTrend = Number(trendsData[lastIndex].cashFlow)
    isPositiveTrend = lastValueForTrend >= 0
    trendPercentage = 0 // No trend with single point
  }

  // Grid lines
  const zeroY = padding.top + ((maxValue - 0) / valueRange) * plotHeight
  const gridLines = [
    { y: padding.top, value: maxValue },
    { y: zeroY, value: 0 },
    { y: padding.top + plotHeight, value: minValue },
  ]

  return (
    <StyledCard>
      <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'text.primary',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            Cash Flow Trends
          </Typography>
          {isPositiveTrend ? (
            <TrendingUpOutlined sx={{ color: 'secondary.main', fontSize: '1.2rem' }} />
          ) : (
            <TrendingDownOutlined sx={{ color: '#e67e22', fontSize: '1.2rem' }} />
          )}
        </Box>

        {/* Current vs Previous */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
              Current Month
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: lastValue >= 0 ? 'secondary.main' : '#e67e22',
                fontWeight: 700,
                fontSize: '1.1rem',
              }}
            >
              {formatPrice(lastValue)}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
              6-Month Trend
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: isPositiveTrend ? 'secondary.main' : '#e67e22',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 0.5,
              }}
            >
              {isPositiveTrend ? '↗' : '↘'} {Math.abs(trendPercentage).toFixed(1)}%
            </Typography>
          </Box>
        </Box>

        {/* Line Chart */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          <ChartContainer>
            <LineChart viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
              {/* Grid lines */}
              {gridLines.map((line, index) => (
                <GridLine
                  key={index}
                  x1={padding.left}
                  y1={line.y}
                  x2={chartWidth - padding.right}
                  y2={line.y}
                />
              ))}

              {/* Zero line (thicker) */}
              <line
                x1={padding.left}
                y1={zeroY}
                x2={chartWidth - padding.right}
                y2={zeroY}
                stroke="rgba(0,0,0,0.2)"
                strokeWidth={1.5}
              />

              {/* Area fill (gradient) */}
              <defs>
                <linearGradient id="positiveAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop
                    offset="0%"
                    style={{ stopColor: 'var(--mui-palette-secondary-main)', stopOpacity: 0.2 }}
                  />
                  <stop
                    offset="100%"
                    style={{ stopColor: 'var(--mui-palette-secondary-main)', stopOpacity: 0.05 }}
                  />
                </linearGradient>
                <linearGradient id="negativeAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#e67e22', stopOpacity: 0.2 }} />
                  <stop offset="100%" style={{ stopColor: '#e67e22', stopOpacity: 0.05 }} />
                </linearGradient>
              </defs>

              {/* Area fills for each segment */}
              {points.map((point, index) => {
                if (index === 0) return null
                const prevPoint = points[index - 1]
                const isSegmentPositive = point.data.cashFlow >= 0
                const segmentPath = `M ${prevPoint.x} ${prevPoint.y} L ${point.x} ${point.y} L ${point.x} ${zeroY} L ${prevPoint.x} ${zeroY} Z`

                return (
                  <path
                    key={`area-${index}`}
                    d={segmentPath}
                    fill={`url(#${isSegmentPositive ? 'positive' : 'negative'}AreaGradient)`}
                  />
                )
              })}

              {/* Main line segments with dynamic colors */}
              {points.map((point, index) => {
                if (index === 0) return null
                const prevPoint = points[index - 1]
                const isSegmentPositive = point.data.cashFlow >= 0
                const segmentColor = isSegmentPositive
                  ? 'var(--mui-palette-secondary-main)'
                  : '#e67e22'
                const segmentOpacity = point.data.isReal ? 1 : 0.4

                return (
                  <line
                    key={`line-${index}`}
                    x1={prevPoint.x}
                    y1={prevPoint.y}
                    x2={point.x}
                    y2={point.y}
                    stroke={segmentColor}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    opacity={segmentOpacity}
                    strokeDasharray={!point.data.isReal ? '4,2' : 'none'}
                  />
                )
              })}

              {/* Data points */}
              {points.map((point, index) => (
                <DataPoint
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  isPositive={point.data.cashFlow >= 0}
                  isReal={point.data.isReal}
                  onMouseEnter={() => {
                    console.log('Mouse entered point', index)
                    setHoveredPoint(index)
                  }}
                  onMouseLeave={() => {
                    console.log('Mouse left point')
                    setHoveredPoint(null)
                  }}
                />
              ))}

              {/* Customized SVG tooltip */}
              {hoveredPoint !== null && (
                <g>
                  {/* Tooltip shadow */}
                  <rect
                    x={points[hoveredPoint].x - 65}
                    y={points[hoveredPoint].y - 62}
                    width="130"
                    height="50"
                    fill="rgba(0,0,0,0.15)"
                    rx="8"
                    transform="translate(2, 2)"
                  />

                  {/* Main tooltip background */}
                  <rect
                    x={points[hoveredPoint].x - 65}
                    y={points[hoveredPoint].y - 62}
                    width="130"
                    height="50"
                    fill="#ffffff"
                    stroke="rgba(0,0,0,0.08)"
                    strokeWidth="1"
                    rx="8"
                  />

                  {/* Month label */}
                  <text
                    x={points[hoveredPoint].x}
                    y={points[hoveredPoint].y - 45}
                    textAnchor="middle"
                    fill="rgba(0,0,0,0.6)"
                    fontSize="9"
                    fontWeight="500"
                  >
                    {points[hoveredPoint].data.month} 2024
                  </text>

                  {/* Cash Flow amount */}
                  <text
                    x={points[hoveredPoint].x}
                    y={points[hoveredPoint].y - 32}
                    textAnchor="middle"
                    fill={points[hoveredPoint].data.cashFlow >= 0 ? '#1976d2' : '#e67e22'}
                    fontSize="12"
                    fontWeight="700"
                  >
                    {points[hoveredPoint].data.isReal
                      ? formatPrice(points[hoveredPoint].data.cashFlow)
                      : 'No data'}
                  </text>

                  {/* Status indicator */}
                  <text
                    x={points[hoveredPoint].x}
                    y={points[hoveredPoint].y - 19}
                    textAnchor="middle"
                    fill="rgba(0,0,0,0.5)"
                    fontSize="8"
                  >
                    {points[hoveredPoint].data.isReal
                      ? points[hoveredPoint].data.cashFlow >= 0
                        ? 'Positive Flow'
                        : 'Negative Flow'
                      : 'Awaiting Data'}
                  </text>

                  {/* Tooltip pointer */}
                  <polygon
                    points={`${points[hoveredPoint].x - 6},${points[hoveredPoint].y - 12} ${points[hoveredPoint].x + 6},${points[hoveredPoint].y - 12} ${points[hoveredPoint].x},${points[hoveredPoint].y - 5}`}
                    fill="#ffffff"
                    stroke="rgba(0,0,0,0.08)"
                    strokeWidth="1"
                  />
                </g>
              )}

              {/* Month labels */}
              {points.map((point, index) => (
                <text
                  key={`label-${index}`}
                  x={point.x}
                  y={chartHeight - 5}
                  textAnchor="middle"
                  fontSize="10"
                  fill="rgba(0,0,0,0.6)"
                >
                  {point.data.month}
                </text>
              ))}
            </LineChart>
          </ChartContainer>
        </Box>

        {/* Footer Stats */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            pt: 1,
            borderTop: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>
              Real Data
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, fontSize: '0.7rem', color: 'text.primary' }}
            >
              {trendsData.filter((d) => d.isReal).length}/6 months
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>
              Current
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: '0.7rem',
                color: currentCashFlow >= 0 ? 'secondary.main' : '#e67e22',
              }}
            >
              {formatPrice(currentCashFlow)}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>
              Status
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontSize: '0.7rem',
                color: currentCashFlow >= 0 ? 'secondary.main' : '#e67e22',
              }}
            >
              {currentCashFlow >= 0 ? 'Positive' : 'Negative'}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </StyledCard>
  )
}

export default CashFlowTrendsCard
