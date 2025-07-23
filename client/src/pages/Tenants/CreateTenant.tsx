import React, { useState, useEffect } from 'react'
import { Box, Alert, Skeleton, Divider } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import Sidebar from '../../components/common/Sidebar'
import Titlebar from '../../components/basic/Titlebar'
import CustomButton from '../../components/basic/CustomButton'
import Card from '../../components/basic/Card'
import PersonalInfoForm from '../../components/tenants/PersonalInfoForm'
import ContactInfoForm from '../../components/tenants/ContactInfoForm'
import CurrentAddressForm from '../../components/tenants/CurrentAddressForm'
import PreviousAddressForm from '../../components/tenants/PreviousAddressForm'
import EmploymentInfoForm from '../../components/tenants/EmploymentInfoForm'
import PreviousEmploymentForm from '../../components/tenants/PreviousEmploymentForm'
import FinancialInfoForm from '../../components/tenants/FinancialInfoForm'
import PetsInfoForm from '../../components/tenants/PetsInfoForm'
import VehiclesInfoForm from '../../components/tenants/VehiclesInfoForm'
import ReferenceChecksForm from '../../components/tenants/ReferenceChecksForm'
import ReferencingStatusForm from '../../components/tenants/ReferencingStatusForm'
import PrivacyConsentForm from '../../components/tenants/PrivacyConsentForm'
import { SkipLink } from '../../components/common'
import { useCreateTenant, useTenant, useUpdateTenant } from '../../hooks/useTenants'
import type { Tenant, PreviousAddress, Reference } from '../../types/tenant'

