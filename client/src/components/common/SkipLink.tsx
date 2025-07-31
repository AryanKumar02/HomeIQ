import React from 'react'
import { Box, Button } from '@mui/material'

interface SkipLinkProps {
  href: string
  children: string
}

/**
 * Skip link component for keyboard navigation accessibility
 * Allows users to skip to main content or specific sections
 */
const SkipLink: React.FC<SkipLinkProps> = ({ href, children }) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const target = document.querySelector(href)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
      // Focus the target element if it's focusable
      if (target instanceof HTMLElement) {
        target.focus()
      }
    }
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        left: '-9999px',
        zIndex: 9999,
        '&:focus-within': {
          left: '50%',
          top: '10px',
          transform: 'translateX(-50%)',
        },
      }}
    >
      <Button
        onClick={handleClick}
        variant="contained"
        size="small"
        sx={{
          backgroundColor: 'secondary.main',
          color: 'white',
          fontWeight: 600,
          textTransform: 'none',
          borderRadius: 1,
          boxShadow: 3,
          '&:focus': {
            outline: '2px solid white',
            outlineOffset: '2px',
          },
        }}
      >
        {children}
      </Button>
    </Box>
  )
}

export default SkipLink
