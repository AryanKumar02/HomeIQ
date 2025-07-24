import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import PropertyCard from '../PropertyCard'
import theme from '../../../theme'
import type { Property } from '../../../types/property'

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})
window.IntersectionObserver = mockIntersectionObserver

// Mock the useCurrency hook
vi.mock('../../../hooks/useCurrency', () => ({
  useCurrency: () => ({
    formatPrice: (price: number) => `$${price.toLocaleString()}`,
  }),
}))

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

// Mock property data
const mockProperty: Property = {
  _id: '1',
  title: 'Beautiful Test House',
  description: 'A lovely house for testing',
  propertyType: 'house',
  address: {
    street: '123 Test Street',
    city: 'Test City',
    state: 'Test State',
    zipCode: '12345',
    country: 'United States',
  },
  bedrooms: 3,
  bathrooms: 2,
  squareFootage: 1500,
  yearBuilt: 2020,
  lotSize: 5000,
  status: 'available',
  occupancy: {
    isOccupied: false,
    leaseStart: '',
    leaseEnd: '',
    leaseType: 'month-to-month',
    rentDueDate: 1,
  },
  financials: {
    propertyValue: 300000,
    purchasePrice: 280000,
    purchaseDate: '2020-01-01',
    monthlyRent: 2000,
    securityDeposit: 2000,
    petDeposit: 500,
    monthlyMortgage: 1200,
    propertyTaxes: 300,
    insurance: 100,
    maintenance: 200,
    utilities: 150,
  },
  features: {
    parking: 'garage',
    airConditioning: true,
    heating: 'central',
    laundry: 'in-unit',
    petPolicy: {
      allowed: true,
      types: ['dogs', 'cats'],
      maxPets: 2,
    },
    amenities: ['pool', 'gym'],
  },
  images: [
    {
      url: 'https://example.com/image1.jpg',
      caption: 'Front view',
      isPrimary: true,
      uploadedAt: '2024-01-01T00:00:00Z',
    },
  ],
  units: [],
}

const mockApartmentProperty: Property = {
  ...mockProperty,
  _id: '2',
  title: 'Test Apartment Building',
  propertyType: 'apartment',
  units: [
    {
      _id: 'unit1',
      unitNumber: '101',
      bedrooms: 2,
      bathrooms: 1,
      squareFootage: 800,
      monthlyRent: 1200,
      securityDeposit: 1200,
      status: 'available',
      occupancy: {
        isOccupied: false,
        leaseStart: '',
        leaseEnd: '',
        leaseType: 'month-to-month',
        rentDueDate: 1,
      },
      features: {
        parking: 'assigned',
        balcony: true,
        amenities: ['pool'],
      },
    },
    {
      _id: 'unit2',
      unitNumber: '102',
      bedrooms: 1,
      bathrooms: 1,
      squareFootage: 600,
      monthlyRent: 1000,
      securityDeposit: 1000,
      status: 'occupied',
      occupancy: {
        isOccupied: true,
        leaseStart: '2024-01-01',
        leaseEnd: '2024-12-31',
        leaseType: 'fixed-term',
        rentDueDate: 1,
      },
      features: {
        parking: 'none',
        balcony: false,
        amenities: [],
      },
    },
  ],
}

