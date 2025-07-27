/**
 * Utility functions for preloading critical resources to improve performance
 */

interface PreloadOptions {
  as?: 'image' | 'font' | 'script' | 'style'
  crossOrigin?: 'anonymous' | 'use-credentials'
  type?: string
}

/**
 * Preload a resource to improve performance
 */
export const preloadResource = (href: string, options: PreloadOptions = {}) => {
  // Check if resource is already preloaded
  const existingLink = document.querySelector(`link[rel="preload"][href="${href}"]`)
  if (existingLink) return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = href
  
  if (options.as) link.as = options.as
  if (options.crossOrigin) link.crossOrigin = options.crossOrigin
  if (options.type) link.type = options.type

  document.head.appendChild(link)
}

/**
 * Preload critical images for the landing page
 */
export const preloadCriticalImages = () => {
  const criticalImages = [
    '/assets/logo.webp', // Use WebP directly since you have them
    // Add other critical images that appear above the fold
  ]

  criticalImages.forEach(src => {
    preloadResource(src, { as: 'image' })
  })
}

/**
 * Preload critical fonts
 */
export const preloadCriticalFonts = () => {
  const criticalFonts: string[] = [
    // Add paths to critical font files
    // Example: '/fonts/roboto-v30-latin-regular.woff2'
  ]

  criticalFonts.forEach((src: string) => {
    preloadResource(src, { 
      as: 'font', 
      type: 'font/woff2',
      crossOrigin: 'anonymous'
    })
  })
}

/**
 * Preload critical CSS
 */
export const preloadCriticalCSS = () => {
  // This would typically be used for critical CSS files
  // Material-UI styles are already optimized by the framework
}

/**
 * Initialize all critical resource preloading
 */
export const initializePreloading = () => {
  // Only preload on the client side
  if (typeof window === 'undefined') return

  // Preload critical resources
  preloadCriticalImages()
  preloadCriticalFonts()
  preloadCriticalCSS()

  // Prefetch critical components when idle
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Prefetch authentication components
      import('../pages/Auth/Login.tsx').catch(() => {})
      import('../pages/Dashboard/Dashboard').catch(() => {})
      import('../pages/Properties/Property.tsx').catch(() => {})
    })
  }
}

/**
 * Prefetch resources for the next page navigation
 */
export const prefetchPageResources = (pageName: string) => {
  const pageResources: Record<string, string[]> = {
    'dashboard': [
      // Add dashboard-specific resources
    ],
    'properties': [
      // Add properties-specific resources
    ],
    'tenants': [
      // Add tenants-specific resources
    ]
  }

  const resources = pageResources[pageName] || []
  resources.forEach(src => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = src
    document.head.appendChild(link)
  })
}