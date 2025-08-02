import React from 'react'
import { PeopleOutlined } from '@mui/icons-material'
import MetricCard from './MetricCard'
import useRealTimeAnalytics from '../../hooks/useRealTimeAnalytics'

const ActiveTenantsMetricCard: React.FC = () => {
  const { analytics, isConnected, connectionError } = useRealTimeAnalytics()

  const activeTenants = Number(analytics?.activeTenants ?? 0)

  // Debug logging
  console.log('ActiveTenantsMetricCard - Analytics:', analytics)
  console.log('ActiveTenantsMetricCard - isConnected:', isConnected)
  console.log('ActiveTenantsMetricCard - connectionError:', connectionError)
  console.log('ActiveTenantsMetricCard - activeTenants:', activeTenants)

  // For now, show +0 this month since we're just starting
  const changeThisMonth = 0

  return (
    <MetricCard
      title="Active Tenants"
      value={activeTenants}
      icon={<PeopleOutlined />}
      color="green"
      trend={{
        value: changeThisMonth,
        label: 'this month',
        isPositive: changeThisMonth >= 0,
      }}
    />
  )
}

export default ActiveTenantsMetricCard
