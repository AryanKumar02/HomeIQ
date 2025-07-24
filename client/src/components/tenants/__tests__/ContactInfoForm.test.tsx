import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { createTheme } from '@mui/material/styles'
import { vi } from 'vitest'
import ContactInfoForm from '../ContactInfoForm'

const theme = createTheme()

const mockOnInputChange = vi.fn()

const defaultFormData = {
  email: 'john.smith@example.com',
  phone: {
    primary: {
      number: '07700900123',
      type: 'mobile',
    },
    secondary: {
      number: '',
      type: 'mobile',
    },
  },
  emergencyContact: {
    name: 'Jane Smith',
    relationship: 'parent',
    phone: '07700900124',
    email: 'jane.smith@example.com',
    address: '123 Main St, London',
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

describe('ContactInfoForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the form with all required fields', () => {
    renderWithTheme(<ContactInfoForm {...defaultProps} />)

    expect(screen.getByText('Contact Information')).toBeInTheDocument()
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Primary Phone Number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Emergency Contact Name/i)).toBeInTheDocument()
  })

  it('displays form data correctly', () => {
    renderWithTheme(<ContactInfoForm {...defaultProps} />)

    expect(screen.getByDisplayValue('john.smith@example.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('07700900123')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument()
    expect(screen.getByDisplayValue('07700900124')).toBeInTheDocument()
  })

  it('handles email input change', () => {
    renderWithTheme(<ContactInfoForm {...defaultProps} />)

    const emailInput = screen.getByLabelText(/Email Address/i)
    fireEvent.change(emailInput, { target: { value: 'new.email@example.com' } })

    expect(mockOnInputChange).toHaveBeenCalledWith('contactInfo.email', 'new.email@example.com')
  })

  it('handles primary phone number input change', () => {
    renderWithTheme(<ContactInfoForm {...defaultProps} />)

    const primaryPhoneInput = screen.getByLabelText(/Primary Phone Number/i)
    fireEvent.change(primaryPhoneInput, { target: { value: '07800123456' } })

    expect(mockOnInputChange).toHaveBeenCalledWith(
      'contactInfo.phone.primary.number',
      '07800123456'
    )
  })

  it('handles primary phone type selection', async () => {
    renderWithTheme(<ContactInfoForm {...defaultProps} />)

    const primaryTypeSelect = screen.getByLabelText(/Primary Phone Type/i)
    fireEvent.mouseDown(primaryTypeSelect)

    await waitFor(() => {
      expect(screen.getByText('Work')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Work'))

    expect(mockOnInputChange).toHaveBeenCalledWith('contactInfo.phone.primary.type', 'work')
  })

  it('handles secondary phone number input change', () => {
    renderWithTheme(<ContactInfoForm {...defaultProps} />)

    const secondaryPhoneInput = screen.getByLabelText(/Secondary Phone Number/i)
    fireEvent.change(secondaryPhoneInput, { target: { value: '02071234567' } })

    expect(mockOnInputChange).toHaveBeenCalledWith(
      'contactInfo.phone.secondary.number',
      '02071234567'
    )
  })

  it('handles secondary phone type selection', async () => {
    renderWithTheme(<ContactInfoForm {...defaultProps} />)

    const secondaryTypeSelect = screen.getByLabelText(/Secondary Phone Type/i)
    fireEvent.mouseDown(secondaryTypeSelect)

    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Home'))

    expect(mockOnInputChange).toHaveBeenCalledWith('contactInfo.phone.secondary.type', 'home')
  })

  it('handles emergency contact name input change', () => {
    renderWithTheme(<ContactInfoForm {...defaultProps} />)

    const emergencyNameInput = screen.getByLabelText(/Emergency Contact Name/i)
    fireEvent.change(emergencyNameInput, { target: { value: 'Bob Smith' } })

    expect(mockOnInputChange).toHaveBeenCalledWith('contactInfo.emergencyContact.name', 'Bob Smith')
  })

  it('handles emergency contact relationship selection', async () => {
    renderWithTheme(<ContactInfoForm {...defaultProps} />)

    const relationshipSelect = screen.getByLabelText(/Relationship/i)
    fireEvent.mouseDown(relationshipSelect)

    await waitFor(() => {
      expect(screen.getByText('Spouse')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Spouse'))

    expect(mockOnInputChange).toHaveBeenCalledWith(
      'contactInfo.emergencyContact.relationship',
      'spouse'
    )
  })

  it('handles emergency contact phone input change', () => {
    renderWithTheme(<ContactInfoForm {...defaultProps} />)

    const emergencyPhoneInput = screen.getByLabelText(/Emergency Contact Phone/i)
    fireEvent.change(emergencyPhoneInput, { target: { value: '07900123456' } })

    expect(mockOnInputChange).toHaveBeenCalledWith(
      'contactInfo.emergencyContact.phone',
      '07900123456'
    )
  })

  it('handles emergency contact email input change', () => {
    renderWithTheme(<ContactInfoForm {...defaultProps} />)

    const emergencyEmailInput = screen.getByLabelText(/Emergency Contact Email/i)
    fireEvent.change(emergencyEmailInput, { target: { value: 'emergency@example.com' } })

    expect(mockOnInputChange).toHaveBeenCalledWith(
      'contactInfo.emergencyContact.email',
      'emergency@example.com'
    )
  })

  it('handles emergency contact address input change', () => {
    renderWithTheme(<ContactInfoForm {...defaultProps} />)

    const emergencyAddressInput = screen.getByLabelText(/Emergency Contact Address/i)
    fireEvent.change(emergencyAddressInput, { target: { value: '456 New Street, Manchester' } })

    expect(mockOnInputChange).toHaveBeenCalledWith(
      'contactInfo.emergencyContact.address',
      '456 New Street, Manchester'
    )
  })

  it('renders with undefined optional fields', () => {
    const formDataWithUndefined = {
      email: 'john.smith@example.com',
      phone: {
        primary: {
          number: '07700900123',
          type: 'mobile',
        },
        secondary: undefined,
      },
      emergencyContact: {
        name: 'Jane Smith',
        relationship: 'parent',
        phone: '07700900124',
        email: undefined,
        address: undefined,
      },
    }

    renderWithTheme(<ContactInfoForm {...defaultProps} formData={formDataWithUndefined} />)

    // Should render without errors
    expect(screen.getByDisplayValue('john.smith@example.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument()
  })

  it('shows required indicators on required fields', () => {
    renderWithTheme(<ContactInfoForm {...defaultProps} />)

    const emailInput = screen.getByLabelText(/Email Address/i)
    const primaryPhoneInput = screen.getByLabelText(/Primary Phone Number/i)
    const emergencyNameInput = screen.getByLabelText(/Emergency Contact Name/i)
    const emergencyPhoneInput = screen.getByLabelText(/Emergency Contact Phone/i)

    // Check that required fields have the required attribute
    expect(emailInput).toBeRequired()
    expect(primaryPhoneInput).toBeRequired()
    expect(emergencyNameInput).toBeRequired()
    expect(emergencyPhoneInput).toBeRequired()
  })

  it('shows emergency contact section with proper heading', () => {
    renderWithTheme(<ContactInfoForm {...defaultProps} />)

    expect(screen.getByText('Emergency Contact')).toBeInTheDocument()
    expect(screen.getByText('Person to contact in case of emergency')).toBeInTheDocument()
  })

  it('handles all relationship options', async () => {
    renderWithTheme(<ContactInfoForm {...defaultProps} />)

    const relationshipSelect = screen.getByLabelText(/Relationship/i)
    fireEvent.mouseDown(relationshipSelect)

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Sibling' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Spouse' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Partner' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Child' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Relative' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Friend' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Colleague' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Other' })).toBeInTheDocument()
    })
  })

  it('handles all phone type options', async () => {
    renderWithTheme(<ContactInfoForm {...defaultProps} />)

    const primaryTypeSelect = screen.getByLabelText(/Primary Phone Type/i)
    fireEvent.mouseDown(primaryTypeSelect)

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Home' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Work' })).toBeInTheDocument()
    })
  })

  it('has proper placeholder text', () => {
    renderWithTheme(<ContactInfoForm {...defaultProps} />)

    expect(screen.getByPlaceholderText('e.g., john.smith@email.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g., 07700900123 or 02071234567')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g., Jane Smith')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Full address of emergency contact (optional)')
    ).toBeInTheDocument()
  })
})
