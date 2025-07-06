import { useState } from 'react'
import {
  createProperty,
  updateProperty,
  getProperty,
  addPropertyImages,
  removePropertyImage,
  setPrimaryImage as setPrimaryImageAPI,
  type Property,
} from '../services/property'

export const usePropertyApi = () => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Helper function to extract error message from API errors
  const getErrorMessage = (err: unknown, defaultMessage: string): string => {
    if (err && typeof err === 'object' && 'response' in err) {
      const response = err.response as { data?: { message?: string } }
      if (response.data && typeof response.data.message === 'string') {
        return response.data.message
      }
    }
    return defaultMessage
  }

  // Type guard to check if an object is a Property
  const isProperty = (obj: unknown): obj is Property => {
    return (
      obj !== null &&
      typeof obj === 'object' &&
      'title' in obj &&
      'description' in obj &&
      'propertyType' in obj &&
      'address' in obj &&
      'bedrooms' in obj &&
      'bathrooms' in obj &&
      'squareFootage' in obj &&
      'status' in obj &&
      'occupancy' in obj &&
      'financials' in obj &&
      'features' in obj &&
      'images' in obj &&
      'units' in obj
    )
  }

  // Helper function to get file extension from MIME type
  const getFileExtensionFromMimeType = (mimeType: string): string => {
    const mimeToExtension: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
      'image/bmp': '.bmp',
      'image/tiff': '.tiff',
      'image/x-icon': '.ico',
    }
    return mimeToExtension[mimeType.toLowerCase()] || '.jpg' // Default to .jpg if unknown
  }

  // Load property data
  const loadProperty = async (propertyId: string): Promise<Property | null> => {
    try {
      setLoading(true)
      setError(null)
      const response = await getProperty(propertyId)

      // Handle both possible response formats
      const isSuccess = response.success === true || response.status === 'success'
      const propertyData = response.property || response.data?.property

      if (isSuccess && isProperty(propertyData)) {
        return propertyData
      } else {
        setError('Failed to load property data')
        return null
      }
    } catch (err) {
      console.error('Error loading property:', err)
      setError('Failed to load property data')
      return null
    } finally {
      setLoading(false)
    }
  }

  // Helper function to upload local blob images after property creation
  const uploadLocalImages = async (propertyId: string, localImages: Property['images']) => {
    if (localImages.length === 0) return

    try {
      // Create a single FormData with all images and captions
      const formDataObj = new FormData()
      const captions: string[] = []

      // Process all images
      await Promise.all(
        localImages.map(async (image, index) => {
          // Fetch the blob data
          const response = await fetch(image.url)
          const blob = await response.blob()

          // Get the correct file extension from MIME type
          const extension = getFileExtensionFromMimeType(blob.type)
          const fileName = `image-${index}${extension}`

          // Create a File object from the blob
          const file = new File([blob], fileName, { type: blob.type })

          // Append to FormData
          formDataObj.append('images', file)

          // Add caption to array (server expects array of captions)
          captions.push(image.caption || '')
        })
      )

      // Append all captions as individual form fields
      captions.forEach((caption) => {
        formDataObj.append('captions', caption)
      })

      // Upload all images in a single request to S3
      await addPropertyImages(propertyId, formDataObj)
    } catch (err) {
      console.error('Failed to upload images:', err)
      throw err
    }
  }

  // Save property (create or update)
  const saveProperty = async (
    formData: Property,
    isEditMode: boolean,
    propertyId?: string
  ): Promise<{ success: boolean; propertyId?: string }> => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      // Validate form data before submission
      const validationErrors: string[] = []

      if (!formData.title.trim()) validationErrors.push('Property title is required')
      if (!formData.address.street.trim()) validationErrors.push('Street address is required')
      if (!formData.address.city.trim()) validationErrors.push('City is required')
      if (!formData.address.state.trim()) validationErrors.push('State/County is required')
      if (!formData.address.zipCode.trim()) validationErrors.push('Zip/Post code is required')

      const bedrooms = parseFloat(formData.bedrooms as string)
      const bathrooms = parseFloat(formData.bathrooms as string)
      const squareFootage = parseFloat(formData.squareFootage as string)
      const yearBuilt = parseFloat(formData.yearBuilt as string)

      if (isNaN(bedrooms) || bedrooms < 0 || bedrooms > 50)
        validationErrors.push('Bedrooms must be between 0 and 50')
      if (isNaN(bathrooms) || bathrooms < 0 || bathrooms > 50)
        validationErrors.push('Bathrooms must be between 0 and 50')
      if (isNaN(squareFootage) || squareFootage < 1 || squareFootage > 1000000)
        validationErrors.push('Square footage must be between 1 and 1,000,000')
      if (
        formData.yearBuilt &&
        (isNaN(yearBuilt) || yearBuilt < 1800 || yearBuilt > new Date().getFullYear() + 5)
      ) {
        validationErrors.push(`Year built must be between 1800 and ${new Date().getFullYear() + 5}`)
      }

      if (validationErrors.length > 0) {
        setError(validationErrors.join('. '))
        return { success: false }
      }

      // Store local images for later upload (for new properties)
      const localImages = formData.images.filter((img) => img.url.startsWith('blob:'))

      // Convert string numeric fields to numbers for server validation
      const processedData: Property = {
        ...formData,
        bedrooms: formData.bedrooms ? parseFloat(formData.bedrooms as string) : 0,
        bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms as string) : 0,
        squareFootage: formData.squareFootage ? parseFloat(formData.squareFootage as string) : 0,
        yearBuilt: formData.yearBuilt ? parseFloat(formData.yearBuilt as string) : 0,
        lotSize: formData.lotSize ? parseFloat(formData.lotSize as string) : 0,
        financials: {
          ...formData.financials,
          propertyValue: formData.financials.propertyValue
            ? parseFloat(formData.financials.propertyValue as string)
            : 0,
          purchasePrice: formData.financials.purchasePrice
            ? parseFloat(formData.financials.purchasePrice as string)
            : 0,
          monthlyRent: formData.financials.monthlyRent
            ? parseFloat(formData.financials.monthlyRent as string)
            : 0,
          securityDeposit: formData.financials.securityDeposit
            ? parseFloat(formData.financials.securityDeposit as string)
            : 0,
          petDeposit: formData.financials.petDeposit
            ? parseFloat(formData.financials.petDeposit as string)
            : 0,
          monthlyMortgage: formData.financials.monthlyMortgage
            ? parseFloat(formData.financials.monthlyMortgage as string)
            : 0,
          propertyTaxes: formData.financials.propertyTaxes
            ? parseFloat(formData.financials.propertyTaxes as string)
            : 0,
          insurance: formData.financials.insurance
            ? parseFloat(formData.financials.insurance as string)
            : 0,
          maintenance: formData.financials.maintenance
            ? parseFloat(formData.financials.maintenance as string)
            : 0,
          utilities: formData.financials.utilities
            ? parseFloat(formData.financials.utilities as string)
            : 0,
        },
        occupancy: {
          ...formData.occupancy,
          rentDueDate: formData.occupancy.rentDueDate
            ? parseFloat(formData.occupancy.rentDueDate as string)
            : 1,
        },
        features: {
          ...formData.features,
          petPolicy: {
            ...formData.features.petPolicy,
            maxPets: formData.features.petPolicy.maxPets
              ? parseFloat(formData.features.petPolicy.maxPets as string)
              : 0,
          },
        },
        units: formData.units.map((unit) => ({
          ...unit,
          bedrooms: unit.bedrooms ? parseFloat(unit.bedrooms as string) : 0,
          bathrooms: unit.bathrooms ? parseFloat(unit.bathrooms as string) : 0,
          squareFootage: unit.squareFootage ? parseFloat(unit.squareFootage as string) : 0,
          monthlyRent: unit.monthlyRent ? parseFloat(unit.monthlyRent as string) : 0,
          securityDeposit: unit.securityDeposit ? parseFloat(unit.securityDeposit as string) : 0,
          occupancy: {
            ...unit.occupancy,
            rentDueDate: unit.occupancy.rentDueDate
              ? parseFloat(unit.occupancy.rentDueDate as string)
              : 1,
          },
        })),
        // Remove local blob images from property creation (will upload separately)
        images: formData.images.filter((img) => !img.url.startsWith('blob:')),
      }

      let response
      if (isEditMode && propertyId) {
        // Update existing property
        response = await updateProperty(propertyId, processedData)
      } else {
        // Create new property
        response = await createProperty(processedData)
      }

      // Handle both possible response formats
      const isSuccess = response.success === true || response.status === 'success'
      const propertyData = response.property || response.data?.property

      if (isSuccess) {
        setSuccess(isEditMode ? 'Property updated successfully!' : 'Property created successfully!')

        // If creating new property and there are local images, upload them
        if (
          !isEditMode &&
          propertyData &&
          typeof propertyData === 'object' &&
          propertyData !== null &&
          '_id' in propertyData &&
          propertyData._id &&
          typeof propertyData._id === 'string' &&
          localImages.length > 0
        ) {
          try {
            await uploadLocalImages(propertyData._id, localImages)
            setSuccess('Property created and images uploaded successfully!')
          } catch (err) {
            console.error('Error uploading images after property creation:', err)
            setError('Property created but failed to upload some images')
          }
        }

        return {
          success: true,
          propertyId:
            !isEditMode &&
            propertyData &&
            typeof propertyData === 'object' &&
            propertyData !== null &&
            '_id' in propertyData &&
            propertyData._id &&
            typeof propertyData._id === 'string'
              ? propertyData._id
              : undefined,
        }
      } else {
        setError(response.message || 'Failed to save property')
        return { success: false }
      }
    } catch (err: unknown) {
      console.error('Error saving property:', err)

      // Handle server validation errors
      if (err && typeof err === 'object' && 'response' in err) {
        const response = err.response as { data?: { errors?: Array<{ msg: string }> } }
        if (response.data?.errors) {
          const serverErrors = response.data.errors
            .map((error: { msg: string }) => error.msg)
            .join('. ')
          setError(serverErrors)
        } else {
          setError(getErrorMessage(err, 'Failed to save property'))
        }
      } else {
        setError(getErrorMessage(err, 'Failed to save property'))
      }
      return { success: false }
    } finally {
      setSaving(false)
    }
  }

  // Add image to property
  const addImage = async (
    file: File,
    formData: Property,
    setFormData: React.Dispatch<React.SetStateAction<Property>>,
    isEditMode: boolean,
    propertyId?: string
  ) => {
    if (!isEditMode || !propertyId) {
      // For new properties, just add to local state
      const url = URL.createObjectURL(file)
      const newImage = {
        url,
        caption: '',
        isPrimary: formData.images.length === 0,
        uploadedAt: new Date().toISOString(),
      }
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImage],
      }))
      return
    }

    // For existing properties, upload to server
    try {
      const formDataObj = new FormData()
      formDataObj.append('images', file)

      const response = await addPropertyImages(propertyId, formDataObj)

      // Handle both possible response formats
      const isSuccess = response.success === true || response.status === 'success'
      const propertyData = response.property || response.data?.property

      if (isSuccess && isProperty(propertyData)) {
        setFormData(propertyData)
        setSuccess('Image uploaded successfully!')
      } else {
        setError('Failed to upload image')
      }
    } catch (err: unknown) {
      console.error('Error uploading image:', err)
      setError(getErrorMessage(err, 'Failed to upload image'))
    }
  }

  // Remove image from property
  const removeImage = async (
    index: number,
    formData: Property,
    setFormData: React.Dispatch<React.SetStateAction<Property>>,
    isEditMode: boolean,
    propertyId?: string
  ) => {
    const imageToRemove = formData.images[index]

    if (!isEditMode || !propertyId || !imageToRemove.url.startsWith('http')) {
      // For new properties or local images, just remove from state
      setFormData((prev) => {
        const newImages = prev.images.filter((_, i) => i !== index)
        // If we removed the primary image, make the first remaining image primary
        if (prev.images[index]?.isPrimary && newImages.length > 0) {
          newImages[0].isPrimary = true
        }
        return {
          ...prev,
          images: newImages,
        }
      })
      return
    }

    // For existing properties, remove from server
    try {
      // Extract image ID from URL or use index as fallback
      const imageId = imageToRemove.url.split('/').pop() || index.toString()

      const response = await removePropertyImage(propertyId, imageId)

      // Handle both possible response formats
      const isSuccess = response.success === true || response.status === 'success'
      const propertyData = response.property || response.data?.property

      if (isSuccess && isProperty(propertyData)) {
        setFormData(propertyData)
        setSuccess('Image removed successfully!')
      } else {
        setError('Failed to remove image')
      }
    } catch (err: unknown) {
      console.error('Error removing image:', err)
      setError(getErrorMessage(err, 'Failed to remove image'))
    }
  }

  // Set primary image
  const setPrimaryImage = async (
    index: number,
    formData: Property,
    setFormData: React.Dispatch<React.SetStateAction<Property>>,
    isEditMode: boolean,
    propertyId?: string
  ) => {
    const imageToSetPrimary = formData.images[index]

    if (!isEditMode || !propertyId || !imageToSetPrimary.url.startsWith('http')) {
      // For new properties or local images, just update state
      setFormData((prev) => ({
        ...prev,
        images: prev.images.map((img, i) => ({
          ...img,
          isPrimary: i === index,
        })),
      }))
      return
    }

    // For existing properties, update on server
    try {
      // Extract image ID from URL or use index as fallback
      const imageId = imageToSetPrimary.url.split('/').pop() || index.toString()

      const response = await setPrimaryImageAPI(propertyId, imageId)

      // Handle both possible response formats
      const isSuccess = response.success === true || response.status === 'success'
      const propertyData = response.property || response.data?.property

      if (isSuccess && isProperty(propertyData)) {
        setFormData(propertyData)
        setSuccess('Primary image updated successfully!')
      } else {
        setError('Failed to set primary image')
      }
    } catch (err: unknown) {
      console.error('Error setting primary image:', err)
      setError(getErrorMessage(err, 'Failed to set primary image'))
    }
  }

  // Clear error and success messages
  const clearMessages = () => {
    setError(null)
    setSuccess(null)
  }

  return {
    // State
    loading,
    saving,
    error,
    success,
    // Methods
    loadProperty,
    saveProperty,
    addImage,
    removeImage,
    setPrimaryImage,
    clearMessages,
  }
}
