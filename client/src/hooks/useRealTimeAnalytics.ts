import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '../stores/authStoreNew'

interface AnalyticsData {
  // Core metrics
  totalProperties: number
  activeTenants: number
  portfolioValue: number

  // Additional useful metrics
  occupancyRate: number
  monthlyRevenue: number
  monthlyExpenses: number
  netOperatingIncome: number

  // Legacy structure for backward compatibility (can remove later)
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
    occupiedProperties: number
    vacantProperties: number
    value: number
  }
  tenants: {
    active: number
    total: number
  }
  timestamp: string
}

interface AnalyticsEvent {
  analytics: AnalyticsData
  timestamp: string
  eventType: string
}

interface UseRealTimeAnalyticsOptions {
  autoConnect?: boolean
  onAnalyticsUpdate?: (data: AnalyticsData) => void
  onError?: (error: unknown) => void
}

export const useRealTimeAnalytics = (options: UseRealTimeAnalyticsOptions = {}) => {
  const { autoConnect = true, onAnalyticsUpdate, onError } = options
  const { user, token } = useAuth()
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const reconnectTimeoutRef = useRef<number | null>(null)

  const connect = () => {
    if (!user || !token || socketRef.current?.connected) {
      return
    }

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined
      const socketUrl =
        typeof apiBaseUrl === 'string' ? apiBaseUrl.replace('/api/v1', '') : 'http://localhost:3001'

      socketRef.current = io(socketUrl, {
        auth: {
          token: token,
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
      })

      const socket = socketRef.current

      socket.on('connect', () => {
        console.log('WebSocket connected for analytics')
        setIsConnected(true)
        setConnectionError(null)

        // Subscribe to analytics updates
        socket.emit('analytics:subscribe')
      })

      socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason)
        setIsConnected(false)

        // Auto-reconnect on unexpected disconnection
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, don't reconnect automatically
          return
        }

        // Client disconnection or network issues, attempt reconnect
        reconnectTimeoutRef.current = window.setTimeout(() => {
          if (!socketRef.current?.connected) {
            connect()
          }
        }, 5000)
      })

      socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error)
        setConnectionError(error.message)
        setIsConnected(false)
        onError?.(error)
      })

      // Analytics event handlers
      socket.on('analytics:initial', (event: AnalyticsEvent) => {
        console.log('Received initial analytics:', event)
        setAnalytics(event.analytics)
        setLastUpdate(new Date(event.timestamp))
        onAnalyticsUpdate?.(event.analytics)
      })

      socket.on('analytics:updated', (event: AnalyticsEvent) => {
        console.log('Received analytics update:', event)
        setAnalytics(event.analytics)
        setLastUpdate(new Date(event.timestamp))
        onAnalyticsUpdate?.(event.analytics)
      })

      socket.on('analytics:refreshed', (event: AnalyticsEvent) => {
        console.log('Received analytics refresh:', event)
        setAnalytics(event.analytics)
        setLastUpdate(new Date(event.timestamp))
        onAnalyticsUpdate?.(event.analytics)
      })

      // Specific analytics events
      socket.on('analytics:property-created', (event: AnalyticsEvent) => {
        console.log('Property created - analytics updated:', event)
        setAnalytics(event.analytics)
        setLastUpdate(new Date(event.timestamp))
        onAnalyticsUpdate?.(event.analytics)
      })

      socket.on('analytics:property-updated', (event: AnalyticsEvent) => {
        console.log('Property updated - analytics updated:', event)
        setAnalytics(event.analytics)
        setLastUpdate(new Date(event.timestamp))
        onAnalyticsUpdate?.(event.analytics)
      })

      socket.on('analytics:property-deleted', (event: AnalyticsEvent) => {
        console.log('Property deleted - analytics updated:', event)
        setAnalytics(event.analytics)
        setLastUpdate(new Date(event.timestamp))
        onAnalyticsUpdate?.(event.analytics)
      })

      socket.on('analytics:tenant-created', (event: AnalyticsEvent) => {
        console.log('Tenant created - analytics updated:', event)
        setAnalytics(event.analytics)
        setLastUpdate(new Date(event.timestamp))
        onAnalyticsUpdate?.(event.analytics)
      })

      socket.on('analytics:tenant-updated', (event: AnalyticsEvent) => {
        console.log('Tenant updated - analytics updated:', event)
        setAnalytics(event.analytics)
        setLastUpdate(new Date(event.timestamp))
        onAnalyticsUpdate?.(event.analytics)
      })

      socket.on('analytics:tenant-deleted', (event: AnalyticsEvent) => {
        console.log('Tenant deleted - analytics updated:', event)
        setAnalytics(event.analytics)
        setLastUpdate(new Date(event.timestamp))
        onAnalyticsUpdate?.(event.analytics)
      })

      socket.on('analytics:lease-assigned', (event: AnalyticsEvent) => {
        console.log('Lease assigned - analytics updated:', event)
        setAnalytics(event.analytics)
        setLastUpdate(new Date(event.timestamp))
        onAnalyticsUpdate?.(event.analytics)
      })

      socket.on('analytics:lease-terminated', (event: AnalyticsEvent) => {
        console.log('Lease terminated - analytics updated:', event)
        setAnalytics(event.analytics)
        setLastUpdate(new Date(event.timestamp))
        onAnalyticsUpdate?.(event.analytics)
      })

      socket.on('analytics:lease-added', (event: AnalyticsEvent) => {
        console.log('Lease added - analytics updated:', event)
        setAnalytics(event.analytics)
        setLastUpdate(new Date(event.timestamp))
        onAnalyticsUpdate?.(event.analytics)
      })

      socket.on('analytics:lease-status-updated', (event: AnalyticsEvent) => {
        console.log('Lease status updated - analytics updated:', event)
        setAnalytics(event.analytics)
        setLastUpdate(new Date(event.timestamp))
        onAnalyticsUpdate?.(event.analytics)
      })

      socket.on('analytics:error', (error) => {
        console.error('Analytics error:', error)
        onError?.(error)
      })
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      setConnectionError(error instanceof Error ? error.message : 'Unknown connection error')
      onError?.(error)
    }
  }

  const disconnect = () => {
    console.log('Disconnecting WebSocket...')

    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (socketRef.current) {
      socketRef.current.emit('analytics:unsubscribe')
      socketRef.current.disconnect()
      socketRef.current = null
    }

    setIsConnected(false)
    setAnalytics(null)
    setLastUpdate(null)
    setConnectionError(null)
  }

  const refresh = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('analytics:refresh')
    }
  }

  const subscribe = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('analytics:subscribe')
    }
  }

  const unsubscribe = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('analytics:unsubscribe')
    }
  }

  // Auto-connect when user and token are available
  useEffect(() => {
    if (autoConnect && user && token) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [user, token, autoConnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [])

  return {
    // Connection state
    isConnected,
    connectionError,

    // Analytics data
    analytics,
    lastUpdate,

    // Methods
    connect,
    disconnect,
    refresh,
    subscribe,
    unsubscribe,
  }
}

export default useRealTimeAnalytics
