// Lightweight route prefetching to improve perceived navigation speed
// Uses dynamic imports matching App.tsx lazy routes

type PrefetchablePath =
  | '/login'
  | '/signup'
  | '/forgot-password'
  | '/resend-verification'
  | '/privacy-policy'
  | '/terms-of-service'
  | '/dashboard'
  | '/properties'
  | '/properties/add'
  | '/tenants'
  | '/tenants/add'
  | '/analytics'

// Prefetch map: path -> function returning import promise
const prefetchMap: Record<PrefetchablePath, () => Promise<unknown>> = {
  '/login': () => import('../pages/Auth/Login'),
  '/signup': () => import('../pages/Auth/Signup'),
  '/forgot-password': () => import('../pages/Auth/ForgotPassword'),
  '/resend-verification': () => import('../pages/Auth/ResendVerification'),
  '/privacy-policy': () => import('../pages/Legal/PrivacyPolicy'),
  '/terms-of-service': () => import('../pages/Legal/TermsOfService'),
  '/dashboard': () => import('../pages/Dashboard/Dashboard'),
  '/properties': () => import('../pages/Properties/Property'),
  '/properties/add': () => import('../pages/Properties/CreateProperty'),
  '/tenants': () => import('../pages/Tenants/Tenants'),
  '/tenants/add': () => import('../pages/Tenants/CreateTenant'),
  '/analytics': () => import('../pages/Analytics/Analytics'),
}

export function prefetchByPath(path: string): void {
  if (import.meta.env.DEV) return
  const normalized = path.split('?')[0] as PrefetchablePath
  const prefetchFn = prefetchMap[normalized]
  if (!prefetchFn) return
  // Fire-and-forget
  void prefetchFn().catch(() => {
    // ignore prefetch errors
  })
}

