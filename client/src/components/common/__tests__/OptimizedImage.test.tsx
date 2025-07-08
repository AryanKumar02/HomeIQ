import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import OptimizedImage from '../OptimizedImage'

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})
window.IntersectionObserver = mockIntersectionObserver

describe('OptimizedImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    test('renders with basic props (lazy disabled)', () => {
      render(<OptimizedImage src="https://example.com/image.jpg" alt="Test image" lazy={false} />)

      expect(screen.getByAltText('Test image')).toBeInTheDocument()
    })

    test('applies custom dimensions', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Test image"
          width={300}
          height={200}
          lazy={false}
        />
      )

      const container = screen.getByAltText('Test image').closest('div')
      expect(container).toHaveStyle({ width: '300px', height: '200px' })
    })

    test('applies custom border radius', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Test image"
          borderRadius="10px"
          lazy={false}
        />
      )

      const container = screen.getByAltText('Test image').closest('div')
      expect(container).toHaveStyle({ borderRadius: '10px' })
    })
  })

  describe('Lazy Loading', () => {
    test('shows loading placeholder when lazy loading is enabled', () => {
      render(<OptimizedImage src="https://example.com/image.jpg" alt="Test image" lazy={true} />)

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    test('loads immediately when lazy loading is disabled', () => {
      render(<OptimizedImage src="https://example.com/image.jpg" alt="Test image" lazy={false} />)

      expect(screen.getByAltText('Test image')).toBeInTheDocument()
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    test('sets up IntersectionObserver when lazy loading is enabled', () => {
      render(<OptimizedImage src="https://example.com/image.jpg" alt="Test image" lazy={true} />)

      expect(mockIntersectionObserver).toHaveBeenCalledWith(expect.any(Function), {
        rootMargin: '50px',
        threshold: 0.1,
      })
    })
  })

  describe('Image Loading States', () => {
    test('shows skeleton while loading', () => {
      render(<OptimizedImage src="https://example.com/image.jpg" alt="Test image" lazy={false} />)

      // Skeleton should be visible initially
      expect(document.querySelector('.MuiSkeleton-root')).toBeInTheDocument()
    })

    test('calls onLoad callback when image loads', () => {
      const onLoad = vi.fn()
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Test image"
          lazy={false}
          onLoad={onLoad}
        />
      )

      const image = screen.getByAltText('Test image')
      fireEvent.load(image)

      expect(onLoad).toHaveBeenCalled()
    })

    test('calls onError callback when image fails to load', () => {
      const onError = vi.fn()
      render(
        <OptimizedImage
          src="https://example.com/broken-image.jpg"
          alt="Test image"
          lazy={false}
          onError={onError}
        />
      )

      const image = screen.getByAltText('Test image')
      fireEvent.error(image)

      expect(onError).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    test('falls back to placeholder on image error', () => {
      const placeholder = 'data:image/svg+xml;base64,placeholder'
      render(
        <OptimizedImage
          src="https://example.com/broken-image.jpg"
          alt="Test image"
          lazy={false}
          placeholder={placeholder}
        />
      )

      const image = screen.getByAltText('Test image')
      fireEvent.error(image)

      expect(image).toHaveAttribute('src', placeholder)
    })

    test('uses default placeholder when none provided', () => {
      render(
        <OptimizedImage src="https://example.com/broken-image.jpg" alt="Test image" lazy={false} />
      )

      const image = screen.getByAltText('Test image')
      fireEvent.error(image)

      expect(image).toHaveAttribute('src', expect.stringContaining('data:image/svg+xml'))
    })
  })

  describe('Image Optimization', () => {
    test('adds quality parameter to URLs', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Test image"
          lazy={false}
          quality={75}
          width={400}
          height={300}
        />
      )

      const image = screen.getByAltText('Test image')
      expect(image).toHaveAttribute('src', expect.stringContaining('q=75'))
    })

    test('adds width and height parameters for responsive sizing', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Test image"
          lazy={false}
          width={400}
          height={300}
        />
      )

      const image = screen.getByAltText('Test image')
      const src = image.getAttribute('src')
      expect(src).toContain('w=800') // 2x for retina
      expect(src).toContain('h=600') // 2x for retina
    })

    test('does not modify data URLs', () => {
      const dataUrl =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      render(<OptimizedImage src={dataUrl} alt="Test image" lazy={false} quality={75} />)

      const image = screen.getByAltText('Test image')
      expect(image).toHaveAttribute('src', dataUrl)
    })
  })

  describe('Accessibility', () => {
    test('has proper alt text', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Beautiful landscape photo"
          lazy={false}
        />
      )

      expect(screen.getByAltText('Beautiful landscape photo')).toBeInTheDocument()
    })

    test('supports different object fit values', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Test image"
          lazy={false}
          objectFit="contain"
        />
      )

      const image = screen.getByAltText('Test image')
      expect(image).toHaveStyle({ objectFit: 'contain' })
    })
  })

  it('renders with correct src and alt attributes', () => {
    const testSrc = 'https://example.com/image.jpg'
    const testAlt = 'Test image'

    render(<OptimizedImage src={testSrc} alt={testAlt} lazy={false} />)

    const img = screen.getByAltText(testAlt)
    expect(img).toHaveAttribute('src', expect.stringContaining(testSrc))
    expect(img).toHaveAttribute('alt', testAlt)
  })
})
