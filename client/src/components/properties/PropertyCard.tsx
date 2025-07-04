import React, { useState } from 'react'
import {
  Card,
  CardMedia,
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
import type { Property } from '../../types/property'
import { useCurrency } from '../../hooks/useCurrency'

interface PropertyCardProps {
  property: Property
  onViewDetails?: (propertyId: string) => void
  onEdit?: (propertyId: string) => void
  onDelete?: (propertyId: string) => void
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme()
  const { formatPrice } = useCurrency()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  const menuOpen = Boolean(anchorEl)

  // Get primary image or use placeholder
  const primaryImage = property.images?.find(img => img.isPrimary)
  const hasImage = primaryImage?.url || property.images?.[0]?.url
  
  // Debug logging
  React.useEffect(() => {
    if (hasImage) {
      console.log('Property:', property.title, 'Image URL:', hasImage)
    }
  }, [hasImage, property.title])
  
  // Create a data URL placeholder
  const createPlaceholder = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 200
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#f5f5f5'
      ctx.fillRect(0, 0, 400, 200)
      ctx.fillStyle = '#9e9e9e'
      ctx.font = '16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Property Image', 200, 100)
    }
    return canvas.toDataURL()
  }

  const placeholderUrl = React.useMemo(() => createPlaceholder(), [])
  const imageUrl = hasImage || placeholderUrl

  // Handle image error
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    // Prevent infinite loop by checking if we're already showing placeholder
    if (event.currentTarget.src !== placeholderUrl) {
      console.log('Image failed to load:', event.currentTarget.src)
      console.log('Error details:', event)
      
      // Test if it's a CORS issue by trying to fetch the URL
      fetch(event.currentTarget.src, { mode: 'no-cors' })
        .then(() => console.log('Image exists but CORS issue'))
        .catch(err => console.log('Image fetch error:', err))
      
      event.currentTarget.src = placeholderUrl
    }
  }

  // Format price using localized currency
  const formatPropertyPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return numPrice ? formatPrice(numPrice) : 'Price not set'
  }

  // Format address
  const formatAddress = () => {
    const { street, city, state } = property.address
    return `${street}, ${city}, ${state}`
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

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.1)',
        transition: 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
        },
        cursor: 'pointer',
        width: '320px',
        minWidth: '320px',
        maxWidth: '320px',
        minHeight: '320px',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
      onClick={handleViewDetails}
    >
      {/* Image Section - 50% of card height */}
      <Box sx={{ position: 'relative', height: '160px', flex: '0 0 auto' }}>
        <CardMedia
          component="img"
          height="160"
          image={imageUrl}
          alt={property.title}
          onError={handleImageError}
          sx={{
            objectFit: 'cover',
            borderTopLeftRadius: 2,
            borderTopRightRadius: 2,
          }}
        />
        
        {/* Status Badge */}
        <Chip
          label={statusConfig.label}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: statusConfig.color,
            color: 'white',
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 24,
            '& .MuiChip-label': {
              px: 1,
            },
          }}
        />

        {/* Menu Button */}
        <IconButton
          onClick={handleMenuClick}
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
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
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.grey[600],
                  fontSize: '0.85rem',
                  mb: 1,
                  fontWeight: 600,
                }}
              >
                {property.units?.length || 0} Units Available
              </Typography>
              
              {/* Show first 2-3 units with pricing */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {property.units?.slice(0, 2).map((unit, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.grey[700],
                        fontSize: '0.8rem',
                      }}
                    >
                      Unit {unit.unitNumber}: {unit.bedrooms}BR/{unit.bathrooms}BA
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.secondary.main,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      {formatPropertyPrice(unit.monthlyRent)} /mo
                    </Typography>
                  </Box>
                ))}
                
                {property.units && property.units.length > 2 && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.grey[500],
                      fontSize: '0.75rem',
                      fontStyle: 'italic',
                    }}
                  >
                    +{property.units.length - 2} more units
                  </Typography>
                )}
              </Box>
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
                {formatPropertyPrice(property.financials.monthlyRent)} /month
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
                    {property.bedrooms} bed
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
                    {property.bathrooms} bath
                  </Typography>
                </Box>
              </Box>
            </>
          )}
        </Box>

        {/* View Details Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={handleViewDetails}
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
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: 2,
            minWidth: 160,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <MenuItem onClick={handleEdit} sx={{ py: 1, px: 2 }}>
          <EditIcon sx={{ mr: 1, fontSize: '1.1rem' }} />
          Edit Property
        </MenuItem>
        <MenuItem 
          onClick={handleDeleteClick} 
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
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Delete Property
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '1rem' }}>
            Are you sure you want to delete &ldquo;{property.title}&rdquo;? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handleDeleteCancel}
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