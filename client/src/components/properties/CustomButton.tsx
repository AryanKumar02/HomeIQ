import React from 'react'
import { Button, useTheme } from '@mui/material'

interface CustomButtonProps {
  text: string
  onClick?: () => void
  variant?: 'contained' | 'outlined' | 'text'
  backgroundColor?: string
  hoverBackgroundColor?: string
  textColor?: string
  borderColor?: string
  hoverBorderColor?: string
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
}

const CustomButton: React.FC<CustomButtonProps> = ({
  text,
  onClick,
  variant = 'contained',
  backgroundColor,
  hoverBackgroundColor,
  textColor,
  borderColor,
  hoverBorderColor,
  startIcon,
  endIcon,
  disabled = false,
  size = 'small',
}) => {
  const theme = useTheme()

  // Default colors based on variant
  const getDefaultColors = () => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          hoverBackgroundColor: 'rgba(0, 0, 0, 0.04)',
          textColor: 'rgba(0, 0, 0, 0.6)',
          borderColor: 'rgba(0, 0, 0, 0.23)',
          hoverBorderColor: 'rgba(0, 0, 0, 0.4)',
        }
      case 'text':
        return {
          backgroundColor: 'transparent',
          hoverBackgroundColor: 'rgba(0, 0, 0, 0.04)',
          textColor: theme.palette.primary.main,
          borderColor: 'transparent',
          hoverBorderColor: 'transparent',
        }
      default: // contained
        return {
          backgroundColor: theme.palette.secondary.main,
          hoverBackgroundColor: theme.palette.secondary.dark,
          textColor: 'white',
          borderColor: 'transparent',
          hoverBorderColor: 'transparent',
        }
    }
  }

  const defaults = getDefaultColors()

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      startIcon={startIcon}
      endIcon={endIcon}
      disabled={disabled}
      sx={{
        height: '40px',
        backgroundColor: backgroundColor || defaults.backgroundColor,
        color: textColor || defaults.textColor,
        borderColor: borderColor || defaults.borderColor,
        fontFamily: theme.typography.fontFamily,
        fontWeight: 600,
        fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.9rem' },
        textTransform: 'none',
        borderRadius: theme.shape.borderRadius,
        px: { xs: 2, sm: 3 },
        py: { xs: 1, sm: 1.5 },
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          backgroundColor: hoverBackgroundColor || defaults.hoverBackgroundColor,
          borderColor: hoverBorderColor || defaults.hoverBorderColor,
        },
        '&:disabled': {
          backgroundColor: 'rgba(0, 0, 0, 0.12)',
          color: 'rgba(0, 0, 0, 0.26)',
        },
      }}
    >
      {text}
    </Button>
  )
}

export default CustomButton
