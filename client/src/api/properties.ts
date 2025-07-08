import axios from 'axios'
import type { Property, Unit, PropertyResponse } from '../types/property'

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken')
}

// Create axios instance with default configuration
const apiClient = axios.create({
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
    const response = await apiClient.get<PropertyResponse>('/api/v1/property')
    return response.data.properties || response.data.data?.properties || []
  },

  // Get property by ID
  getById: async (id: string): Promise<Property> => {
    const response = await apiClient.get<PropertyResponse>(`/api/v1/property/${id}`)
    const property = response.data.property || response.data.data?.property
    if (!property) {
      throw new Error('Property not found')
    }
    return property
  },

  // Create new property
  create: async (data: Omit<Property, '_id'>): Promise<Property> => {
    try {
      console.log('Creating property with data:', JSON.stringify(data, null, 2))
      const response = await apiClient.post<PropertyResponse>('/api/v1/property', data)
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
      console.log('Updating property with data:', JSON.stringify(data, null, 2))
      const response = await apiClient.put<PropertyResponse>(`/api/v1/property/${id}`, data)
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
    await apiClient.delete(`/api/v1/property/${id}`)
  },

  // Update property status
  updateStatus: async (id: string, status: Property['status']): Promise<Property> => {
    const response = await apiClient.patch<PropertyResponse>(`/api/v1/property/${id}/status`, {
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
    const response = await apiClient.patch<PropertyResponse>(
      `/api/v1/property/${id}/occupancy`,
      occupancy
    )
    const property = response.data.property || response.data.data?.property
    if (!property) {
      throw new Error('Failed to update property occupancy')
    }
    return property
  },

  // Image management
  addImages: async (id: string, images: FormData): Promise<Property> => {
    const response = await apiClient.post<PropertyResponse>(
      `/api/v1/property/${id}/images`,
      images,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    const property = response.data.property || response.data.data?.property
    if (!property) {
      throw new Error('Failed to add images')
    }
    return property
  },

  removeImage: async (id: string, imageId: string): Promise<Property> => {
    const response = await apiClient.delete<PropertyResponse>(
      `/api/v1/property/${id}/images/${imageId}`
    )
    const property = response.data.property || response.data.data?.property
    if (!property) {
      throw new Error('Failed to remove image')
    }
    return property
  },

  setPrimaryImage: async (id: string, imageId: string): Promise<Property> => {
    const response = await apiClient.patch<PropertyResponse>(
      `/api/v1/property/${id}/images/${imageId}/primary`,
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
    const response = await apiClient.get<PropertyResponse>(`/api/v1/property/${propertyId}/units`)
    return (response.data.data?.units || []) as Unit[]
  },

  addUnit: async (propertyId: string, unitData: Omit<Unit, '_id'>): Promise<Property> => {
    const response = await apiClient.post<PropertyResponse>(
      `/api/v1/property/${propertyId}/units`,
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
      `/api/v1/property/${propertyId}/units/${unitId}`,
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
      `/api/v1/property/${propertyId}/units/${unitId}`
    )
    const property = response.data.property || response.data.data?.property
    if (!property) {
      throw new Error('Failed to delete unit')
    }
    return property
  },
}
