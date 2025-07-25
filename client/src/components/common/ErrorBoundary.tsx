import React from 'react'
import { Box, Typography, Button, Alert } from '@mui/material'
import { Refresh as RefreshIcon, Home as HomeIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

/**
 * Internal state for the ErrorBoundary component
 */
interface ErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean
  /** The caught error object */
  error?: Error
  /** Additional error information from React */
  errorInfo?: React.ErrorInfo
}

/**
 * Props for the ErrorBoundary component
 */
interface ErrorBoundaryProps {
  /** The child components to render when there's no error */
  children: React.ReactNode
  /** Optional custom fallback component to render when there's an error */
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of the component tree that crashed.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (import.meta.env.MODE === 'development') {
      console.error('Error caught by boundary:', error, errorInfo)
    }

    this.setState({
      error,
      errorInfo,
    })
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback component
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      // Default fallback UI
      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

/**
 * Default error fallback component
 */
const DefaultErrorFallback: React.FC<{ error?: Error; resetError: () => void }> = ({
  error,
  resetError,
}) => {
  const navigate = useNavigate()

  const handleGoHome = () => {
    resetError()
    void navigate('/dashboard')
  }

  const handleRefresh = () => {
    resetError()
    void window.location.reload()
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        p: 4,
        textAlign: 'center',
      }}
    >
      <Alert
        severity="error"
        sx={{
          mb: 3,
          maxWidth: '600px',
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
      >
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          Something went wrong
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          We&apos;re sorry, but an unexpected error occurred. This has been logged and we&apos;ll
          look into it.
        </Typography>

        {import.meta.env.MODE === 'development' && error && (
          <Box sx={{ mt: 2, textAlign: 'left' }}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
              {error.message}
            </Typography>
          </Box>
        )}
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Refresh Page
        </Button>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={handleGoHome}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Go to Dashboard
        </Button>
      </Box>
    </Box>
  )
}

export default ErrorBoundary
