import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes - longer cache
      gcTime: 30 * 60 * 1000, // 30 minutes - keep in memory longer
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false
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
