import React from 'react'
import { Box, Button, IconButton, useTheme } from '@mui/material'
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
} from '@mui/icons-material'

interface CustomPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  maxVisiblePages?: number
  showFirstLast?: boolean
  disabled?: boolean
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
  showFirstLast = true,
  disabled = false,
}) => {
  const theme = useTheme()

  // Don't render if there's only one page or no pages
  if (totalPages <= 1) {
    return null
  }

  // Calculate which pages to show
  const getVisiblePages = () => {
    const pages: (number | string)[] = []

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const halfVisible = Math.floor(maxVisiblePages / 2)
      let startPage = Math.max(1, currentPage - halfVisible)
      let endPage = Math.min(totalPages, currentPage + halfVisible)

      // Adjust if we're near the beginning or end
      if (currentPage <= halfVisible) {
        endPage = maxVisiblePages
      } else if (currentPage >= totalPages - halfVisible) {
        startPage = totalPages - maxVisiblePages + 1
      }

      // Add first page and ellipsis if needed
      if (startPage > 1) {
        pages.push(1)
        if (startPage > 2) {
          pages.push('...')
        }
      }

      // Add visible pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      // Add ellipsis and last page if needed
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...')
        }
        pages.push(totalPages)
      }
    }

    return pages
  }

  const buttonStyles = {
    minWidth: { xs: '32px', sm: '36px', md: '40px' },
    height: { xs: '32px', sm: '36px', md: '40px' },
    borderRadius: 2,
    fontWeight: 600,
    fontSize: { xs: '0.875rem', sm: '0.9rem', md: '1rem' },
    mx: 0.25,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
  }

  const activeButtonStyles = {
    ...buttonStyles,
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    fontWeight: 700,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
      transform: 'translateY(-1px)',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
  }

  const iconButtonStyles = {
    ...buttonStyles,
    '&.Mui-disabled': {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        py: 2,
        gap: 0.5,
      }}
    >
      {/* First Page Button */}
      {showFirstLast && (
        <IconButton
          onClick={() => onPageChange(1)}
          disabled={disabled || currentPage === 1}
          sx={iconButtonStyles}
          aria-label="Go to first page"
        >
          <FirstPageIcon />
        </IconButton>
      )}

      {/* Previous Button */}
      <IconButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={disabled || currentPage === 1}
        sx={iconButtonStyles}
        aria-label="Go to previous page"
      >
        <ChevronLeftIcon />
      </IconButton>

      {/* Page Numbers */}
      {getVisiblePages().map((page, index) => {
        if (page === '...') {
          return (
            <Box
              key={`ellipsis-${index}`}
              sx={{
                ...buttonStyles,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.palette.text.secondary,
                cursor: 'default',
                '&:hover': {
                  transform: 'none',
                  boxShadow: 'none',
                },
              }}
            >
              ...
            </Box>
          )
        }

        const pageNumber = page as number
        const isActive = pageNumber === currentPage

        return (
          <Button
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            disabled={disabled}
            sx={isActive ? activeButtonStyles : buttonStyles}
            aria-label={`Go to page ${pageNumber}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {pageNumber}
          </Button>
        )
      })}

      {/* Next Button */}
      <IconButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={disabled || currentPage === totalPages}
        sx={iconButtonStyles}
        aria-label="Go to next page"
      >
        <ChevronRightIcon />
      </IconButton>

      {/* Last Page Button */}
      {showFirstLast && (
        <IconButton
          onClick={() => onPageChange(totalPages)}
          disabled={disabled || currentPage === totalPages}
          sx={iconButtonStyles}
          aria-label="Go to last page"
        >
          <LastPageIcon />
        </IconButton>
      )}
    </Box>
  )
}

export default CustomPagination
