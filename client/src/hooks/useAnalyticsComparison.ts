import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../api/analytics'

export interface ComparisonData {
  current: {
    totalProperties: number
    activeTenants: number
    portfolioValue: number
    monthlyRevenue: number
    occupancyRate: number
    monthlyExpenses: number
    netOperatingIncome: number
  }
  previous: {
    totalProperties: number
    activeTenants: number
    portfolioValue: number
    monthlyRevenue: number
    occupancyRate: number
    monthlyExpenses: number
    netOperatingIncome: number
  } | null
  trends: {
    totalProperties: {
      change: number
      percentChange: number
      isPositive: boolean
    }
    activeTenants: {
      change: number
      percentChange: number
      isPositive: boolean
    }
    portfolioValue: {
      change: number
      percentChange: number
      isPositive: boolean
    }
    monthlyRevenue: {
      change: number
      percentChange: number
      isPositive: boolean
    }
  }
}

export const useAnalyticsComparison = () => {
  return useQuery({
    queryKey: ['analytics', 'comparison'],
    queryFn: async (): Promise<ComparisonData> => {
      const response = await analyticsApi.getWithComparison()

      const current = response.current
      const previous = response.previous

      // Calculate trends for each metric
      const calculateTrend = (currentValue: number, previousValue: number | undefined | null) => {
        if (!previousValue || previousValue === 0) {
          return {
            change: currentValue,
            percentChange: 0,
            isPositive: currentValue >= 0,
          }
        }

        const change = currentValue - previousValue
        const percentChange = (change / previousValue) * 100

        return {
          change,
          percentChange,
          isPositive: change >= 0,
        }
      }

      return {
        current: {
          totalProperties: current.totalProperties || current.portfolio?.totalProperties || 0,
          activeTenants: current.activeTenants || current.tenants?.active || 0,
          portfolioValue: current.portfolioValue || current.portfolio?.value || 0,
          monthlyRevenue: current.monthlyRevenue || current.revenue?.total || 0,
          occupancyRate: current.occupancyRate || current.occupancy?.occupancyRate || 0,
          monthlyExpenses: current.monthlyExpenses || current.expenses?.total || 0,
          netOperatingIncome:
            current.netOperatingIncome || current.performance?.netOperatingIncome || 0,
        },
        previous: previous
          ? {
              totalProperties: previous.totalProperties || previous.portfolio?.totalProperties || 0,
              activeTenants: previous.activeTenants || previous.tenants?.active || 0,
              portfolioValue: previous.portfolioValue || previous.portfolio?.value || 0,
              monthlyRevenue: previous.monthlyRevenue || previous.revenue?.total || 0,
              occupancyRate: previous.occupancyRate || previous.occupancy?.occupancyRate || 0,
              monthlyExpenses: previous.monthlyExpenses || previous.expenses?.total || 0,
              netOperatingIncome:
                previous.netOperatingIncome || previous.performance?.netOperatingIncome || 0,
            }
          : null,
        trends: {
          totalProperties: calculateTrend(
            current.totalProperties || current.portfolio?.totalProperties || 0,
            previous?.totalProperties || previous?.portfolio?.totalProperties
          ),
          activeTenants: calculateTrend(
            current.activeTenants || current.tenants?.active || 0,
            previous?.activeTenants || previous?.tenants?.active
          ),
          portfolioValue: calculateTrend(
            current.portfolioValue || current.portfolio?.value || 0,
            previous?.portfolioValue || previous?.portfolio?.value
          ),
          monthlyRevenue: calculateTrend(
            current.monthlyRevenue || current.revenue?.total || 0,
            previous?.monthlyRevenue || previous?.revenue?.total
          ),
        },
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}
