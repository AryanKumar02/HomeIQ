import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Box, Skeleton } from '@mui/material'

/**
 * Props for the OptimizedImage component
 */
interface OptimizedImageProps {
  /** Image source URL */
  src: string
  /** Alt text for accessibility */
  alt: string
  /** Image width */
  width?: number | string
  /** Image height */
  height?: number | string
  /** Placeholder URL to show on error */
  placeholder?: string
  /** Whether to enable lazy loading (default: true) */
  lazy?: boolean
  /** Quality setting for image optimization (1-100, default: 80) */
  quality?: number
  /** Additional CSS styles */
  sx?: object
  /** Callback when image loads successfully */
  onLoad?: () => void
  /** Callback when image fails to load */
  onError?: () => void
  /** Object fit style (default: 'cover') */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  /** Border radius */
  borderRadius?: number | string
}

/**
 * Optimized image component with lazy loading, error handling, and performance optimizations
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width = '100%',
  height = 200,
  placeholder,
  lazy = true,
  quality = 80,
  sx = {},
  onLoad,
  onError,
  objectFit = 'cover',
  borderRadius = 0,
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(!lazy)
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Default placeholder - a simple SVG
  const defaultPlaceholder = React.useMemo(() => {
    const svg = `
      <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f5f5f5"/>
        <text x="50%" y="50%" font-family="Arial" font-size="16" fill="#9e9e9e" text-anchor="middle" dy=".3em">
          Image
        </text>
      </svg>
    `.trim()
    return `data:image/svg+xml;base64,${btoa(svg)}`
  }, [])

  const placeholderUrl = placeholder || defaultPlaceholder

  // Generate optimized image URL with quality and size parameters
  const getOptimizedImageUrl = useCallback(
    (originalUrl: string) => {
      // Handle non-string inputs
      if (!originalUrl || typeof originalUrl !== 'string') {
        return placeholderUrl
      }

      // If it's already a data URL or placeholder, return as-is
      if (originalUrl.startsWith('data:') || originalUrl === placeholderUrl) {
        return originalUrl
      }

      // For real image URLs, we could add optimization parameters
      // This would typically integrate with a CDN or image optimization service
      try {
        const url = new URL(originalUrl)

        // Add quality parameter if not already present
        if (!url.searchParams.has('q') && !url.searchParams.has('quality')) {
          url.searchParams.set('q', quality.toString())
        }

        // Add responsive sizing if dimensions are specified
        if (typeof width === 'number' && !url.searchParams.has('w')) {
          url.searchParams.set('w', Math.ceil(width * 2).toString()) // 2x for retina
        }
        if (typeof height === 'number' && !url.searchParams.has('h')) {
          url.searchParams.set('h', Math.ceil(height * 2).toString()) // 2x for retina
        }

        return url.toString()
      } catch {
        // If URL parsing fails, return original
        return originalUrl
      }
    },
    [quality, width, height, placeholderUrl]
  )

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1,
      }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [lazy, isInView])

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }, [onLoad])

  // Handle image error
  const handleError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      setIsLoading(false)
      setHasError(true)

      // Prevent infinite loop by checking if we're already showing placeholder
      if (event.currentTarget.src !== placeholderUrl) {
        event.currentTarget.src = placeholderUrl
      }

      onError?.()
    },
    [placeholderUrl, onError]
  )

  // Determine which image URL to use
  const imageUrl = React.useMemo(() => {
    if (!isInView) return placeholderUrl
    if (hasError) return placeholderUrl
    return getOptimizedImageUrl(src)
  }, [isInView, hasError, src, getOptimizedImageUrl, placeholderUrl])

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        width,
        height,
        overflow: 'hidden',
        borderRadius,
        ...sx,
      }}
    >
      {/* Loading skeleton */}
      {isLoading && isInView && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1,
          }}
        />
      )}

      {/* Actual image */}
      {isInView && (
        <Box
          // Render a native img to allow typed loading/decoding attributes
          component="img"
          ref={imgRef}
          src={imageUrl}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          sx={{
            width: '100%',
            height: '100%',
            objectFit,
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out',
          }}
        />
      )}

      {/* Placeholder for lazy loading */}
      {!isInView && (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9e9e9e',
            fontSize: '14px',
          }}
        >
          Loading...
        </Box>
      )}
    </Box>
  )
}

export default OptimizedImage
