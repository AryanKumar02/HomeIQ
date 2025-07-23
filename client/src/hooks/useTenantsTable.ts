import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { tenantsApi } from '../api/tenants'
import type { Tenant } from '../api/tenants'
import type { 
  TenantTableData, 
  TenantsTableResponse, 
  TenantTableFilters, 
  PaginationInfo,
  TenantStatus 
} from '../types/tenantTable'
import { getDaysUntilLeaseEnd } from '../utils/dateUtils'

// Extended tenant keys for table-specific queries
export const tenantTableKeys = {
  all: ['tenantsTable'] as const,
  lists: () => [...tenantTableKeys.all, 'list'] as const,
  list: (filters: TenantTableFilters) => [...tenantTableKeys.lists(), filters] as const,
}

/**
 * Transforms tenant data from API format to table format
 * @param tenant - Raw tenant data from API
 * @returns Transformed tenant data for table display
 */
const transformTenantForTable = (tenant: Tenant): TenantTableData => {
  const { personalInfo, contactInfo, leases, _id } = tenant
  
  // Get the most recent active lease
  const activeLease = leases?.find(lease => lease.status === 'active')
  
  // Generate property display name
  let propertyDisplay = 'No property assigned'
  if (activeLease?.property) {
    if (typeof activeLease.property === 'object' && 'title' in activeLease.property) {
      propertyDisplay = activeLease.property.title as string
      if (activeLease.unit) {
        propertyDisplay += `, Unit ${activeLease.unit}`
      }
    } else if (typeof activeLease.property === 'string') {
      propertyDisplay = `Property ${activeLease.property.slice(-8)}`
      if (activeLease.unit) {
        propertyDisplay += `, Unit ${activeLease.unit}`
      }
    }
  }
  
  // Determine status based on application and lease information
  let status: TenantStatus = 'pending'
  
  // Helper function to ensure status is a valid TenantStatus
  const normalizeStatus = (rawStatus: string): TenantStatus => {
    // Map common status variations to our TenantStatus type
    const statusMap: Record<string, TenantStatus> = {
      'pending': 'pending',
      'approved': 'approved', 
      'rejected': 'rejected',
      'under-review': 'under-review',
      'waitlisted': 'waitlisted',
      'withdrawn': 'withdrawn',
      'expired': 'expired',
      'active': 'active',
      'expiring': 'expiring',
      'terminated': 'terminated'
    }
    
    return statusMap[rawStatus] || 'pending'
  }

  // Use computed application status (which maps qualification to application status) if available
  if (tenant.computedApplicationStatus) {
    status = normalizeStatus(tenant.computedApplicationStatus)
  } else if (tenant.applicationStatus?.status) {
    status = normalizeStatus(tenant.applicationStatus.status)
  } else if (activeLease) {
    // Check if lease is expiring soon
    const daysUntilEnd = getDaysUntilLeaseEnd(activeLease.endDate)
    if (daysUntilEnd < 0) {
      status = 'expired'
    } else if (daysUntilEnd <= 30) {
      status = 'expiring'
    } else {
      status = 'active'
    }
  }
  
  return {
    id: _id || '',
    name: `${personalInfo?.firstName || ''} ${personalInfo?.lastName || ''}`.trim() || 'Unknown',
    email: contactInfo?.email || 'No email',
    property: propertyDisplay,
    leaseEnds: activeLease?.endDate || new Date().toISOString(),
    monthlyRent: activeLease?.monthlyRent || 0,
    status
  }
}

// This function has been removed - pagination is now handled server-side

/**
 * Hook for fetching and managing tenant table data with server-side pagination
 * @param filters - Pagination and search filters
 * @returns Query result with tenant table data and utilities
 */
export const useTenantsTable = (filters: TenantTableFilters = {}) => {
  // Set default pagination values
  const paginatedFilters = {
    page: 1,
    limit: 10,
    ...filters
  }

  const {
    data: apiResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: tenantTableKeys.list(paginatedFilters),
    queryFn: () => tenantsApi.getAllPaginated({
      page: paginatedFilters.page,
      limit: paginatedFilters.limit,
      search: paginatedFilters.search,
      status: paginatedFilters.status,
      property: paginatedFilters.property,
      leaseExpiry: paginatedFilters.leaseExpiry
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // Transform tenant data for table display
  const transformedTenants = useMemo(() => {
    if (!apiResponse?.tenants) return []
    return apiResponse.tenants.map(transformTenantForTable)
  }, [apiResponse?.tenants])

  // Calculate pagination info from server response
  const paginationInfo: PaginationInfo = useMemo(() => {
    if (!apiResponse?.pagination) {
      return {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      }
    }
    
    return {
      page: apiResponse.pagination.page,
      limit: apiResponse.pagination.limit,
      total: apiResponse.pagination.total,
      totalPages: apiResponse.pagination.pages
    }
  }, [apiResponse?.pagination])

  return {
    tenants: transformedTenants,
    pagination: paginationInfo,
    isLoading,
    error,
    refetch,
    // Utility functions
    hasNextPage: paginationInfo.page < paginationInfo.totalPages,
    hasPreviousPage: paginationInfo.page > 1,
    isEmpty: transformedTenants.length === 0 && !isLoading,
    isEmptySearch: transformedTenants.length === 0 && !isLoading && filters.search
  }
}

/**
 * Hook for getting display text for pagination
 * @param pagination - Pagination information
 * @returns Formatted pagination text
 */
export const usePaginationText = (pagination: PaginationInfo) => {
  return useMemo(() => {
    if (pagination.total === 0) {
      return 'No tenants found'
    }
    
    const startItem = (pagination.page - 1) * pagination.limit + 1
    const endItem = Math.min(pagination.page * pagination.limit, pagination.total)
    
    return `Showing ${startItem} to ${endItem} of ${pagination.total} tenant${pagination.total === 1 ? '' : 's'}`
  }, [pagination])
}