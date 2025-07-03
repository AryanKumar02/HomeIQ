import React, { useState, useEffect } from 'react'
import { Box, TextField, MenuItem, Typography, Divider, Button, IconButton, Switch, FormControlLabel, Alert, CircularProgress } from '@mui/material'
import Grid from '@mui/material/Grid'
import { Add as AddIcon, Remove as RemoveIcon, CloudUpload as CloudUploadIcon, Delete as DeleteIcon, Star as StarIcon, StarBorder as StarBorderIcon } from '@mui/icons-material'
import { useNavigate, useParams } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import Sidebar from '../components/properties/Sidebar'
import Titlebar from '../components/properties/Titlebar'
import CustomButton from '../components/properties/CustomButton'
import Card from '../components/properties/Card'
import { createProperty, updateProperty, getProperty, addPropertyImages, removePropertyImage, setPrimaryImage as setPrimaryImageAPI, type Property, type Unit } from '../services/property'

// Use Property type from service
type FormData = Property

const EditProperty: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const { id: propertyId } = useParams<{ id: string }>()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isEditMode] = useState(!!propertyId)

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

  // Load property data if editing
  useEffect(() => {
    if (propertyId) {
      void loadProperty()
    }
  }, [propertyId])

  const loadProperty = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getProperty(propertyId!)

      // Handle both possible response formats
      const isSuccess = response.success === true || response.status === 'success'
      const propertyData = response.property || response.data?.property

      if (isSuccess && propertyData) {
        setFormData(propertyData)
      } else {
        setError('Failed to load property data')
      }
    } catch (err) {
      console.error('Error loading property:', err)
      setError('Failed to load property data')
    } finally {
      setLoading(false)
    }
  }

  // Common TextField styles matching login form styling
  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      background: '#f7f8fa',
      boxShadow: 'none',
      transition: 'border-color 0.35s cubic-bezier(0.4,0,0.2,1), box-shadow 0.35s cubic-bezier(0.4,0,0.2,1)',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderWidth: '1.5px',
      borderColor: '#e0e3e7',
      transition: 'border-color 0.35s cubic-bezier(0.4,0,0.2,1), border-width 0.25s cubic-bezier(0.4,0,0.2,1)',
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
      color: '#2d3748',
    },
    '& .MuiInputLabel-root': {
      color: '#718096',
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
      rentDueDate: '1'
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
        maxPets: '0'
      },
      amenities: []
    },

    // Images Array
    images: [],

    // Units (only for apartments)
    units: []
  })

  const propertyTypes = [
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'duplex', label: 'Duplex' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'land', label: 'Land' },
    { value: 'other', label: 'Other' },
  ]

  const propertyStatuses = [
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'off-market', label: 'Off Market' },
    { value: 'pending', label: 'Pending' },
  ]

  const unitStatuses = [
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'off-market', label: 'Off Market' },
  ]

  const leaseTypes = [
    { value: 'month-to-month', label: 'Month-to-Month' },
    { value: 'fixed-term', label: 'Fixed Term' },
    { value: 'week-to-week', label: 'Week-to-Week' },
  ]

  const unitParkingOptions = [
    { value: 'none', label: 'None' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'shared', label: 'Shared' },
    { value: 'garage', label: 'Garage' },
  ]

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    if (field.includes('.')) {
      const parts = field.split('.')
      if (parts[0] === 'units') {
        const unitIndex = parseInt(parts[1])
        const fieldPath = parts.slice(2)

        setFormData(prev => ({
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
                    [childKey]: value
                  }
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
                      [grandchildKey]: value
                    }
                  }
                } as Unit
              }
            }
            return unit
          })
        }))
      } else if (parts.length === 2) {
        const [parent, child] = parts
        const parentKey = parent as keyof FormData
        setFormData(prev => ({
          ...prev,
          [parentKey]: {
            ...(prev[parentKey] as Record<string, unknown>),
            [child]: value
          }
        }))
      } else if (parts.length === 3) {
        const [parent, child, grandchild] = parts
        const parentKey = parent as keyof FormData
        setFormData(prev => {
          const parentObj = prev[parentKey] as Record<string, unknown>
          const childObj = (parentObj?.[child] as Record<string, unknown>) || {}
          return {
            ...prev,
            [parentKey]: {
              ...parentObj,
              [child]: {
                ...childObj,
                [grandchild]: value
              }
            }
          }
        })
      }
    } else {
      const fieldKey = field as keyof FormData
      setFormData(prev => ({
        ...prev,
        [fieldKey]: value
      }))
    }
  }

  const addUnit = () => {
    setFormData(prev => ({
      ...prev,
      units: [...prev.units, {
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
          rentDueDate: '1'
        },
        features: {
          parking: 'none',
          balcony: false,
          amenities: []
        }
      }]
    }))
  }

  const removeUnit = (index: number) => {
    if (formData.units.length > 1) {
      setFormData(prev => ({
        ...prev,
        units: prev.units.filter((_, i) => i !== index)
      }))
    }
  }

  const addImage = async (file: File) => {
    if (!isEditMode || !propertyId) {
      // For new properties, just add to local state
      const url = URL.createObjectURL(file)
      const newImage = {
        url,
        caption: '',
        isPrimary: formData.images.length === 0,
        uploadedAt: new Date().toISOString()
      }
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage]
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

      if (isSuccess && propertyData) {
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

  const removeImage = async (index: number) => {
    const imageToRemove = formData.images[index]

    if (!isEditMode || !propertyId || !imageToRemove.url.startsWith('http')) {
      // For new properties or local images, just remove from state
      setFormData(prev => {
        const newImages = prev.images.filter((_, i) => i !== index)
        // If we removed the primary image, make the first remaining image primary
        if (prev.images[index]?.isPrimary && newImages.length > 0) {
          newImages[0].isPrimary = true
        }
        return {
          ...prev,
          images: newImages
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

      if (isSuccess && propertyData) {
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

  const setPrimaryImage = async (index: number) => {
    const imageToSetPrimary = formData.images[index]

    if (!isEditMode || !propertyId || !imageToSetPrimary.url.startsWith('http')) {
      // For new properties or local images, just update state
      setFormData(prev => ({
        ...prev,
        images: prev.images.map((img, i) => ({
          ...img,
          isPrimary: i === index
        }))
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

      if (isSuccess && propertyData) {
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

  const updateImageCaption = (index: number, caption: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) =>
        i === index ? { ...img, caption } : img
      )
    }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      void Promise.all(
        Array.from(files)
          .filter((file): file is File => file instanceof File && file.type.startsWith('image/'))
          .map(file => addImage(file))
      )
    }
    // Reset the input value so the same file can be uploaded again if needed
    event.target.value = ''
  }

  // Helper function to upload local blob images after property creation
  const uploadLocalImages = async (propertyId: string, localImages: typeof formData.images) => {
    // Convert blob URLs back to Files for upload
    const uploadPromises = localImages.map(async (image, index) => {
      try {
        // Fetch the blob data
        const response = await fetch(image.url)
        const blob = await response.blob()

        // Create a File object from the blob
        const file = new File([blob], `image-${index}.jpg`, { type: blob.type })

        // Create FormData for upload
        const formDataObj = new FormData()
        formDataObj.append('images', file)
        if (image.caption) {
          formDataObj.append('captions', image.caption)
        }

        // Upload to S3
        return await addPropertyImages(propertyId, formDataObj)
      } catch (err) {
        console.error(`Failed to upload image ${index}:`, err)
        throw err
      }
    })

    await Promise.all(uploadPromises)
  }

  const handleSave = async () => {
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

      if (isNaN(bedrooms) || bedrooms < 0 || bedrooms > 50) validationErrors.push('Bedrooms must be between 0 and 50')
      if (isNaN(bathrooms) || bathrooms < 0 || bathrooms > 50) validationErrors.push('Bathrooms must be between 0 and 50')
      if (isNaN(squareFootage) || squareFootage < 1 || squareFootage > 1000000) validationErrors.push('Square footage must be between 1 and 1,000,000')
      if (formData.yearBuilt && (isNaN(yearBuilt) || yearBuilt < 1800 || yearBuilt > new Date().getFullYear() + 5)) {
        validationErrors.push(`Year built must be between 1800 and ${new Date().getFullYear() + 5}`)
      }

      if (validationErrors.length > 0) {
        setError(validationErrors.join('. '))
        setSaving(false)
        return
      }

      // Store local images for later upload (for new properties)
      const localImages = formData.images.filter(img => img.url.startsWith('blob:'))

      // Convert string numeric fields to numbers for server validation
      const processedData: FormData = {
        ...formData,
        bedrooms: formData.bedrooms ? parseFloat(formData.bedrooms as string) : 0,
        bathrooms: formData.bathrooms ? parseFloat(formData.bathrooms as string) : 0,
        squareFootage: formData.squareFootage ? parseFloat(formData.squareFootage as string) : 0,
        yearBuilt: formData.yearBuilt ? parseFloat(formData.yearBuilt as string) : 0,
        lotSize: formData.lotSize ? parseFloat(formData.lotSize as string) : 0,
        financials: {
          ...formData.financials,
          propertyValue: formData.financials.propertyValue ? parseFloat(formData.financials.propertyValue as string) : 0,
          purchasePrice: formData.financials.purchasePrice ? parseFloat(formData.financials.purchasePrice as string) : 0,
          monthlyRent: formData.financials.monthlyRent ? parseFloat(formData.financials.monthlyRent as string) : 0,
          securityDeposit: formData.financials.securityDeposit ? parseFloat(formData.financials.securityDeposit as string) : 0,
          petDeposit: formData.financials.petDeposit ? parseFloat(formData.financials.petDeposit as string) : 0,
          monthlyMortgage: formData.financials.monthlyMortgage ? parseFloat(formData.financials.monthlyMortgage as string) : 0,
          propertyTaxes: formData.financials.propertyTaxes ? parseFloat(formData.financials.propertyTaxes as string) : 0,
          insurance: formData.financials.insurance ? parseFloat(formData.financials.insurance as string) : 0,
          maintenance: formData.financials.maintenance ? parseFloat(formData.financials.maintenance as string) : 0,
          utilities: formData.financials.utilities ? parseFloat(formData.financials.utilities as string) : 0,
        },
        occupancy: {
          ...formData.occupancy,
          rentDueDate: formData.occupancy.rentDueDate ? parseFloat(formData.occupancy.rentDueDate as string) : 1,
        },
        features: {
          ...formData.features,
          petPolicy: {
            ...formData.features.petPolicy,
            maxPets: formData.features.petPolicy.maxPets ? parseFloat(formData.features.petPolicy.maxPets as string) : 0,
          }
        },
        units: formData.units.map(unit => ({
          ...unit,
          bedrooms: unit.bedrooms ? parseFloat(unit.bedrooms as string) : 0,
          bathrooms: unit.bathrooms ? parseFloat(unit.bathrooms as string) : 0,
          squareFootage: unit.squareFootage ? parseFloat(unit.squareFootage as string) : 0,
          monthlyRent: unit.monthlyRent ? parseFloat(unit.monthlyRent as string) : 0,
          securityDeposit: unit.securityDeposit ? parseFloat(unit.securityDeposit as string) : 0,
          occupancy: {
            ...unit.occupancy,
            rentDueDate: unit.occupancy.rentDueDate ? parseFloat(unit.occupancy.rentDueDate as string) : 1,
          }
        })),
        // Remove local blob images from property creation (will upload separately)
        images: formData.images.filter(img => !img.url.startsWith('blob:'))
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
        if (!isEditMode && propertyData?._id && localImages.length > 0) {
          try {
            await uploadLocalImages(propertyData._id, localImages)
            setSuccess('Property created and images uploaded successfully!')
          } catch (err) {
            console.error('Error uploading images after property creation:', err)
            setError('Property created but failed to upload some images')
          }
        }

        if (!isEditMode && propertyData?._id) {
          // Small delay before redirect to show success message
          setTimeout(() => {
            void navigate('/properties')
          }, 1500)
        }
      } else {
        setError(response.message || 'Failed to save property')
      }
    } catch (err: unknown) {
      console.error('Error saving property:', err)

      // Handle server validation errors
      if (err && typeof err === 'object' && 'response' in err) {
        const response = err.response as { data?: { errors?: Array<{ msg: string }> } }
        if (response.data?.errors) {
          const serverErrors = response.data.errors.map((error: { msg: string }) => error.msg).join('. ')
          setError(serverErrors)
        } else {
          setError(getErrorMessage(err, 'Failed to save property'))
        }
      } else {
        setError(getErrorMessage(err, 'Failed to save property'))
      }
    } finally {
      setSaving(false)
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
        <Titlebar
          title={isEditMode ? "Edit Property" : "Add Property"}
          showSearch={false}
        >
          <CustomButton
            text="Cancel"
            variant="outlined"
            onClick={handleCancel}
          />
          <CustomButton
            text={saving ? "Saving..." : (isEditMode ? "Update Property" : "Save Property")}
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
              <Alert
                severity="error"
                onClose={() => setError(null)}
                sx={{ mb: 3 }}
              >
                {error}
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert
                severity="success"
                onClose={() => setSuccess(null)}
                sx={{ mb: 3 }}
              >
                {success}
              </Alert>
            )}

            {!loading && (
              <>
            {/* Basic Information Card */}
            <Card
              title="Basic Information"
              subtitle="Required information about your property"
              padding={{ xs: 3, sm: 4, md: 5 }}
              marginBottom={4}
            >
              <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                {/* Property Title - Left Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Property Title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Beautiful 3BR House in Downtown"
                    required
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* Property Type - Right Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label="Property Type"
                    value={formData.propertyType}
                    onChange={(e) => handleInputChange('propertyType', e.target.value)}
                    required
                    variant="outlined"
                    sx={textFieldStyles}
                  >
                    {propertyTypes.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Property Description - Full Width */}
                <Grid size={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Property Description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your property..."
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* Property Status - Left Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label="Property Status"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as FormData['status'])}
                    required
                    variant="outlined"
                    sx={textFieldStyles}
                  >
                    {propertyStatuses.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Street Address - Full Width */}
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Street Address"
                    value={formData.address.street}
                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                    placeholder="e.g., 123 Main Street"
                    required
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* City - Left Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="City"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    placeholder="e.g., London"
                    required
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* State - Right Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="County"
                    value={formData.address.state}
                    onChange={(e) => handleInputChange('address.state', e.target.value)}
                    placeholder="e.g., West Midlands"
                    required
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* ZIP Code - Left Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Post Code"
                    value={formData.address.zipCode}
                    onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                    placeholder="e.g., WA1 1AA"
                    required
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>

                {/* Country - Right Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Country"
                    value={formData.address.country}
                    onChange={(e) => handleInputChange('address.country', e.target.value)}
                    placeholder="e.g., United Kingdom"
                    required
                    variant="outlined"
                    sx={textFieldStyles}
                  />
                </Grid>

              </Grid>
            </Card>

            {/* Property Details Card */}
            <Card
              title="Property Details"
              subtitle="Specific information about the property"
              padding={{ xs: 3, sm: 4, md: 5 }}
              marginBottom={4}
            >
              <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                {/* Bedrooms - Left Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                    placeholder="0"
                    required
                    variant="outlined"
                    sx={textFieldStyles}
                    slotProps={{
                      htmlInput: { min: 0, max: 50 }
                    }}
                  />
                </Grid>

                {/* Bathrooms - Right Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                    placeholder="0"
                    required
                    variant="outlined"
                    sx={textFieldStyles}
                    slotProps={{
                      htmlInput: { min: 0, max: 50, step: 0.5 }
                    }}
                    error={parseFloat(formData.bathrooms as string) > 50}
                    helperText={parseFloat(formData.bathrooms as string) > 50 ? "Bathrooms must be between 0 and 50" : ""}
                  />
                </Grid>

                {/* Square Footage - Left Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Square Footage"
                    type="number"
                    value={formData.squareFootage}
                    onChange={(e) => handleInputChange('squareFootage', e.target.value)}
                    placeholder="e.g., 1200"
                    required
                    variant="outlined"
                    sx={textFieldStyles}
                    slotProps={{
                      htmlInput: { min: 1, max: 1000000 }
                    }}
                  />
                </Grid>

                {/* Year Built - Right Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Year Built"
                    type="number"
                    value={formData.yearBuilt}
                    onChange={(e) => handleInputChange('yearBuilt', e.target.value)}
                    placeholder="e.g., 1995"
                    variant="outlined"
                    sx={textFieldStyles}
                    slotProps={{
                      htmlInput: { min: 1800, max: new Date().getFullYear() + 5 }
                    }}
                    error={parseFloat(formData.yearBuilt as string) < 1800 || parseFloat(formData.yearBuilt as string) > new Date().getFullYear() + 5}
                    helperText={
                      parseFloat(formData.yearBuilt as string) < 1800 || parseFloat(formData.yearBuilt as string) > new Date().getFullYear() + 5
                        ? `Year built must be between 1800 and ${new Date().getFullYear() + 5}`
                        : ""
                    }
                  />
                </Grid>

                {/* Lot Size - Left Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Lot Size (sq ft)"
                    type="number"
                    value={formData.lotSize}
                    onChange={(e) => handleInputChange('lotSize', e.target.value)}
                    placeholder="e.g., 5000"
                    variant="outlined"
                    sx={textFieldStyles}
                    slotProps={{
                      htmlInput: { min: 0 }
                    }}
                  />
                </Grid>
              </Grid>
            </Card>

            {/* Images Upload Card */}
            <Card
              title="Property Images"
              subtitle="Upload and manage property photos"
              padding={{ xs: 3, sm: 4, md: 5 }}
              marginBottom={4}
            >
              {/* Upload Section */}
              <Box sx={{ mb: 4 }}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => void handleFileUpload(e)}
                  style={{ display: 'none' }}
                  id="image-upload-input"
                />
                <label htmlFor="image-upload-input">
                  <Button
                    component="span"
                    variant="outlined"
                    sx={{
                      borderColor: theme.palette.secondary.main,
                      color: theme.palette.secondary.main,
                      borderStyle: 'dashed',
                      borderWidth: '2px',
                      p: 3,
                      width: '100%',
                      height: '120px',
                      fontSize: '1rem',
                      fontWeight: 500,
                      flexDirection: 'column',
                      gap: 1,
                      '&:hover': {
                        borderColor: theme.palette.secondary.main,
                        backgroundColor: `${theme.palette.secondary.main}10`,
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CloudUploadIcon />
                      <span>Click to upload images or drag and drop</span>
                    </Box>
                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                      Supports JPG, PNG, WEBP (Max 10MB each)
                    </Typography>
                  </Button>
                </label>
              </Box>

              {/* Images Grid */}
              {formData.images.length > 0 && (
                <Grid container spacing={3}>
                  {formData.images.map((image, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                      <Box
                        sx={{
                          position: 'relative',
                          borderRadius: 2,
                          overflow: 'hidden',
                          border: image.isPrimary ? `3px solid ${theme.palette.secondary.main}` : '1px solid #e0e3e7',
                          backgroundColor: 'white',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
                          },
                        }}
                      >
                        {/* Primary Badge */}
                        {image.isPrimary && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 8,
                              left: 8,
                              backgroundColor: theme.palette.secondary.main,
                              color: 'white',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              zIndex: 2,
                            }}
                          >
                            PRIMARY
                          </Box>
                        )}

                        {/* Action Buttons */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            display: 'flex',
                            gap: 1,
                            zIndex: 2,
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => void setPrimaryImage(index)}
                            sx={{
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              color: image.isPrimary ? theme.palette.secondary.main : 'grey.500',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 1)',
                              },
                            }}
                          >
                            {image.isPrimary ? <StarIcon /> : <StarBorderIcon />}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => void removeImage(index)}
                            sx={{
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              color: 'error.main',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 1)',
                              },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>

                        {/* Image */}
                        <Box
                          component="img"
                          src={image.url}
                          alt={image.caption || `Property image ${index + 1}`}
                          sx={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            display: 'block',
                          }}
                        />

                        {/* Caption Input */}
                        <Box sx={{ p: 2 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Caption"
                            value={image.caption}
                            onChange={(e) => updateImageCaption(index, e.target.value)}
                            placeholder="Add a caption..."
                            variant="outlined"
                            sx={{
                              ...textFieldStyles,
                              '& .MuiOutlinedInput-root': {
                                ...textFieldStyles['& .MuiOutlinedInput-root'],
                                fontSize: '0.875rem',
                              },
                            }}
                            slotProps={{
                              htmlInput: { maxLength: 200 }
                            }}
                          />
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Empty State */}
              {formData.images.length === 0 && (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 4,
                    color: 'text.secondary',
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    No images uploaded yet
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Upload photos to showcase your property
                  </Typography>
                </Box>
              )}
            </Card>

            {/* Property Status & Occupancy Card */}
            <Card
              padding={{ xs: 3, sm: 4, md: 5 }}
              marginBottom={4}
            >
              {/* Header with title and switch */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: '1.25rem', sm: '1.35rem', md: '1.5rem' },
                      letterSpacing: '0.02em',
                      color: 'grey.900',
                      mb: 0.5,
                    }}
                  >
                    Property Status & Occupancy
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'grey.600',
                      fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.95rem' },
                    }}
                  >
                    Current status and occupancy information
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.occupancy.isOccupied}
                      onChange={(e) => handleInputChange('occupancy.isOccupied', e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: theme.palette.secondary.main,
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: theme.palette.secondary.main,
                        },
                      }}
                    />
                  }
                  label="Currently Occupied"
                  labelPlacement="start"
                  sx={{ m: 0 }}
                />
              </Box>

              {formData.occupancy.isOccupied && (
                <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                  {/* Lease Start Date - Left Column */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Lease Start Date"
                      type="date"
                      value={formData.occupancy.leaseStart}
                      onChange={(e) => handleInputChange('occupancy.leaseStart', e.target.value)}
                      variant="outlined"
                      sx={textFieldStyles}
                      slotProps={{
                        inputLabel: { shrink: true }
                      }}
                    />
                  </Grid>

                  {/* Lease End Date - Right Column */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Lease End Date"
                      type="date"
                      value={formData.occupancy.leaseEnd}
                      onChange={(e) => handleInputChange('occupancy.leaseEnd', e.target.value)}
                      variant="outlined"
                      sx={textFieldStyles}
                      slotProps={{
                        inputLabel: { shrink: true }
                      }}
                    />
                  </Grid>

                  {/* Lease Type - Left Column */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      select
                      label="Lease Type"
                      value={formData.occupancy.leaseType}
                      onChange={(e) => handleInputChange('occupancy.leaseType', e.target.value as FormData['occupancy']['leaseType'])}
                      variant="outlined"
                      sx={textFieldStyles}
                    >
                      {leaseTypes.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {/* Rent Due Date - Right Column */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Rent Due Date"
                      type="number"
                      value={formData.occupancy.rentDueDate}
                      onChange={(e) => handleInputChange('occupancy.rentDueDate', e.target.value)}
                      placeholder="1"
                      variant="outlined"
                      sx={textFieldStyles}
                      slotProps={{
                        htmlInput: { min: 1, max: 31 }
                      }}
                    />
                  </Grid>
                </Grid>
              )}
            </Card>

            {/* Units Management Card - Only for Apartments */}
            {formData.propertyType === 'apartment' && (
              <Card
                title="Units Management"
                subtitle="Manage individual units for this apartment building"
                padding={{ xs: 3, sm: 4, md: 5 }}
                marginBottom={4}
              >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Units ({formData.units.length})
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addUnit}
                  variant="outlined"
                  sx={{
                    borderColor: theme.palette.secondary.main,
                    color: theme.palette.secondary.main,
                    '&:hover': {
                      borderColor: theme.palette.secondary.main,
                      backgroundColor: `${theme.palette.secondary.main}10`
                    }
                  }}
                >
                  Add Unit
                </Button>
              </Box>

              {formData.units.map((unit, index) => (
                <Box key={index} sx={{ mb: 4, p: 3, border: '1px solid #e0e3e7', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Unit {index + 1}
                    </Typography>
                    {formData.units.length > 1 && (
                      <IconButton
                        onClick={() => removeUnit(index)}
                        size="small"
                        sx={{ color: 'error.main' }}
                      >
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </Box>

                  {/* Basic Unit Information */}
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    {formData.propertyType === 'apartment' && (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Unit Number"
                          value={unit.unitNumber}
                          onChange={(e) => handleInputChange(`units.${index}.unitNumber`, e.target.value)}
                          placeholder="e.g., 101, A, 1A"
                          required
                          variant="outlined"
                          sx={textFieldStyles}
                          slotProps={{
                            htmlInput: { maxLength: 20 }
                          }}
                        />
                      </Grid>
                    )}

                    <Grid size={{ xs: 12, md: formData.propertyType === 'apartment' ? 6 : 3 }}>
                      <TextField
                        fullWidth
                        label="Bedrooms"
                        type="number"
                        value={unit.bedrooms}
                        onChange={(e) => handleInputChange(`units.${index}.bedrooms`, e.target.value)}
                        placeholder="0"
                        variant="outlined"
                        sx={textFieldStyles}
                        slotProps={{
                          htmlInput: { min: 0, max: 50 }
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: formData.propertyType === 'apartment' ? 6 : 3 }}>
                      <TextField
                        fullWidth
                        label="Bathrooms"
                        type="number"
                        value={unit.bathrooms}
                        onChange={(e) => handleInputChange(`units.${index}.bathrooms`, e.target.value)}
                        placeholder="0"
                        variant="outlined"
                        sx={textFieldStyles}
                        slotProps={{
                          htmlInput: { min: 0, max: 50, step: 0.5 }
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: formData.propertyType === 'apartment' ? 6 : 3 }}>
                      <TextField
                        fullWidth
                        label="Square Footage"
                        type="number"
                        value={unit.squareFootage}
                        onChange={(e) => handleInputChange(`units.${index}.squareFootage`, e.target.value)}
                        placeholder="e.g., 800"
                        variant="outlined"
                        sx={textFieldStyles}
                        slotProps={{
                          htmlInput: { min: 1, max: 10000 }
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: formData.propertyType === 'apartment' ? 6 : 3 }}>
                      <TextField
                        fullWidth
                        select
                        label="Status"
                        value={unit.status}
                        onChange={(e) => handleInputChange(`units.${index}.status`, e.target.value)}
                        variant="outlined"
                        sx={textFieldStyles}
                      >
                        {unitStatuses.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </Grid>

                  {/* Rental Information */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Rental Information
                  </Typography>
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Monthly Rent"
                        type="number"
                        value={unit.monthlyRent}
                        onChange={(e) => handleInputChange(`units.${index}.monthlyRent`, e.target.value)}
                        placeholder="e.g., 1200"
                        variant="outlined"
                        sx={textFieldStyles}
                        slotProps={{
                          htmlInput: { min: 0 }
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Security Deposit"
                        type="number"
                        value={unit.securityDeposit}
                        onChange={(e) => handleInputChange(`units.${index}.securityDeposit`, e.target.value)}
                        placeholder="e.g., 1200"
                        variant="outlined"
                        sx={textFieldStyles}
                        slotProps={{
                          htmlInput: { min: 0 }
                        }}
                      />
                    </Grid>
                  </Grid>

                  {/* Occupancy Information */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Occupancy Information
                  </Typography>
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={unit.occupancy.isOccupied}
                            onChange={(e) => handleInputChange(`units.${index}.occupancy.isOccupied`, e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: theme.palette.secondary.main,
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: theme.palette.secondary.main,
                              },
                            }}
                          />
                        }
                        label="Currently Occupied"
                      />
                    </Grid>

                    {unit.occupancy.isOccupied && (
                      <>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            label="Lease Start Date"
                            type="date"
                            value={unit.occupancy.leaseStart}
                            onChange={(e) => handleInputChange(`units.${index}.occupancy.leaseStart`, e.target.value)}
                            variant="outlined"
                            sx={textFieldStyles}
                            slotProps={{
                              inputLabel: { shrink: true }
                            }}
                          />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            label="Lease End Date"
                            type="date"
                            value={unit.occupancy.leaseEnd}
                            onChange={(e) => handleInputChange(`units.${index}.occupancy.leaseEnd`, e.target.value)}
                            variant="outlined"
                            sx={textFieldStyles}
                            slotProps={{
                              inputLabel: { shrink: true }
                            }}
                          />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            select
                            label="Lease Type"
                            value={unit.occupancy.leaseType}
                            onChange={(e) => handleInputChange(`units.${index}.occupancy.leaseType`, e.target.value)}
                            variant="outlined"
                            sx={textFieldStyles}
                          >
                            {leaseTypes.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            label="Rent Due Date"
                            type="number"
                            value={unit.occupancy.rentDueDate}
                            onChange={(e) => handleInputChange(`units.${index}.occupancy.rentDueDate`, e.target.value)}
                            placeholder="1"
                            variant="outlined"
                            sx={textFieldStyles}
                            slotProps={{
                              htmlInput: { min: 1, max: 31 }
                            }}
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>

                  {/* Features */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Features
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        select
                        label="Parking"
                        value={unit.features.parking}
                        onChange={(e) => handleInputChange(`units.${index}.features.parking`, e.target.value)}
                        variant="outlined"
                        sx={textFieldStyles}
                      >
                        {unitParkingOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={unit.features.balcony}
                            onChange={(e) => handleInputChange(`units.${index}.features.balcony`, e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: theme.palette.secondary.main,
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: theme.palette.secondary.main,
                              },
                            }}
                          />
                        }
                        label="Has Balcony"
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Card>
            )}

            {/* Financial Information Card */}
            <Card
              title="Financial Information"
              subtitle="Property value, rental income, and expense details"
              padding={{ xs: 3, sm: 4, md: 5 }}
            >
              {/* Property Value & Purchase Section */}
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  fontWeight: 600,
                  fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.25rem' },
                  color: 'text.primary'
                }}
              >
                Property Value & Purchase
              </Typography>
              <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: 4 }}>
                {/* Property Value - Left Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Property Value"
                    type="number"
                    value={formData.financials.propertyValue}
                    onChange={(e) => handleInputChange('financials.propertyValue', e.target.value)}
                    placeholder="e.g., 450000"
                    variant="outlined"
                    sx={textFieldStyles}
                    slotProps={{
                      htmlInput: { min: 0 }
                    }}
                  />
                </Grid>

                {/* Purchase Price - Right Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Purchase Price"
                    type="number"
                    value={formData.financials.purchasePrice}
                    onChange={(e) => handleInputChange('financials.purchasePrice', e.target.value)}
                    placeholder="e.g., 420000"
                    variant="outlined"
                    sx={textFieldStyles}
                    slotProps={{
                      htmlInput: { min: 0 }
                    }}
                  />
                </Grid>

                {/* Purchase Date - Left Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Purchase Date"
                    type="date"
                    value={formData.financials.purchaseDate}
                    onChange={(e) => handleInputChange('financials.purchaseDate', e.target.value)}
                    variant="outlined"
                    sx={textFieldStyles}
                    slotProps={{
                      inputLabel: { shrink: true }
                    }}
                  />
                </Grid>
              </Grid>

              {/* Divider */}
              <Divider sx={{ my: 4 }} />

              {/* Monthly Expenses Section */}
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  fontWeight: 600,
                  fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.25rem' },
                  color: 'text.primary'
                }}
              >
                Monthly Expenses
              </Typography>
              <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                {/* Monthly Mortgage - Left Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Monthly Mortgage"
                    type="number"
                    value={formData.financials.monthlyMortgage}
                    onChange={(e) => handleInputChange('financials.monthlyMortgage', e.target.value)}
                    placeholder="e.g., 1800"
                    variant="outlined"
                    sx={textFieldStyles}
                    slotProps={{
                      htmlInput: { min: 0 }
                    }}
                  />
                </Grid>

                {/* Property Taxes - Right Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Property Taxes (Monthly)"
                    type="number"
                    value={formData.financials.propertyTaxes}
                    onChange={(e) => handleInputChange('financials.propertyTaxes', e.target.value)}
                    placeholder="e.g., 450"
                    variant="outlined"
                    sx={textFieldStyles}
                    slotProps={{
                      htmlInput: { min: 0 }
                    }}
                  />
                </Grid>

                {/* Insurance - Left Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Insurance (Monthly)"
                    type="number"
                    value={formData.financials.insurance}
                    onChange={(e) => handleInputChange('financials.insurance', e.target.value)}
                    placeholder="e.g., 120"
                    variant="outlined"
                    sx={textFieldStyles}
                    slotProps={{
                      htmlInput: { min: 0 }
                    }}
                  />
                </Grid>

                {/* Maintenance - Right Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Maintenance"
                    type="number"
                    value={formData.financials.maintenance}
                    onChange={(e) => handleInputChange('financials.maintenance', e.target.value)}
                    placeholder="e.g., 200"
                    variant="outlined"
                    sx={textFieldStyles}
                    slotProps={{
                      htmlInput: { min: 0 }
                    }}
                  />
                </Grid>

                {/* Utilities - Left Column */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Utilities"
                    type="number"
                    value={formData.financials.utilities}
                    onChange={(e) => handleInputChange('financials.utilities', e.target.value)}
                    placeholder="e.g., 150"
                    variant="outlined"
                    sx={textFieldStyles}
                    slotProps={{
                      htmlInput: { min: 0 }
                    }}
                  />
                </Grid>
              </Grid>
            </Card>
            </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default EditProperty
