import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'
import { tenantsApi } from '../api/tenants'
import type { Tenant } from '../api/tenants'

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
    onError: (error) => {
      console.error('Create tenant mutation error:', error)
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
    onError: (error) => {
      console.error('Update tenant mutation error:', error)
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
    onError: (error) => {
      console.error('Delete tenant mutation error:', error)
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
    onError: (error) => {
      console.error('Update tenant status mutation error:', error)
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
    onError: (error) => {
      console.error('Update tenant application status mutation error:', error)
    },
  })
}
