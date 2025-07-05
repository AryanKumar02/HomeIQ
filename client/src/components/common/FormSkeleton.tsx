import React from 'react'
import { Box, Skeleton, Card, CardContent } from '@mui/material'
import Grid from '@mui/material/Grid'

/**
 * Skeleton loader for form fields
 */
const FormFieldSkeleton: React.FC<{ width?: string }> = ({ width = '100%' }) => (
  <Box sx={{ mb: 3 }}>
    <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
    <Skeleton variant="rounded" width={width} height={56} />
  </Box>
)

/**
 * Skeleton loader for property creation/edit forms
 */
const PropertyFormSkeleton: React.FC = () => {
  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', width: '100%' }}>
      {/* Basic Information Card */}
      <Card sx={{ mb: 4, borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Skeleton variant="text" width="25%" height={32} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
          
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormFieldSkeleton />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormFieldSkeleton />
            </Grid>
            <Grid size={12}>
              <FormFieldSkeleton />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormFieldSkeleton />
            </Grid>
            <Grid size={12}>
              <FormFieldSkeleton />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormFieldSkeleton />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormFieldSkeleton />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Property Details Card */}
      <Card sx={{ mb: 4, borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Skeleton variant="text" width="20%" height={32} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="35%" height={20} />
          </Box>
          
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormFieldSkeleton />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormFieldSkeleton />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormFieldSkeleton />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormFieldSkeleton />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Images Upload Card */}
      <Card sx={{ mb: 4, borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Skeleton variant="text" width="18%" height={32} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="32%" height={20} />
          </Box>
          
          {/* Upload area skeleton */}
          <Skeleton 
            variant="rounded" 
            width="100%" 
            height={120} 
            sx={{ mb: 4, borderRadius: 2 }}
          />
          
          {/* Image grid skeleton */}
          <Grid container spacing={3}>
            {Array.from({ length: 3 }, (_, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Box sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <Skeleton variant="rectangular" width="100%" height={200} />
                  <Box sx={{ p: 2 }}>
                    <Skeleton variant="rounded" width="100%" height={40} />
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Financial Information Card */}
      <Card sx={{ mb: 4, borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Skeleton variant="text" width="25%" height={32} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="45%" height={20} />
          </Box>
          
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormFieldSkeleton />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormFieldSkeleton />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormFieldSkeleton />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormFieldSkeleton />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormFieldSkeleton />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormFieldSkeleton />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}

export default PropertyFormSkeleton