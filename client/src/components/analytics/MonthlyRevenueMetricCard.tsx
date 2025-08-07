import React from 'react'
import { TrendingUpOutlined } from '@mui/icons-material'
import MetricCard from './MetricCard'
import useRealTimeAnalytics from '../../hooks/useRealTimeAnalytics'

const MonthlyRevenueMetricCard: React.FC = () => {
  const { analytics } = useRealTimeAnalytics()

  const monthlyRevenue = Number(analytics?.monthlyRevenue ?? 0)

  return (
    <MetricCard
      title="Monthly Revenue"
      value={monthlyRevenue}
      icon={<TrendingUpOutlined />}
      color="green"
    />
  )
}

export default MonthlyRevenueMetricCard
