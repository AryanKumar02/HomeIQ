import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { vi } from 'vitest'
import ErrorBoundary from '../ErrorBoundary'
import theme from '../../theme'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  </BrowserRouter>
)

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>Working component</div>
}

// Custom fallback component for testing
const CustomFallback: React.FC<{ error?: Error; resetError: () => void }> = ({ 
  error, 
  resetError 
}) => (
  <div>
    <h1>Custom Error Fallback</h1>
    <p>{error?.message}</p>
    <button onClick={resetError}>Custom Reset</button>
  </div>
)

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Suppress console.error for cleaner test output
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Normal Operation', () => {
    test('renders children when there is no error', () => {
      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError shouldThrow={false} />
          </ErrorBoundary>
        </TestWrapper>
      )

      expect(screen.getByText('Working component')).toBeInTheDocument()
    })

    test('does not show error UI when component works normally', () => {
      render(
        <TestWrapper>
          <ErrorBoundary>
            <div>Normal content</div>
          </ErrorBoundary>
        </TestWrapper>
      )

      expect(screen.getByText('Normal content')).toBeInTheDocument()
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    test('catches errors and displays default fallback UI', () => {
      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </TestWrapper>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByText(/We're sorry, but an unexpected error occurred/)).toBeInTheDocument()
      expect(screen.getByText('Refresh Page')).toBeInTheDocument()
      expect(screen.getByText('Go to Dashboard')).toBeInTheDocument()
    })

    test('displays error message in development mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </TestWrapper>
      )

      expect(screen.getByText('Test error message')).toBeInTheDocument()

      process.env.NODE_ENV = originalEnv
    })

    test('does not display error message in production mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </TestWrapper>
      )

      expect(screen.queryByText('Test error message')).not.toBeInTheDocument()

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('Custom Fallback', () => {
    test('renders custom fallback when provided', () => {
      render(
        <TestWrapper>
          <ErrorBoundary fallback={CustomFallback}>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </TestWrapper>
      )

      expect(screen.getByText('Custom Error Fallback')).toBeInTheDocument()
      expect(screen.getByText('Test error message')).toBeInTheDocument()
      expect(screen.getByText('Custom Reset')).toBeInTheDocument()
    })

    test('custom fallback reset button exists', () => {
      render(
        <TestWrapper>
          <ErrorBoundary fallback={CustomFallback}>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </TestWrapper>
      )

      expect(screen.getByText('Custom Error Fallback')).toBeInTheDocument()
      
      const resetButton = screen.getByText('Custom Reset')
      expect(resetButton).toBeInTheDocument()
      
      // Verify reset button is clickable
      fireEvent.click(resetButton)
    })
  })

  describe('Default Fallback Actions', () => {
    test('refresh page button calls window.location.reload', () => {
      const mockReload = vi.fn()
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true
      })

      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </TestWrapper>
      )

      fireEvent.click(screen.getByText('Refresh Page'))
      expect(mockReload).toHaveBeenCalled()
    })

    test('go to dashboard button calls navigate', () => {
      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </TestWrapper>
      )

      fireEvent.click(screen.getByText('Go to Dashboard'))
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  describe('Error Recovery', () => {
    test('error boundary shows refresh and dashboard buttons', () => {
      const mockReload = vi.fn()
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true
      })

      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </TestWrapper>
      )

      // Should show error
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()

      // Should have recovery buttons
      expect(screen.getByText('Refresh Page')).toBeInTheDocument()
      expect(screen.getByText('Go to Dashboard')).toBeInTheDocument()

      // Test refresh button functionality
      fireEvent.click(screen.getByText('Refresh Page'))
      expect(mockReload).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    test('error fallback has proper semantic structure', () => {
      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ErrorBoundary>
        </TestWrapper>
      )

      // Should have alert for error message
      expect(screen.getByRole('alert')).toBeInTheDocument()
      
      // Should have buttons with proper roles
      expect(screen.getByRole('button', { name: /refresh page/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /go to dashboard/i })).toBeInTheDocument()
    })
  })
})