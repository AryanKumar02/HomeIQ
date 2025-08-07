import React, { useEffect, useState } from 'react'
import { Home } from '@mui/icons-material'
import MetricCard from './MetricCard'
import { useAnalyticsWithComparison } from '../../hooks/useAnalytics'
import { useRealTimeAnalytics } from '../../hooks/useRealTimeAnalytics'

const OccupancyMetricCard: React.FC = () => {
  const { data, isLoading, error } = useAnalyticsWithComparison()
  const { analytics: realTimeAnalytics, isConnected } = useRealTimeAnalytics()
  const [currentOccupancy, setCurrentOccupancy] = useState(0)

  // Use real-time data when available, otherwise fall back to API data
  useEffect(() => {
    if (realTimeAnalytics && isConnected) {
      setCurrentOccupancy(realTimeAnalytics.occupancy.occupancyRate)
    } else if (data?.current) {
      setCurrentOccupancy(data.current.occupancy.occupancyRate)
    }
  }, [realTimeAnalytics, data, isConnected])

  if (isLoading && !realTimeAnalytics) {
    return <MetricCard title="Occupancy Rate" value="Loading..." icon={<Home />} color="green" />
  }

  if (error && !realTimeAnalytics) {
    return (
      <MetricCard
        title="Occupancy Rate"
        value="0%"
        trend={{
          value: 0,
          label: 'from last month',
          isPositive: true,
        }}
        icon={<Home />}
        color="green"
      />
    )
  }

  const trendValue = data?.comparison?.occupancy.change || 0

  return (
    <MetricCard
      title="Occupancy Rate"
      value={`${currentOccupancy.toFixed(0)}%`}
      trend={{
        value: trendValue,
        label: 'from last month',
        isPositive: trendValue >= 0,
      }}
      icon={<Home />}
      color="green"
    />
  )
}

export default OccupancyMetricCard
