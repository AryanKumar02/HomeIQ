import axios from 'axios'

// Tenant interfaces
export interface Tenant {
  _id?: string
  tenantId?: string
  personalInfo: {
    title?: string
    firstName: string
    lastName: string
    middleName?: string
    preferredName?: string
    dateOfBirth: string
    nationalInsuranceNumber?: string
    passportNumber?: string
    drivingLicenceNumber?: string
    nationality?: string
    immigrationStatus?: string
    rightToRent: {
      verified: boolean
      verificationDate?: string
      documentType?: string
      documentExpiryDate?: string
      recheckRequired?: boolean
      recheckDate?: string
      notes?: string
    }
  }
  addresses: {
    current?: {
      addressLine1: string
      addressLine2: string
      city: string
      county: string
      postcode: string
      country: string
    }
    previous: PreviousAddress[]
  }
  contactInfo?: {
    email: string
    phone: {
      primary: {
        number: string
        type: string
      }
      secondary?: {
        number: string
        type: string
      }
    }
    emergencyContact: {
      name: string
      relationship: string
      phone: string
      email?: string
      address?: string
    }
  }
  employment?: {
    current: {
      status: string
      employer?: {
        name: string
        position: string
        contractType: string
        startDate: string
        address: {
          addressLine1: string
          addressLine2: string
          city: string
          county: string
          postcode: string
          country: string
        }
        phone: string
        hrContactName: string
        hrContactPhone: string
        hrContactEmail: string
      }
      income: {
        gross: {
          monthly: number
          annual: number
        }
        net: {
          monthly: number
          annual: number
        }
        currency: string
        payFrequency: string
        verified: boolean
        verificationDate?: string
        verificationMethod?: string
        probationPeriod: {
          inProbation: boolean
          endDate?: string
        }
      }
      benefits: {
        receives: boolean
        types: string[]
        monthlyAmount: number
      }
    }
    previous: Array<{
      employer: string
      position: string
      startDate: string
      endDate: string
      reasonForLeaving: string
      contactName: string
      contactPhone: string
      contactEmail: string
    }>
  }
  financialInfo?: {
    bankAccount: {
      bankName: string
      accountType: string
      sortCode: string
      verified: boolean
      verificationDate?: string
    }
    guarantor: {
      required: boolean
      provided: boolean
      name?: string
      relationship?: string
      phone?: string
      email?: string
      address?: string
      incomeVerified?: boolean
    }
    affordabilityAssessment: {
      monthlyIncome: number
      monthlyExpenses: number
      monthlyCommitments: number
      disposableIncome?: number
      rentToIncomeRatio?: number
    }
  }
  pets?: Array<{
    name: string
    type: string
    breed?: string
    age?: number
    weight?: number
    weightUnit?: string
    color?: string
    isServiceAnimal?: boolean
    vaccinationStatus?: string
    lastVetVisit?: string
    specialNeeds?: string
  }>
  vehicles?: Array<{
    make?: string
    model?: string
    year?: number
    color?: string
    registrationNumber?: string
    parkingSpot?: string
  }>
  privacy?: {
    profileVisibility?: string
    allowBackgroundCheck?: boolean
    allowCreditCheck?: boolean
    dataRetentionConsent: boolean
    consentDate?: string
  }
  applicationStatus: {
    status: string
    applicationDate: string
    reviewDate?: string
    approvalDate?: string
    rejectionReason?: string
    notes?: string
    reviewedBy?: string
  }
  isActive: boolean
  createdAt?: string
  updatedAt?: string
  createdBy?: string
}

export interface PreviousAddress {
  addressLine1: string
  addressLine2: string
  city: string
  county: string
  postcode: string
  country: string
  startDate: string
  endDate: string
  landlordName: string
  landlordPhone: string
  monthlyRent: string
  currency: string
  payFrequency: string
  reasonForLeaving: string
}

export interface TenantResponse {
  success?: boolean
  status?: string
  message?: string
  tenant?: Tenant
  tenants?: Tenant[]
  data?: {
    tenant?: Tenant
    tenants?: Tenant[]
    [key: string]: unknown
  }
}

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

