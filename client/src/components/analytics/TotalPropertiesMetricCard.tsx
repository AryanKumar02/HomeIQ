import React from 'react'
import { HomeOutlined } from '@mui/icons-material'
import MetricCard from './MetricCard'
import useRealTimeAnalytics from '../../hooks/useRealTimeAnalytics'

const TotalPropertiesMetricCard: React.FC = () => {
  const { analytics, isConnected, connectionError } = useRealTimeAnalytics()

  const totalProperties = Number(analytics?.totalProperties ?? 0)

  // Debug logging
  console.log('TotalPropertiesMetricCard - Analytics:', analytics)
  console.log('TotalPropertiesMetricCard - isConnected:', isConnected)
  console.log('TotalPropertiesMetricCard - connectionError:', connectionError)
  console.log('TotalPropertiesMetricCard - totalProperties:', totalProperties)

  // For now, show +0 this month since we're just starting
  const changeThisMonth = 0

  return (
    <MetricCard
      title="Total Properties"
      value={totalProperties}
      icon={<HomeOutlined />}
      color="blue"
      trend={{
        value: changeThisMonth,
        label: 'this month',
        isPositive: changeThisMonth >= 0,
      }}
    />
  )
}

export default TotalPropertiesMetricCard