describe('PropertyCard', () => {
  const mockOnViewDetails = vi.fn()
  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    test('renders property card with basic information', () => {
      render(
        <TestWrapper>
          <PropertyCard
            property={mockProperty}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </TestWrapper>
      )

      expect(screen.getByText('Beautiful Test House')).toBeInTheDocument()
      expect(screen.getByText('123 Test Street, Test City, Test State')).toBeInTheDocument()
      expect(screen.getByText('$2,000 /month')).toBeInTheDocument()
      expect(screen.getByText('3 bed')).toBeInTheDocument()
      expect(screen.getByText('2 bath')).toBeInTheDocument()
      expect(screen.getByText('Available')).toBeInTheDocument()
    })

    test('renders property type badge correctly', () => {
      render(
        <TestWrapper>
          <PropertyCard
            property={mockProperty}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </TestWrapper>
      )

      expect(screen.getByText('House')).toBeInTheDocument()
    })

    test('displays property details like square footage and year built', () => {
      render(
        <TestWrapper>
          <PropertyCard
            property={mockProperty}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </TestWrapper>
      )

      expect(screen.getByText('1,500 sq ft')).toBeInTheDocument()
      expect(screen.getByText('Built 2020')).toBeInTheDocument()
    })
  })

  describe('Apartment Properties', () => {
    test('renders apartment with units information', () => {
      render(
        <TestWrapper>
          <PropertyCard
            property={mockApartmentProperty}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </TestWrapper>
      )

      expect(screen.getByText('2 Units')).toBeInTheDocument()
      expect(screen.getByText('1 Available')).toBeInTheDocument()
      expect(screen.getByText('Total Revenue: $2,200 /month')).toBeInTheDocument()
    })

    test('displays unit details correctly', () => {
      render(
        <TestWrapper>
          <PropertyCard
            property={mockApartmentProperty}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </TestWrapper>
      )

      expect(screen.getByText('Unit 101: 2BR/1BA')).toBeInTheDocument()
      expect(screen.getByText('Unit 102: 1BR/1BA')).toBeInTheDocument()
      expect(screen.getAllByText('Available')).toHaveLength(2) // Property status chip + unit status
      expect(screen.getByText('Occupied')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    test('calls onViewDetails when View Details button is clicked', () => {
      render(
        <TestWrapper>
          <PropertyCard
            property={mockProperty}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </TestWrapper>
      )

      fireEvent.click(screen.getByText('View Details'))
      expect(mockOnViewDetails).toHaveBeenCalledWith('1')
    })

    test('calls onViewDetails when card is clicked', () => {
      render(
        <TestWrapper>
          <PropertyCard
            property={mockProperty}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </TestWrapper>
      )

      // Click on the card content area
      fireEvent.click(screen.getByText('Beautiful Test House'))
      expect(mockOnViewDetails).toHaveBeenCalledWith('1')
    })

    test('opens menu when menu button is clicked', () => {
      render(
        <TestWrapper>
          <PropertyCard
            property={mockProperty}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </TestWrapper>
      )

      // Find the menu button by its aria-label
      const menuButton = screen.getByLabelText('Property options for Beautiful Test House')
      expect(menuButton).toBeInTheDocument()
      expect(menuButton).toHaveAttribute('aria-expanded', 'false')

      // Click to open menu
      fireEvent.click(menuButton)

      // Menu should be expanded
      expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    })

    test('menu button is accessible and functional', () => {
      render(
        <TestWrapper>
          <PropertyCard
            property={mockProperty}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </TestWrapper>
      )

      const menuButton = screen.getByLabelText('Property options for Beautiful Test House')
      expect(menuButton).toHaveAttribute('aria-haspopup', 'true')
      expect(menuButton).toHaveAttribute('aria-expanded', 'false')

      // Verify clicking changes expanded state
      fireEvent.click(menuButton)
      expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    })

    test('menu button accessibility features work correctly', () => {
      render(
        <TestWrapper>
          <PropertyCard
            property={mockProperty}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </TestWrapper>
      )

      const menuButton = screen.getByLabelText('Property options for Beautiful Test House')
      expect(menuButton).toHaveAttribute('aria-haspopup', 'true')
      expect(menuButton).toHaveAttribute('aria-expanded', 'false')

      // Test accessibility attributes remain correct after interactions
      fireEvent.click(menuButton)
      expect(menuButton).toHaveAttribute('aria-haspopup', 'true')
    })
  })

  describe('Image Handling', () => {
    test('displays property image when available', () => {
      render(
        <TestWrapper>
          <PropertyCard
            property={mockProperty}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </TestWrapper>
      )

      const image = screen.getByAltText('Property image of Beautiful Test House')
      expect(image).toBeInTheDocument()
      // Image should be rendered (either original or optimized URL)
      expect(image).toHaveAttribute('src', expect.any(String))
    })

    test('handles image error gracefully', () => {
      render(
        <TestWrapper>
          <PropertyCard
            property={mockProperty}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </TestWrapper>
      )

      const image = screen.getByAltText('Property image of Beautiful Test House')

      // Simulate image error
      fireEvent.error(image)

      // Should still be in the document but with placeholder
      expect(image).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    test('handles property without images', () => {
      const propertyWithoutImages = {
        ...mockProperty,
        images: [],
      }

      render(
        <TestWrapper>
          <PropertyCard
            property={propertyWithoutImages}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </TestWrapper>
      )

      // Should display placeholder image when no images available
      const image = screen.getByAltText('Property image of Beautiful Test House')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', expect.stringContaining('data:image'))
    })

    test('handles property without monthly rent', () => {
      const propertyWithoutRent = {
        ...mockProperty,
        financials: {
          ...mockProperty.financials,
          monthlyRent: 0,
        },
      }

      render(
        <TestWrapper>
          <PropertyCard
            property={propertyWithoutRent}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </TestWrapper>
      )

      expect(screen.getByText('Price not set /month')).toBeInTheDocument()
    })

    test('handles apartment with no units', () => {
      const apartmentWithoutUnits = {
        ...mockProperty,
        propertyType: 'apartment' as const,
        units: [],
      }

      render(
        <TestWrapper>
          <PropertyCard
            property={apartmentWithoutUnits}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </TestWrapper>
      )

      expect(screen.getByText('No units configured')).toBeInTheDocument()
      expect(screen.getByText('Add units to get started')).toBeInTheDocument()
    })
  })

  describe('Status Display', () => {
    test.each([
      ['available', 'Available'],
      ['occupied', 'Occupied'],
      ['maintenance', 'Maintenance'],
      ['off-market', 'Off Market'],
      ['pending', 'Pending'],
    ])('displays %s status correctly', (status, expectedLabel) => {
      const propertyWithStatus = {
        ...mockProperty,
        status: status as Property['status'],
      }

      render(
        <TestWrapper>
          <PropertyCard
            property={propertyWithStatus}
            onViewDetails={mockOnViewDetails}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </TestWrapper>
      )

      expect(screen.getByText(expectedLabel)).toBeInTheDocument()
    })
  })
})
