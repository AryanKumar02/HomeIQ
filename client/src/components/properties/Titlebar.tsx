import React from 'react'
import { Box, Typography, useTheme } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SearchBar from './SearchBar'
import CustomButton from './CustomButton'

interface TitlebarProps {
  onAdd?: () => void
  onSearch?: (term: string) => void
  title?: string
  searchPlaceholder?: string
  addButtonText?: string
  showSearch?: boolean
  children?: React.ReactNode // For custom content instead of search
}

const Titlebar: React.FC<TitlebarProps> = ({
  onAdd,
  onSearch,
  title = "Properties",
  searchPlaceholder = "Search properties...",
  addButtonText = "Add Property",
  showSearch = true,
  children
}) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: { xs: 1.5, sm: 2, md: 2.5 },
      }}
    >
      <Typography
        variant="h5"
        component="h1"
        sx={{
          fontFamily: theme.typography.fontFamily,
          fontWeight: 700,
          letterSpacing: '0.02em',
          fontSize: { xs: '1.35rem', sm: '1.45rem', md: '1.55rem' },
          mr: { xs: 2, sm: 3, md: 4 },
          ml: { xs: '72px', md: 0 }, // Add left margin on mobile to avoid burger menu
          minWidth: 0, // Allow text truncation
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </Typography>

      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 2, sm: 3, md: 4 }
      }}>
        {showSearch && (
          <SearchBar
            placeholder={searchPlaceholder}
            onSearch={onSearch}
            width={{ xs: 200, sm: 250, md: 300 }}
          />
        )}

        {children}

        {!children && onAdd && (
          <CustomButton
            text={addButtonText}
            startIcon={<AddIcon />}
            onClick={onAdd}
          />
        )}
      </Box>
    </Box>
  )
}

export default Titlebar
