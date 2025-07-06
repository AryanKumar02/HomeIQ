import React from 'react'
import { Card, CardContent, Box, Skeleton } from '@mui/material'

/**
 * Skeleton loader for PropertyCard component.
 * Provides a visual placeholder while property data is loading.
 *
 * Features:
 * - Matches the exact layout and dimensions of PropertyCard
 * - Animated skeleton effects using Material-UI Skeleton component
 * - Responsive design that works on all screen sizes
 * - Shows placeholders for image, badges, content, and buttons
 *
 * @returns A skeleton loader component matching PropertyCard layout
 */
const PropertyCardSkeleton: React.FC = () => {
  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.1)',
        width: '320px',
        minWidth: '320px',
        maxWidth: '320px',
        minHeight: '320px',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Image Section Skeleton */}
      <Box sx={{ position: 'relative', height: '160px', flex: '0 0 auto' }}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height="160px"
          sx={{
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
          }}
        />

        {/* Status Badge Skeleton */}
        <Skeleton
          variant="rounded"
          width={80}
          height={24}
          sx={{
            position: 'absolute',
            bottom: 12,
            right: 12,
          }}
        />

        {/* Property Type Badge Skeleton */}
        <Skeleton
          variant="rounded"
          width={70}
          height={20}
          sx={{
            position: 'absolute',
            bottom: 12,
            left: 12,
          }}
        />

        {/* Menu Button Skeleton */}
        <Skeleton
          variant="circular"
          width={32}
          height={32}
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
          }}
        />
      </Box>

      {/* Content Section Skeleton */}
      <CardContent
        sx={{
          p: 2,
          '&:last-child': { pb: 3 },
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Property Info Skeleton */}
        <Box>
          {/* Title */}
          <Skeleton variant="text" width="85%" height={24} sx={{ mb: 0.5 }} />

          {/* Address */}
          <Skeleton variant="text" width="75%" height={20} sx={{ mb: 1 }} />

          {/* Price */}
          <Skeleton variant="text" width="60%" height={28} sx={{ mb: 1 }} />

          {/* Bedroom and Bathroom Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Skeleton variant="circular" width={16} height={16} />
              <Skeleton variant="text" width={40} height={20} />
            </Box>
            <Skeleton variant="text" width={8} height={20} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Skeleton variant="circular" width={16} height={16} />
              <Skeleton variant="text" width={45} height={20} />
            </Box>
          </Box>

          {/* Additional Property Metadata */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Skeleton variant="circular" width={14} height={14} />
              <Skeleton variant="text" width={60} height={18} />
            </Box>
            <Skeleton variant="text" width={8} height={18} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Skeleton variant="circular" width={14} height={14} />
              <Skeleton variant="text" width={50} height={18} />
            </Box>
          </Box>
        </Box>

        {/* View Details Button Skeleton */}
        <Skeleton variant="rounded" width="100%" height={36} sx={{ borderRadius: 2 }} />
      </CardContent>
    </Card>
  )
}

/**
 * Props for PropertyCardSkeletonGrid component
 */
interface PropertyCardSkeletonGridProps {
  /** Number of skeleton cards to display. Defaults to 6. */
  count?: number
}

/**
 * Grid of PropertyCard skeletons for loading states.
 *
 * Displays multiple PropertyCardSkeleton components in a responsive grid layout
 * that matches the actual PropertyCard grid layout.
 *
 * @param props - The component props
 * @returns A grid of skeleton loaders
 */
export const PropertyCardSkeletonGrid: React.FC<PropertyCardSkeletonGridProps> = ({
  count = 6,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
        mb: 4,
        justifyContent: { xs: 'center', sm: 'flex-start' },
      }}
    >
      {Array.from({ length: count }, (_, index) => (
        <PropertyCardSkeleton key={index} />
      ))}
    </Box>
  )
}

export default PropertyCardSkeleton
