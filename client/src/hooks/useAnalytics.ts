import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import { analyticsApi, type MonthlyAnalytics, type AnalyticsComparison } from '../api/analytics'

// Query keys for consistent cache management
export const analyticsKeys = {
  all: ['analytics'] as const,
  current: () => [...analyticsKeys.all, 'current'] as const,
  comparison: () => [...analyticsKeys.all, 'comparison'] as const,
  historical: () => [...analyticsKeys.all, 'historical'] as const,
  historicalMonths: (months: number) => [...analyticsKeys.historical(), months] as const,
  monthly: (year: number, month: number) => [...analyticsKeys.all, 'monthly', year, month] as const,
}

// Current analytics hook
export const useCurrentAnalytics = (
  options?: Omit<UseQueryOptions<MonthlyAnalytics, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: analyticsKeys.current(),
    queryFn: analyticsApi.getCurrent,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  })
}

// Analytics with comparison hook
export const useAnalyticsWithComparison = (
  options?: Omit<
    UseQueryOptions<
      {
        current: MonthlyAnalytics
        previous?: MonthlyAnalytics
        comparison?: AnalyticsComparison
      },
      Error
    >,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: analyticsKeys.comparison(),
    queryFn: analyticsApi.getWithComparison,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  })
}

// Historical analytics hook
export const useHistoricalAnalytics = (
  months: number = 6,
  options?: Omit<UseQueryOptions<MonthlyAnalytics[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: analyticsKeys.historicalMonths(months),
    queryFn: () => analyticsApi.getHistorical(months),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  })
}

// Monthly analytics hook
export const useMonthlyAnalytics = (
  year: number,
  month: number,
  options?: Omit<
    UseQueryOptions<
      {
        analytics: MonthlyAnalytics
        comparison?: AnalyticsComparison
      },
      Error
    >,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: analyticsKeys.monthly(year, month),
    queryFn: () => analyticsApi.getForMonth(year, month),
    enabled: !!year && !!month,
    staleTime: 30 * 60 * 1000, // 30 minutes (historical data doesn't change often)
    gcTime: 60 * 60 * 1000, // 1 hour
    ...options,
  })
}

// Create snapshot mutation
export const useCreateSnapshot = (
  options?: Omit<
    UseMutationOptions<
      {
        analytics: MonthlyAnalytics
        comparison?: AnalyticsComparison
      },
      Error,
      {
        year?: number
        month?: number
        forceRecalculate?: boolean
      }
    >,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: analyticsApi.createSnapshot,
    onSuccess: (data, variables) => {
      // Invalidate and refetch relevant queries
      void queryClient.invalidateQueries({ queryKey: analyticsKeys.all })

      // Optionally update specific cache entries
      if (variables.year && variables.month) {
        queryClient.setQueryData(analyticsKeys.monthly(variables.year, variables.month), data)
      }
    },
    ...options,
  })
}

// Combined hook for analytics dashboard
export const useAnalyticsDashboard = () => {
  const currentAnalytics = useCurrentAnalytics()
  const analyticsWithComparison = useAnalyticsWithComparison()
  const historicalAnalytics = useHistoricalAnalytics(6)

  return {
    // Current data
    current: currentAnalytics.data,
    isLoadingCurrent: currentAnalytics.isLoading,
    currentError: currentAnalytics.error,

    // Comparison data
    comparison: analyticsWithComparison.data?.comparison,
    previous: analyticsWithComparison.data?.previous,
    isLoadingComparison: analyticsWithComparison.isLoading,
    comparisonError: analyticsWithComparison.error,

    // Historical data
    historical: historicalAnalytics.data || [],
    isLoadingHistorical: historicalAnalytics.isLoading,
    historicalError: historicalAnalytics.error,

    // Combined loading state
    isLoading:
      currentAnalytics.isLoading ||
      analyticsWithComparison.isLoading ||
      historicalAnalytics.isLoading,

    // Combined error state
    error: currentAnalytics.error || analyticsWithComparison.error || historicalAnalytics.error,

    // Refetch functions
    refetch: () => {
      void currentAnalytics.refetch()
      void analyticsWithComparison.refetch()
      void historicalAnalytics.refetch()
    },
  }
}
