import React, { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { Link as RouterLink } from 'react-router-dom'
import { prefetchByPath } from '../../utils/prefetchRoutes'
import MobileMenuDrawer from './MobileMenuDrawer'
import { useTheme } from '@mui/material/styles'

const navLinks = [
  { label: 'Features', to: '/#features' },
  { label: 'About', to: '/#about' },
  { label: 'Pricing', to: '/#pricing' },
  { label: 'Contact', to: 'mailto:sales@homeiq.com' },
]

const Navbar: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const theme = useTheme()

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen)
  }

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: '#fff',
        color: '#000',
        boxShadow: '0 2px 8px 0 rgba(3,108,163,0.08)',
        width: '100%',
        top: 0,
        left: 0,
        right: 0,
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 1, sm: 2, md: 3 } }}>
        {/* Logo/Brand */}
        <Box
          component={RouterLink}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexGrow: 1 }}
        >
          <picture>
            <source srcSet="/assets/logo.webp" type="image/webp" />
            <Box
              component="img"
              src="/assets/logo.png"
              alt="EstateLink logo"
              sx={{ height: { xs: 50, sm: 60, md: 80 }, width: { xs: 50, sm: 60, md: 80 }, mr: 0 }}
            />
          </picture>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              letterSpacing: { xs: '-0.8px', sm: '-1.2px' },
              color: '#000000',
              textDecoration: 'none',
              fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
              ml: 0,
              mr: 0,
              display: { xs: 'none', sm: 'block' }, // Hide on very small screens
            }}
          >
            EstateLink
          </Typography>
          <Box
            sx={{
              display: { xs: 'none', sm: 'block' },
              ml: 0.5,
              alignSelf: 'center',
            }}
          ></Box>
        </Box>

        {/* Desktop nav links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1.5, alignItems: 'center' }}>
          {navLinks.map((link) => {
            const isHashLink = link.to.includes('#')
            const isMailto = link.to.startsWith('mailto:')
            return (
              <Button
                key={link.label}
                component={isHashLink || isMailto ? 'a' : RouterLink}
                {...(isHashLink || isMailto ? { href: link.to } : { to: link.to })}
                onMouseEnter={() => {
                  if (!isHashLink && !isMailto) prefetchByPath(link.to)
                }}
                sx={{
                  color: '#000',
                  fontWeight: 700,
                  fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                  textTransform: 'none',
                  background: 'none',
                  boxShadow: 'none',
                  px: { xs: 1, sm: 1.5, md: 2 },
                  py: { xs: 0.5, sm: 1 },
                  minWidth: 'auto',
                  transition: 'color 0.25s cubic-bezier(0.4,0,0.2,1)',
                  '&:hover': {
                    color: theme.palette.secondary.main,
                    background: 'none',
                  },
                }}
              >
                {link.label}
              </Button>
            )
          })}
          <Button
            component={RouterLink}
            to="/login"
            sx={{
              color: '#000',
              fontWeight: 700,
              fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
              textTransform: 'none',
              ml: { xs: 0.5, sm: 1 },
              px: { xs: 1, sm: 1.5, md: 2 },
              py: { xs: 0.5, sm: 1 },
              minWidth: 'auto',
              background: 'none',
              boxShadow: 'none',
              transition: 'color 0.25s cubic-bezier(0.4,0,0.2,1)',
              '&:hover': {
                color: theme.palette.secondary.main,
                background: 'none',
              },
            }}
          >
            Sign In
          </Button>
          <Button
            component={RouterLink}
            to="/signup"
            variant="contained"
            color="secondary"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '0.8rem', sm: '0.85rem', md: '1rem' },
              textTransform: 'none',
              ml: { xs: 0.5, sm: 1 },
              borderRadius: '8px',
              px: { xs: 2, sm: 2.5, md: 3.5 },
              py: { xs: 0.8, sm: 1, md: 1.2 },
              minWidth: 'auto',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 18px 0 rgba(3,108,163,0.13)',
              color: '#fff',
              background: theme.palette.secondary.main,
              transition:
                'background 0.22s cubic-bezier(0.4,0,0.2,1), box-shadow 0.22s cubic-bezier(0.4,0,0.2,1)',
              '&:hover': {
                background: theme.palette.secondary.dark || theme.palette.secondary.main,
                color: '#fff',
                boxShadow: '0 6px 24px 0 rgba(61,130,247,0.18)',
              },
            }}
          >
            Get Started
          </Button>
        </Box>

        {/* Mobile menu button */}
        <IconButton
          edge="end"
          color="inherit"
          sx={{
            display: { md: 'none' },
            color: '#000',
            mr: { xs: 0.5, sm: 1.5 },
            p: { xs: 1, sm: 1.5 },
            transition: 'color 0.22s',
            '&:hover': { color: theme.palette.secondary.main },
          }}
          aria-label="menu"
          onClick={handleDrawerToggle}
        >
          <MenuIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
        </IconButton>
      </Toolbar>

      {/* Mobile Drawer */}
      <MobileMenuDrawer
        open={drawerOpen}
        onClose={handleDrawerToggle}
        navLinks={navLinks.concat([
          { label: 'Sign In', to: '/login' },
          { label: 'Get Started', to: '/signup' },
        ])}
      />
    </AppBar>
  )
}

export default Navbar
