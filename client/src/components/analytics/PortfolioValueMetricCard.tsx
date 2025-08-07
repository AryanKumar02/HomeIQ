import React from 'react'
import { AccountBalanceWalletOutlined } from '@mui/icons-material'
import MetricCard from './MetricCard'
import useRealTimeAnalytics from '../../hooks/useRealTimeAnalytics'

const PortfolioValueMetricCard: React.FC = () => {
  const { analytics, isConnected } = useRealTimeAnalytics()

  // Debug logging
  console.log('PortfolioValueMetricCard - isConnected:', isConnected)
  console.log('PortfolioValueMetricCard - analytics:', analytics)
  console.log('PortfolioValueMetricCard - portfolioValue:', analytics?.portfolioValue)
  console.log('PortfolioValueMetricCard - timestamp:', analytics?.timestamp)

  const portfolioValue = Number(analytics?.portfolioValue ?? 0)

  // For now, show 0% change since we're just starting
  const percentageChange = 0

  return (
    <MetricCard
      title="Portfolio Value"
      value={portfolioValue}
      icon={<AccountBalanceWalletOutlined />}
      color="purple"
      trend={{
        value: percentageChange,
        label: 'from last month',
        isPositive: percentageChange >= 0,
      }}
    />
  )
}

export default PortfolioValueMetricCard
