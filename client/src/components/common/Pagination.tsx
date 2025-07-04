import React from 'react'
import { Box, Pagination as MuiPagination, useTheme } from '@mui/material'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  siblingCount?: number
  boundaryCount?: number
  size?: 'small' | 'medium' | 'large'
  showFirstLast?: boolean
  disabled?: boolean
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
  size = 'large',
  showFirstLast = true,
  disabled = false,
}) => {
  const theme = useTheme()

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    onPageChange(value)
  }

  // Don't render if there's only one page or no pages
  if (totalPages <= 1) {
    return null
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        py: 2,
      }}
    >
      <MuiPagination
        count={totalPages}
        page={currentPage}
        onChange={handlePageChange}
        siblingCount={siblingCount}
        boundaryCount={boundaryCount}
        size={size}
        color="secondary"
        showFirstButton={showFirstLast}
        showLastButton={showFirstLast}
        disabled={disabled}
        sx={{
          '& .MuiPaginationItem-root': {
            borderRadius: 2, // 8px, matching your theme
            fontWeight: 600,
            fontSize: { xs: '0.875rem', sm: '0.9rem', md: '1rem' },
            minWidth: { xs: '32px', sm: '36px', md: '40px' },
            height: { xs: '32px', sm: '36px', md: '40px' },
            margin: '0 2px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
              transform: 'translateY(-1px)',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            },
          },
          '& .MuiPaginationItem-page': {
            '&.Mui-selected': {
              backgroundColor: theme.palette.secondary.main,
              color: 'white',
              fontWeight: 700,
              '&:hover': {
                backgroundColor: theme.palette.secondary.dark,
              },
            },
          },
          '& .MuiPaginationItem-previousNext': {
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
            '&.Mui-disabled': {
              opacity: 0.4,
              cursor: 'not-allowed',
            },
          },
          '& .MuiPaginationItem-firstLast': {
            fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' },
            fontWeight: 600,
            '&.Mui-disabled': {
              opacity: 0.4,
              cursor: 'not-allowed',
            },
          },
          '& .MuiPaginationItem-ellipsis': {
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
            color: theme.palette.text.secondary,
          },
        }}
      />
    </Box>
  )
}

export default Pagination