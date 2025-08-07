import React, { useEffect, useState } from 'react'
import { AttachMoney } from '@mui/icons-material'
import MetricCard from './MetricCard'
import { useAnalyticsWithComparison } from '../../hooks/useAnalytics'
import { useRealTimeAnalytics } from '../../hooks/useRealTimeAnalytics'

const RevenueMetricCard: React.FC = () => {
  const { data, isLoading, error } = useAnalyticsWithComparison()
  const { analytics: realTimeAnalytics, isConnected } = useRealTimeAnalytics()
  const [currentRevenue, setCurrentRevenue] = useState(0)

  // Use real-time data when available, otherwise fall back to API data
  useEffect(() => {
    if (realTimeAnalytics && isConnected) {
      setCurrentRevenue(realTimeAnalytics.revenue.total)
    } else if (data?.current) {
      setCurrentRevenue(data.current.revenue.total)
    }
  }, [realTimeAnalytics, data, isConnected])

  if (isLoading && !realTimeAnalytics) {
    return (
      <MetricCard title="Total Revenue" value="Loading..." icon={<AttachMoney />} color="blue" />
    )
  }

  if (error && !realTimeAnalytics) {
    return (
      <MetricCard
        title="Total Revenue"
        value="$0"
        trend={{
          value: 0,
          label: 'from last month',
          isPositive: true,
        }}
        icon={<AttachMoney />}
        color="blue"
      />
    )
  }

  const trendValue = data?.comparison?.revenue.percentChange || 0

  return (
    <MetricCard
      title="Total Revenue"
      value={currentRevenue}
      trend={{
        value: trendValue,
        label: 'from last month',
        isPositive: trendValue >= 0,
      }}
      icon={<AttachMoney />}
      color="blue"
    />
  )
}

export default RevenueMetricCard
