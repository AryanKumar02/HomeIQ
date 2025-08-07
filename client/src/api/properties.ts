import axios from 'axios'
import type { Property, Unit, PropertyResponse } from '../types/property'

// Re-export types for convenience
export type { Property, Unit, PropertyResponse } from '../types/property'

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken')
}

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3001/api/v1',
  withCredentials: true,
})

// Add auth header to all requests
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const propertiesApi = {
  // Get all properties
  getAll: async (): Promise<Property[]> => {
    const response = await apiClient.get<PropertyResponse>('/property')
    return response.data.properties || response.data.data?.properties || []
  },

  // Get property by ID
  getById: async (id: string): Promise<Property> => {
    const response = await apiClient.get<PropertyResponse>(`/property/${id}`)
    const property = response.data.property || response.data.data?.property
    if (!property) {
      throw new Error('Property not found')
    }
    return property
  },

  // Create new property
  create: async (data: Omit<Property, '_id'>): Promise<Property> => {
    try {
      const response = await apiClient.post<PropertyResponse>('/property', data)
      const property = response.data.property || response.data.data?.property
      if (!property) {
        throw new Error('Failed to create property')
      }
      return property
    } catch (error) {
      console.error('Property creation failed:', error)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown; status?: number } }
        console.error('Server response:', axiosError.response?.data)
        console.error('Status code:', axiosError.response?.status)
      }
      throw error
    }
  },

  // Update existing property
  update: async (id: string, data: Partial<Property>): Promise<Property> => {
    try {
      // Clean up empty string values for ObjectId fields
      const cleanedData = { ...data }
      if (cleanedData.occupancy?.tenant === '') {
        cleanedData.occupancy.tenant = undefined
      }

      const response = await apiClient.put<PropertyResponse>(`/property/${id}`, cleanedData)
      const property = response.data.property || response.data.data?.property
      if (!property) {
        throw new Error('Failed to update property')
      }
      return property
    } catch (error) {
      console.error('Property update failed:', error)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown; status?: number } }
        console.error('Server response:', axiosError.response?.data)
        console.error('Status code:', axiosError.response?.status)
      }
      throw error
    }
  },

  // Delete property
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/property/${id}`)
  },

  // Update property status
  updateStatus: async (id: string, status: Property['status']): Promise<Property> => {
    const response = await apiClient.patch<PropertyResponse>(`/property/${id}/status`, {
      status,
    })
    const property = response.data.property || response.data.data?.property
    if (!property) {
      throw new Error('Failed to update property status')
    }
    return property
  },

  // Update property occupancy
  updateOccupancy: async (id: string, occupancy: Property['occupancy']): Promise<Property> => {
    const response = await apiClient.patch<PropertyResponse>(`/property/${id}/occupancy`, occupancy)
    const property = response.data.property || response.data.data?.property
    if (!property) {
      throw new Error('Failed to update property occupancy')
    }
    return property
  },

  // Image management
  addImages: async (id: string, images: FormData): Promise<Property> => {
    const response = await apiClient.post<PropertyResponse>(`/property/${id}/images`, images, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    const property = response.data.property || response.data.data?.property
    if (!property) {
      throw new Error('Failed to add images')
    }
    return property
  },

  removeImage: async (id: string, imageId: string): Promise<Property> => {
    const response = await apiClient.delete<PropertyResponse>(`/property/${id}/images/${imageId}`)
    const property = response.data.property || response.data.data?.property
    if (!property) {
      throw new Error('Failed to remove image')
    }
    return property
  },

  setPrimaryImage: async (id: string, imageId: string): Promise<Property> => {
    const response = await apiClient.patch<PropertyResponse>(
      `/property/${id}/images/${imageId}/primary`,
      {}
    )
    const property = response.data.property || response.data.data?.property
    if (!property) {
      throw new Error('Failed to set primary image')
    }
    return property
  },

  // Unit management
  getUnits: async (propertyId: string): Promise<Unit[]> => {
    const response = await apiClient.get<PropertyResponse>(`/property/${propertyId}/units`)
    return (response.data.data?.units || []) as Unit[]
  },

  addUnit: async (propertyId: string, unitData: Omit<Unit, '_id'>): Promise<Property> => {
    const response = await apiClient.post<PropertyResponse>(
      `/property/${propertyId}/units`,
      unitData
    )
    const property = response.data.property || response.data.data?.property
    if (!property) {
      throw new Error('Failed to add unit')
    }
    return property
  },

  updateUnit: async (
    propertyId: string,
    unitId: string,
    unitData: Partial<Unit>
  ): Promise<Property> => {
    const response = await apiClient.put<PropertyResponse>(
      `/property/${propertyId}/units/${unitId}`,
      unitData
    )
    const property = response.data.property || response.data.data?.property
    if (!property) {
      throw new Error('Failed to update unit')
    }
    return property
  },

  deleteUnit: async (propertyId: string, unitId: string): Promise<Property> => {
    const response = await apiClient.delete<PropertyResponse>(
      `/property/${propertyId}/units/${unitId}`
    )
    const property = response.data.property || response.data.data?.property
    if (!property) {
      throw new Error('Failed to delete unit')
    }
    return property
  },
}
