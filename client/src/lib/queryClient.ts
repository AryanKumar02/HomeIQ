import { QueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes - longer cache
      gcTime: 30 * 60 * 1000, // 30 minutes - keep in memory longer
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof AxiosError && error.response) {
          const status = error.response.status
          if (status >= 400 && status < 500) {
            return false
          }
        }
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      refetchOnMount: false, // Don't refetch if data is fresh
    },
    mutations: {
      retry: 1,
    },
  },
})
