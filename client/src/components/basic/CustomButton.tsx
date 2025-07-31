import React from 'react'
import { Button, useTheme, useMediaQuery } from '@mui/material'

interface CustomButtonProps {
  text: string
  onClick?: () => void
  variant?: 'contained' | 'outlined' | 'text'
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
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
  color = 'secondary',
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

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
          textColor: theme.palette.secondary.main,
          borderColor: 'transparent',
          hoverBorderColor: 'transparent',
        }
      default: { // contained
        const paletteColor = theme.palette[color]
        return {
          backgroundColor: paletteColor.main,
          hoverBackgroundColor: paletteColor.dark,
          textColor: 'white',
          borderColor: 'transparent',
          hoverBorderColor: 'transparent',
        }
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
        height: isMobile ? '36px' : '40px',
        backgroundColor: backgroundColor || defaults.backgroundColor,
        color: textColor || defaults.textColor,
        borderColor: borderColor || defaults.borderColor,
        fontFamily: theme.typography.fontFamily,
        fontWeight: 600,
        fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
        textTransform: 'none',
        borderRadius: theme.shape.borderRadius,
        px: { xs: 1.5, sm: 2, md: 3 },
        py: { xs: 0.5, sm: 1, md: 1.5 },
        minWidth: isMobile ? '60px' : '80px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        '& .MuiButton-startIcon': {
          marginRight: isMobile ? '4px' : '8px',
          '& > *:first-of-type': {
            fontSize: isMobile ? '16px' : '20px',
          },
        },
        '& .MuiButton-endIcon': {
          marginLeft: isMobile ? '4px' : '8px',
          '& > *:first-of-type': {
            fontSize: isMobile ? '16px' : '20px',
          },
        },
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
