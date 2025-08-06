import React from 'react'
import { HomeOutlined } from '@mui/icons-material'
import MetricCard from './MetricCard'
import { useCurrentAnalyticsData, useAnalyticsComparison } from '../../contexts/AnalyticsProvider'

const TotalPropertiesMetricCard: React.FC = () => {
  // Use shared analytics context instead of individual hooks
  const { data: currentAnalytics, isLoading, error } = useCurrentAnalyticsData()
  const { comparison } = useAnalyticsComparison()

  const totalProperties = currentAnalytics?.portfolio?.totalProperties ?? 0
  const changeThisMonth = comparison?.revenue?.change ?? 0

  // Debug logging
  console.log('TotalPropertiesMetricCard - Current Analytics:', currentAnalytics)
  console.log('TotalPropertiesMetricCard - Loading:', isLoading)
  console.log('TotalPropertiesMetricCard - Error:', error)
  console.log('TotalPropertiesMetricCard - Total Properties:', totalProperties)

  // Show loading state or error if needed
  if (isLoading) {
    return (
      <MetricCard
        title="Total Properties"
        value="..."
        icon={<HomeOutlined />}
        color="blue"
        trend={{
          value: 0,
          label: 'loading...',
          isPositive: true,
        }}
      />
    )
  }

  if (error) {
    return (
      <MetricCard
        title="Total Properties"
        value="--"
        icon={<HomeOutlined />}
        color="red"
        trend={{
          value: 0,
          label: 'error',
          isPositive: false,
        }}
      />
    )
  }

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
