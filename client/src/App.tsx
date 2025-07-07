import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import theme from './theme'
import { AuthProvider } from './context/AuthContext.tsx'
import { queryClient } from './lib/queryClient'
import Login from './pages/Auth/Login.tsx'
import Signup from './pages/Auth/Signup.tsx'
import ForgotPassword from './pages/Auth/ForgotPassword.tsx'
import ResetPassword from './pages/Auth/ResetPassword.tsx'
import VerifyEmail from './pages/Auth/VerifyEmail'
import ResendVerification from './pages/Auth/ResendVerification.tsx'
import TermsOfService from './pages/Legal/TermsOfService.tsx'
import PrivacyPolicy from './pages/Legal/PrivacyPolicy.tsx'
import LandingPage from './pages/LandingPage'
import PropertyDetails from './pages/Properties/Property.tsx'
import Dashboard from './pages/Dashboard'
import EditProperty from './pages/Properties/CreateProperty.tsx'
import ProtectedRoute from './components/common/ProtectedRoute.tsx'
import ErrorBoundary from './components/common/ErrorBoundary.tsx'

// Temporary placeholder components - replace with actual pages
const TenantsPage = () => <div>Tenants Page</div>
const AnalyticsPage = () => <div>Analytics Page</div>
const MaintenancePage = () => <div>Maintenance Page</div>
const SettingsPage = () => <div>Settings Page</div>

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary>
          <AuthProvider>
            <Router>
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
                    <TenantsPage />
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
            </Router>
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
