import React from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from '../../theme' // Use the original theme

interface OptimizedMuiProviderProps {
  children: React.ReactNode
}

export const OptimizedMuiProvider: React.FC<OptimizedMuiProviderProps> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}