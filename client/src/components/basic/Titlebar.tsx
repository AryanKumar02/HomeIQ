import React, { useState } from 'react'
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import SearchBar from './SearchBar'
import CustomButton from './CustomButton'

interface TitlebarProps {
  onAdd?: () => void
  onSearch?: (term: string) => void
  onClearSearch?: () => void
  title?: string
  searchPlaceholder?: string
  addButtonText?: string
  showSearch?: boolean
  searchTerm?: string
  children?: React.ReactNode // For custom content instead of search
}

const Titlebar: React.FC<TitlebarProps> = ({
  onAdd,
  onSearch,
  onClearSearch,
  title = 'Properties',
  searchPlaceholder = 'Search properties...',
  addButtonText = 'Add Property',
  showSearch = true,
  searchTerm = '',
  children,
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: { xs: 1, sm: 1.5, md: 2.5 },
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontFamily: theme.typography.fontFamily,
            fontWeight: 700,
            letterSpacing: '0.02em',
            fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.55rem' },
            mr: { xs: 1, sm: 2, md: 4 },
            ml: { xs: '40px', sm: '40px', md: 0 }, // Move title right on mobile, keep other sizes
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}
        >
          {title}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 1, sm: 2, md: 4 },
          }}
        >
          {/* Desktop Search Bar */}
          {showSearch && !isMobile && (
            <SearchBar
              placeholder={searchPlaceholder}
              onSearch={onSearch}
              width={{ xs: '150px', sm: '200px', md: '300px' }}
            />
          )}

          {/* Mobile Search Icon */}
          {showSearch && isMobile && (
            <Box sx={{ position: 'relative' }}>
              <IconButton
                onClick={() => setMobileSearchOpen(true)}
                sx={{
                  p: 0,
                  backgroundColor: searchTerm ? theme.palette.secondary.main : 'transparent',
                  border: 'none',
                  ml: 2, // Add left padding from burger menu
                  mt: 0.5, // Bring it down slightly
                  borderRadius: 1,
                  px: searchTerm ? 1 : 0,
                  '&:hover': {
                    backgroundColor: searchTerm ? theme.palette.secondary.dark : 'rgba(0, 0, 0, 0.04)',
                    color: 'rgba(0, 0, 0, 0.8)',
                  },
                }}
              >
                <SearchIcon sx={{ 
                  fontSize: '1.25rem', 
                  color: searchTerm ? 'white' : 'rgba(0, 0, 0, 0.6)' 
                }} />
              </IconButton>
              {/* Active search indicator */}
              {searchTerm && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    width: 8,
                    height: 8,
                    backgroundColor: theme.palette.error.main,
                    borderRadius: '50%',
                  }}
                />
              )}
            </Box>
          )}

          {children}

          {!children && onAdd && (
            <>
              {/* Desktop Add Button */}
              {!isMobile && (
                <CustomButton
                  text={addButtonText}
                  variant="contained"
                  onClick={onAdd}
                  startIcon={<AddIcon />}
                  size="medium"
                />
              )}

              {/* Mobile Add Button (+ Icon) */}
              {isMobile && (
                <IconButton
                  onClick={onAdd}
                  sx={{
                    backgroundColor: theme.palette.secondary.main,
                    color: 'white',
                    width: 'auto',
                    height: 'auto',
                    p: 1,
                    borderRadius: '50%',
                    boxShadow: '0 2px 8px 0 rgba(61, 130, 247, 0.25)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      backgroundColor: theme.palette.secondary.dark,
                      transform: 'scale(1.05)',
                      boxShadow: '0 4px 12px 0 rgba(61, 130, 247, 0.35)',
                    },
                    '&:active': {
                      transform: 'scale(0.95)',
                    },
                  }}
                >
                  <AddIcon sx={{ fontSize: '1.25rem' }} />
                </IconButton>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Mobile Search Dialog */}
      <Dialog
        open={mobileSearchOpen}
        onClose={() => setMobileSearchOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            position: 'fixed',
            top: 0,
            m: 0,
            borderRadius: 0,
            height: 'auto',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1,
          }}
        >
          <Typography variant="h6">Search</Typography>
          <IconButton onClick={() => setMobileSearchOpen(false)} sx={{ p: 1 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 0, pb: 3 }}>
          <SearchBar
            placeholder={searchPlaceholder}
            value={searchTerm}
            onSearch={(term) => {
              if (onSearch) onSearch(term)
              // Update results in real-time as user types
            }}
            onSubmit={(term) => {
              if (onSearch) onSearch(term)
              setMobileSearchOpen(false)
              // Close dialog only when Enter is pressed
            }}
            onClear={() => {
              if (onClearSearch) onClearSearch()
              // Clear search and show all results
            }}
            width={{ xs: '100%', sm: '100%', md: '100%' }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Titlebar
