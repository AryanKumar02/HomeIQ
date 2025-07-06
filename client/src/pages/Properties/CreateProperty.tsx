import React, { useState, useEffect } from 'react'
import { Box, Alert, CircularProgress } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { useCurrency, CURRENCY_CONFIG } from '../../hooks/useCurrency'
import Sidebar from '../../components/properties/Sidebar'
import Titlebar from '../../components/properties/Titlebar'
import CustomButton from '../../components/properties/CustomButton'
import ImageUploadSection from '../../components/properties/ImageUploadSection'
import UnitManagement from '../../components/properties/UnitManagement'
import PropertyBasicInfoForm from '../../components/properties/PropertyBasicInfoForm'
import PropertyDetailsForm from '../../components/properties/PropertyDetailsForm'
import PropertyStatusOccupancyForm from '../../components/properties/PropertyStatusOccupancyForm'
import FinancialInformationForm from '../../components/properties/FinancialInformationForm'
import PropertyFeaturesForm from '../../components/properties/PropertyFeaturesForm'
import { type Property, type Unit } from '../../services/property'
import { usePropertyApi } from '../../hooks/usePropertyApi'

// Use Property type from service
type FormData = Property

const CreateProperty: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const { currency } = useCurrency()
  const currencySymbol = CURRENCY_CONFIG[currency].symbol
  const { id: propertyId } = useParams<{ id: string }>()

  const [isEditMode] = useState(!!propertyId)
  const {
    loading,
    saving,
    error,
    success,
    loadProperty: loadPropertyAPI,
    saveProperty,
    addImage: addImageAPI,
    removeImage: removeImageAPI,
    setPrimaryImage: setPrimaryImageAPI,
    clearMessages,
  } = usePropertyApi()

  // Load property data if editing
  useEffect(() => {
    if (propertyId) {
      void loadProperty()
    }
  }, [propertyId])

  const loadProperty = async () => {
    const propertyData = await loadPropertyAPI(propertyId!)
    if (propertyData) {
      setFormData(propertyData)
    }
  }

  // Common TextField styles matching login form styling
  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      background: '#f7f8fa',
      boxShadow: 'none',
      transition:
        'border-color 0.35s cubic-bezier(0.4,0,0.2,1), box-shadow 0.35s cubic-bezier(0.4,0,0.2,1)',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderWidth: '1.5px',
      borderColor: '#e0e3e7',
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

  const addImage = async (file: File) => {
    await addImageAPI(file, formData, setFormData, isEditMode, propertyId)
  }

  const removeImage = async (index: number) => {
    await removeImageAPI(index, formData, setFormData, isEditMode, propertyId)
  }

  const setPrimaryImage = async (index: number) => {
    await setPrimaryImageAPI(index, formData, setFormData, isEditMode, propertyId)
  }

  const updateImageCaption = (index: number, caption: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => (i === index ? { ...img, caption } : img)),
    }))
  }

  const handleSave = async () => {
    const result = await saveProperty(formData, isEditMode, propertyId)

    if (result.success && result.propertyId) {
      // Small delay before redirect to show success message
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
              <Alert severity="error" onClose={clearMessages} sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert severity="success" onClose={clearMessages} sx={{ mb: 3 }}>
                {success}
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
                    status: formData.status,
                    propertyType: formData.propertyType,
                    occupancy: formData.occupancy,
                  }}
                  onInputChange={handleInputChange}
                  textFieldStyles={textFieldStyles}
                />

                {/* Units Management Section */}
                <UnitManagement
                  units={formData.units}
                  propertyType={formData.propertyType}
                  onAddUnit={addUnit}
                  onRemoveUnit={removeUnit}
                  onInputChange={handleInputChange}
                  textFieldStyles={textFieldStyles}
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
