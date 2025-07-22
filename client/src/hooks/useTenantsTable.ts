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

/**
 * Simulates pagination and filtering for tenant data
 * Since the current API doesn't support pagination, we'll implement it client-side
 * @param tenants - Array of all tenants
 * @param filters - Pagination and search filters
 * @returns Paginated and filtered tenant data
 */
const applyFiltersAndPagination = (
  tenants: TenantTableData[], 
  filters: TenantTableFilters
): TenantsTableResponse => {
  let filteredTenants = [...tenants]
  
  // Apply search filter
  if (filters.search && filters.search.trim()) {
    const searchLower = filters.search.toLowerCase().trim()
    filteredTenants = filteredTenants.filter(tenant => 
      tenant.name.toLowerCase().includes(searchLower) ||
      tenant.email.toLowerCase().includes(searchLower) ||
      tenant.property.toLowerCase().includes(searchLower)
    )
  }
  
  // Apply status filter
  if (filters.status && filters.status !== 'all') {
    filteredTenants = filteredTenants.filter(tenant => {
      if (filters.status === 'expiring') {
        return tenant.status.includes('expiring') || tenant.status.includes('expired')
      }
      return tenant.status === filters.status
    })
  }
  
  // Apply property assignment filter
  if (filters.property && filters.property !== 'all') {
    filteredTenants = filteredTenants.filter(tenant => {
      if (filters.property === 'assigned') {
        return tenant.property !== 'No property assigned'
      }
      if (filters.property === 'unassigned') {
        return tenant.property === 'No property assigned'
      }
      return tenant.property.toLowerCase().includes(filters.property.toLowerCase())
    })
  }
  
  // Apply lease expiry filter
  if (filters.leaseExpiry && filters.leaseExpiry !== 'all') {
    filteredTenants = filteredTenants.filter(tenant => {
      const daysUntilEnd = getDaysUntilLeaseEnd(tenant.leaseEnds)
      if (filters.leaseExpiry === 'expiring-soon') {
        return daysUntilEnd <= 30 && daysUntilEnd >= 0
      }
      if (filters.leaseExpiry === 'expired') {
        return daysUntilEnd < 0
      }
      if (filters.leaseExpiry === 'long-term') {
        return daysUntilEnd > 30
      }
      return true
    })
  }
  
  const total = filteredTenants.length
  const page = Math.max(1, filters.page || 1)
  const limit = Math.max(1, filters.limit || 10)
  const startIndex = (page - 1) * limit
  const endIndex = Math.min(startIndex + limit, total)
  
  const paginatedTenants = filteredTenants.slice(startIndex, endIndex)
  
  return {
    tenants: paginatedTenants,
    total,
    page,
    limit
  }
}

/**
 * Hook for fetching and managing tenant table data with pagination
 * @param filters - Pagination and search filters
 * @returns Query result with tenant table data and utilities
 */
export const useTenantsTable = (filters: TenantTableFilters = {}) => {
  const {
    data: rawTenants = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: tenantTableKeys.list(filters),
    queryFn: () => tenantsApi.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  // Transform and paginate data
  const tableData = useMemo(() => {
    const transformedTenants = rawTenants.map(transformTenantForTable)
    return applyFiltersAndPagination(transformedTenants, filters)
  }, [rawTenants, filters])

  // Calculate pagination info
  const paginationInfo: PaginationInfo = useMemo(() => ({
    page: tableData.page,
    limit: tableData.limit,
    total: tableData.total,
    totalPages: Math.ceil(tableData.total / tableData.limit)
  }), [tableData])

  return {
    tenants: tableData.tenants,
    pagination: paginationInfo,
    isLoading,
    error,
    refetch,
    // Utility functions
    hasNextPage: tableData.page < paginationInfo.totalPages,
    hasPreviousPage: tableData.page > 1,
    isEmpty: tableData.tenants.length === 0 && !isLoading,
    isEmptySearch: tableData.tenants.length === 0 && !isLoading && filters.search
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