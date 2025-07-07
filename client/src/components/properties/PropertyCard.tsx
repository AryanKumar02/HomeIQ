import React, { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
} from '@mui/material'
import {
  Bed as BedIcon,
  Bathtub as BathtubIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material'
import {
  Home as HomeIcon,
  Apartment as ApartmentIcon,
  Business as BusinessIcon,
  Landscape as LandIcon,
  SquareFoot as SquareFootIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material'
import type { Property } from '../../types/property'
import { useCurrency } from '../../hooks/useCurrency'
import { PropertyImage } from '../common'
import { propertiesApi } from '../../api/properties'
import { propertyKeys } from '../../hooks/useProperties'

/**
 * Props for the PropertyCard component
 */
interface PropertyCardProps {
  /** The property data to display */
  property: Property
  /** Callback function called when the user wants to view property details */
  onViewDetails?: (propertyId: string) => void
  /** Callback function called when the user wants to edit the property */
  onEdit?: (propertyId: string) => void
  /** Callback function called when the user wants to delete the property */
  onDelete?: (propertyId: string) => void
}

/**
 * PropertyCard component displays a property in a card format with image, details, and actions.
 *
 * Features:
 * - Displays property image with fallback placeholder
 * - Shows property status, type, and key details (bedrooms, bathrooms, etc.)
 * - Different layouts for apartments (shows unit information) vs other property types
 * - Interactive menu with edit/delete options
 * - Delete confirmation dialog
 * - Fully accessible with ARIA labels and keyboard navigation
 * - Responsive design that works on all screen sizes
 *
 * @param props - The component props
 * @returns A card component displaying property information
 */
const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme()
  const { formatPrice } = useCurrency()
  const queryClient = useQueryClient()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const menuOpen = Boolean(anchorEl)

  // Prefetch property details on hover for better UX
  const handleMouseEnter = () => {
    if (property._id) {
      void queryClient.prefetchQuery({
        queryKey: propertyKeys.detail(property._id),
        queryFn: () => propertiesApi.getById(property._id!),
        staleTime: 5 * 60 * 1000, // 5 minutes
      })
    }
  }

  // Handle image error (PropertyImage component handles its own errors)
  const handleImageError = () => {
    // PropertyImage component handles its own error states
    console.warn('Image error in PropertyCard - handled by PropertyImage component')
  }

  // Format price using localized currency
  const formatPropertyPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return numPrice ? formatPrice(numPrice) : 'Price not set'
  }

  // Format address
  const formatAddress = () => {
    if (!property.address) return 'Address not available'
    const { street, city, state } = property.address
    const parts = [street, city, state].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'Address not available'
  }

  // Get status color and label
  const getStatusConfig = () => {
    switch (property.status) {
      case 'available':
        return { color: '#4caf50', label: 'Available' }
      case 'occupied':
        return { color: theme.palette.primary.main, label: 'Occupied' }
      case 'maintenance':
        return { color: '#ff9800', label: 'Maintenance' }
      case 'off-market':
        return { color: '#9e9e9e', label: 'Off Market' }
      case 'pending':
        return { color: '#f9a825', label: 'Pending' }
      default:
        return { color: '#9e9e9e', label: property.status }
    }
  }

  const statusConfig = getStatusConfig()

  // Get property type icon and label
  const getPropertyTypeConfig = () => {
    switch (property.propertyType) {
      case 'house':
        return { icon: HomeIcon, label: 'House' }
      case 'apartment':
        return { icon: ApartmentIcon, label: 'Apartment' }
      case 'condo':
        return { icon: ApartmentIcon, label: 'Condo' }
      case 'townhouse':
        return { icon: HomeIcon, label: 'Townhouse' }
      case 'duplex':
        return { icon: HomeIcon, label: 'Duplex' }
      case 'commercial':
        return { icon: BusinessIcon, label: 'Commercial' }
      case 'land':
        return { icon: LandIcon, label: 'Land' }
      default:
        return { icon: HomeIcon, label: property.propertyType || 'Property' }
    }
  }

  const propertyTypeConfig = getPropertyTypeConfig()
  const PropertyTypeIcon = propertyTypeConfig.icon

  const handleViewDetails = () => {
    if (onViewDetails && property._id) {
      onViewDetails(property._id)
    }
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleEdit = () => {
    handleMenuClose()
    if (onEdit && property._id) {
      onEdit(property._id)
    }
  }

  const handleDeleteClick = () => {
    handleMenuClose()
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(false)
    if (onDelete && property._id) {
      onDelete(property._id)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
  }

  const handleCardClick = () => {
    // Don't navigate if menu is open
    if (menuOpen) {
      return
    }
    handleViewDetails()
  }

  const handleViewDetailsButtonClick = (event: React.MouseEvent) => {
    event.stopPropagation() // Prevent card click
    handleViewDetails()
  }

  return (
    <Card
      component="article"
      role="button"
      tabIndex={0}
      aria-label={`Property: ${property.title}. Click to view details.`}
      sx={{
        borderRadius: 2,
        boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.1)',
        transition: 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
        },
        '&:focus': {
          outline: `2px solid ${theme.palette.secondary.main}`,
          outlineOffset: '2px',
        },
        cursor: 'pointer',
        width: { xs: '260px', sm: '295px', md: '315px' },
        minWidth: { xs: '260px', sm: '295px', md: '315px' },
        maxWidth: { xs: '260px', sm: '295px', md: '315px' },
        minHeight: { xs: '300px', sm: '335px', md: '355px' },
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
    >
      {/* Image Section - 50% of card height */}
      <Box sx={{ position: 'relative', height: { xs: '150px', sm: '167px', md: '177px' }, flex: '0 0 auto' }}>
        <PropertyImage
          images={property.images?.map((img) => img.url) || []}
          title={property.title}
          width="100%"
          height="100%"
          interactive={true}
          onError={handleImageError}
        />

        {/* Status Badge - Bottom Right */}
        <Chip
          label={statusConfig.label}
          aria-label={`Property status: ${statusConfig.label}`}
          sx={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            backgroundColor: statusConfig.color,
            color: 'white',
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 24,
            '& .MuiChip-label': {
              px: 1,
              color: 'white',
            },
          }}
        />

        {/* Property Type Badge - Bottom Left */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
            borderRadius: 1,
            px: 1,
            py: 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <PropertyTypeIcon sx={{ fontSize: '0.8rem', color: theme.palette.grey[600] }} />
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: theme.palette.grey[700],
            }}
          >
            {propertyTypeConfig.label}
          </Typography>
        </Box>

        {/* Menu Button */}
        <IconButton
          onClick={handleMenuClick}
          aria-label={`Property options for ${property.title}`}
          aria-haspopup="true"
          aria-expanded={menuOpen}
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            },
            '&:focus': {
              outline: 'none',
            },
            width: 32,
            height: 32,
          }}
        >
          <MoreVertIcon sx={{ fontSize: '1.2rem' }} />
        </IconButton>
      </Box>

      {/* Content Section - 50% of card height */}
      <CardContent
        sx={{
          p: 2,
          '&:last-child': { pb: 3 },
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* Property Info */}
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1rem',
              color: theme.palette.grey[900],
              mb: 0.5,
              lineHeight: 1.2,
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {property.title}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: theme.palette.grey[600],
              fontSize: '0.85rem',
              mb: 0.5,
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {formatAddress()}
          </Typography>

          {/* Financial and Property Info - Different for Apartments vs Other Properties */}
          {property.propertyType === 'apartment' ? (
            // Apartment: Show Units Information
            <Box sx={{ mb: 2 }}>
              {property.units && property.units.length > 0 ? (
                <>
                  {/* Unit Summary */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.grey[600],
                        fontSize: '0.85rem',
                        fontWeight: 600,
                      }}
                    >
                      {property.units.length} Unit{property.units.length !== 1 ? 's' : ''}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.success.main,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      {property.units.filter((unit) => unit.status === 'available').length}{' '}
                      Available
                    </Typography>
                  </Box>

                  {/* Total Revenue Potential */}
                  <Box sx={{ mb: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.secondary.main,
                        fontSize: '0.85rem',
                        fontWeight: 700,
                      }}
                    >
                      Total Revenue:{' '}
                      {formatPropertyPrice(
                        property.units.reduce((total, unit) => {
                          if (!unit.monthlyRent) return total
                          const rent =
                            typeof unit.monthlyRent === 'string'
                              ? parseFloat(unit.monthlyRent)
                              : unit.monthlyRent
                          return total + (isNaN(rent) || rent < 0 ? 0 : rent)
                        }, 0)
                      )}{' '}
                      /month
                    </Typography>
                  </Box>

                  {/* Show first 2 units with status and pricing */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {property.units
                      .sort((a, b) => {
                        // Sort by status: available first, then occupied, then others
                        const statusPriority = {
                          available: 0,
                          occupied: 1,
                          maintenance: 2,
                          'off-market': 3,
                        }
                        return statusPriority[a.status] - statusPriority[b.status]
                      })
                      .slice(0, 2)
                      .map((unit, index) => {
                        // Get status color and label
                        const getUnitStatusConfig = (status: string) => {
                          switch (status) {
                            case 'available':
                              return {
                                color: theme.palette.success.main,
                                label: 'Available',
                                bgColor: theme.palette.success.light,
                              }
                            case 'occupied':
                              return {
                                color: theme.palette.primary.main,
                                label: 'Occupied',
                                bgColor: theme.palette.primary.light,
                              }
                            case 'maintenance':
                              return {
                                color: theme.palette.warning.main,
                                label: 'Maintenance',
                                bgColor: theme.palette.warning.light,
                              }
                            case 'off-market':
                              return {
                                color: theme.palette.grey[600],
                                label: 'Off Market',
                                bgColor: theme.palette.grey[300],
                              }
                            default:
                              return {
                                color: theme.palette.grey[600],
                                label: status,
                                bgColor: theme.palette.grey[300],
                              }
                          }
                        }

                        const statusConfig = getUnitStatusConfig(unit.status)

                        return (
                          <Box
                            key={index}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              py: 0.25,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: theme.palette.grey[700],
                                  fontSize: '0.8rem',
                                }}
                              >
                                Unit {unit.unitNumber || 'N/A'}: {unit.bedrooms || 0}BR/
                                {unit.bathrooms || 0}BA
                              </Typography>
                              <Box
                                sx={{
                                  backgroundColor: statusConfig.color,
                                  color: 'white',
                                  px: 0.5,
                                  py: 0.125,
                                  borderRadius: 0.5,
                                  fontSize: '0.65rem',
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                }}
                              >
                                {statusConfig.label}
                              </Box>
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                color:
                                  unit.status === 'available' || unit.status === 'occupied'
                                    ? theme.palette.secondary.main
                                    : theme.palette.grey[500],
                                fontSize: '0.8rem',
                                fontWeight: 600,
                              }}
                            >
                              {unit.monthlyRent &&
                              (unit.status === 'available' || unit.status === 'occupied')
                                ? formatPropertyPrice(unit.monthlyRent)
                                : '--'}{' '}
                              /mo
                            </Typography>
                          </Box>
                        )
                      })}

                    {property.units.length > 2 && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.grey[500],
                          fontSize: '0.75rem',
                          fontStyle: 'italic',
                          textAlign: 'center',
                          mt: 0.5,
                        }}
                      >
                        +{property.units.length - 2} more unit
                        {property.units.length - 2 !== 1 ? 's' : ''}
                      </Typography>
                    )}
                  </Box>
                </>
              ) : (
                // Empty apartment state
                <Box sx={{ textAlign: 'center', py: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.grey[500],
                      fontSize: '0.8rem',
                      fontStyle: 'italic',
                    }}
                  >
                    No units configured
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.grey[400],
                      fontSize: '0.75rem',
                    }}
                  >
                    Add units to get started
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            // Non-Apartment: Show Traditional Property Information
            <>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: theme.palette.secondary.main,
                  mb: 0.5,
                }}
              >
                {formatPropertyPrice(property.financials?.monthlyRent)} /month
              </Typography>

              {/* Bedroom and Bathroom Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <BedIcon sx={{ fontSize: '1rem', color: theme.palette.grey[600] }} />
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.grey[600],
                      fontSize: '0.85rem',
                    }}
                  >
                    {property.bedrooms || 0} bed
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.grey[400], fontSize: '0.85rem' }}
                >
                  •
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <BathtubIcon sx={{ fontSize: '1rem', color: theme.palette.grey[600] }} />
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.grey[600],
                      fontSize: '0.85rem',
                    }}
                  >
                    {property.bathrooms || 0} bath
                  </Typography>
                </Box>
              </Box>

              {/* Additional Property Metadata */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                {/* Square Footage */}
                {property.squareFootage && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <SquareFootIcon sx={{ fontSize: '0.9rem', color: theme.palette.grey[600] }} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.grey[600],
                        fontSize: '0.8rem',
                      }}
                    >
                      {typeof property.squareFootage === 'string'
                        ? parseFloat(property.squareFootage).toLocaleString()
                        : property.squareFootage.toLocaleString()}{' '}
                      sq ft
                    </Typography>
                  </Box>
                )}

                {/* Year Built */}
                {property.yearBuilt && (
                  <>
                    {property.squareFootage && (
                      <Typography
                        variant="body2"
                        sx={{ color: theme.palette.grey[400], fontSize: '0.8rem' }}
                      >
                        •
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarIcon sx={{ fontSize: '0.9rem', color: theme.palette.grey[600] }} />
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.grey[600],
                          fontSize: '0.8rem',
                        }}
                      >
                        Built {property.yearBuilt}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </>
          )}
        </Box>

        {/* View Details Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={handleViewDetailsButtonClick}
          aria-label={`View details of ${property.title}`}
          sx={{
            backgroundColor: theme.palette.secondary.main,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.85rem',
            py: 0.75,
            minHeight: 'auto',
            height: '36px',
            '&:hover': {
              backgroundColor: theme.palette.secondary.dark,
            },
            '&:focus': {
              outline: 'none',
            },
          }}
        >
          View Details
        </Button>
      </CardContent>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            'aria-labelledby': 'property-options-button',
            role: 'menu',
          },
        }}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: 2,
            minWidth: 160,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <MenuItem
          onClick={handleEdit}
          role="menuitem"
          aria-label={`Edit ${property.title}`}
          sx={{ py: 1, px: 2 }}
        >
          <EditIcon sx={{ mr: 1, fontSize: '1.1rem' }} />
          Edit Property
        </MenuItem>
        <MenuItem
          onClick={handleDeleteClick}
          role="menuitem"
          aria-label={`Delete ${property.title}`}
          sx={{
            py: 1,
            px: 2,
            color: 'error.main',
            '&:hover': {
              backgroundColor: 'error.light',
              color: 'error.dark',
            },
          }}
        >
          <DeleteIcon sx={{ mr: 1, fontSize: '1.1rem' }} />
          Delete Property
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle id="delete-dialog-title" sx={{ fontWeight: 600 }}>
          Delete Property
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description" sx={{ fontSize: '1rem' }}>
            Are you sure you want to delete &ldquo;{property.title}&rdquo;? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={handleDeleteCancel}
            aria-label="Cancel deletion"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            aria-label={`Confirm deletion of ${property.title}`}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Delete Property
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default PropertyCard
