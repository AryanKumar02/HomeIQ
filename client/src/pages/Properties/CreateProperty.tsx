import React, { useState, useEffect } from 'react'
import { Box, Alert, CircularProgress } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { useCurrency, CURRENCY_CONFIG } from '../../hooks/useCurrency'
import Sidebar from '../../components/common/Sidebar'
import Titlebar from '../../components/basic/Titlebar'
import CustomButton from '../../components/basic/CustomButton'
import ImageUploadSection from '../../components/properties/ImageUploadSection'
import UnitManagement from '../../components/properties/UnitManagement'
import PropertyBasicInfoForm from '../../components/properties/PropertyBasicInfoForm'
import PropertyDetailsForm from '../../components/properties/PropertyDetailsForm'
import PropertyStatusOccupancyForm from '../../components/properties/PropertyStatusOccupancyForm'
import FinancialInformationForm from '../../components/properties/FinancialInformationForm'
import PropertyFeaturesForm from '../../components/properties/PropertyFeaturesForm'
import { type Property, type Unit } from '../../types/property'
import {
  useProperty,
  useCreateProperty,
  useUpdateProperty,
  useAddPropertyImages,
  useRemovePropertyImage,
  useSetPrimaryPropertyImage,
} from '../../hooks/useProperties'

// Use Property type from service
type FormData = Property