export const tenantsApi = {
  // Get all tenants
  getAll: async (): Promise<Tenant[]> => {
    try {
      console.log('GET ALL TENANTS API CALL:', '/api/v1/tenants')
      const response = await apiClient.get<TenantResponse>('/api/v1/tenants')
      console.log('GET ALL TENANTS API RESPONSE:', response)
      return response.data.tenants || response.data.data?.tenants || []
    } catch (error) {
      console.error('GET ALL TENANTS API ERROR:', error)
      throw error
    }
  },

  // Get tenant by ID
  getById: async (id: string): Promise<Tenant> => {
    try {
      console.log('GET TENANT API CALL:', `/api/v1/tenants/${id}`)
      const response = await apiClient.get<TenantResponse>(`/api/v1/tenants/${id}`)
      console.log('GET TENANT API RESPONSE:', response)
      const tenant = response.data.tenant || response.data.data?.tenant
      if (!tenant) {
        throw new Error('Tenant not found')
      }
      return tenant
    } catch (error) {
      console.error('GET TENANT API ERROR:', error)
      throw error
    }
  },

  // Create new tenant
  create: async (
    data: Omit<Tenant, '_id' | 'tenantId' | 'createdAt' | 'updatedAt'>
  ): Promise<Tenant> => {
    try {
      console.log('CREATE TENANT API CALL:', '/api/v1/tenants')
      console.log('CREATE TENANT API DATA:', JSON.stringify(data, null, 2))
      const response = await apiClient.post<TenantResponse>('/api/v1/tenants', data)
      console.log('CREATE TENANT API RESPONSE:', response)
      const tenant = response.data.tenant || response.data.data?.tenant
      if (!tenant) {
        throw new Error('Failed to create tenant')
      }
      return tenant
    } catch (error) {
      console.error('CREATE TENANT API ERROR:', error)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { errors?: Array<{ msg: string }> } } }
        console.error('CREATE TENANT API ERROR RESPONSE:', axiosError.response)
        console.error('CREATE TENANT API ERROR DATA:', axiosError.response?.data)
        if (axiosError.response?.data?.errors) {
          console.error('VALIDATION ERRORS:', axiosError.response.data.errors)
        }
      }
      throw error
    }
  },

  // Update tenant
  update: async (id: string, data: Partial<Tenant>): Promise<Tenant> => {
    try {
      console.log('UPDATE TENANT API CALL:', `/api/v1/tenants/${id}`, data)
      const response = await apiClient.put<TenantResponse>(`/api/v1/tenants/${id}`, data)
      console.log('UPDATE TENANT API RESPONSE:', response)
      const tenant = response.data.tenant || response.data.data?.tenant
      if (!tenant) {
        throw new Error('Failed to update tenant')
      }
      return tenant
    } catch (error) {
      console.error('UPDATE TENANT API ERROR:', error)
      throw error
    }
  },

  // Delete tenant
  delete: async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      console.log('DELETE TENANT API CALL:', `/api/v1/tenants/${id}`)
      const response = await apiClient.delete<TenantResponse>(`/api/v1/tenants/${id}`)
      console.log('DELETE TENANT API RESPONSE:', response)

      // For DELETE requests that return 204 No Content, create a success response
      if (response.status === 204) {
        return { success: true, message: 'Tenant deleted successfully' }
      }

      return { success: true, message: response.data.message || 'Tenant deleted successfully' }
    } catch (error) {
      console.error('DELETE TENANT API ERROR:', error)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: unknown } }
        console.error('DELETE TENANT ERROR STATUS:', axiosError.response?.status)
        console.error('DELETE TENANT ERROR DATA:', axiosError.response?.data)
      }
      throw error
    }
  },

  // Update tenant status
  updateStatus: async (id: string, status: string): Promise<Tenant> => {
    try {
      console.log('UPDATE TENANT STATUS API CALL:', `/api/v1/tenants/${id}/status`, { status })
      const response = await apiClient.patch<TenantResponse>(`/api/v1/tenants/${id}/status`, {
        status,
      })
      console.log('UPDATE TENANT STATUS API RESPONSE:', response)
      const tenant = response.data.tenant || response.data.data?.tenant
      if (!tenant) {
        throw new Error('Failed to update tenant status')
      }
      return tenant
    } catch (error) {
      console.error('UPDATE TENANT STATUS API ERROR:', error)
      throw error
    }
  },

  // Update application status
  updateApplicationStatus: async (
    id: string,
    applicationStatus: Partial<Tenant['applicationStatus']>
  ): Promise<Tenant> => {
    try {
      console.log(
        'UPDATE TENANT APPLICATION STATUS API CALL:',
        `/api/v1/tenants/${id}/application-status`,
        applicationStatus
      )
      const response = await apiClient.patch<TenantResponse>(
        `/api/v1/tenants/${id}/application-status`,
        applicationStatus
      )
      console.log('UPDATE TENANT APPLICATION STATUS API RESPONSE:', response)
      const tenant = response.data.tenant || response.data.data?.tenant
      if (!tenant) {
        throw new Error('Failed to update tenant application status')
      }
      return tenant
    } catch (error) {
      console.error('UPDATE TENANT APPLICATION STATUS API ERROR:', error)
      throw error
    }
  },

  // Assign tenant to property
  assignToProperty: async (assignment: {
    tenantId: string
    propertyId: string
    unitId?: string
    leaseData?: {
      startDate?: string
      endDate?: string
      monthlyRent?: number
      securityDeposit?: number
      tenancyType?: string
    }
  }): Promise<{ tenant: Tenant; property: any; lease: any }> => {
    try {
      console.log('ASSIGN TENANT TO PROPERTY API CALL:', '/api/v1/tenants/assign-to-property', assignment)
      const response = await apiClient.post('/api/v1/tenants/assign-to-property', assignment)
      console.log('ASSIGN TENANT TO PROPERTY API RESPONSE:', response)
      return response.data.data
    } catch (error) {
      console.error('ASSIGN TENANT TO PROPERTY API ERROR:', error)
      throw error
    }
  },

  // Unassign tenant from property
  unassignFromProperty: async (assignment: {
    tenantId: string
    propertyId: string
    unitId?: string
  }): Promise<{ tenant: Tenant; property: any }> => {
    try {
      console.log('UNASSIGN TENANT FROM PROPERTY API CALL:', '/api/v1/tenants/unassign-from-property', assignment)
      const response = await apiClient.post('/api/v1/tenants/unassign-from-property', assignment)
      console.log('UNASSIGN TENANT FROM PROPERTY API RESPONSE:', response)
      return response.data.data
    } catch (error) {
      console.error('UNASSIGN TENANT FROM PROPERTY API ERROR:', error)
      throw error
    }
  },
}
