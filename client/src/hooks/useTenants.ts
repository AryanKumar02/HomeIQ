import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'
import { tenantsApi } from '../api/tenants'
import type { Tenant } from '../api/tenants'

// Property interface for populated lease property
interface PopulatedProperty {
  _id: string
  id?: string
  title: string
  address: object
  propertyType: string
}

// Lease interface for tenant leases
interface PopulatedLease {
  _id?: string
  property: string | PopulatedProperty
  unit?: string
  status: string
  startDate?: string
  endDate?: string
  monthlyRent?: number
}

// Extended tenant interface with leases for type safety
interface TenantWithLeases extends Omit<Tenant, 'leases'> {
  leases?: PopulatedLease[]
}

// Query keys for consistent cache management
export const tenantKeys = {
  all: ['tenants'] as const,
  lists: () => [...tenantKeys.all, 'list'] as const,
  list: (filters?: string) => [...tenantKeys.lists(), filters] as const,
  details: () => [...tenantKeys.all, 'detail'] as const,
  detail: (id: string) => [...tenantKeys.details(), id] as const,
}

// Queries
export const useTenants = (
  options?: Omit<UseQueryOptions<Tenant[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: tenantKeys.lists(),
    queryFn: tenantsApi.getAll,
    ...options,
  })
}

export const useTenant = (
  id: string,
  options?: Omit<UseQueryOptions<Tenant, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: tenantKeys.detail(id),
    queryFn: () => tenantsApi.getById(id),
    enabled: !!id,
    ...options,
  })
}

// Mutations
export const useCreateTenant = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: tenantsApi.create,
    onSuccess: (newTenant) => {
      // Invalidate and refetch tenants list
      void queryClient.invalidateQueries({ queryKey: tenantKeys.lists() })

      // Add the new tenant to the cache
      queryClient.setQueryData(tenantKeys.detail(newTenant._id!), newTenant)
    },
  })
}

export const useUpdateTenant = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Tenant> }) =>
      tenantsApi.update(id, data),
    onSuccess: (updatedTenant) => {
      // Update the tenant in the cache
      queryClient.setQueryData(tenantKeys.detail(updatedTenant._id!), updatedTenant)

      // Invalidate the tenants list to ensure consistency
      void queryClient.invalidateQueries({ queryKey: tenantKeys.lists() })
    },
  })
}

export const useDeleteTenant = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: tenantsApi.delete,
    onSuccess: (_, deletedTenantId) => {
      // Remove the tenant from the cache
      queryClient.removeQueries({ queryKey: tenantKeys.detail(deletedTenantId) })

      // Invalidate the tenants list
      void queryClient.invalidateQueries({ queryKey: tenantKeys.lists() })
    },
  })
}

export const useUpdateTenantStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      tenantsApi.updateStatus(id, status),
    onSuccess: (updatedTenant) => {
      // Update the tenant in the cache
      queryClient.setQueryData(tenantKeys.detail(updatedTenant._id!), updatedTenant)

      // Invalidate the tenants list to ensure consistency
      void queryClient.invalidateQueries({ queryKey: tenantKeys.lists() })
    },
  })
}

export const useUpdateTenantApplicationStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      applicationStatus,
    }: {
      id: string
      applicationStatus: Partial<Tenant['applicationStatus']>
    }) => tenantsApi.updateApplicationStatus(id, applicationStatus),
    onSuccess: (updatedTenant) => {
      // Update the tenant in the cache
      queryClient.setQueryData(tenantKeys.detail(updatedTenant._id!), updatedTenant)

      // Invalidate the tenants list to ensure consistency
      void queryClient.invalidateQueries({ queryKey: tenantKeys.lists() })
    },
  })
}

// Get tenant count for a property
export const usePropertyTenantCount = (propertyId: string) => {
  const { data: tenants = [] } = useTenants()

  const tenantsWithLeases = tenants as TenantWithLeases[]

  if (!propertyId || tenants.length === 0) {
    return 0
  }

  const matchingTenants = tenantsWithLeases.filter((tenant) => {
    if (!tenant.leases || !Array.isArray(tenant.leases)) {
      return false
    }

    return tenant.leases.some((lease) => {
      // Handle both populated object and string ID cases
      let leasePropertyId: string

      if (
        typeof lease.property === 'object' &&
        lease.property !== null &&
        '_id' in lease.property
      ) {
        leasePropertyId = lease.property._id || lease.property.id || ''
      } else {
        leasePropertyId = typeof lease.property === 'string' ? lease.property : ''
      }

      return lease && leasePropertyId === propertyId && lease.status === 'active'
    })
  })

  return matchingTenants.length
}
