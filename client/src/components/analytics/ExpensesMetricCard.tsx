import React, { useEffect, useState } from 'react'
import { Receipt } from '@mui/icons-material'
import MetricCard from './MetricCard'
import { useAnalyticsWithComparison } from '../../hooks/useAnalytics'
import useRealTimeAnalytics from '../../hooks/useRealTimeAnalytics'

const ExpensesMetricCard: React.FC = () => {
  const { data, isLoading, error } = useAnalyticsWithComparison()
  const { analytics: realTimeAnalytics, isConnected } = useRealTimeAnalytics()
  const [currentExpenses, setCurrentExpenses] = useState(0)

  // Use real-time data when available, otherwise fall back to API data
  useEffect(() => {
    if (realTimeAnalytics && isConnected) {
      setCurrentExpenses(Number(realTimeAnalytics.expenses.total))
    } else if (data?.current) {
      setCurrentExpenses(Number(data.current.expenses.total))
    }
  }, [realTimeAnalytics, data, isConnected])

  if (isLoading && !realTimeAnalytics) {
    return <MetricCard title="Expenses" value="Loading..." icon={<Receipt />} color="red" />
  }

  if (error && !realTimeAnalytics) {
    return (
      <MetricCard
        title="Expenses"
        value="$0"
        trend={{
          value: 0,
          label: 'from last month',
          isPositive: true,
        }}
        icon={<Receipt />}
        color="red"
      />
    )
  }

  const trendValue = data?.comparison?.expenses.percentChange || 0

  return (
    <MetricCard
      title="Expenses"
      value={currentExpenses}
      trend={{
        value: trendValue,
        label: 'from last month',
        isPositive: trendValue < 0, // For expenses, decreasing is positive
      }}
      icon={<Receipt />}
      color="red"
      // realTime={isConnected} // Removed as MetricCard doesn't have this prop
    />
  )
}

export default ExpensesMetricCard
