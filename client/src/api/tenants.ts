import axios from 'axios'

// Reference interface
export interface Reference {
  _id?: string
  type: 'personal' | 'professional' | 'previous-landlord' | 'employer'
  name: string
  relationship: string
  phone: string
  email?: string
  company?: string
  yearsKnown?: number
  contactedDate?: string
  contactedBy?: string
  response?: string
  recommendation?:
    | 'strongly-recommend'
    | 'recommend'
    | 'neutral'
    | 'not-recommend'
    | 'strongly-not-recommend'
  notes?: string
}

// Lease interface
export interface Lease {
  _id?: string
  property: string
  unit?: string
  tenancyType?: string
  startDate: string
  endDate: string
  monthlyRent: number
  securityDeposit?: number
  status: 'active' | 'pending' | 'terminated' | 'expired' | 'renewed'
  rentDueDate?: number
  createdAt?: string
  updatedAt?: string
}

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
  leases?: Lease[]
  references?: Reference[]
  applicationStatus: {
    status: string
    applicationDate: string
    reviewDate?: string
    approvalDate?: string
    rejectionReason?: string
    notes?: string
    reviewedBy?: string
  }
  // Virtual field that maps qualification status to application status
  computedApplicationStatus?: string
  // Virtual field for qualification status
  qualificationStatus?: {
    status: 'qualified' | 'needs-review' | 'not-qualified' | 'unknown'
    issues?: string[]
  }
  // Referencing status information
  referencing?: {
    status?: 'not-started' | 'in-progress' | 'completed' | 'failed'
    provider?: string
    reference?: string
    outcome?: 'pending' | 'pass' | 'pass-with-conditions' | 'fail'
    conditions?: string
    notes?: string
    completedDate?: string
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

export const tenantsApi = {
  // Get all tenants (simple version for useTenants hook - uses max server limit)
  getAll: async (): Promise<Tenant[]> => {
    try {
      // Use server's maximum allowed limit (100) to get as many tenants as possible
      const url = '/tenants?limit=100'
      const response = await apiClient.get<{
        status: string
        results: number
        pagination: {
          page: number
          limit: number
          total: number
          pages: number
        }
        data: {
          tenants: Tenant[]
        }
      }>(url)


      const { tenants } = response.data.data
      const { pagination } = response.data

      // If there are more pages, fetch them all for backward compatibility
      if (pagination.pages > 1) {
        const allTenants = [...tenants]

        // Fetch remaining pages
        for (let page = 2; page <= Math.min(pagination.pages, 10); page++) {
          // Cap at 10 pages (1000 tenants) for safety
          try {
            const pageResponse = await apiClient.get<typeof response.data>(
              `/tenants?page=${page}&limit=100`
            )
            allTenants.push(...pageResponse.data.data.tenants)
          } catch (pageError) {
            console.warn(`Failed to fetch page ${page}:`, pageError)
            break
          }
        }

        return allTenants
      }

      return tenants || []
    } catch (error) {
      console.error('GET ALL TENANTS API ERROR:', error)
      throw error
    }
  },

  // Get all tenants with server-side pagination and filtering (for table)
  getAllPaginated: async (filters?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    property?: string
    leaseStatus?: string
    leaseExpiry?: string
  }): Promise<{
    tenants: Tenant[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }> => {
    try {
      const params = new URLSearchParams()

      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.limit) params.append('limit', filters.limit.toString())
      if (filters?.search) params.append('search', filters.search)
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status)
      if (filters?.property && filters.property !== 'all')
        params.append('property', filters.property)
      if (filters?.leaseStatus && filters.leaseStatus !== 'all')
        params.append('leaseStatus', filters.leaseStatus)

      const queryString = params.toString()
      const url = `/tenants${queryString ? `?${queryString}` : ''}`

      console.log('GET ALL TENANTS API CALL:', url)
      const response = await apiClient.get<{
        status: string
        results: number
        pagination: {
          page: number
          limit: number
          total: number
          pages: number
        }
        data: {
          tenants: Tenant[]
        }
      }>(url)

      console.log('GET ALL TENANTS API RESPONSE:', response)

      return {
        tenants: response.data.data.tenants || [],
        pagination: response.data.pagination,
      }
    } catch (error) {
      console.error('GET ALL TENANTS API ERROR:', error)
      throw error
    }
  },

  // Get tenant by ID
  getById: async (id: string): Promise<Tenant> => {
    try {
      console.log('GET TENANT API CALL:', `/tenants/${id}`)
      const response = await apiClient.get<TenantResponse>(`/tenants/${id}`)
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
      console.log('CREATE TENANT API CALL:', '/tenants')
      console.log('CREATE TENANT API DATA:', JSON.stringify(data, null, 2))
      const response = await apiClient.post<TenantResponse>('/tenants', data)
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
      console.log('UPDATE TENANT API CALL:', `/tenants/${id}`, data)
      const response = await apiClient.patch<TenantResponse>(`/tenants/${id}`, data)
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
      console.log('DELETE TENANT API CALL:', `/tenants/${id}`)
      const response = await apiClient.delete<TenantResponse>(`/tenants/${id}`)
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
      console.log('UPDATE TENANT STATUS API CALL:', `/tenants/${id}/status`, { status })
      const response = await apiClient.patch<TenantResponse>(`/tenants/${id}/status`, {
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
        `/tenants/${id}/application-status`,
        applicationStatus
      )
      const response = await apiClient.patch<TenantResponse>(
        `/tenants/${id}/application-status`,
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
  }): Promise<{ tenant: Tenant; property: unknown; lease: unknown }> => {
    try {
      console.log('ASSIGN TENANT TO PROPERTY API CALL:', '/tenants/assign-to-property', assignment)
      const response = await apiClient.post<{
        data: { tenant: Tenant; property: unknown; lease: unknown }
      }>('/tenants/assign-to-property', assignment)
      console.log('ASSIGN TENANT TO PROPERTY API RESPONSE:', response)
      return response.data.data
    } catch (error) {
      console.error('ASSIGN TENANT TO PROPERTY API ERROR:', error)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown; status?: number } }
        console.error('ASSIGN TENANT API ERROR RESPONSE:', axiosError.response)
        console.error('ASSIGN TENANT API ERROR DATA:', axiosError.response?.data)
      }
      throw error
    }
  },

  // Unassign tenant from property
  unassignFromProperty: async (assignment: {
    tenantId: string
    propertyId: string
    unitId?: string
  }): Promise<{ tenant: Tenant; property: unknown }> => {
    try {
      console.log(
        'UNASSIGN TENANT FROM PROPERTY API CALL:',
        '/tenants/unassign-from-property',
        assignment
      )
      const response = await apiClient.post<{ data: { tenant: Tenant; property: unknown } }>(
        '/tenants/unassign-from-property',
        assignment
      )
      console.log('UNASSIGN TENANT FROM PROPERTY API RESPONSE:', response)
      return response.data.data
    } catch (error) {
      console.error('UNASSIGN TENANT FROM PROPERTY API ERROR:', error)
      throw error
    }
  },

  // Update tenant referencing status
  updateReferencingStatus: async (
    id: string,
    referencingData: {
      status?: 'not-started' | 'in-progress' | 'completed' | 'failed'
      provider?: string
      reference?: string
      outcome?: 'pending' | 'pass' | 'pass-with-conditions' | 'fail'
      conditions?: string
      notes?: string
      completedDate?: string
    }
  ): Promise<Tenant> => {
    try {
      console.log(
        'UPDATE REFERENCING STATUS API CALL:',
        `/tenants/${id}/referencing`,
        referencingData
      )
      const response = await apiClient.patch<TenantResponse>(
        `/tenants/${id}/referencing`,
        referencingData
      )
      console.log('UPDATE REFERENCING STATUS API RESPONSE:', response)
      const tenant = response.data.tenant || response.data.data?.tenant
      if (!tenant) {
        throw new Error('Failed to update referencing status')
      }
      return tenant
    } catch (error) {
      console.error('UPDATE REFERENCING STATUS API ERROR:', error)
      throw error
    }
  },
}
