import React, { useMemo } from 'react'
import { Box, Typography, Card, CardContent } from '@mui/material'
import { styled } from '@mui/material/styles'
import { HomeOutlined } from '@mui/icons-material'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { propertiesApi } from '../../api'
import { useCurrency } from '../../hooks/useCurrency'
import useRealTimeAnalytics from '../../hooks/useRealTimeAnalytics'

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: 16,
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease-in-out',
  border: 'none',
  height: 350,
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    height: 330,
    borderRadius: 12,
  },
  '&:hover': {
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-2px)',
  },
}))

const PropertyItem = styled(Box)<{ isLast?: boolean; rank: number }>(({ isLast }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '12px 0',
  borderBottom: isLast ? 'none' : '1px solid rgba(0, 0, 0, 0.06)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateX(2px)',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 8,
    padding: '12px 8px',
    margin: '0 -8px',
  },
}))

const RankIndicator = styled(Box)<{ rank: number }>(({ rank }) => {
  const colors = {
    0: '#3b82f6', // Blue
    1: '#10b981', // Green
    2: '#f59e0b', // Orange
  }

  return {
    width: 24,
    height: 24,
    borderRadius: '50%',
    backgroundColor: colors[rank as keyof typeof colors] || '#6b7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'white',
    flexShrink: 0,
  }
})

interface Property {
  _id?: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
  }
  financials?: {
    monthlyRent?: string | number
    propertyValue?: string | number
    monthlyExpenses?: string | number
  }
  units?: Array<{
    _id?: string
    unitNumber?: string
    monthlyRent?: string | number
    occupancy?: {
      isOccupied?: boolean
      tenant?: string
      leaseStart?: string
      leaseEnd?: string
      leaseType?: string
    }
  }>
  occupancy?: {
    isOccupied?: boolean
    tenant?: string
    leaseStart?: string
    leaseEnd?: string
    leaseType?: string
  }
}

interface PropertyData {
  name: string
  units: number
  occupancy: number
  monthlyRevenue: number
}

const TopPropertiesCard: React.FC = () => {
  const { formatPrice } = useCurrency()
  const queryClient = useQueryClient()

  // Fetch properties data
  const {
    data: properties = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['properties'],
    queryFn: propertiesApi.getAll,
    staleTime: 0, // No stale time - always fetch fresh data
    refetchOnWindowFocus: true,
    refetchInterval: 5000, // Refetch every 5 seconds as fallback
  })

  // Real-time analytics WebSocket integration
  useRealTimeAnalytics({
    onAnalyticsUpdate: () => {
      console.log('TopPropertiesCard - Analytics update received - refreshing properties')
      // Force immediate refetch instead of just invalidating
      void refetch()
      // Also invalidate to ensure cache is updated
      void queryClient.invalidateQueries({ queryKey: ['properties'] })
    },
  })

  // Calculate property data with revenue from real properties
  const { topProperties, totalPortfolio } = useMemo(() => {
    if (!properties.length) {
      return {
        topProperties: [],
        totalPortfolio: 0,
      }
    }

    // Process properties to calculate revenue and occupancy
    const processedProperties: PropertyData[] = properties.map((property: Property) => {
      const street = property.address?.street || 'Unknown Property'
      const units = property.units || []

      let totalUnits: number
      let occupiedUnits: number
      let occupancy: number

      if (units.length > 0) {
        // Multi-unit property
        totalUnits = units.length
        occupiedUnits = units.filter((unit) => unit.occupancy?.isOccupied === true).length
        occupancy = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0
      } else {
        // Single-unit property
        totalUnits = 1
        occupiedUnits = property.occupancy?.isOccupied === true ? 1 : 0
        occupancy = occupiedUnits > 0 ? 100 : 0
      }

      // Calculate monthly revenue from occupied units
      let monthlyRevenue = 0
      if (units.length > 0) {
        // Multi-unit property: sum rent from occupied units
        monthlyRevenue = units
          .filter((unit) => unit.occupancy?.isOccupied === true && unit.monthlyRent)
          .reduce((sum, unit) => {
            const rent =
              typeof unit.monthlyRent === 'string'
                ? parseFloat(unit.monthlyRent)
                : unit.monthlyRent || 0
            return sum + rent
          }, 0)
      } else if (property.occupancy?.isOccupied === true && property.financials?.monthlyRent) {
        // Single-unit property: use property-level rent if occupied
        monthlyRevenue =
          typeof property.financials.monthlyRent === 'string'
            ? parseFloat(property.financials.monthlyRent)
            : property.financials.monthlyRent
      }

      return {
        name: street,
        units: totalUnits || 1,
        occupancy,
        monthlyRevenue,
      }
    })

    // Sort by monthly revenue (highest first) and show all properties with actual revenue
    const sortedProperties = processedProperties
      .filter((p) => p.monthlyRevenue > 0 && p.occupancy > 0) // Only include properties with revenue AND occupancy
      .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)

    // Calculate total portfolio revenue
    const totalPortfolio = sortedProperties.reduce((sum, p) => sum + p.monthlyRevenue, 0)

    return {
      topProperties: sortedProperties,
      totalPortfolio,
    }
  }, [properties])

  return (
    <StyledCard>
      <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header matching your app's style */}
        <Box
          sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              fontSize: '0.8rem',
              textTransform: 'none',
              lineHeight: 1.3,
            }}
          >
            Top Properties
          </Typography>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#3b82f6',
            }}
          >
            <HomeOutlined sx={{ fontSize: 16, color: '#ffffff' }} />
          </Box>
        </Box>

        {/* Main content area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Properties List */}
          <Box
            sx={{
              flex: 1,
              maxHeight: 220,
              overflowY: 'auto',
              pr: 0.5,
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(0,0,0,0.1)',
                borderRadius: '2px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '2px',
                '&:hover': {
                  background: 'rgba(0,0,0,0.4)',
                },
              },
            }}
          >
            {isLoading ? (
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', fontSize: '0.75rem', textAlign: 'center', py: 2 }}
              >
                Loading...
              </Typography>
            ) : topProperties.length === 0 ? (
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', fontSize: '0.75rem', textAlign: 'center', py: 2 }}
              >
                No properties with revenue data
              </Typography>
            ) : (
              topProperties.map((property, index) => (
                <PropertyItem key={index} isLast={index === topProperties.length - 1} rank={index}>
                  <RankIndicator rank={index}>{index + 1}</RankIndicator>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.primary',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        lineHeight: 1.4,
                        mb: 0.5,
                      }}
                    >
                      {property.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.7rem',
                        fontWeight: 500,
                      }}
                    >
                      {property.units} {property.units === 1 ? 'unit' : 'units'} •{' '}
                      {property.occupancy}% occupied
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.primary',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        lineHeight: 1.2,
                      }}
                    >
                      {formatPrice(property.monthlyRevenue)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '0.65rem',
                        fontWeight: 500,
                      }}
                    >
                      /month
                    </Typography>
                  </Box>
                </PropertyItem>
              ))
            )}
          </Box>
        </Box>

        {/* Total Portfolio - clean style matching your app */}
        {totalPortfolio > 0 && (
          <Box
            sx={{
              mt: 2,
              pt: 1.5,
              borderTop: '1px solid rgba(0, 0, 0, 0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
                fontWeight: 500,
              }}
            >
              Total Portfolio
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                fontSize: '0.9rem',
                fontWeight: 700,
              }}
            >
              {formatPrice(totalPortfolio)}
            </Typography>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  )
}

export default TopPropertiesCard
