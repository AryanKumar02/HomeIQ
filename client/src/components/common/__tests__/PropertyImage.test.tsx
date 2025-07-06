import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import PropertyImage from '../PropertyImage'

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})
window.IntersectionObserver = mockIntersectionObserver

// Mock OptimizedImage to simplify testing
interface MockOptimizedImageProps {
  src?: string
  alt: string
  onLoad?: () => void
  onError?: () => void
  sx?: React.CSSProperties
}

vi.mock('../OptimizedImage', () => ({
  default: ({ src, alt, onLoad, onError, sx = {} }: MockOptimizedImageProps) => (
    <img
      src={src || 'data:image/svg+xml;base64,placeholder'}
      alt={alt}
      onLoad={onLoad}
      onError={onError}
      style={sx}
      data-testid="optimized-image"
    />
  ),
}))

describe('PropertyImage', () => {
  const mockImages = [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg',
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    test('renders with single image', () => {
      render(<PropertyImage images={[mockImages[0]]} title="Test Property" />)

      expect(screen.getByAltText('Property image of Test Property')).toBeInTheDocument()
    })

    test('renders with no images and shows placeholder', () => {
      render(<PropertyImage images={[]} title="Test Property" />)

      const image = screen.getByAltText('Property image of Test Property')
      expect(image).toHaveAttribute('src', expect.stringContaining('data:image/svg+xml'))
    })

    test('applies custom dimensions', () => {
      render(<PropertyImage images={mockImages} title="Test Property" width={300} height={200} />)

      const container = screen.getByAltText('Property image of Test Property').closest('div')
      expect(container).toHaveStyle({ width: '300px', height: '200px' })
    })
  })

  describe('Multiple Images', () => {
    test('shows image count indicator with multiple images', () => {
      render(<PropertyImage images={mockImages} title="Test Property" />)

      expect(screen.getByText('1/3')).toBeInTheDocument()
    })

    test('does not show image count with single image', () => {
      render(<PropertyImage images={[mockImages[0]]} title="Test Property" />)

      expect(screen.queryByText('1/1')).not.toBeInTheDocument()
    })

    test('renders secondary image for hover effect', () => {
      render(<PropertyImage images={mockImages} title="Test Property" />)

      const images = screen.getAllByTestId('optimized-image')
      expect(images).toHaveLength(2) // Primary and secondary images

      // Primary image
      expect(images[0]).toHaveAttribute('src', mockImages[0])
      expect(images[0]).toHaveAttribute('alt', 'Property image of Test Property')

      // Secondary image
      expect(images[1]).toHaveAttribute('src', mockImages[1])
      expect(images[1]).toHaveAttribute('alt', 'Secondary image of Test Property')
    })
  })

  describe('Interactive Features', () => {
    test('handles mouse hover with multiple images', () => {
      render(<PropertyImage images={mockImages} title="Test Property" interactive={true} />)

      const container = screen.getByAltText('Property image of Test Property').closest('div')

      // Test mouse enter
      fireEvent.mouseEnter(container!)

      // Test mouse leave
      fireEvent.mouseLeave(container!)

      // Component should handle the events without errors
      expect(container).toBeInTheDocument()
    })

    test('disables interactivity when interactive=false', () => {
      render(<PropertyImage images={mockImages} title="Test Property" interactive={false} />)

      const container = screen.getByAltText('Property image of Test Property').closest('div')
      expect(container).toHaveStyle({ cursor: 'default' })
    })

    test('enables pointer cursor when interactive=true', () => {
      render(<PropertyImage images={mockImages} title="Test Property" interactive={true} />)

      const container = screen.getByAltText('Property image of Test Property').closest('div')
      expect(container).toHaveStyle({ cursor: 'pointer' })
    })

    test('does not render secondary image with single image', () => {
      render(<PropertyImage images={[mockImages[0]]} title="Test Property" interactive={true} />)

      const images = screen.getAllByTestId('optimized-image')
      expect(images).toHaveLength(1) // Only primary image
    })
  })

  describe('Error Handling', () => {
    test('calls onError callback when image fails to load', () => {
      const onError = vi.fn()
      render(
        <PropertyImage
          images={['https://example.com/broken-image.jpg']}
          title="Test Property"
          onError={onError}
        />
      )

      const image = screen.getByAltText('Property image of Test Property')
      fireEvent.error(image)

      expect(onError).toHaveBeenCalled()
    })

    test('calls onLoad callback when image loads successfully', () => {
      const onLoad = vi.fn()
      render(<PropertyImage images={mockImages} title="Test Property" onLoad={onLoad} />)

      const image = screen.getByAltText('Property image of Test Property')
      fireEvent.load(image)

      expect(onLoad).toHaveBeenCalled()
    })
  })

  describe('Placeholder Generation', () => {
    test('generates property-specific placeholder', () => {
      render(<PropertyImage images={[]} title="Test Property" />)

      const image = screen.getByAltText('Property image of Test Property')
      const src = image.getAttribute('src')

      expect(typeof src).toBe('string')
      expect(src).toMatch(/^data:image\/svg\+xml;base64,/)
    })
  })

  describe('Accessibility', () => {
    test('has proper alt text for primary image', () => {
      render(<PropertyImage images={mockImages} title="Beautiful House" />)

      expect(screen.getByAltText('Property image of Beautiful House')).toBeInTheDocument()
    })

    test('has proper alt text for secondary image', () => {
      render(<PropertyImage images={mockImages} title="Beautiful House" />)

      expect(screen.getByAltText('Secondary image of Beautiful House')).toBeInTheDocument()
    })

    test('image count indicator is not interactive', () => {
      render(<PropertyImage images={mockImages} title="Test Property" />)

      const indicator = screen.getByText('1/3').closest('div')
      expect(indicator).toHaveStyle({ pointerEvents: 'none' })
    })
  })
})
