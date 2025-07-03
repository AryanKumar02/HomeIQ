import axios from 'axios'

// Property related interfaces
export interface Property {
  _id?: string
  title: string
  description: string
  propertyType: 'house' | 'apartment' | 'condo' | 'townhouse' | 'duplex' | 'commercial' | 'land' | 'other'
  
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  
  bedrooms: number | string
  bathrooms: number | string
  squareFootage: number | string
  yearBuilt: number | string
  lotSize: number | string
  
  status: 'available' | 'occupied' | 'maintenance' | 'off-market' | 'pending'
  
  occupancy: {
    isOccupied: boolean
    leaseStart: string
    leaseEnd: string
    leaseType: 'month-to-month' | 'fixed-term' | 'week-to-week'
    rentDueDate: number | string
  }
  
  financials: {
    propertyValue: number | string
    purchasePrice: number | string
    purchaseDate: string
    monthlyRent: number | string
    securityDeposit: number | string
    petDeposit: number | string
    monthlyMortgage: number | string
    propertyTaxes: number | string
    insurance: number | string
    maintenance: number | string
    utilities: number | string
  }
  
  features: {
    parking: 'none' | 'street' | 'driveway' | 'garage' | 'covered'
    airConditioning: boolean
    heating: 'none' | 'central' | 'baseboard' | 'radiator' | 'fireplace'
    laundry: 'none' | 'in-unit' | 'shared' | 'hookups'
    petPolicy: {
      allowed: boolean
      types: ('dogs' | 'cats' | 'birds' | 'fish' | 'other')[]
      maxPets: number | string
    }
    amenities: string[]
  }
  
  images: {
    url: string
    caption: string
    isPrimary: boolean
    uploadedAt: string
  }[]
  
  units: Unit[]
}

export interface Unit {
  _id?: string
  unitNumber: string
  bedrooms: number | string
  bathrooms: number | string
  squareFootage: number | string
  monthlyRent: number | string
  securityDeposit: number | string
  status: 'available' | 'occupied' | 'maintenance' | 'off-market'
  occupancy: {
    isOccupied: boolean
    leaseStart: string
    leaseEnd: string
    leaseType: 'month-to-month' | 'fixed-term' | 'week-to-week'
    rentDueDate: number | string
  }
  features: {
    parking: 'none' | 'assigned' | 'shared' | 'garage'
    balcony: boolean
    amenities: string[]
  }
}

export interface PropertyResponse {
  success?: boolean
  status?: string
  message?: string
  property?: Property
  properties?: Property[]
  data?: {
    property?: Property
    properties?: Property[]
    [key: string]: unknown
  }
}

// Property CRUD operations
export async function createProperty(propertyData: Omit<Property, '_id'>): Promise<PropertyResponse> {
  try {
    console.log('CREATE PROPERTY API CALL:', '/api/v1/property')
    console.log('CREATE PROPERTY API DATA:', JSON.stringify(propertyData, null, 2))
    const res = await axios.post<PropertyResponse>(
      '/api/v1/property',
      propertyData,
      {
        withCredentials: true,
      }
    )
    console.log('CREATE PROPERTY API RESPONSE:', res)
    return res.data
  } catch (err) {
    console.error('CREATE PROPERTY API ERROR:', err)
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosError = err as { response?: { data?: any } }
      console.error('CREATE PROPERTY API ERROR RESPONSE:', axiosError.response)
      console.error('CREATE PROPERTY API ERROR DATA:', axiosError.response?.data)
      if (axiosError.response?.data?.errors) {
        console.error('VALIDATION ERRORS:', axiosError.response.data.errors)
      }
    }
    throw err
  }
}

export async function getProperty(propertyId: string): Promise<PropertyResponse> {
  try {
    console.log('GET PROPERTY API CALL:', `/api/v1/property/${propertyId}`)
    const res = await axios.get<PropertyResponse>(
      `/api/v1/property/${propertyId}`,
      {
        withCredentials: true,
      }
    )
    console.log('GET PROPERTY API RESPONSE:', res)
    return res.data
  } catch (err) {
    console.error('GET PROPERTY API ERROR:', err)
    throw err
  }
}

export async function updateProperty(propertyId: string, propertyData: Partial<Property>): Promise<PropertyResponse> {
  try {
    console.log('UPDATE PROPERTY API CALL:', `/api/v1/property/${propertyId}`, propertyData)
    const res = await axios.put<PropertyResponse>(
      `/api/v1/property/${propertyId}`,
      propertyData,
      {
        withCredentials: true,
      }
    )
    console.log('UPDATE PROPERTY API RESPONSE:', res)
    return res.data
  } catch (err) {
    console.error('UPDATE PROPERTY API ERROR:', err)
    throw err
  }
}

export async function deleteProperty(propertyId: string): Promise<PropertyResponse> {
  try {
    console.log('DELETE PROPERTY API CALL:', `/api/v1/property/${propertyId}`)
    const res = await axios.delete<PropertyResponse>(
      `/api/v1/property/${propertyId}`,
      {
        withCredentials: true,
      }
    )
    console.log('DELETE PROPERTY API RESPONSE:', res)
    return res.data
  } catch (err) {
    console.error('DELETE PROPERTY API ERROR:', err)
    throw err
  }
}

export async function getAllProperties(): Promise<PropertyResponse> {
  try {
    console.log('GET ALL PROPERTIES API CALL:', '/api/v1/property')
    const res = await axios.get<PropertyResponse>(
      '/api/v1/property',
      {
        withCredentials: true,
      }
    )
    console.log('GET ALL PROPERTIES API RESPONSE:', res)
    return res.data
  } catch (err) {
    console.error('GET ALL PROPERTIES API ERROR:', err)
    throw err
  }
}

