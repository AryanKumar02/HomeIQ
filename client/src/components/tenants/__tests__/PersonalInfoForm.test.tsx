import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { createTheme } from '@mui/material/styles'
import { vi } from 'vitest'
import PersonalInfoForm from '../PersonalInfoForm'

const theme = createTheme()

const mockOnInputChange = vi.fn()

const defaultFormData = {
  title: '',
  firstName: 'John',
  lastName: 'Smith',
  middleName: '',
  preferredName: '',
  dateOfBirth: '1990-05-15',
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
}

const defaultProps = {
  formData: defaultFormData,
  onInputChange: mockOnInputChange,
  textFieldStyles: {},
}

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>)
}

describe('PersonalInfoForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the form with all required fields', () => {
    renderWithTheme(<PersonalInfoForm {...defaultProps} />)

    expect(screen.getByText('Personal Information')).toBeInTheDocument()
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Date of Birth/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Immigration Status/i)).toBeInTheDocument()
  })

  it('displays form data correctly', () => {
    renderWithTheme(<PersonalInfoForm {...defaultProps} />)

    expect(screen.getByDisplayValue('John')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Smith')).toBeInTheDocument()
    expect(screen.getByDisplayValue('1990-05-15')).toBeInTheDocument()
    expect(screen.getByDisplayValue('British')).toBeInTheDocument()
  })

  it('handles title selection', async () => {
    renderWithTheme(<PersonalInfoForm {...defaultProps} />)

    const titleSelect = screen.getByLabelText(/Title/i)
    fireEvent.mouseDown(titleSelect)

    await waitFor(() => {
      expect(screen.getByText('Mr')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Mr'))

    expect(mockOnInputChange).toHaveBeenCalledWith('personalInfo.title', 'Mr')
  })

  it('handles first name input change', () => {
    renderWithTheme(<PersonalInfoForm {...defaultProps} />)

    const firstNameInput = screen.getByLabelText(/First Name/i)
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } })

    expect(mockOnInputChange).toHaveBeenCalledWith('personalInfo.firstName', 'Jane')
  })

  it('handles last name input change', () => {
    renderWithTheme(<PersonalInfoForm {...defaultProps} />)

    const lastNameInput = screen.getByLabelText(/Last Name/i)
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } })

    expect(mockOnInputChange).toHaveBeenCalledWith('personalInfo.lastName', 'Doe')
  })

  it('handles middle name input change', () => {
    renderWithTheme(<PersonalInfoForm {...defaultProps} />)

    const middleNameInput = screen.getByLabelText(/Middle Name/i)
    fireEvent.change(middleNameInput, { target: { value: 'Michael' } })

    expect(mockOnInputChange).toHaveBeenCalledWith('personalInfo.middleName', 'Michael')
  })

  it('handles preferred name input change', () => {
    renderWithTheme(<PersonalInfoForm {...defaultProps} />)

    const preferredNameInput = screen.getByLabelText(/Preferred Name/i)
    fireEvent.change(preferredNameInput, { target: { value: 'Johnny' } })

    expect(mockOnInputChange).toHaveBeenCalledWith('personalInfo.preferredName', 'Johnny')
  })

  it('handles date of birth input change', () => {
    renderWithTheme(<PersonalInfoForm {...defaultProps} />)

    const dobInput = screen.getByLabelText(/Date of Birth/i)
    fireEvent.change(dobInput, { target: { value: '1985-12-25' } })

    expect(mockOnInputChange).toHaveBeenCalledWith('personalInfo.dateOfBirth', '1985-12-25')
  })

  it('handles National Insurance Number input change', () => {
    renderWithTheme(<PersonalInfoForm {...defaultProps} />)

    const ninoInput = screen.getByLabelText(/National Insurance Number/i)
    fireEvent.change(ninoInput, { target: { value: 'AB123456C' } })

    expect(mockOnInputChange).toHaveBeenCalledWith(
      'personalInfo.nationalInsuranceNumber',
      'AB123456C'
    )
  })

  it('handles passport number input change', () => {
    renderWithTheme(<PersonalInfoForm {...defaultProps} />)

    const passportInput = screen.getByLabelText(/Passport Number/i)
    fireEvent.change(passportInput, { target: { value: '123456789' } })

    expect(mockOnInputChange).toHaveBeenCalledWith('personalInfo.passportNumber', '123456789')
  })

  it('handles driving licence number input change', () => {
    renderWithTheme(<PersonalInfoForm {...defaultProps} />)

    const licenceInput = screen.getByLabelText(/UK Driving Licence Number/i)
    fireEvent.change(licenceInput, { target: { value: 'KUMAR009052A99RX' } })

    expect(mockOnInputChange).toHaveBeenCalledWith(
      'personalInfo.drivingLicenceNumber',
      'KUMAR009052A99RX'
    )
  })

  it('handles nationality input change', () => {
    renderWithTheme(<PersonalInfoForm {...defaultProps} />)

    const nationalityInput = screen.getByLabelText(/Nationality/i)
    fireEvent.change(nationalityInput, { target: { value: 'Irish' } })

    expect(mockOnInputChange).toHaveBeenCalledWith('personalInfo.nationality', 'Irish')
  })

  it('handles immigration status selection', async () => {
    renderWithTheme(<PersonalInfoForm {...defaultProps} />)

    const statusSelect = screen.getByLabelText(/Immigration Status/i)
    fireEvent.mouseDown(statusSelect)

    await waitFor(() => {
      expect(screen.getByText('EU Settled Status')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('EU Settled Status'))

    expect(mockOnInputChange).toHaveBeenCalledWith(
      'personalInfo.immigrationStatus',
      'eu-settled-status'
    )
  })

  it('handles right to rent verification checkbox', () => {
    renderWithTheme(<PersonalInfoForm {...defaultProps} />)

    const verifiedCheckbox = screen.getByLabelText(/Right to Rent Verified/i)
    fireEvent.click(verifiedCheckbox)

    expect(mockOnInputChange).toHaveBeenCalledWith('personalInfo.rightToRent.verified', true)
  })

  it('handles right to rent verification date change', () => {
    renderWithTheme(<PersonalInfoForm {...defaultProps} />)

    const verificationDateInput = screen.getByLabelText(/Verification Date/i)
    fireEvent.change(verificationDateInput, { target: { value: '2023-07-01' } })

    expect(mockOnInputChange).toHaveBeenCalledWith(
      'personalInfo.rightToRent.verificationDate',
      '2023-07-01'
    )
  })

  it('handles right to rent document type selection', async () => {
    renderWithTheme(<PersonalInfoForm {...defaultProps} />)

    const docTypeSelect = screen.getByLabelText(/Right to Rent Document Type/i)
    fireEvent.mouseDown(docTypeSelect)

    await waitFor(() => {
      expect(screen.getByText('UK Passport')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('UK Passport'))

    expect(mockOnInputChange).toHaveBeenCalledWith(
      'personalInfo.rightToRent.documentType',
      'uk-passport'
    )
  })

  it('handles document expiry date change', () => {
    renderWithTheme(<PersonalInfoForm {...defaultProps} />)

    const expiryDateInput = screen.getByLabelText(/Document Expiry Date/i)
    fireEvent.change(expiryDateInput, { target: { value: '2030-12-31' } })

    expect(mockOnInputChange).toHaveBeenCalledWith(
      'personalInfo.rightToRent.documentExpiryDate',
      '2030-12-31'
    )
  })

  it('handles recheck required checkbox', () => {
    renderWithTheme(<PersonalInfoForm {...defaultProps} />)

    const recheckCheckbox = screen.getByLabelText(/Recheck Required/i)
    fireEvent.click(recheckCheckbox)

    expect(mockOnInputChange).toHaveBeenCalledWith('personalInfo.rightToRent.recheckRequired', true)
  })

  it('handles recheck date change when recheck is required', () => {
    const formDataWithRecheck = {
      ...defaultFormData,
      rightToRent: {
        ...defaultFormData.rightToRent,
        recheckRequired: true,
      },
    }

    renderWithTheme(<PersonalInfoForm {...defaultProps} formData={formDataWithRecheck} />)

    const recheckDateInput = screen.getByLabelText(/Recheck Date/i)
    fireEvent.change(recheckDateInput, { target: { value: '2024-07-01' } })

    expect(mockOnInputChange).toHaveBeenCalledWith(
      'personalInfo.rightToRent.recheckDate',
      '2024-07-01'
    )
  })

  it('handles right to rent notes change', () => {
    renderWithTheme(<PersonalInfoForm {...defaultProps} />)

    const notesInput = screen.getByLabelText(/Right to Rent Notes/i)
    fireEvent.change(notesInput, { target: { value: 'Verification completed successfully' } })

    expect(mockOnInputChange).toHaveBeenCalledWith(
      'personalInfo.rightToRent.notes',
      'Verification completed successfully'
    )
  })

  it('renders with undefined optional fields', () => {
    const formDataWithUndefined = {
      ...defaultFormData,
      title: undefined,
      middleName: undefined,
      preferredName: undefined,
      nationalInsuranceNumber: undefined,
      passportNumber: undefined,
      drivingLicenceNumber: undefined,
      nationality: undefined,
      immigrationStatus: undefined,
      rightToRent: {
        ...defaultFormData.rightToRent,
        verificationDate: undefined,
        documentType: undefined,
        documentExpiryDate: undefined,
        recheckRequired: undefined,
        recheckDate: undefined,
        notes: undefined,
      },
    }

    renderWithTheme(<PersonalInfoForm {...defaultProps} formData={formDataWithUndefined} />)

    // Should render without errors and show empty values
    expect(screen.getByDisplayValue('John')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Smith')).toBeInTheDocument()
  })

  it('shows required indicators on required fields', () => {
    renderWithTheme(<PersonalInfoForm {...defaultProps} />)

    const firstNameInput = screen.getByLabelText(/First Name/i)
    const lastNameInput = screen.getByLabelText(/Last Name/i)
    const dobInput = screen.getByLabelText(/Date of Birth/i)
    const immigrationStatusInput = screen.getByLabelText(/Immigration Status/i)

    // Check that required fields have the required attribute
    expect(firstNameInput).toBeRequired()
    expect(lastNameInput).toBeRequired()
    expect(dobInput).toBeRequired()
    expect(immigrationStatusInput).toBeRequired()
  })
})
