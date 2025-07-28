import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Property } from '../types/property'
import type { TenantTableData } from '../types/tenantTable'

// Search query keys
export const searchKeys = {
  all: ['search'] as const,
  properties: (term: string, filters?: unknown) => [...searchKeys.all, 'properties', term, filters] as const,
  tenants: (term: string, filters?: unknown) => [...searchKeys.all, 'tenants', term, filters] as const,
}

// Generic search hook for client-side filtering
export const useClientSearch = <T>(
  data: T[] | undefined,
  searchTerm: string,
  searchFn: (items: T[], term: string) => T[],
  queryKey: readonly unknown[],
  enabled = true
) => {
  return useQuery({
    queryKey: [...queryKey, searchTerm],
    queryFn: () => {
      if (!data || !searchTerm.trim()) return data || []
      return searchFn(data, searchTerm.trim())
    },
    enabled: enabled && !!data,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  })
}

// Property search hook
export const usePropertySearch = (
  properties: Property[] | undefined,
  searchTerm: string,
  filters?: { type: string | null; status: string | null }
) => {
  const searchFn = (items: Property[], term: string) => {
    return items.filter((property) => {
      // Safe access with null/undefined checks
      const title = property?.title || ''
      const street = property?.address?.street || ''
      const city = property?.address?.city || ''

      const matchesSearch =
        title.toLowerCase().includes(term.toLowerCase()) ||
        street.toLowerCase().includes(term.toLowerCase()) ||
        city.toLowerCase().includes(term.toLowerCase())

      const matchesType = !filters?.type || property.propertyType === filters.type
      const matchesStatus = !filters?.status || property.status === filters.status

      return matchesSearch && matchesType && matchesStatus
    })
  }

  return useClientSearch(
    properties,
    searchTerm,
    searchFn,
    searchKeys.properties(searchTerm, filters),
    true
  )
}

// Tenant search hook
export const useTenantSearch = (
  tenants: TenantTableData[] | undefined,
  searchTerm: string,
  filters?: { status: string | null; property: string | null; leaseExpiry: string | null }
) => {
  const searchFn = (items: TenantTableData[], term: string) => {
    return items.filter((tenant) => {
      const matchesSearch =
        tenant.name.toLowerCase().includes(term.toLowerCase()) ||
        tenant.email.toLowerCase().includes(term.toLowerCase()) ||
        tenant.property.toLowerCase().includes(term.toLowerCase())

      const matchesStatus = !filters?.status || tenant.status === filters.status
      const matchesProperty =
        !filters?.property ||
        (filters.property === 'assigned' && tenant.property !== 'No property assigned') ||
        (filters.property === 'unassigned' && tenant.property === 'No property assigned')
      const matchesLeaseExpiry = !filters?.leaseExpiry // TODO: implement lease expiry logic

      return matchesSearch && matchesStatus && matchesProperty && matchesLeaseExpiry
    })
  }

  return useClientSearch(
    tenants,
    searchTerm,
    searchFn,
    searchKeys.tenants(searchTerm, filters),
    true
  )
}

// Search state management hook
export const useSearchState = (initialTerm = '', pageName?: string) => {
  const queryClient = useQueryClient()

  // Use page-specific query key to isolate search state per page
  const queryKey = pageName ? ['searchState', pageName] : ['searchState', 'current']

  // Use query state for search term persistence
  const searchQuery = useQuery({
    queryKey,
    queryFn: () => initialTerm,
    staleTime: 5 * 60 * 1000, // 5 minutes instead of infinity
    gcTime: 10 * 60 * 1000, // 10 minutes instead of infinity
  })

  const setSearchTerm = (term: string) => {
    queryClient.setQueryData(queryKey, term)
  }

  const clearSearch = () => {
    queryClient.setQueryData(queryKey, '')
    // Clear all search result caches more comprehensively
    if (pageName) {
      // Clear all queries that start with ['search', pageName]
      queryClient.removeQueries({
        queryKey: [searchKeys.all[0]],
        predicate: (query) => {
          const key = query.queryKey
          return Array.isArray(key) && key.length >= 2 && key[0] === 'search' && key[1] === pageName
        }
      })
    } else {
      // Clear all search-related queries
      queryClient.removeQueries({
        queryKey: [searchKeys.all[0]],
        predicate: (query) => {
          const key = query.queryKey
          return Array.isArray(key) && key[0] === 'search'
        }
      })
    }
  }

  return {
    searchTerm: searchQuery.data || '',
    setSearchTerm,
    clearSearch,
    isLoading: searchQuery.isLoading,
  }
}