// Property status and occupancy updates
export async function updatePropertyStatus(propertyId: string, status: Property['status']): Promise<PropertyResponse> {
  try {
    console.log('UPDATE PROPERTY STATUS API CALL:', `/api/v1/property/${propertyId}/status`, { status })
    const res = await axios.patch<PropertyResponse>(
      `/api/v1/property/${propertyId}/status`,
      { status },
      {
        withCredentials: true,
      }
    )
    console.log('UPDATE PROPERTY STATUS API RESPONSE:', res)
    return res.data
  } catch (err) {
    console.error('UPDATE PROPERTY STATUS API ERROR:', err)
    throw err
  }
}

export async function updatePropertyOccupancy(propertyId: string, occupancy: Property['occupancy']): Promise<PropertyResponse> {
  try {
    console.log('UPDATE PROPERTY OCCUPANCY API CALL:', `/api/v1/property/${propertyId}/occupancy`, occupancy)
    const res = await axios.patch<PropertyResponse>(
      `/api/v1/property/${propertyId}/occupancy`,
      occupancy,
      {
        withCredentials: true,
      }
    )
    console.log('UPDATE PROPERTY OCCUPANCY API RESPONSE:', res)
    return res.data
  } catch (err) {
    console.error('UPDATE PROPERTY OCCUPANCY API ERROR:', err)
    throw err
  }
}

// Image management
export async function addPropertyImages(propertyId: string, images: FormData): Promise<PropertyResponse> {
  try {
    console.log('ADD PROPERTY IMAGES API CALL:', `/api/v1/property/${propertyId}/images`)
    const res = await axios.post<PropertyResponse>(
      `/api/v1/property/${propertyId}/images`,
      images,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    console.log('ADD PROPERTY IMAGES API RESPONSE:', res)
    return res.data
  } catch (err) {
    console.error('ADD PROPERTY IMAGES API ERROR:', err)
    throw err
  }
}

export async function removePropertyImage(propertyId: string, imageId: string): Promise<PropertyResponse> {
  try {
    console.log('REMOVE PROPERTY IMAGE API CALL:', `/api/v1/property/${propertyId}/images/${imageId}`)
    const res = await axios.delete<PropertyResponse>(
      `/api/v1/property/${propertyId}/images/${imageId}`,
      {
        withCredentials: true,
      }
    )
    console.log('REMOVE PROPERTY IMAGE API RESPONSE:', res)
    return res.data
  } catch (err) {
    console.error('REMOVE PROPERTY IMAGE API ERROR:', err)
    throw err
  }
}

export async function setPrimaryImage(propertyId: string, imageId: string): Promise<PropertyResponse> {
  try {
    console.log('SET PRIMARY IMAGE API CALL:', `/api/v1/property/${propertyId}/images/${imageId}/primary`)
    const res = await axios.patch<PropertyResponse>(
      `/api/v1/property/${propertyId}/images/${imageId}/primary`,
      {},
      {
        withCredentials: true,
      }
    )
    console.log('SET PRIMARY IMAGE API RESPONSE:', res)
    return res.data
  } catch (err) {
    console.error('SET PRIMARY IMAGE API ERROR:', err)
    throw err
  }
}

// Unit management (for apartment properties)
export async function getUnits(propertyId: string): Promise<PropertyResponse> {
  try {
    console.log('GET UNITS API CALL:', `/api/v1/property/${propertyId}/units`)
    const res = await axios.get<PropertyResponse>(
      `/api/v1/property/${propertyId}/units`,
      {
        withCredentials: true,
      }
    )
    console.log('GET UNITS API RESPONSE:', res)
    return res.data
  } catch (err) {
    console.error('GET UNITS API ERROR:', err)
    throw err
  }
}

export async function addUnit(propertyId: string, unitData: Omit<Unit, '_id'>): Promise<PropertyResponse> {
  try {
    console.log('ADD UNIT API CALL:', `/api/v1/property/${propertyId}/units`, unitData)
    const res = await axios.post<PropertyResponse>(
      `/api/v1/property/${propertyId}/units`,
      unitData,
      {
        withCredentials: true,
      }
    )
    console.log('ADD UNIT API RESPONSE:', res)
    return res.data
  } catch (err) {
    console.error('ADD UNIT API ERROR:', err)
    throw err
  }
}

export async function updateUnit(propertyId: string, unitId: string, unitData: Partial<Unit>): Promise<PropertyResponse> {
  try {
    console.log('UPDATE UNIT API CALL:', `/api/v1/property/${propertyId}/units/${unitId}`, unitData)
    const res = await axios.put<PropertyResponse>(
      `/api/v1/property/${propertyId}/units/${unitId}`,
      unitData,
      {
        withCredentials: true,
      }
    )
    console.log('UPDATE UNIT API RESPONSE:', res)
    return res.data
  } catch (err) {
    console.error('UPDATE UNIT API ERROR:', err)
    throw err
  }
}

export async function deleteUnit(propertyId: string, unitId: string): Promise<PropertyResponse> {
  try {
    console.log('DELETE UNIT API CALL:', `/api/v1/property/${propertyId}/units/${unitId}`)
    const res = await axios.delete<PropertyResponse>(
      `/api/v1/property/${propertyId}/units/${unitId}`,
      {
        withCredentials: true,
      }
    )
    console.log('DELETE UNIT API RESPONSE:', res)
    return res.data
  } catch (err) {
    console.error('DELETE UNIT API ERROR:', err)
    throw err
  }
}