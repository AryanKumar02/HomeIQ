import React, { useState, useCallback } from 'react'
import { Box, Fade, alpha } from '@mui/material'
import OptimizedImage from './OptimizedImage'

/**
 * Props for the PropertyImage component
 */
interface PropertyImageProps {
  /** Property images array */
  images?: string[]
  /** Property title for alt text */
  title: string
  /** Image width */
  width?: number | string
  /** Image height */
  height?: number | string
  /** Whether to enable hover effects */
  interactive?: boolean
  /** Additional CSS styles */
  sx?: object
  /** Callback when image loads */
  onLoad?: () => void
  /** Callback when image fails to load */
  onError?: () => void
}

/**
 * Enhanced property image component with hover effects and multiple image support
 */
const PropertyImage: React.FC<PropertyImageProps> = ({
  images = [],
  title,
  width = '100%',
  height = 160,
  interactive = true,
  sx = {},
  onLoad,
  onError,
}) => {
  // Disable lazy loading in test environment
  const isTestEnvironment = process.env.NODE_ENV === 'test'
  const [isHovered, setIsHovered] = useState(false)

  // Get the primary image URL
  const primaryImage = images.length > 0 ? images[0] : ''

  // Get the secondary image for hover effect (if available)
  const secondaryImage = images.length > 1 ? images[1] : primaryImage

  // Handle mouse enter for hover effect
  const handleMouseEnter = useCallback(() => {
    if (interactive && images.length > 1) {
      setIsHovered(true)
    }
  }, [interactive, images.length])

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    if (interactive) {
      setIsHovered(false)
    }
  }, [interactive])

  // Create a placeholder specific to property images
  const propertyPlaceholder = React.useMemo(() => {
    const svg = `
      <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f0f2f5;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e4e6ea;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
        <g transform="translate(200,100)">
          <circle cx="0" cy="-20" r="25" fill="#c4c7cc" opacity="0.6"/>
          <rect x="-40" y="0" width="80" height="50" fill="#c4c7cc" opacity="0.6" rx="4"/>
          <polygon points="-15,15 0,0 15,15" fill="#ffffff"/>
        </g>
        <text x="50%" y="75%" font-family="Arial" font-size="14" fill="#8a8d94" text-anchor="middle">
          Property Image
        </text>
      </svg>
    `.trim()
    return `data:image/svg+xml;base64,${btoa(svg)}`
  }, [])

  return (
    <Box
      sx={{
        position: 'relative',
        width,
        height,
        overflow: 'hidden',
        borderRadius: '8px 8px 0 0',
        cursor: interactive ? 'pointer' : 'default',
        ...sx,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Primary Image */}
      <OptimizedImage
        src={primaryImage}
        alt={`Property image of ${title}`}
        width="100%"
        height={height}
        quality={85}
        lazy={!isTestEnvironment}
        placeholder={propertyPlaceholder}
        onLoad={onLoad}
        onError={onError}
        sx={{
          transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
          transform: interactive && isHovered ? 'scale(1.05)' : 'scale(1)',
          opacity: isHovered && images.length > 1 ? 0 : 1,
        }}
      />

      {/* Secondary Image for Hover Effect */}
      {interactive && images.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        >
          <Fade in={isHovered} timeout={300}>
            <Box sx={{ width: '100%', height: '100%' }}>
              <OptimizedImage
                src={secondaryImage}
                alt={`Secondary image of ${title}`}
                width="100%"
                height={height}
                quality={85}
                lazy={false} // Don't lazy load secondary image
                placeholder={propertyPlaceholder}
                sx={{
                  transform: 'scale(1.05)',
                  transition: 'transform 0.3s ease-in-out',
                }}
              />
            </Box>
          </Fade>
        </Box>
      )}

      {/* Image Count Indicator */}
      {images.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: alpha('#000000', 0.7),
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 600,
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          1/{images.length}
        </Box>
      )}

      {/* Overlay for Interactive State */}
      {interactive && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: isHovered ? alpha('#000000', 0.1) : 'transparent',
            transition: 'background-color 0.3s ease-in-out',
            pointerEvents: 'none',
          }}
        />
      )}
    </Box>
  )
}

export default PropertyImage
