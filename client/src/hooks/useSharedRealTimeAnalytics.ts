import { useRef, useState, useEffect, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '../stores/authStoreNew'

// Types for analytics data structure from your existing code
export interface AnalyticsData {
  revenue: {
    total: number
    collected: number
    pending: number
    monthlyGrowth?: number
  }
  expenses: {
    total: number
    operating: number
    maintenance: number
    monthlyChange?: number
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

interface UseRealTimeAnalyticsReturn {
  analytics: AnalyticsData | null
  isConnected: boolean
  lastUpdate: Date | null
  connect: () => void
  disconnect: () => void
  refresh: () => void
  subscribe: () => void
  unsubscribe: () => void
}

// Global connection manager to prevent duplicate WebSocket connections
class AnalyticsSocketManager {
  private static instance: AnalyticsSocketManager | null = null
  private socket: Socket | null = null
  private subscribers = new Set<(data: AnalyticsData) => void>()
  private errorHandlers = new Set<(error: unknown) => void>()
  private connectionState = {
    isConnected: false,
    lastUpdate: null as Date | null,
    analytics: null as AnalyticsData | null
  }
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  static getInstance(): AnalyticsSocketManager {
    if (!AnalyticsSocketManager.instance) {
      AnalyticsSocketManager.instance = new AnalyticsSocketManager()
    }
    return AnalyticsSocketManager.instance
  }

  subscribe(callback: (data: AnalyticsData) => void): void {
    this.subscribers.add(callback)

    // If we already have analytics data, send it immediately
    if (this.connectionState.analytics) {
      callback(this.connectionState.analytics)
    }
  }

  unsubscribe(callback: (data: AnalyticsData) => void): void {
    this.subscribers.delete(callback)
  }

  addErrorHandler(handler: (error: unknown) => void): void {
    this.errorHandlers.add(handler)
  }

  removeErrorHandler(handler: (error: unknown) => void): void {
    this.errorHandlers.delete(handler)
  }

  connect(token: string): void {
    if (this.socket?.connected) {
      return
    }

    if (this.socket && !this.socket.connected) {
      this.socket.connect()
      return
    }

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined
    const socketUrl = typeof apiBaseUrl === 'string'
      ? apiBaseUrl.replace('/api/v1', '')
      : 'http://localhost:3001'

    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    if (!this.socket) return

    this.socket.on('connect', () => {
      this.connectionState.isConnected = true
      this.reconnectAttempts = 0
      this.socket?.emit('analytics:subscribe')
    })

    this.socket.on('disconnect', () => {
      this.connectionState.isConnected = false

      // Handle reconnection
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++
      }
    })

    this.socket.on('connect_error', (error) => {
      this.notifyErrorHandlers(error)
    })

    // Analytics event handlers with deduplication
    const handleAnalyticsUpdate = (event: AnalyticsEvent) => {
      this.connectionState.analytics = event.analytics
      this.connectionState.lastUpdate = new Date(event.timestamp)

      // Notify all subscribers with the new data
      this.subscribers.forEach(callback => {
        try {
          callback(event.analytics)
        } catch {
          // Handle callback error silently
        }
      })
    }

    // Single handler for all analytics events to prevent duplicates
    const analyticsEvents = [
      'analytics:initial',
      'analytics:updated',
      'analytics:refreshed',
      'analytics:property-created',
      'analytics:property-updated',
      'analytics:property-deleted',
      'analytics:tenant-created',
      'analytics:tenant-updated',
      'analytics:tenant-deleted',
      'analytics:lease-assigned',
      'analytics:lease-terminated',
      'analytics:lease-added',
      'analytics:lease-status-updated'
    ]

    analyticsEvents.forEach(eventType => {
      this.socket?.on(eventType, handleAnalyticsUpdate)
    })

    this.socket.on('analytics:error', (error) => {
      this.notifyErrorHandlers(error)
    })
  }

  private notifyErrorHandlers(error: unknown): void {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error)
      } catch {
        // Handle error handler error silently
      }
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.emit('analytics:unsubscribe')
      this.socket.disconnect()
      this.socket = null
    }
    this.connectionState.isConnected = false
  }

  refresh(): void {
    if (this.socket?.connected) {
      this.socket.emit('analytics:refresh')
    }
  }

  getConnectionState() {
    return { ...this.connectionState }
  }
}

// Hook that uses the shared connection manager
export const useSharedRealTimeAnalytics = (options: UseRealTimeAnalyticsOptions = {}): UseRealTimeAnalyticsReturn => {
  const { autoConnect = true, onAnalyticsUpdate, onError } = options
  const { user, token } = useAuth()

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const managerRef = useRef(AnalyticsSocketManager.getInstance())
  const callbackRef = useRef(onAnalyticsUpdate)
  const errorHandlerRef = useRef(onError)

  // Update refs when callbacks change
  useEffect(() => {
    callbackRef.current = onAnalyticsUpdate
    errorHandlerRef.current = onError
  }, [onAnalyticsUpdate, onError])

  // Analytics update callback
  const handleAnalyticsUpdate = useCallback((data: AnalyticsData) => {
    setAnalytics(data)
    setLastUpdate(new Date())
    callbackRef.current?.(data)
  }, [])

  // Error callback
  const handleError = useCallback((error: unknown) => {
    errorHandlerRef.current?.(error)
  }, [])

  // Connect function
  const connect = useCallback(() => {
    if (!token || !user) return

    const manager = managerRef.current
    manager.subscribe(handleAnalyticsUpdate)
    manager.addErrorHandler(handleError)
    manager.connect(token)

    // Set initial state
    const state = manager.getConnectionState()
    setIsConnected(state.isConnected)
    if (state.analytics) {
      setAnalytics(state.analytics)
      setLastUpdate(state.lastUpdate)
    }
  }, [token, user, handleAnalyticsUpdate, handleError])

  // Disconnect function
  const disconnect = useCallback(() => {
    const manager = managerRef.current
    manager.unsubscribe(handleAnalyticsUpdate)
    manager.removeErrorHandler(handleError)
    setIsConnected(false)
  }, [handleAnalyticsUpdate, handleError])

  const refresh = useCallback(() => {
    managerRef.current.refresh()
  }, [])

  const subscribe = useCallback(() => {
    if (token && user) {
      const manager = managerRef.current
      manager.subscribe(handleAnalyticsUpdate)
      manager.addErrorHandler(handleError)
    }
  }, [token, user, handleAnalyticsUpdate, handleError])

  const unsubscribe = useCallback(() => {
    const manager = managerRef.current
    manager.unsubscribe(handleAnalyticsUpdate)
    manager.removeErrorHandler(handleError)
  }, [handleAnalyticsUpdate, handleError])

  // Auto-connect effect
  useEffect(() => {
    if (autoConnect && token && user) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect, token, user, connect, disconnect])

  // Monitor connection state
  useEffect(() => {
    const checkConnection = () => {
      const state = managerRef.current.getConnectionState()
      setIsConnected(state.isConnected)
    }

    const interval = setInterval(checkConnection, 1000)
    return () => clearInterval(interval)
  }, [])

  return {
    analytics,
    isConnected,
    lastUpdate,
    connect,
    disconnect,
    refresh,
    subscribe,
    unsubscribe
  }
}
