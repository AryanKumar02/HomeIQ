import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'
import { propertiesApi } from '../api/properties'
import type { Property, Unit } from '../types/property'

// Query keys for consistent cache management
export const propertyKeys = {
  all: ['properties'] as const,
  lists: () => [...propertyKeys.all, 'list'] as const,
  list: (filters?: string) => [...propertyKeys.lists(), filters] as const,
  details: () => [...propertyKeys.all, 'detail'] as const,
  detail: (id: string) => [...propertyKeys.details(), id] as const,
  units: (propertyId: string) => [...propertyKeys.detail(propertyId), 'units'] as const,
}

// Queries
export const useProperties = (
  options?: Omit<UseQueryOptions<Property[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: propertyKeys.lists(),
    queryFn: propertiesApi.getAll,
    ...options,
  })
}

export const useProperty = (
  id: string,
  options?: Omit<UseQueryOptions<Property, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: propertyKeys.detail(id),
    queryFn: () => propertiesApi.getById(id),
    enabled: !!id,
    ...options,
  })
}

export const usePropertyUnits = (
  propertyId: string,
  options?: Omit<UseQueryOptions<Unit[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: propertyKeys.units(propertyId),
    queryFn: () => propertiesApi.getUnits(propertyId),
    enabled: !!propertyId,
    ...options,
  })
}

// Mutations
export const useCreateProperty = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<Property, '_id'>) => propertiesApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
    },
  })
}

export const useUpdateProperty = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Property> }) =>
      propertiesApi.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: propertyKeys.detail(id) })

      // Snapshot the previous value
      const previousProperty = queryClient.getQueryData<Property>(propertyKeys.detail(id))

      // Optimistically update to the new value
      if (previousProperty) {
        queryClient.setQueryData(propertyKeys.detail(id), { ...previousProperty, ...data })
      }

      // Return a context object with the snapshotted value
      return { previousProperty }
    },
    onError: (_, { id }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProperty) {
        queryClient.setQueryData(propertyKeys.detail(id), context.previousProperty)
      }
    },
    onSettled: (updatedProperty) => {
      // Always refetch after error or success
      if (updatedProperty) {
        void queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
        void queryClient.invalidateQueries({ queryKey: propertyKeys.detail(updatedProperty._id!) })
        // Invalidate tenant table cache when property is updated (for lease date sync)
        void queryClient.invalidateQueries({ queryKey: ['tenantsTable'] })
      }
    },
  })
}

export const useDeleteProperty = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => propertiesApi.delete(id),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: propertyKeys.lists() })

      // Snapshot the previous value
      const previousProperties = queryClient.getQueryData<Property[]>(propertyKeys.lists())

      // Optimistically remove the property from the list
      if (previousProperties) {
        const optimisticProperties = previousProperties.filter((property) => property._id !== id)
        queryClient.setQueryData(propertyKeys.lists(), optimisticProperties)
      }

      return { previousProperties }
    },
    onError: (_, __, context) => {
      // If the mutation fails, roll back to the previous value
      if (context?.previousProperties) {
        queryClient.setQueryData(propertyKeys.lists(), context.previousProperties)
      }
    },
    onSettled: (_, __, deletedId) => {
      // Always refetch after error or success to ensure consistency
      void queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
      queryClient.removeQueries({ queryKey: propertyKeys.detail(deletedId) })
    },
  })
}

export const useUpdatePropertyStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Property['status'] }) =>
      propertiesApi.updateStatus(id, status),
    onSuccess: (updatedProperty) => {
      void queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
      queryClient.setQueryData(propertyKeys.detail(updatedProperty._id!), updatedProperty)
    },
  })
}

export const useUpdatePropertyOccupancy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, occupancy }: { id: string; occupancy: Property['occupancy'] }) =>
      propertiesApi.updateOccupancy(id, occupancy),
    onSuccess: (updatedProperty) => {
      void queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
      queryClient.setQueryData(propertyKeys.detail(updatedProperty._id!), updatedProperty)
    },
  })
}

// Image mutations
export const useAddPropertyImages = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, images }: { id: string; images: FormData }) =>
      propertiesApi.addImages(id, images),
    onSuccess: (updatedProperty) => {
      void queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
      queryClient.setQueryData(propertyKeys.detail(updatedProperty._id!), updatedProperty)
    },
  })
}

export const useRemovePropertyImage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, imageId }: { id: string; imageId: string }) =>
      propertiesApi.removeImage(id, imageId),
    onSuccess: (updatedProperty) => {
      void queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
      queryClient.setQueryData(propertyKeys.detail(updatedProperty._id!), updatedProperty)
    },
  })
}

export const useSetPrimaryPropertyImage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, imageId }: { id: string; imageId: string }) =>
      propertiesApi.setPrimaryImage(id, imageId),
    onSuccess: (updatedProperty) => {
      void queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
      queryClient.setQueryData(propertyKeys.detail(updatedProperty._id!), updatedProperty)
    },
  })
}

// Unit mutations
export const useAddUnit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ propertyId, unitData }: { propertyId: string; unitData: Omit<Unit, '_id'> }) =>
      propertiesApi.addUnit(propertyId, unitData),
    onSuccess: (updatedProperty) => {
      void queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
      queryClient.setQueryData(propertyKeys.detail(updatedProperty._id!), updatedProperty)
      void queryClient.invalidateQueries({ queryKey: propertyKeys.units(updatedProperty._id!) })
    },
  })
}

export const useUpdateUnit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      propertyId,
      unitId,
      unitData,
    }: {
      propertyId: string
      unitId: string
      unitData: Partial<Unit>
    }) => propertiesApi.updateUnit(propertyId, unitId, unitData),
    onSuccess: (updatedProperty) => {
      void queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
      queryClient.setQueryData(propertyKeys.detail(updatedProperty._id!), updatedProperty)
      void queryClient.invalidateQueries({ queryKey: propertyKeys.units(updatedProperty._id!) })
    },
  })
}

export const useDeleteUnit = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ propertyId, unitId }: { propertyId: string; unitId: string }) =>
      propertiesApi.deleteUnit(propertyId, unitId),
    onSuccess: (updatedProperty) => {
      void queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
      queryClient.setQueryData(propertyKeys.detail(updatedProperty._id!), updatedProperty)
      void queryClient.invalidateQueries({ queryKey: propertyKeys.units(updatedProperty._id!) })
    },
  })
}
