import React, { useState, useEffect } from 'react'
import { TextField, InputAdornment, IconButton, useTheme, useMediaQuery } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'

interface SearchBarProps {
  onSearch?: (term: string) => void
  onSubmit?: (term: string) => void
  onClear?: () => void
  placeholder?: string
  value?: string
  width?: { xs: number | string; sm: number | string; md: number | string }
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onSubmit,
  onClear,
  placeholder = 'Search...',
  value,
  width = { xs: '150px', sm: '200px', md: '300px' },
}) => {
  const [searchTerm, setSearchTerm] = useState(value || '')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Sync with external value prop
  useEffect(() => {
    setSearchTerm(value || '')
  }, [value])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    if (onSearch) onSearch(value)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (onSubmit) onSubmit(searchTerm)
    }
  }

  const handleClear = () => {
    setSearchTerm('')
    if (onSearch) onSearch('')
    if (onClear) onClear()
  }

  return (
    <TextField
      variant="outlined"
      size="small"
      placeholder={isMobile ? 'Search...' : placeholder}
      value={searchTerm}
      onChange={handleSearchChange}
      onKeyPress={handleKeyPress}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} />
          </InputAdornment>
        ),
        endAdornment: searchTerm && (
          <InputAdornment position="end">
            <IconButton
              onClick={handleClear}
              edge="end"
              size="small"
              sx={{
                p: 0.5,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <ClearIcon sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} />
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{
        backgroundColor: 'white',
        borderRadius: 1,
        width: width,
        minWidth: isMobile ? '120px' : '150px',
        '& .MuiOutlinedInput-root': {
          fontSize: isMobile ? '0.8rem' : '0.875rem',
          '& input': {
            padding: isMobile ? '8px 12px' : '8.5px 14px',
          },
          '& fieldset': {
            borderColor: 'rgba(0, 0, 0, 0.12)',
            borderWidth: '1px',
            transition:
              'border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(0, 0, 0, 0.23)',
            borderWidth: '2px',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'rgba(0, 0, 0, 0.3)',
            borderWidth: '2px',
          },
        },
      }}
    />
  )
}

export default SearchBar
