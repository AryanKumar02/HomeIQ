import React, { useState } from 'react'
import { TextField, InputAdornment, useTheme, useMediaQuery } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

interface SearchBarProps {
  onSearch?: (term: string) => void
  placeholder?: string
  width?: { xs: number | string; sm: number | string; md: number | string }
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search...',
  width = { xs: '150px', sm: '200px', md: '300px' },
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    if (onSearch) onSearch(value)
  }

  return (
    <TextField
      variant="outlined"
      size="small"
      placeholder={isMobile ? 'Search...' : placeholder}
      value={searchTerm}
      onChange={handleSearchChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} />
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
