import React from 'react'
import Box from '@mui/material/Box'

interface SplashImageProps {
  imageName: string
  alt: string
  objectPosition?: string
  sx?: object
}

/**
 * Optimized splash image component that serves WebP with PNG fallback
 * for auth page background images
 */
const SplashImage: React.FC<SplashImageProps> = ({ 
  imageName, 
  alt, 
  objectPosition = 'center',
  sx = {} 
}) => {
  const webpSrc = `/assets/splashes/${imageName}.webp`
  const pngSrc = `/assets/splashes/${imageName}.png`

  return (
    <picture>
      {/* WebP version for modern browsers */}
      <source srcSet={webpSrc} type="image/webp" />
      {/* PNG fallback for older browsers */}
      <Box
        component="img"
        src={pngSrc}
        alt={alt}
        sx={{
          width: '100%',
          height: '100vh',
          objectFit: 'cover',
          objectPosition,
          ...sx
        }}
      />
    </picture>
  )
}

export default SplashImage