import React, { useState } from 'react'
import { TextField, InputAdornment } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

interface SearchBarProps {
  onSearch?: (term: string) => void
  placeholder?: string
  width?: { xs: number | string, sm: number | string, md: number | string }
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search...",
  width = { xs: 200, sm: 250, md: 300 }
}) => {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    if (onSearch) onSearch(value)
  }

  return (
    <TextField
      variant="outlined"
      size="small"
      placeholder={placeholder}
      value={searchTerm}
      onChange={handleSearchChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
      sx={{
        backgroundColor: 'white',
        borderRadius: 1,
        width: width,
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: 'rgba(0, 0, 0, 0.12)', // Default light grey
            borderWidth: '1px',
            transition: 'border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(0, 0, 0, 0.23)', // Darker grey on hover
            borderWidth: '2px', // Thicker border on hover
          },
          '&.Mui-focused fieldset': {
            borderColor: 'rgba(0, 0, 0, 0.3)', // Even darker grey when focused
            borderWidth: '2px', // Thick border when focused
          },
        },
      }}
    />
  )
}

export default SearchBar
