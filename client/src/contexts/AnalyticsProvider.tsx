import React, { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAnalyticsDashboard, analyticsKeys } from '../hooks/useAnalytics'
import { useSharedRealTimeAnalytics } from '../hooks/useSharedRealTimeAnalytics'
import type { MonthlyAnalytics, AnalyticsComparison } from '../api/analytics'

interface AnalyticsContextValue {
  // Current analytics data
  current: MonthlyAnalytics | undefined
  previous: MonthlyAnalytics | undefined
  comparison: AnalyticsComparison | undefined
  historical: MonthlyAnalytics[]
  
  // Loading states
  isLoading: boolean
  isLoadingCurrent: boolean
  isLoadingComparison: boolean
  isLoadingHistorical: boolean
  
  // Error states
  error: Error | null
  currentError: Error | null
  comparisonError: Error | null
  historicalError: Error | null
  
  // Real-time data
  isConnected: boolean
  lastUpdate: Date | null
  
  // Actions
  refetch: () => void
  connect: () => void
  disconnect: () => void
  refresh: () => void
}

const AnalyticsContext = createContext<AnalyticsContextValue | undefined>(undefined)

interface AnalyticsProviderProps {
  children: ReactNode
  autoConnect?: boolean
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ 
  children, 
  autoConnect = true 
}) => {
  const queryClient = useQueryClient()
  
  // Use the existing analytics dashboard hook
  const dashboard = useAnalyticsDashboard()
  
  // Use shared WebSocket connection for real-time updates
  const {
    isConnected,
    lastUpdate,
    connect,
    disconnect,
    refresh
  } = useSharedRealTimeAnalytics({
    autoConnect,
    onAnalyticsUpdate: (data) => {
      // When WebSocket sends updates, update the query cache instead of triggering new requests
      console.log('Analytics WebSocket update received, updating cache (shared connection)...')
      
      // Convert WebSocket analytics data to MonthlyAnalytics format
      const monthlyAnalytics: MonthlyAnalytics = {
        _id: 'current',
        userId: '', // Will be filled by the backend
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        revenue: {
          total: data.revenue.total,
          expected: data.revenue.total, // Fallback mapping
          collected: data.revenue.collected,
          collectionRate: data.revenue.collected / data.revenue.total || 0,
        },
        occupancy: {
          totalUnits: data.portfolio.totalProperties + data.portfolio.vacantProperties,
          occupiedUnits: data.portfolio.occupiedProperties || 0,
          occupancyRate: ((data.portfolio.occupiedProperties || 0) / data.portfolio.totalProperties) * 100 || 0,
          vacantUnits: data.portfolio.vacantProperties || 0,
        },
        expenses: {
          total: data.expenses.total,
          breakdown: {
            mortgage: 0,
            taxes: 0,
            insurance: 0,
            maintenance: data.expenses.maintenance || 0,
            utilities: 0,
          }
        },
        performance: data.performance,
        portfolio: {
          totalProperties: data.portfolio.totalProperties,
          occupiedProperties: data.portfolio.occupiedProperties,
          vacantProperties: data.portfolio.vacantProperties,
          value: data.portfolio.value,
        },
        tenants: data.tenants,
        calculatedAt: data.timestamp,
        dataSource: 'automatic' as const,
        createdAt: data.timestamp,
        updatedAt: data.timestamp,
      }
      
      // Update current analytics cache with converted data
      queryClient.setQueryData(analyticsKeys.current(), monthlyAnalytics)
      
      // Invalidate comparison and historical queries for background refetch
      // Use refetchType: 'none' to avoid loading states
      void queryClient.invalidateQueries({ 
        queryKey: analyticsKeys.comparison(),
        refetchType: 'none'
      })
      void queryClient.invalidateQueries({ 
        queryKey: analyticsKeys.historical(),
        refetchType: 'none'
      })
      
      // Batch background refetches to prevent rate limiting
      setTimeout(() => {
        void queryClient.refetchQueries({ 
          queryKey: analyticsKeys.comparison(),
          type: 'inactive'
        })
        void queryClient.refetchQueries({ 
          queryKey: analyticsKeys.historical(),
          type: 'inactive'
        })
      }, 2000) // 2 second delay to batch rapid updates
    },
    onError: (error) => {
      console.error('Analytics WebSocket error (shared connection):', error)
    }
  })
  
  // Merge WebSocket data with HTTP data (WebSocket takes precedence)
  const contextValue: AnalyticsContextValue = {
    // Data - prefer HTTP data from dashboard (WebSocket updates are handled via cache)
    current: dashboard.current,
    previous: dashboard.previous,
    comparison: dashboard.comparison,
    historical: dashboard.historical,
    
    // Loading states
    isLoading: dashboard.isLoading,
    isLoadingCurrent: dashboard.isLoadingCurrent,
    isLoadingComparison: dashboard.isLoadingComparison,
    isLoadingHistorical: dashboard.isLoadingHistorical,
    
    // Error states
    error: dashboard.error,
    currentError: dashboard.currentError,
    comparisonError: dashboard.comparisonError,
    historicalError: dashboard.historicalError,
    
    // Real-time states
    isConnected,
    lastUpdate,
    
    // Actions
    refetch: dashboard.refetch,
    connect,
    disconnect,
    refresh
  }

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  )
}

// Hook to use the analytics context
export const useAnalyticsContext = (): AnalyticsContextValue => {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider')
  }
  return context
}

// Convenience hooks for specific analytics data
export const useCurrentAnalyticsData = () => {
  const { current, isLoadingCurrent, currentError } = useAnalyticsContext()
  return { data: current, isLoading: isLoadingCurrent, error: currentError }
}

export const useAnalyticsComparison = () => {
  const { comparison, previous, isLoadingComparison, comparisonError } = useAnalyticsContext()
  return { 
    comparison, 
    previous, 
    isLoading: isLoadingComparison, 
    error: comparisonError 
  }
}

export const useHistoricalAnalyticsData = () => {
  const { historical, isLoadingHistorical, historicalError } = useAnalyticsContext()
  return { data: historical, isLoading: isLoadingHistorical, error: historicalError }
}