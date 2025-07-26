import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material'
import { QueryClientProvider } from '@tanstack/react-query'
import { SpeedInsights } from '@vercel/speed-insights/react'
import theme from './theme'
import { queryClient } from './lib/queryClient'
import ErrorBoundary from './components/common/ErrorBoundary.tsx'
import { initializePreloading } from './utils/preloadResources'

// Immediate imports for landing page (critical path)
import LandingPage from './pages/Landing/LandingPage.tsx'

// Lazy load all other components to reduce initial bundle size
const Login = lazy(() => import('./pages/Auth/Login.tsx'))
const Signup = lazy(() => import('./pages/Auth/Signup.tsx'))
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword.tsx'))
const ResetPassword = lazy(() => import('./pages/Auth/ResetPassword.tsx'))
const VerifyEmail = lazy(() => import('./pages/Auth/VerifyEmail'))
const ResendVerification = lazy(() => import('./pages/Auth/ResendVerification.tsx'))
const TermsOfService = lazy(() => import('./pages/Legal/TermsOfService.tsx'))
const PrivacyPolicy = lazy(() => import('./pages/Legal/PrivacyPolicy.tsx'))
const PropertyDetails = lazy(() => import('./pages/Properties/Property.tsx'))
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'))
const EditProperty = lazy(() => import('./pages/Properties/CreateProperty.tsx'))
const Tenants = lazy(() => import('./pages/Tenants/Tenants.tsx'))
const CreateTenant = lazy(() => import('./pages/Tenants/CreateTenant.tsx'))
const ProtectedRoute = lazy(() => import('./components/common/ProtectedRoute.tsx'))

// Lazy load dev tools only in development
const ReactQueryDevtools = lazy(() => import('@tanstack/react-query-devtools').then(module => ({ default: module.ReactQueryDevtools })))

// Loading fallback component
const PageLoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: 2,
    }}
  >
    <CircularProgress size={40} />
  </Box>
)

// Temporary placeholder components - replace with actual pages
const AnalyticsPage = () => <div>Analytics Page</div>
const MaintenancePage = () => <div>Maintenance Page</div>
const SettingsPage = () => <div>Settings Page</div>

function App() {
  // Initialize resource preloading for performance
  React.useEffect(() => {
    // Use requestIdleCallback to not block main thread
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => initializePreloading())
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => initializePreloading(), 0)
    }
  }, [])
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <ErrorBoundary>
            <Suspense fallback={<PageLoadingFallback />}>
              <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/verify-email/:token" element={<VerifyEmail />} />
                  <Route path="/resend-verification" element={<ResendVerification />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />

                  {/* Protected Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/properties"
                    element={
                      <ProtectedRoute>
                        <PropertyDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/properties/:id"
                    element={
                      <ProtectedRoute>
                        <PropertyDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/properties/edit"
                    element={
                      <ProtectedRoute>
                        <EditProperty />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/properties/edit/:id"
                    element={
                      <ProtectedRoute>
                        <EditProperty />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/properties/add"
                    element={
                      <ProtectedRoute>
                        <EditProperty />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tenants"
                    element={
                      <ProtectedRoute>
                        <Tenants />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tenants/add"
                    element={
                      <ProtectedRoute>
                        <CreateTenant />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tenants/:tenantId/edit"
                    element={
                      <ProtectedRoute>
                        <CreateTenant />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/analytics"
                    element={
                      <ProtectedRoute>
                        <AnalyticsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/maintenance"
                    element={
                      <ProtectedRoute>
                        <MaintenancePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </Router>
      </ThemeProvider>
      {/* Load dev tools only in development */}
      {import.meta.env.DEV && (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      )}
      <SpeedInsights />
    </QueryClientProvider>
  )
}

export default App
