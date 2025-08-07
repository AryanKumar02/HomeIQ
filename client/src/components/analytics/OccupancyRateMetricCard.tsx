import React from 'react'
import { BusinessOutlined } from '@mui/icons-material'
import MetricCard from './MetricCard'
import useRealTimeAnalytics from '../../hooks/useRealTimeAnalytics'

const OccupancyRateMetricCard: React.FC = () => {
  const { analytics } = useRealTimeAnalytics()

  const occupancyRate = Number(analytics?.occupancyRate ?? 0)

  // For now, show 0% change since we're just starting
  const percentageChange = 0

  return (
    <MetricCard
      title="Occupancy Rate"
      value={`${occupancyRate.toFixed(1)}%`}
      icon={<BusinessOutlined />}
      color="orange"
      trend={{
        value: percentageChange,
        label: 'from last month',
        isPositive: percentageChange >= 0,
      }}
    />
  )
}

export default OccupancyRateMetricCard
