import React from 'react'
import { Box, IconButton, Chip } from '@mui/material'
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'

interface PageNavigationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const PageNavigation: React.FC<PageNavigationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const theme = useTheme()

  if (totalPages <= 1) return null

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        ml: 2, // Add some margin from the filters
      }}
    >
      <IconButton
        size="small"
        onClick={handlePrevious}
        disabled={currentPage === 1}
        sx={{
          color: theme.palette.secondary.main,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid',
          borderColor: 'grey.200',
          width: 28,
          height: 28,
          '&:hover': {
            backgroundColor: `${theme.palette.secondary.main}15`,
            borderColor: theme.palette.secondary.main,
          },
          '&:disabled': {
            color: 'grey.300',
            backgroundColor: 'grey.50',
            borderColor: 'grey.200',
          },
        }}
      >
        <ChevronLeftIcon fontSize="small" />
      </IconButton>

      <Chip
        label={`${currentPage} / ${totalPages}`}
        size="small"
        sx={{
          fontWeight: 600,
          fontSize: '0.8rem',
          height: '28px',
          backgroundColor: theme.palette.secondary.main,
          color: 'white',
          '& .MuiChip-label': {
            px: 1.5,
          },
        }}
      />

      <IconButton
        size="small"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        sx={{
          color: theme.palette.secondary.main,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid',
          borderColor: 'grey.200',
          width: 28,
          height: 28,
          '&:hover': {
            backgroundColor: `${theme.palette.secondary.main}15`,
            borderColor: theme.palette.secondary.main,
          },
          '&:disabled': {
            color: 'grey.300',
            backgroundColor: 'grey.50',
            borderColor: 'grey.200',
          },
        }}
      >
        <ChevronRightIcon fontSize="small" />
      </IconButton>
    </Box>
  )
}

export default PageNavigation
