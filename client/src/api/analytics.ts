import axios from 'axios'

// Analytics interfaces
export interface MonthlyAnalytics {
  _id?: string
  userId: string
  year: number
  month: number

  // Core analytics metrics (new simplified structure)
  totalProperties?: number
  activeTenants?: number
  portfolioValue?: number
  occupancyRate?: number
  monthlyRevenue?: number
  monthlyExpenses?: number
  netOperatingIncome?: number

  // Legacy structure for backward compatibility
  revenue: {
    total: number
    expected: number
    collected: number
    collectionRate: number
  }
  occupancy: {
    totalUnits: number
    occupiedUnits: number
    occupancyRate: number
    vacantUnits: number
  }
  expenses: {
    total: number
    breakdown?: {
      mortgage: number
      taxes: number
      insurance: number
      maintenance: number
      utilities: number
    }
  }
  performance: {
    netOperatingIncome: number
    cashFlow: number
    profitMargin?: number
  }
  portfolio: {
    totalProperties: number
    occupiedProperties?: number
    vacantProperties?: number
    value?: number
  }
  tenants?: {
    active: number
    total: number
  }

  calculatedAt: string
  dataSource: 'automatic' | 'manual' | 'import'
  notes?: string
  createdAt: string
  updatedAt: string
  monthString?: string
  displayDate?: string
}

export interface AnalyticsComparison {
  revenue: {
    change: number
    percentChange: number
  }
  occupancy: {
    change: number
    percentChange: number
  }
  expenses: {
    change: number
    percentChange: number
  }
}

export interface AnalyticsResponse {
  status: string
  data: {
    analytics?: MonthlyAnalytics
    current?: MonthlyAnalytics
    previous?: MonthlyAnalytics
    comparison?: AnalyticsComparison
  }
  results?: number
  message?: string
}

export interface AnalyticsHistoricalResponse {
  status: string
  data: {
    analytics?: MonthlyAnalytics[]
  }
  results?: number
  message?: string
}

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken')
}

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3001/api/v1',
  withCredentials: true,
})

// Add auth header to all requests
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const analyticsApi = {
  // Get current analytics (real-time calculation)
  getCurrent: async (): Promise<MonthlyAnalytics> => {
    try {
      console.log('GET CURRENT ANALYTICS API CALL:', '/analytics/current')
      const response = await apiClient.get<AnalyticsResponse>('/analytics/current')
      console.log('GET CURRENT ANALYTICS API RESPONSE:', response)

      const analytics = response.data.data.analytics
      if (!analytics) {
        throw new Error('Analytics data not found')
      }
      return analytics
    } catch (error) {
      console.error('GET CURRENT ANALYTICS API ERROR:', error)
      throw error
    }
  },

  // Get analytics with comparison to previous month
  getWithComparison: async (): Promise<{
    current: MonthlyAnalytics
    previous?: MonthlyAnalytics
    comparison?: AnalyticsComparison
  }> => {
    try {
      console.log('GET ANALYTICS WITH COMPARISON API CALL:', '/analytics/comparison')
      const response = await apiClient.get<AnalyticsResponse>('/analytics/comparison')
      console.log('GET ANALYTICS WITH COMPARISON API RESPONSE:', response)

      return {
        current: response.data.data.current!,
        previous: response.data.data.previous,
        comparison: response.data.data.comparison,
      }
    } catch (error) {
      console.error('GET ANALYTICS WITH COMPARISON API ERROR:', error)
      throw error
    }
  },

  // Get historical analytics (last N months)
  getHistorical: async (months: number = 6): Promise<MonthlyAnalytics[]> => {
    try {
      console.log('GET HISTORICAL ANALYTICS API CALL:', `/analytics/historical?months=${months}`)
      const response = await apiClient.get<AnalyticsHistoricalResponse>(
        `/analytics/historical?months=${months}`
      )

      return response.data.data.analytics || []
    } catch (error) {
      console.error('GET HISTORICAL ANALYTICS API ERROR:', error)
      throw error
    }
  },

  // Get specific month analytics
  getForMonth: async (
    year: number,
    month: number
  ): Promise<{
    analytics: MonthlyAnalytics
    comparison?: AnalyticsComparison
  }> => {
    try {
      console.log('GET MONTHLY ANALYTICS API CALL:', `/analytics/${year}/${month}`)
      const response = await apiClient.get<AnalyticsResponse>(`/analytics/${year}/${month}`)
      console.log('GET MONTHLY ANALYTICS API RESPONSE:', response)

      return {
        analytics: response.data.data.analytics!,
        comparison: response.data.data.comparison,
      }
    } catch (error) {
      console.error('GET MONTHLY ANALYTICS API ERROR:', error)
      throw error
    }
  },

  // Create monthly snapshot
  createSnapshot: async (params?: {
    year?: number
    month?: number
    forceRecalculate?: boolean
  }): Promise<{
    analytics: MonthlyAnalytics
    comparison?: AnalyticsComparison
  }> => {
    try {
      console.log('CREATE MONTHLY SNAPSHOT API CALL:', '/analytics/snapshot', params)
      const response = await apiClient.post<AnalyticsResponse>('/analytics/snapshot', params || {})
      console.log('CREATE MONTHLY SNAPSHOT API RESPONSE:', response)

      return {
        analytics: response.data.data.analytics!,
        comparison: response.data.data.comparison,
      }
    } catch (error) {
      console.error('CREATE MONTHLY SNAPSHOT API ERROR:', error)
      throw error
    }
  },
}