// Create a form-specific type that ensures all sections are present for form state
type TenantFormData = {
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
  contactInfo: {
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
  employment: {
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
  financialInfo: {
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
  pets: Array<{
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
  vehicles: Array<{
    make?: string
    model?: string
    year?: number
    color?: string
    registrationNumber?: string
    parkingSpot?: string
  }>
  privacy: {
    profileVisibility?: string
    allowBackgroundCheck?: boolean
    allowCreditCheck?: boolean
    dataRetentionConsent: boolean
    consentDate?: string
  }
  references: Reference[]
}

const CreateTenant: React.FC = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const { tenantId } = useParams<{ tenantId: string }>()

  // Determine if we're in edit mode
  const [isEditMode] = useState(!!tenantId)

  // React Query hooks
  const createTenantMutation = useCreateTenant()
  const updateTenantMutation = useUpdateTenant()
  const {
    data: tenantData,
    isLoading: isLoadingTenant,
    error: fetchError
  } = useTenant(tenantId!, { enabled: !!tenantId })

  // Get the appropriate mutation based on mode
  const mutation = isEditMode ? updateTenantMutation : createTenantMutation
  const { isPending: saving, error: mutationError, isSuccess: success } = mutation

  // Common TextField styles matching property form styling
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

  // Form state for tenant data with minimal required structure
  const [formData, setFormData] = useState<TenantFormData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      title: '',
      middleName: '',
      preferredName: '',
      nationalInsuranceNumber: '',
      passportNumber: '',
      drivingLicenceNumber: '',
      nationality: 'British',
      immigrationStatus: 'british-citizen',
      rightToRent: {
        verified: false,
        verificationDate: '',
        documentType: '',
        documentExpiryDate: '',
        recheckRequired: false,
        recheckDate: '',
        notes: '',
      },
    },
    contactInfo: {
      email: '',
      phone: {
        primary: {
          number: '',
          type: 'mobile',
        },
        secondary: {
          number: '',
          type: 'mobile',
        },
      },
      emergencyContact: {
        name: '',
        relationship: 'parent',
        phone: '',
        email: '',
        address: '',
      },
    },
    addresses: {
      current: {
        addressLine1: '',
        addressLine2: '',
        city: '',
        county: '',
        postcode: '',
        country: 'United Kingdom',
      },
      previous: [],
    },
    employment: {
      current: {
        status: 'employed-full-time',
        employer: {
          name: '',
          position: '',
          contractType: 'permanent',
          startDate: '',
          address: {
            addressLine1: '',
            addressLine2: '',
            city: '',
            county: '',
            postcode: '',
            country: 'United Kingdom',
          },
          phone: '',
          hrContactName: '',
          hrContactPhone: '',
          hrContactEmail: '',
        },
        income: {
          gross: {
            monthly: 0,
            annual: 0,
          },
          net: {
            monthly: 0,
            annual: 0,
          },
          currency: 'GBP',
          payFrequency: 'monthly',
          verified: false,
          verificationDate: '',
          verificationMethod: '',
          probationPeriod: {
            inProbation: false,
            endDate: '',
          },
        },
        benefits: {
          receives: false,
          types: [],
          monthlyAmount: 0,
        },
      },
      previous: [],
    },
    financialInfo: {
      bankAccount: {
        bankName: '',
        accountType: 'current',
        sortCode: '',
        verified: false,
        verificationDate: '',
      },
      guarantor: {
        required: false,
        provided: false,
        name: '',
        relationship: 'parent',
        phone: '',
        email: '',
        address: '',
        incomeVerified: false,
      },
      affordabilityAssessment: {
        monthlyIncome: 0,
        monthlyExpenses: 0,
        monthlyCommitments: 0,
        disposableIncome: 0,
        rentToIncomeRatio: 0,
      },
    },
    pets: [],
    vehicles: [],
    privacy: {
      profileVisibility: 'landlords-only',
      allowBackgroundCheck: true,
      allowCreditCheck: true,
      dataRetentionConsent: false,
      consentDate: '',
    },
    references: [],
  })

  // Load tenant data when editing
  useEffect(() => {
    if (isEditMode && tenantData) {
      console.log('Loading tenant data for editing:', tenantData)

      // Convert tenant data to form format
      const convertedData: TenantFormData = {
        personalInfo: {
          firstName: tenantData.personalInfo?.firstName || '',
          lastName: tenantData.personalInfo?.lastName || '',
          dateOfBirth: tenantData.personalInfo?.dateOfBirth || '',
          title: tenantData.personalInfo?.title || '',
          middleName: tenantData.personalInfo?.middleName || '',
          preferredName: tenantData.personalInfo?.preferredName || '',
          nationalInsuranceNumber: tenantData.personalInfo?.nationalInsuranceNumber || '',
          passportNumber: tenantData.personalInfo?.passportNumber || '',
          drivingLicenceNumber: tenantData.personalInfo?.drivingLicenceNumber || '',
          nationality: tenantData.personalInfo?.nationality || 'British',
          immigrationStatus: tenantData.personalInfo?.immigrationStatus || 'british-citizen',
          rightToRent: {
            verified: tenantData.personalInfo?.rightToRent?.verified || false,
            verificationDate: tenantData.personalInfo?.rightToRent?.verificationDate || '',
            documentType: tenantData.personalInfo?.rightToRent?.documentType || '',
            documentExpiryDate: tenantData.personalInfo?.rightToRent?.documentExpiryDate || '',
            recheckRequired: tenantData.personalInfo?.rightToRent?.recheckRequired || false,
            recheckDate: tenantData.personalInfo?.rightToRent?.recheckDate || '',
            notes: tenantData.personalInfo?.rightToRent?.notes || '',
          },
        },
        contactInfo: {
          email: tenantData.contactInfo?.email || '',
          phone: {
            primary: {
              number: tenantData.contactInfo?.phone?.primary?.number || '',
              type: tenantData.contactInfo?.phone?.primary?.type || 'mobile',
            },
            secondary: {
              number: tenantData.contactInfo?.phone?.secondary?.number || '',
              type: tenantData.contactInfo?.phone?.secondary?.type || 'mobile',
            },
          },
          emergencyContact: {
            name: tenantData.contactInfo?.emergencyContact?.name || '',
            relationship: tenantData.contactInfo?.emergencyContact?.relationship || 'parent',
            phone: tenantData.contactInfo?.emergencyContact?.phone || '',
            email: tenantData.contactInfo?.emergencyContact?.email || '',
            address: tenantData.contactInfo?.emergencyContact?.address || '',
          },
        },
        addresses: {
          current: tenantData.addresses?.current || {
            addressLine1: '',
            addressLine2: '',
            city: '',
            county: '',
            postcode: '',
            country: 'United Kingdom',
          },
          previous: tenantData.addresses?.previous || [],
        },
        employment: tenantData.employment || {
          current: {
            status: 'employed-full-time',
            employer: {
              name: '',
              position: '',
              contractType: 'permanent',
              startDate: '',
              address: {
                addressLine1: '',
                addressLine2: '',
                city: '',
                county: '',
                postcode: '',
                country: 'United Kingdom',
              },
              phone: '',
              hrContactName: '',
              hrContactPhone: '',
              hrContactEmail: '',
            },
            income: {
              gross: { monthly: 0, annual: 0 },
              net: { monthly: 0, annual: 0 },
              currency: 'GBP',
              payFrequency: 'monthly',
              verified: false,
              verificationDate: '',
              verificationMethod: '',
              probationPeriod: { inProbation: false, endDate: '' },
            },
            benefits: { receives: false, types: [], monthlyAmount: 0 },
          },
          previous: [],
        },
        financialInfo: tenantData.financialInfo || {
          bankAccount: {
            bankName: '',
            accountType: 'current',
            sortCode: '',
            verified: false,
            verificationDate: '',
          },
          guarantor: {
            required: false,
            provided: false,
            name: '',
            relationship: 'parent',
            phone: '',
            email: '',
            address: '',
            incomeVerified: false,
          },
          affordabilityAssessment: {
            monthlyIncome: 0,
            monthlyExpenses: 0,
            monthlyCommitments: 0,
            disposableIncome: 0,
            rentToIncomeRatio: 0,
          },
        },
        pets: tenantData.pets || [],
        vehicles: tenantData.vehicles || [],
        privacy: tenantData.privacy || {
          profileVisibility: 'landlords-only',
          allowBackgroundCheck: true,
          allowCreditCheck: true,
          dataRetentionConsent: false,
          consentDate: '',
        },
        references: tenantData.references || [],
      }

      setFormData(convertedData)
    }
  }, [isEditMode, tenantData])

  const handleInputChange = (field: string, value: unknown) => {
    if (field.includes('.')) {
      const parts = field.split('.')

      // Handle array fields like addresses.previous.0.field or employment.previous.0.field
      if (parts[0] === 'addresses' && parts[1] === 'previous' && parts.length === 4) {
        const index = parseInt(parts[2])
        const fieldName = parts[3]
        setFormData((prev) => ({
          ...prev,
          addresses: {
            ...prev.addresses,
            previous: prev.addresses.previous.map((addr, i) =>
              i === index ? { ...addr, [fieldName]: value } : addr
            ),
          },
        }))
      } else if (parts[0] === 'employment' && parts[1] === 'previous' && parts.length === 4) {
        const index = parseInt(parts[2])
        const fieldName = parts[3]
        setFormData((prev) => ({
          ...prev,
          employment: {
            ...prev.employment,
            previous: prev.employment.previous.map((emp, i) =>
              i === index ? { ...emp, [fieldName]: value } : emp
            ),
          },
        }))
      } else if (parts[0] === 'pets' && parts.length === 3) {
        const index = parseInt(parts[1])
        const fieldName = parts[2]
        setFormData((prev) => ({
          ...prev,
          pets: prev.pets.map((pet, i) => (i === index ? { ...pet, [fieldName]: value } : pet)),
        }))
      } else if (parts[0] === 'vehicles' && parts.length === 3) {
        const index = parseInt(parts[1])
        const fieldName = parts[2]
        setFormData((prev) => ({
          ...prev,
          vehicles: prev.vehicles.map((vehicle, i) =>
            i === index ? { ...vehicle, [fieldName]: value } : vehicle
          ),
        }))
      } else if (parts[0] === 'references' && parts.length === 3) {
        const index = parseInt(parts[1])
        const fieldName = parts[2]
        setFormData((prev) => ({
          ...prev,
          references: prev.references.map((ref, i) => {
            if (i === index) {

              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              return { ...ref, [fieldName]: value }
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return ref
          }),
        }))
      } else if (parts.length === 2) {
        const [parent, child] = parts
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...(prev[parent as keyof TenantFormData] as Record<string, unknown>),
            [child]: value,
          },
        }))
      } else if (parts.length === 3) {
        const [parent, child, grandchild] = parts
        setFormData((prev) => {
          const parentObj = prev[parent as keyof TenantFormData] as Record<string, unknown>
          const childObj = (parentObj?.[child] as Record<string, unknown>) || {}
          return {
            ...prev,
            [parent]: {
              ...parentObj,
              [child]: {
                ...childObj,
                [grandchild]: value,
              },
            },
          }
        })
      } else if (parts.length === 4) {
        // Handle 4-level nesting like contactInfo.phone.primary.number or employment.workAddress.addressLine1
        const [parent, child, grandchild, greatGrandchild] = parts
        setFormData((prev) => {
          const parentObj = prev[parent as keyof TenantFormData] as Record<string, unknown>
          const childObj = (parentObj?.[child] as Record<string, unknown>) || {}
          const grandchildObj = (childObj?.[grandchild] as Record<string, unknown>) || {}
          return {
            ...prev,
            [parent]: {
              ...parentObj,
              [child]: {
                ...childObj,
                [grandchild]: {
                  ...grandchildObj,
                  [greatGrandchild]: value,
                },
              },
            },
          }
        })
      } else if (parts.length === 5) {
        // Handle 5-level nesting like employment.workAddress.addressLine1
        const [parent, child, grandchild, greatGrandchild, greatGreatGrandchild] = parts
        setFormData((prev) => {
          const parentObj = prev[parent as keyof TenantFormData] as Record<string, unknown>
          const childObj = (parentObj?.[child] as Record<string, unknown>) || {}
          const grandchildObj = (childObj?.[grandchild] as Record<string, unknown>) || {}
          const greatGrandchildObj =
            (grandchildObj?.[greatGrandchild] as Record<string, unknown>) || {}
          return {
            ...prev,
            [parent]: {
              ...parentObj,
              [child]: {
                ...childObj,
                [grandchild]: {
                  ...grandchildObj,
                  [greatGrandchild]: {
                    ...greatGrandchildObj,
                    [greatGreatGrandchild]: value,
                  },
                },
              },
            },
          }
        })
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const addPreviousAddress = () => {
    const newAddress: PreviousAddress = {
      addressLine1: '',
      addressLine2: '',
      city: '',
      county: '',
      postcode: '',
      country: 'United Kingdom',
      startDate: '',
      endDate: '',
      landlordName: '',
      landlordPhone: '',
      monthlyRent: '',
      currency: 'GBP',
      payFrequency: 'monthly',
      reasonForLeaving: '',
    }

    setFormData((prev) => ({
      ...prev,
      addresses: {
        ...prev.addresses,
        previous: [...prev.addresses.previous, newAddress],
      },
    }))
  }

  const removePreviousAddress = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      addresses: {
        ...prev.addresses,
        previous: prev.addresses.previous.filter((_, i) => i !== index),
      },
    }))
  }

  const addPreviousEmployment = () => {
    const newEmployment = {
      employer: '',
      position: '',
      startDate: '',
      endDate: '',
      reasonForLeaving: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
    }

    setFormData((prev) => ({
      ...prev,
      employment: {
        ...prev.employment,
        previous: [...prev.employment.previous, newEmployment],
      },
    }))
  }

  const removePreviousEmployment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      employment: {
        ...prev.employment,
        previous: prev.employment.previous.filter((_, i) => i !== index),
      },
    }))
  }

  const addPet = () => {
    const newPet = {
      name: '',
      type: 'dog',
      breed: '',
      age: 0,
      weight: 0,
      weightUnit: 'kg',
      color: '',
      isServiceAnimal: false,
      vaccinationStatus: 'unknown',
      lastVetVisit: '',
      specialNeeds: '',
    }

    setFormData((prev) => ({
      ...prev,
      pets: [...(prev.pets || []), newPet],
    }))
  }

  const removePet = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      pets: (prev.pets || []).filter((_, i) => i !== index),
    }))
  }

  const addVehicle = () => {
    const newVehicle = {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      registrationNumber: '',
      parkingSpot: '',
    }

    setFormData((prev) => ({
      ...prev,
      vehicles: [...(prev.vehicles || []), newVehicle],
    }))
  }

  const removeVehicle = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      vehicles: (prev.vehicles || []).filter((_, i) => i !== index),
    }))
  }

  const validateTenantData = (data: TenantFormData): string[] => {
    const errors: string[] = []

    // Personal Information validation
    if (!data.personalInfo.firstName?.trim()) errors.push('First name is required')
    if (!data.personalInfo.lastName?.trim()) errors.push('Last name is required')
    if (!data.personalInfo.dateOfBirth?.trim()) errors.push('Date of birth is required')

    // Validate age (must be 18+)
    if (data.personalInfo.dateOfBirth) {
      const birthDate = new Date(data.personalInfo.dateOfBirth)
      const today = new Date()
      const age = Math.floor(
        (today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      )
      if (age < 18) {
        errors.push('Tenant must be at least 18 years old')
      }
    }

    // Contact Information validation
    if (!data.contactInfo?.email?.trim()) errors.push('Email is required')
    if (!data.contactInfo?.phone?.primary?.number?.trim())
      errors.push('Primary phone number is required')
    if (!data.contactInfo?.emergencyContact?.name?.trim())
      errors.push('Emergency contact name is required')
    if (!data.contactInfo?.emergencyContact?.relationship?.trim())
      errors.push('Emergency contact relationship is required')
    if (!data.contactInfo?.emergencyContact?.phone?.trim())
      errors.push('Emergency contact phone is required')

    // Email format validation
    const emailRegex = /^\S+@\S+\.\S+$/
    if (data.contactInfo?.email && !emailRegex.test(data.contactInfo.email)) {
      errors.push('Please enter a valid email address')
    }

    // Employment validation
    if (!data.employment?.current?.status) errors.push('Employment status is required')

    // Additional validation for employed status
    const isEmployed = [
      'employed-full-time',
      'employed-part-time',
      'contractor',
      'apprentice',
    ].includes(data.employment?.current?.status || '')
    if (isEmployed) {
      if (!data.employment?.current?.employer?.name?.trim())
        errors.push('Employer name is required for employed status')
      if (!data.employment?.current?.employer?.position?.trim())
        errors.push('Job title is required for employed status')
    }

    // Income validation
    if (data.employment?.current?.income?.gross?.annual) {
      const salary = data.employment.current.income.gross.annual
      if (isNaN(salary) || salary < 0) {
        errors.push('Gross annual salary must be a valid positive number')
      }
    }

    if (data.employment?.current?.income?.net?.monthly) {
      const salary = data.employment.current.income.net.monthly
      if (isNaN(salary) || salary < 0) {
        errors.push('Net monthly salary must be a valid positive number')
      }
    }

    // Benefits validation
    if (data.employment?.current?.benefits?.receives) {
      if (data.employment.current.benefits.monthlyAmount <= 0) {
        errors.push('Monthly benefits amount must be greater than 0 if receiving benefits')
      }
      if (
        !data.employment.current.benefits.types ||
        data.employment.current.benefits.types.length === 0
      ) {
        errors.push('At least one benefit type must be selected if receiving benefits')
      }
    }

    // Income verification validation
    if (data.employment?.current?.income?.verified === true) {
      if (!data.employment.current.income.verificationDate?.trim()) {
        errors.push('Verification date is required when income is verified')
      }
      if (!data.employment.current.income.verificationMethod?.trim()) {
        errors.push('Verification method is required when income is verified')
      }
    }

    // Probation period validation
    if (data.employment?.current?.income?.probationPeriod?.inProbation) {
      if (!data.employment.current.income.probationPeriod.endDate?.trim()) {
        errors.push('Probation end date is required when in probation period')
      }
    }

    // Financial information validation
    if (data.financialInfo?.bankAccount?.verified === true) {
      if (!data.financialInfo.bankAccount.verificationDate?.trim()) {
        errors.push('Bank verification date is required when account is verified')
      }
    }

    // Sort code validation
    if (data.financialInfo?.bankAccount?.sortCode) {
      const sortCodeRegex = /^\d{2}-\d{2}-\d{2}$/
      if (!sortCodeRegex.test(data.financialInfo.bankAccount.sortCode)) {
        errors.push('Sort code must be in format XX-XX-XX')
      }
    }

    // Guarantor validation
    if (data.financialInfo?.guarantor?.required && data.financialInfo.guarantor.provided) {
      if (!data.financialInfo.guarantor.name?.trim()) {
        errors.push('Guarantor name is required when guarantor is provided')
      }
      if (!data.financialInfo.guarantor.phone?.trim()) {
        errors.push('Guarantor phone is required when guarantor is provided')
      }
      if (!data.financialInfo.guarantor.relationship?.trim()) {
        errors.push('Guarantor relationship is required when guarantor is provided')
      }
    }

    // Affordability validation
    if (
      data.financialInfo?.affordabilityAssessment?.monthlyIncome !== undefined &&
      data.financialInfo.affordabilityAssessment.monthlyIncome < 0
    ) {
      errors.push('Monthly income cannot be negative')
    }
    if (
      data.financialInfo?.affordabilityAssessment?.monthlyExpenses !== undefined &&
      data.financialInfo.affordabilityAssessment.monthlyExpenses < 0
    ) {
      errors.push('Monthly expenses cannot be negative')
    }
    if (
      data.financialInfo?.affordabilityAssessment?.monthlyCommitments !== undefined &&
      data.financialInfo.affordabilityAssessment.monthlyCommitments < 0
    ) {
      errors.push('Monthly commitments cannot be negative')
    }

    // Pets validation
    if (data.pets && data.pets.length > 0) {
      data.pets.forEach((pet, index) => {
        if (!pet.name?.trim()) {
          errors.push(`Pet #${index + 1} name is required`)
        }
        if (!pet.type?.trim()) {
          errors.push(`Pet #${index + 1} type is required`)
        }
        if (pet.age !== undefined && (pet.age < 0 || pet.age > 50)) {
          errors.push(`Pet #${index + 1} age must be between 0 and 50 years`)
        }
        if (pet.weight !== undefined && pet.weight < 0) {
          errors.push(`Pet #${index + 1} weight cannot be negative`)
        }
      })
    }

    // Vehicles validation
    if (data.vehicles && data.vehicles.length > 0) {
      data.vehicles.forEach((vehicle, index) => {
        const currentYear = new Date().getFullYear()
        if (vehicle.year !== undefined && (vehicle.year < 1900 || vehicle.year > currentYear + 2)) {
          errors.push(`Vehicle #${index + 1} year must be between 1900 and ${currentYear + 2}`)
        }
        if (vehicle.registrationNumber) {
          // UK registration pattern validation
          const ukRegPattern =
            /^[A-Z]{2}[0-9]{2}\s?[A-Z]{3}$|^[A-Z][0-9]{1,3}\s?[A-Z]{3}$|^[A-Z]{3}\s?[0-9]{1,3}[A-Z]$/
          if (!ukRegPattern.test(vehicle.registrationNumber)) {
            errors.push(`Vehicle #${index + 1} registration number format is invalid`)
          }
        }
      })
    }

    // Privacy and consent validation
    if (data.privacy?.dataRetentionConsent !== true) {
      errors.push('Data retention consent is required to proceed with the application')
    }

    return errors
  }

  const handleSave = () => {
    // Validate data first
    const validationErrors = validateTenantData(formData)
    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors)
      return
    }

    // Convert form data to API format - build clean object with only non-empty values
    const tenantPayload: Omit<Tenant, '_id' | 'tenantId' | 'createdAt' | 'updatedAt'> = {
      personalInfo: {
        firstName: formData.personalInfo.firstName,
        lastName: formData.personalInfo.lastName,
        dateOfBirth: formData.personalInfo.dateOfBirth,
        rightToRent: {
          verified: formData.personalInfo.rightToRent.verified,
          ...(formData.personalInfo.rightToRent.verificationDate && {
            verificationDate: formData.personalInfo.rightToRent.verificationDate,
          }),
          ...(formData.personalInfo.rightToRent.documentType && {
            documentType: formData.personalInfo.rightToRent.documentType,
          }),
          ...(formData.personalInfo.rightToRent.documentExpiryDate && {
            documentExpiryDate: formData.personalInfo.rightToRent.documentExpiryDate,
          }),
          ...(formData.personalInfo.rightToRent.recheckRequired !== undefined && {
            recheckRequired: formData.personalInfo.rightToRent.recheckRequired,
          }),
          ...(formData.personalInfo.rightToRent.recheckDate && {
            recheckDate: formData.personalInfo.rightToRent.recheckDate,
          }),
          ...(formData.personalInfo.rightToRent.notes && {
            notes: formData.personalInfo.rightToRent.notes,
          }),
        },
        // Only include optional fields if they have values
        ...(formData.personalInfo.title?.trim() && {
          title: formData.personalInfo.title,
        }),
        ...(formData.personalInfo.middleName?.trim() && {
          middleName: formData.personalInfo.middleName,
        }),
        ...(formData.personalInfo.preferredName?.trim() && {
          preferredName: formData.personalInfo.preferredName,
        }),
        ...(formData.personalInfo.nationalInsuranceNumber?.trim() && {
          nationalInsuranceNumber: formData.personalInfo.nationalInsuranceNumber,
        }),
        ...(formData.personalInfo.passportNumber?.trim() && {
          passportNumber: formData.personalInfo.passportNumber,
        }),
        ...(formData.personalInfo.drivingLicenceNumber?.trim() && {
          drivingLicenceNumber: formData.personalInfo.drivingLicenceNumber,
        }),
        ...(formData.personalInfo.nationality?.trim() && {
          nationality: formData.personalInfo.nationality,
        }),
        ...(formData.personalInfo.immigrationStatus?.trim() && {
          immigrationStatus: formData.personalInfo.immigrationStatus,
        }),
      },
      ...(formData.contactInfo && {
        contactInfo: {
          email: formData.contactInfo.email,
          phone: {
            primary: formData.contactInfo.phone.primary,
            // Only include secondary phone if it has a number
            ...(formData.contactInfo.phone.secondary?.number?.trim() && {
              secondary: formData.contactInfo.phone.secondary,
            }),
          },
          emergencyContact: {
            name: formData.contactInfo.emergencyContact.name,
            relationship: formData.contactInfo.emergencyContact.relationship,
            phone: formData.contactInfo.emergencyContact.phone,
            // Only include optional emergency contact fields if they have values
            ...(formData.contactInfo.emergencyContact.email?.trim() && {
              email: formData.contactInfo.emergencyContact.email,
            }),
            ...(formData.contactInfo.emergencyContact.address?.trim() && {
              address: formData.contactInfo.emergencyContact.address,
            }),
          },
        },
      }),
      ...(formData.addresses && { addresses: formData.addresses }),
      ...(formData.employment && { employment: formData.employment }),
      ...(formData.financialInfo && { financialInfo: formData.financialInfo }),
      ...(formData.pets && formData.pets.length > 0 && { pets: formData.pets }),
      ...(formData.vehicles && formData.vehicles.length > 0 && { vehicles: formData.vehicles }),
      ...(formData.references && formData.references.length > 0 && { references: formData.references }),
      ...(formData.privacy && { privacy: formData.privacy }),
      isActive: true,
      // Set application status for both new and existing tenants
      applicationStatus: isEditMode && tenantData?.applicationStatus
        ? tenantData.applicationStatus
        : {
            status: 'pending',
            applicationDate: new Date().toISOString(),
          },
    }

    console.log(`${isEditMode ? 'Updating' : 'Creating'} tenant with data:`, tenantPayload)

    if (isEditMode && tenantId) {
      // Update existing tenant
      updateTenantMutation.mutate(
        { id: tenantId, data: tenantPayload },
        {
          onSuccess: () => {
            console.log('Tenant updated successfully')
            setTimeout(() => {
              void navigate('/tenants')
            }, 1500)
          },
          onError: (error) => {
            console.error('Failed to update tenant:', error)
          },
        }
      )
    } else {
      // Create new tenant
      createTenantMutation.mutate(tenantPayload, {
        onSuccess: () => {
          console.log('Tenant created successfully')
          setTimeout(() => {
            void navigate('/tenants')
          }, 1500)
        },
        onError: (error) => {
          console.error('Failed to create tenant:', error)
        },
      })
    }
  }

  const handleCancel = () => {
    void navigate('/tenants')
  }

  // Show loading spinner while fetching tenant data for editing
  if (isEditMode && isLoadingTenant) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <SkipLink href="#main-content">Skip to main content</SkipLink>

        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: { xs: 0, md: '280px' },
            right: 0,
            zIndex: 1200,
            backgroundColor: 'background.paper',
            borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
          }}
        >
          <Titlebar title="Edit Tenant" showSearch={false}>
            <CustomButton text="Cancel" variant="outlined" onClick={handleCancel} />
            <CustomButton text="Loading..." disabled />
          </Titlebar>
        </Box>

        <Box sx={{ display: 'flex', flexGrow: 1, pt: { xs: '80px', md: '100px' } }}>
          <Sidebar />
          <Box
            component="main"
            id="main-content"
            tabIndex={-1}
            sx={{
              flexGrow: 1,
              p: { xs: 2, sm: 3, md: 4 },
              backgroundColor: 'background.default',
              minHeight: '100vh',
            }}
          >
            <Box sx={{ maxWidth: '1200px', mx: 'auto', width: '100%' }}>
              {Array.from({ length: 8 }).map((_, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    )
  }

  // Show error state if failed to load tenant data
  if (isEditMode && fetchError) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <SkipLink href="#main-content">Skip to main content</SkipLink>

        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: { xs: 0, md: '280px' },
            right: 0,
            zIndex: 1200,
            backgroundColor: 'background.paper',
            borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
          }}
        >
          <Titlebar title="Edit Tenant" showSearch={false}>
            <CustomButton text="Back to Tenants" onClick={handleCancel} />
          </Titlebar>
        </Box>

        <Box sx={{ display: 'flex', flexGrow: 1, pt: { xs: '80px', md: '100px' } }}>
          <Sidebar />
          <Box
            component="main"
            id="main-content"
            tabIndex={-1}
            sx={{
              flexGrow: 1,
              p: { xs: 2, sm: 3, md: 4 },
              backgroundColor: 'background.default',
              minHeight: '100vh',
            }}
          >
            <Box sx={{ maxWidth: '1200px', mx: 'auto', width: '100%' }}>
              <Alert severity="error">
                Failed to load tenant data. Please try again or contact support.
              </Alert>
            </Box>
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Skip Links for Accessibility */}
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#create-tenant-form">Skip to create tenant form</SkipLink>

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
        <Titlebar title={isEditMode ? 'Edit Tenant' : 'Create Tenant'} showSearch={false}>
          <CustomButton text="Cancel" variant="outlined" onClick={handleCancel} />
          <CustomButton
            text={saving ? 'Saving...' : isEditMode ? 'Update Tenant' : 'Save Tenant'}
            onClick={handleSave}
            disabled={saving}
          />
        </Titlebar>
      </Box>

      {/* Main layout with sidebar and content */}
      <Box sx={{ display: 'flex', flexGrow: 1, pt: { xs: '80px', md: '100px' } }}>
        <Sidebar />
        <Box
          component="main"
          id="main-content"
          tabIndex={-1}
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
            {/* Error Alert */}
            {mutationError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {mutationError instanceof Error ? mutationError.message : 'An error occurred'}
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Tenant {isEditMode ? 'updated' : 'created'} successfully!
              </Alert>
            )}

            {/* Personal Information Card */}
            <PersonalInfoForm
              formData={formData.personalInfo}
              onInputChange={handleInputChange}
              textFieldStyles={textFieldStyles}
            />

            {/* Contact Information Card */}
            <ContactInfoForm
              formData={formData.contactInfo}
              onInputChange={handleInputChange}
              textFieldStyles={textFieldStyles}
            />

            {/* Current Address Card */}
            <CurrentAddressForm
              formData={
                formData.addresses.current || {
                  addressLine1: '',
                  addressLine2: '',
                  city: '',
                  county: '',
                  postcode: '',
                  country: 'United Kingdom',
                }
              }
              onInputChange={handleInputChange}
              textFieldStyles={textFieldStyles}
            />

            {/* Previous Address Card */}
            <PreviousAddressForm
              previousAddresses={formData.addresses.previous}
              onInputChange={handleInputChange}
              onAddAddress={addPreviousAddress}
              onRemoveAddress={removePreviousAddress}
              textFieldStyles={textFieldStyles}
            />

            {/* Employment Information Card */}
            <EmploymentInfoForm
              formData={formData.employment}
              onInputChange={handleInputChange}
              textFieldStyles={textFieldStyles}
            />

            {/* Previous Employment Card */}
            <PreviousEmploymentForm
              previousEmployment={formData.employment.previous}
              onInputChange={handleInputChange}
              onAddEmployment={addPreviousEmployment}
              onRemoveEmployment={removePreviousEmployment}
              textFieldStyles={textFieldStyles}
            />

            {/* Financial Information Card */}
            <FinancialInfoForm
              formData={formData.financialInfo}
              onInputChange={handleInputChange}
              textFieldStyles={textFieldStyles}
            />

            {/* Pets Information Card */}
            <PetsInfoForm
              pets={formData.pets}
              onInputChange={handleInputChange}
              onAddPet={addPet}
              onRemovePet={removePet}
              textFieldStyles={textFieldStyles}
            />

            {/* Vehicles Information Card */}
            <VehiclesInfoForm
              vehicles={formData.vehicles}
              onInputChange={handleInputChange}
              onAddVehicle={addVehicle}
              onRemoveVehicle={removeVehicle}
              textFieldStyles={textFieldStyles}
            />

            {/* Reference Management Card */}
            <Card>
              {/* Individual Reference Collection */}
              <ReferenceChecksForm
                references={formData.references}
                onInputChange={handleInputChange}
                textFieldStyles={textFieldStyles}
                showContactActions={isEditMode || process.env.NODE_ENV === 'development'}
              />

              {/* Divider - Only show when status form is visible */}
              {isEditMode && tenantData && (
                <Divider sx={{ my: 4, mx: 2 }} />
              )}

              {/* Overall Referencing Status - Only in edit mode */}
              {isEditMode && tenantData && (
                <ReferencingStatusForm
                  tenant={tenantData}
                  onUpdate={(updatedTenant) => {
                    // Update the current tenant data with the new referencing info
                    // Note: Referencing data doesn't affect form submission, this is just for UI consistency
                    console.log('Referencing updated:', updatedTenant.referencing)
                  }}
                  disabled={isLoadingTenant}
                  textFieldStyles={textFieldStyles}
                />
              )}
            </Card>

            {/* Privacy & Consent Card */}
            <PrivacyConsentForm
              formData={formData.privacy}
              onInputChange={handleInputChange}
              textFieldStyles={textFieldStyles}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default CreateTenant
