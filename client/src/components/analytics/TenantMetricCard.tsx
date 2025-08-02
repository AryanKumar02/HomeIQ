import React, { useEffect, useState } from 'react'
import { PeopleOutlined } from '@mui/icons-material'
import MetricCard from './MetricCard'
import { useAnalyticsWithComparison } from '../../hooks/useAnalytics'
import { useRealTimeAnalytics } from '../../hooks/useRealTimeAnalytics'

const TenantMetricCard: React.FC = () => {
  const { data, isLoading, error } = useAnalyticsWithComparison()
  const { analytics: realTimeAnalytics, isConnected } = useRealTimeAnalytics()
  const [currentTenants, setCurrentTenants] = useState(0)

  // Use real-time data when available, otherwise fall back to API data
  useEffect(() => {
    if (realTimeAnalytics && isConnected && realTimeAnalytics.tenants) {
      // Use actual tenant count from real-time data
      setCurrentTenants(realTimeAnalytics.tenants.active)
    } else if (data?.current) {
      // Fallback to occupied units if tenant data not available
      const activeTenants = data.current.occupancy?.occupiedUnits || 0
      setCurrentTenants(activeTenants)
    }
  }, [realTimeAnalytics, data, isConnected])

  if (isLoading && !realTimeAnalytics) {
    return (
      <MetricCard
        title="Active Tenants"
        value="Loading..."
        icon={<PeopleOutlined />}
        color="purple"
      />
    )
  }

  if (error && !realTimeAnalytics) {
    return (
      <MetricCard
        title="Active Tenants"
        value="0"
        trend={{
          value: 0,
          label: 'from last month',
          isPositive: true,
        }}
        icon={<PeopleOutlined />}
        color="purple"
      />
    )
  }

  // Calculate trend based on change in occupied units
  const trendValue = data?.comparison?.occupancy.change || 0

  return (
    <MetricCard
      title="Active Tenants"
      value={currentTenants}
      trend={{
        value: trendValue,
        label: 'from last month',
        isPositive: trendValue >= 0,
      }}
      icon={<PeopleOutlined />}
      color="purple"
    />
  )
}

export default TenantMetricCard
