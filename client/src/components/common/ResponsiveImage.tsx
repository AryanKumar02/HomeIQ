import React, { useState, useCallback } from 'react'
import { Box, Skeleton } from '@mui/material'

interface ResponsiveImageProps {
  /** Base image filename (without extension) */
  src: string
  /** Alt text for accessibility */
  alt: string
  /** Image width */
  width?: number | string
  /** Image height */
  height?: number | string
  /** Object fit style (default: 'cover') */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  /** Border radius */
  borderRadius?: number | string
  /** Whether to enable lazy loading (default: true) */
  lazy?: boolean
  /** Additional CSS styles */
  sx?: object
  /** Object position for cropping */
  objectPosition?: string
  /** Priority loading for above-the-fold images */
  priority?: boolean
}

/**
 * Responsive image component that serves WebP format with PNG fallback
 * and implements lazy loading for performance optimization
 */
const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  width = '100%',
  height = 'auto',
  objectFit = 'cover',
  borderRadius = 0,
  lazy = true,
  sx = {},
  objectPosition = 'center',
  priority = false,
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [webpSupported, setWebpSupported] = useState<boolean | null>(null)

  // Check WebP support
  React.useEffect(() => {
    if (webpSupported !== null) return

    const webp = new Image()
    webp.onload = webp.onerror = () => {
      setWebpSupported(webp.height === 2)
    }
    webp.src =
      'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
  }, [webpSupported])

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
  }, [])

  // Handle image error - fallback to PNG
  const handleError = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      const img = event.currentTarget

      // If we're showing WebP and it failed, try PNG
      if (img.src.includes('.webp')) {
        img.src = src.endsWith('.png') ? src : `${src}.png`
        return
      }

      // If PNG also failed, show error state
      setIsLoading(false)
      setHasError(true)
    },
    [src]
  )

  // Determine image source based on WebP support
  const getImageSrc = useCallback(() => {
    if (hasError) return ''

    // If WebP is supported and we have a WebP version, use it
    if (webpSupported && !src.endsWith('.png')) {
      return `${src}.webp`
    }

    // Fallback to PNG
    return src.endsWith('.png') ? src : `${src}.png`
  }, [src, webpSupported, hasError])

  const imageSrc = getImageSrc()

  if (hasError) {
    return (
      <Box
        sx={{
          width,
          height,
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9e9e9e',
          fontSize: '14px',
          borderRadius,
          ...sx,
        }}
      >
        Failed to load image
      </Box>
    )
  }

  return (
    <Box
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
      {isLoading && (
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
      <Box
        component="img"
        src={imageSrc}
        alt={alt}
        loading={lazy && !priority ? 'lazy' : 'eager'}
        onLoad={handleLoad}
        onError={handleError}
        sx={{
          width: '100%',
          height: '100%',
          objectFit,
          objectPosition,
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
          display: 'block',
        }}
      />
    </Box>
  )
}

export default ResponsiveImage