const CreateProperty: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const { currency } = useCurrency()
  const currencySymbol = CURRENCY_CONFIG[currency].symbol
  const { id: propertyId } = useParams<{ id: string }>()

  const [isEditMode] = useState(!!propertyId)

  // React Query hooks
  const {
    data: propertyData,
    isLoading: loading,
    refetch: refetchProperty,
  } = useProperty(propertyId || '', {
    enabled: !!propertyId,
  })
  const createPropertyMutation = useCreateProperty()
  const updatePropertyMutation = useUpdateProperty()

  // Image management mutations
  const addImagesMutation = useAddPropertyImages()
  const removeImageMutation = useRemovePropertyImage()
  const setPrimaryImageMutation = useSetPrimaryPropertyImage()

  const saving = createPropertyMutation.isPending || updatePropertyMutation.isPending
  const error = createPropertyMutation.error || updatePropertyMutation.error
  const success = createPropertyMutation.isSuccess || updatePropertyMutation.isSuccess

  // Image operation states
  const imageUploading = addImagesMutation.isPending
  const imageError =
    addImagesMutation.error || removeImageMutation.error || setPrimaryImageMutation.error

  // Load property data if editing
  useEffect(() => {
    if (propertyData) {
      // Convert ISO date strings to YYYY-MM-DD format for HTML date inputs
      const convertedData = { ...propertyData }

      // Convert property-level occupancy dates and tenant
      if (convertedData.occupancy) {
        if (convertedData.occupancy.leaseStart) {
          convertedData.occupancy.leaseStart = new Date(convertedData.occupancy.leaseStart)
            .toISOString()
            .split('T')[0]
        }
        if (convertedData.occupancy.leaseEnd) {
          convertedData.occupancy.leaseEnd = new Date(convertedData.occupancy.leaseEnd)
            .toISOString()
            .split('T')[0]
        }
        // Ensure tenant is stored as ID string, not full object
        if (convertedData.occupancy.tenant) {
          if (typeof convertedData.occupancy.tenant === 'string') {
            // Already a string ID, keep as is
            // No assignment needed
          } else {
            // It's a populated tenant object, extract the ID
            const tenantWithId = convertedData.occupancy.tenant as { _id?: string }
            convertedData.occupancy.tenant = tenantWithId._id || undefined
          }
        }
      }

      // Convert unit-level occupancy dates
      if (convertedData.units && convertedData.units.length > 0) {
        convertedData.units = convertedData.units.map((unit) => {
          const updatedUnit = { ...unit }
          if (unit.occupancy) {
            updatedUnit.occupancy = {
              ...unit.occupancy,
              leaseStart: unit.occupancy.leaseStart
                ? new Date(unit.occupancy.leaseStart).toISOString().split('T')[0]
                : '',
              leaseEnd: unit.occupancy.leaseEnd
                ? new Date(unit.occupancy.leaseEnd).toISOString().split('T')[0]
                : '',
            }
            // Handle tenant conversion separately
            if (unit.occupancy.tenant) {
              if (typeof unit.occupancy.tenant === 'string') {
                updatedUnit.occupancy.tenant = unit.occupancy.tenant
              } else {
                // It's a populated tenant object, extract the ID
                const tenantWithId = unit.occupancy.tenant as { _id?: string }
                updatedUnit.occupancy.tenant = tenantWithId._id || undefined
              }
            } else {
              updatedUnit.occupancy.tenant = undefined
            }
          }
          return updatedUnit
        })
      }

      setFormData(convertedData)
    }
  }, [propertyData])

  // Common TextField styles matching login form styling
  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      background: theme.palette.background.default,
      boxShadow: 'none',
      transition:
        'border-color 0.35s cubic-bezier(0.4,0,0.2,1), box-shadow 0.35s cubic-bezier(0.4,0,0.2,1)',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderWidth: '1.5px',
      borderColor: theme.palette.border.light,
      transition:
        'border-color 0.35s cubic-bezier(0.4,0,0.2,1), border-width 0.25s cubic-bezier(0.4,0,0.2,1)',
    },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.secondary.main,
      borderWidth: '2.5px',
    },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.secondary.main,
      borderWidth: '2.5px',
    },
    '& .MuiInputBase-input': {
      padding: '14px 16px',
      fontSize: '0.95rem',
      fontWeight: 400,
      lineHeight: 1.5,
      color: theme.palette.text.primary,
    },
    '& .MuiInputLabel-root': {
      color: theme.palette.text.secondary,
      fontSize: '0.95rem',
      fontWeight: 500,
      transform: 'translate(16px, 16px) scale(1)',
    },
    '& .MuiInputLabel-shrink': {
      transform: 'translate(16px, -8px) scale(0.85)',
      color: theme.palette.secondary.main,
      fontWeight: 600,
    },
  }

  // Form state for all fields
  const [formData, setFormData] = useState<FormData>({
    // Basic Property Information
    title: '',
    description: '',
    propertyType: 'house',

    // Address Information
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
    },

    // Property Details
    bedrooms: '',
    bathrooms: '',
    squareFootage: '',
    yearBuilt: '',
    lotSize: '',

    // Property Status
    status: 'available',

    // Occupancy Information
    occupancy: {
      isOccupied: false,
      leaseStart: '',
      leaseEnd: '',
      leaseType: 'month-to-month',
      rentDueDate: '1',
    },

    // Financial Information
    financials: {
      // Purchase/Value
      propertyValue: '',
      purchasePrice: '',
      purchaseDate: '',
      // Rental
      monthlyRent: '',
      securityDeposit: '',
      petDeposit: '',
      // Expenses
      monthlyMortgage: '',
      propertyTaxes: '',
      insurance: '',
      maintenance: '',
      utilities: '',
    },

    // Property Features
    features: {
      parking: 'none',
      airConditioning: false,
      heating: 'none',
      laundry: 'none',
      petPolicy: {
        allowed: false,
        types: [],
        maxPets: '0',
      },
      amenities: [],
    },

    // Images Array
    images: [],

    // Units (only for apartments)
    units: [],
  })

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    if (field.includes('.')) {
      const parts = field.split('.')
      if (parts[0] === 'units') {
        const unitIndex = parseInt(parts[1])
        const fieldPath = parts.slice(2)

        setFormData((prev) => ({
          ...prev,
          units: prev.units.map((unit, index) => {
            if (index === unitIndex) {
              if (fieldPath.length === 1) {
                return { ...unit, [fieldPath[0]]: value } as Unit
              } else if (fieldPath.length === 2) {
                const parentKey = fieldPath[0] as keyof Unit
                const childKey = fieldPath[1]
                return {
                  ...unit,
                  [parentKey]: {
                    ...(unit[parentKey] as Record<string, unknown>),
                    [childKey]: value,
                  },
                } as Unit
              } else if (fieldPath.length === 3) {
                const parentKey = fieldPath[0] as keyof Unit
                const childKey = fieldPath[1]
                const grandchildKey = fieldPath[2]
                const parentObj = unit[parentKey] as Record<string, unknown>
                const childObj = (parentObj?.[childKey] as Record<string, unknown>) || {}
                return {
                  ...unit,
                  [parentKey]: {
                    ...parentObj,
                    [childKey]: {
                      ...childObj,
                      [grandchildKey]: value,
                    },
                  },
                } as Unit
              }
            }
            return unit
          }),
        }))
      } else if (parts.length === 2) {
        const [parent, child] = parts
        const parentKey = parent as keyof FormData
        setFormData((prev) => ({
          ...prev,
          [parentKey]: {
            ...(prev[parentKey] as Record<string, unknown>),
            [child]: value,
          },
        }))
      } else if (parts.length === 3) {
        const [parent, child, grandchild] = parts
        const parentKey = parent as keyof FormData
        setFormData((prev) => {
          const parentObj = prev[parentKey] as Record<string, unknown>
          const childObj = (parentObj?.[child] as Record<string, unknown>) || {}
          return {
            ...prev,
            [parentKey]: {
              ...parentObj,
              [child]: {
                ...childObj,
                [grandchild]: value,
              },
            },
          }
        })
      }
    } else {
      const fieldKey = field as keyof FormData
      setFormData((prev) => ({
        ...prev,
        [fieldKey]: value,
      }))
    }
  }

  const addUnit = () => {
    setFormData((prev) => ({
      ...prev,
      units: [
        ...prev.units,
        {
          unitNumber: '',
          bedrooms: '',
          bathrooms: '',
          squareFootage: '',
          monthlyRent: '',
          securityDeposit: '',
          status: 'available',
          occupancy: {
            isOccupied: false,
            leaseStart: '',
            leaseEnd: '',
            leaseType: 'month-to-month',
            rentDueDate: '1',
          },
          features: {
            parking: 'none',
            balcony: false,
            amenities: [],
          },
        },
      ],
    }))
  }

  const removeUnit = (index: number) => {
    if (formData.units.length > 1) {
      setFormData((prev) => ({
        ...prev,
        units: prev.units.filter((_, i) => i !== index),
      }))
    }
  }

  const addImage = (file: File) => {
    // Validate file
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

    if (file.size > maxSize) {
      return
    }

    if (!allowedTypes.includes(file.type)) {
      return
    }

    if (!isEditMode || !propertyId) {
      // For new properties, add to local state with optimistic preview
      const url = URL.createObjectURL(file)
      const newImage = {
        url,
        caption: '',
        isPrimary: formData.images.length === 0,
        uploadedAt: new Date().toISOString(),
        file, // Store file for later upload
      }
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImage],
      }))
    } else {
      // For existing properties, upload immediately with optimistic update
      const formDataObj = new FormData()
      formDataObj.append('images', file)
      formDataObj.append('captions', '') // Default empty caption

      // Optimistic update: Add image to UI immediately
      const optimisticImage = {
        url: URL.createObjectURL(file),
        caption: '',
        isPrimary: formData.images.length === 0,
        uploadedAt: new Date().toISOString(),
        uploading: true, // Flag to show upload progress
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, optimisticImage],
      }))

      // Upload to server
      addImagesMutation.mutate(
        { id: propertyId, images: formDataObj },
        {
          onSuccess: (updatedProperty) => {
            // Update with real server data
            setFormData(updatedProperty)
          },
          onError: () => {
            // Remove optimistic image on failure
            setFormData((prev) => ({
              ...prev,
              images: prev.images.filter((img) => !img.uploading),
            }))
          },
        }
      )
    }
  }

  const removeImage = (index: number) => {
    const imageToRemove = formData.images[index]

    if (!isEditMode || !propertyId || !imageToRemove._id) {
      // For new properties or local images, remove from state immediately
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
    } else {
      // For existing properties, show optimistic update then sync with server
      // At this point we know imageToRemove._id exists due to the condition above
      if (!imageToRemove._id || typeof imageToRemove._id !== 'string') {
        return
      }

      const imageId = imageToRemove._id

      // Optimistic update: Remove immediately from UI
      const originalImages = formData.images
      setFormData((prev) => {
        const newImages = prev.images.filter((_, i) => i !== index)
        if (prev.images[index]?.isPrimary && newImages.length > 0) {
          newImages[0].isPrimary = true
        }
        return {
          ...prev,
          images: newImages,
        }
      })

      // Remove from server
      removeImageMutation.mutate(
        { id: propertyId, imageId },
        {
          onSuccess: (updatedProperty) => {
            setFormData(updatedProperty)
          },
          onError: () => {
            // Revert optimistic update on failure
            setFormData((prev) => ({
              ...prev,
              images: originalImages,
            }))
          },
        }
      )
    }
  }

  const setPrimaryImage = (index: number) => {
    const imageToSetPrimary = formData.images[index]

    if (!isEditMode || !propertyId || !imageToSetPrimary._id) {
      // For new properties or local images, update state immediately
      setFormData((prev) => ({
        ...prev,
        images: prev.images.map((img, i) => ({
          ...img,
          isPrimary: i === index,
        })),
      }))
    } else {
      // For existing properties, optimistic update then sync with server
      if (!imageToSetPrimary._id || typeof imageToSetPrimary._id !== 'string') {
        return
      }

      const imageId = imageToSetPrimary._id

      // Optimistic update: Set primary immediately
      const originalImages = formData.images
      setFormData((prev) => ({
        ...prev,
        images: prev.images.map((img, i) => ({
          ...img,
          isPrimary: i === index,
        })),
      }))

      // Update on server
      setPrimaryImageMutation.mutate(
        { id: propertyId, imageId },
        {
          onSuccess: (updatedProperty) => {
            setFormData(updatedProperty)
          },
          onError: () => {
            // Revert optimistic update on failure
            setFormData((prev) => ({
              ...prev,
              images: originalImages,
            }))
          },
        }
      )
    }
  }

  const updateImageCaption = (index: number, caption: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => (i === index ? { ...img, caption } : img)),
    }))
  }

  // Helper function to sanitize property data for server
  const sanitizePropertyData = (data: Property): Omit<Property, '_id'> => {
    const sanitizedData = { ...data }

    // Remove client-side properties from images
    sanitizedData.images = data.images
      .filter((img) => !img.url.startsWith('blob:')) // Remove local blob images
      .map((img) => ({
        url: img.url,
        caption: img.caption,
        isPrimary: img.isPrimary,
        uploadedAt: img.uploadedAt,
        // Remove client-side properties: file, uploading
      }))

    // Ensure numeric fields are properly typed
    sanitizedData.bedrooms =
      typeof data.bedrooms === 'string' ? parseFloat(data.bedrooms) || 0 : data.bedrooms
    sanitizedData.bathrooms =
      typeof data.bathrooms === 'string' ? parseFloat(data.bathrooms) || 0 : data.bathrooms
    sanitizedData.squareFootage =
      typeof data.squareFootage === 'string'
        ? parseFloat(data.squareFootage) || 0
        : data.squareFootage
    sanitizedData.yearBuilt =
      typeof data.yearBuilt === 'string' ? parseFloat(data.yearBuilt) || 0 : data.yearBuilt
    sanitizedData.lotSize =
      typeof data.lotSize === 'string' ? parseFloat(data.lotSize) || 0 : data.lotSize

    // Sanitize financial data
    const financials = { ...data.financials }
    const financialKeys = Object.keys(financials) as Array<keyof typeof financials>
    financialKeys.forEach((key) => {
      const value = financials[key]
      if (typeof value === 'string' && key !== 'purchaseDate') {
        ;(financials as Record<string, number | string>)[key] = parseFloat(value) || 0
      }
    })
    sanitizedData.financials = financials

    // Sanitize occupancy data
    const occupancy = { ...data.occupancy }
    if (typeof occupancy.rentDueDate === 'string') {
      occupancy.rentDueDate = parseFloat(occupancy.rentDueDate) || 1
    }

    // Convert lease date strings to ISO strings or empty strings
    if (occupancy.leaseStart && occupancy.leaseStart !== '') {
      occupancy.leaseStart = new Date(occupancy.leaseStart).toISOString()
    } else {
      occupancy.leaseStart = ''
    }

    if (occupancy.leaseEnd && occupancy.leaseEnd !== '') {
      occupancy.leaseEnd = new Date(occupancy.leaseEnd).toISOString()
    } else {
      occupancy.leaseEnd = ''
    }

    sanitizedData.occupancy = occupancy

    // Sanitize pet policy
    const petPolicy = { ...data.features.petPolicy }
    if (typeof petPolicy.maxPets === 'string') {
      petPolicy.maxPets = parseFloat(petPolicy.maxPets) || 0
    }
    sanitizedData.features = {
      ...data.features,
      petPolicy,
    }

    // Sanitize units
    sanitizedData.units = data.units.map((unit) => ({
      ...unit,
      bedrooms: typeof unit.bedrooms === 'string' ? parseFloat(unit.bedrooms) || 0 : unit.bedrooms,
      bathrooms:
        typeof unit.bathrooms === 'string' ? parseFloat(unit.bathrooms) || 0 : unit.bathrooms,
      squareFootage:
        typeof unit.squareFootage === 'string'
          ? parseFloat(unit.squareFootage) || 0
          : unit.squareFootage,
      monthlyRent:
        typeof unit.monthlyRent === 'string' ? parseFloat(unit.monthlyRent) || 0 : unit.monthlyRent,
      securityDeposit:
        typeof unit.securityDeposit === 'string'
          ? parseFloat(unit.securityDeposit) || 0
          : unit.securityDeposit,
      occupancy: {
        ...unit.occupancy,
        leaseStart:
          unit.occupancy.leaseStart && unit.occupancy.leaseStart !== ''
            ? new Date(unit.occupancy.leaseStart).toISOString()
            : '',
        leaseEnd:
          unit.occupancy.leaseEnd && unit.occupancy.leaseEnd !== ''
            ? new Date(unit.occupancy.leaseEnd).toISOString()
            : '',
        rentDueDate:
          typeof unit.occupancy.rentDueDate === 'string'
            ? parseFloat(unit.occupancy.rentDueDate) || 1
            : unit.occupancy.rentDueDate,
      },
    }))

    // Remove _id for create operations
    delete sanitizedData._id

    return sanitizedData
  }

  // Validation function
  const validatePropertyData = (data: Property): string[] => {
    const errors: string[] = []

    if (!data.title?.trim()) errors.push('Property title is required')
    if (!data.address?.street?.trim()) errors.push('Street address is required')
    if (!data.address?.city?.trim()) errors.push('City is required')
    if (!data.address?.state?.trim()) errors.push('State is required')
    if (!data.address?.zipCode?.trim()) errors.push('Zip code is required')
    if (!data.propertyType) errors.push('Property type is required')

    return errors
  }

  const handleSave = () => {
    // Validate data first
    const validationErrors = validatePropertyData(formData)
    if (validationErrors.length > 0) {
      // You could show these errors in the UI
      return
    }

    if (isEditMode && propertyId) {
      // For updates, save property data (images are handled separately via mutations)
      const sanitizedData = sanitizePropertyData(formData)
      updatePropertyMutation.mutate(
        { id: propertyId, data: sanitizedData },
        {
          onSuccess: () => {
            setTimeout(() => {
              void navigate('/properties')
            }, 1500)
          },
        }
      )
    } else {
      // For new properties, save without blob images first, then upload images
      const localImages = formData.images.filter((img) => img.url.startsWith('blob:'))
      const sanitizedData = sanitizePropertyData(formData)

      createPropertyMutation.mutate(sanitizedData, {
        onSuccess: (newProperty) => {
          // If there are local images to upload, upload them now
          if (localImages.length > 0 && newProperty._id) {
            void uploadLocalImages(newProperty._id, localImages)
          } else {
            setTimeout(() => {
              void navigate('/properties')
            }, 1500)
          }
        },
      })
    }
  }

  // Helper function to upload local images after property creation
  const uploadLocalImages = async (propertyId: string, localImages: typeof formData.images) => {
    try {
      // Create FormData with all local images
      const formDataObj = new FormData()
      const captions: string[] = []

      // Process all local images
      await Promise.all(
        localImages.map(async (image, index) => {
          // Check if we have a stored file
          if ('file' in image && image.file instanceof File) {
            // Use stored file object
            formDataObj.append('images', image.file)
            captions.push(image.caption || '')
          } else {
            // Fallback: fetch blob URL
            const response = await fetch(image.url)
            const blob = await response.blob()
            const fileName = `image-${index}.${blob.type.split('/')[1] || 'jpg'}`
            const file = new File([blob], fileName, { type: blob.type })
            formDataObj.append('images', file)
            captions.push(image.caption || '')
          }
        })
      )

      // Append captions
      captions.forEach((caption) => {
        formDataObj.append('captions', caption)
      })

      // Upload all images
      addImagesMutation.mutate(
        { id: propertyId, images: formDataObj },
        {
          onSuccess: () => {
            setTimeout(() => {
              void navigate('/properties')
            }, 1500)
          },
          onError: () => {
            // Still navigate but show warning
            setTimeout(() => {
              void navigate('/properties')
            }, 1500)
          },
        }
      )
    } catch {
      setTimeout(() => {
        void navigate('/properties')
      }, 1500)
    }
  }

  const handleCancel = () => {
    void navigate('/properties')
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Titlebar at the top */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: { xs: 0, md: '280px' }, // Start after sidebar on desktop
          right: 0,
          zIndex: 1200,
          backgroundColor: 'background.paper',
          borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
        }}
      >
        <Titlebar title={isEditMode ? 'Edit Property' : 'Add Property'} showSearch={false}>
          <CustomButton text="Cancel" variant="outlined" onClick={handleCancel} />
          <CustomButton
            text={saving ? 'Saving...' : isEditMode ? 'Update Property' : 'Save Property'}
            onClick={() => void handleSave()}
            disabled={saving || loading}
          />
        </Titlebar>
      </Box>

      {/* Main layout with sidebar and content */}
      <Box sx={{ display: 'flex', flexGrow: 1, pt: { xs: '80px', md: '100px' } }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 4 },
            backgroundColor: 'background.default',
            minHeight: '100vh',
          }}
        >
          {/* Container to center and limit width */}
          <Box
            sx={{
              maxWidth: '1200px',
              mx: 'auto',
              width: '100%',
            }}
          >
            {/* Loading State */}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error instanceof Error ? error.message : 'An error occurred'}
              </Alert>
            )}

            {/* Image Error Alert */}
            {imageError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {imageError instanceof Error ? imageError.message : 'Image operation failed'}
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {isEditMode ? 'Property updated successfully!' : 'Property created successfully!'}
              </Alert>
            )}

            {/* Image Upload Progress */}
            {imageUploading && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Uploading images...
              </Alert>
            )}

            {!loading && (
              <>
                {/* Basic Information Card */}
                <PropertyBasicInfoForm
                  formData={{
                    title: formData.title,
                    propertyType: formData.propertyType,
                    description: formData.description,
                    status: formData.status,
                    address: formData.address,
                  }}
                  onInputChange={handleInputChange}
                  textFieldStyles={textFieldStyles}
                />

                {/* Property Details Card */}
                <PropertyDetailsForm
                  formData={{
                    bedrooms: formData.bedrooms,
                    bathrooms: formData.bathrooms,
                    squareFootage: formData.squareFootage,
                    yearBuilt: formData.yearBuilt,
                    lotSize: formData.lotSize,
                  }}
                  onInputChange={handleInputChange}
                  textFieldStyles={textFieldStyles}
                />

                {/* Images Upload Section */}
                <ImageUploadSection
                  images={formData.images}
                  onImageAdd={addImage}
                  onImageRemove={removeImage}
                  onSetPrimary={setPrimaryImage}
                  onCaptionUpdate={updateImageCaption}
                  textFieldStyles={textFieldStyles}
                />

                {/* Property Status & Occupancy Card */}
                <PropertyStatusOccupancyForm
                  formData={{
                    _id: formData._id,
                    status: formData.status,
                    propertyType: formData.propertyType,
                    occupancy: formData.occupancy,
                    financials: formData.financials,
                  }}
                  onInputChange={handleInputChange}
                  textFieldStyles={textFieldStyles}
                  onPropertyUpdate={() => void refetchProperty()}
                />

                {/* Units Management Section */}
                <UnitManagement
                  units={formData.units}
                  propertyType={formData.propertyType}
                  propertyId={formData._id}
                  onAddUnit={addUnit}
                  onRemoveUnit={removeUnit}
                  onInputChange={handleInputChange}
                  textFieldStyles={textFieldStyles}
                  onPropertyUpdate={() => void refetchProperty()}
                />

                {/* Financial Information Card */}
                <FinancialInformationForm
                  formData={{
                    financials: formData.financials,
                    status: formData.status,
                    propertyType: formData.propertyType,
                  }}
                  onInputChange={handleInputChange}
                  textFieldStyles={textFieldStyles}
                  currencySymbol={currencySymbol}
                />

                {/* Property Features Card */}
                <PropertyFeaturesForm
                  formData={{
                    propertyType: formData.propertyType,
                    features: formData.features,
                  }}
                  onInputChange={handleInputChange}
                  textFieldStyles={textFieldStyles}
                />
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default CreateProperty
