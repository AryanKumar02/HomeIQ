import React from 'react'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import { Link as RouterLink } from 'react-router-dom'
import Fade from '@mui/material/Fade'
import { useTheme, alpha } from '@mui/material/styles'

interface NavLink {
  label: string
  to: string
}

interface MobileMenuDrawerProps {
  open: boolean
  onClose: () => void
  navLinks: NavLink[]
}

const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({ open, onClose, navLinks }) => {
  const theme = useTheme()

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': {
          width: 290,
          background: '#fff',
          color: '#222',
          pt: 0,
          borderTopRightRadius: 18,
          borderBottomRightRadius: 18,
          boxShadow: `0 8px 32px 0 ${alpha(theme.palette.secondary.main, 0.13)}`,
        },
      }}
    >
      <Box
        sx={{
          px: 2,
          pt: 2,
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box
          component={RouterLink}
          to="/"
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <Box
            component="img"
            src="/assets/logo.png"
            alt="EstateLink logo"
            sx={{ height: 38, mr: 1 }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              color: theme.palette.secondary.main,
              fontSize: '1.2rem',
              letterSpacing: -1.2,
            }}
          >
            EstateLink
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          aria-label="Close menu"
          sx={{ color: theme.palette.secondary.main, ml: 1 }}
        >
          <CloseIcon fontSize="medium" />
        </IconButton>
      </Box>
      <Divider sx={{ borderColor: theme.palette.divider, mb: 1 }} />
      <List sx={{ px: 1, py: 0 }}>
        {navLinks.map((link, idx) => {
          const isHashLink = link.to.includes('#')
          return (
            <Fade
              in={open}
              style={{ transitionDelay: open ? `${idx * 60 + 100}ms` : '0ms' }}
              key={link.label}
            >
              <ListItem disablePadding>
                <ListItemButton
                  component={isHashLink ? 'a' : RouterLink}
                  {...(isHashLink ? { href: link.to } : { to: link.to })}
                  onClick={onClose}
                  sx={{
                    color: '#222',
                    fontWeight: 700,
                    borderRadius: 2,
                    mb: 0.5,
                    px: 2,
                    py: 1.2,
                    fontSize: '1.08rem',
                    transition:
                      'color 0.22s cubic-bezier(0.4,0,0.2,1), background 0.22s cubic-bezier(0.4,0,0.2,1)',
                    '&:hover': {
                      color: theme.palette.secondary.main,
                      background: alpha(theme.palette.secondary.main, 0.07),
                    },
                    ...(link.label === 'Get Started' && {
                      background: theme.palette.secondary.main,
                      color: '#fff',
                      mb: 1.5,
                      mt: 1,
                      fontWeight: 800,
                      borderRadius: 999,
                      px: 3.5,
                      py: 1.2,
                      boxShadow: `0 4px 18px 0 ${alpha(theme.palette.secondary.main, 0.13)}`,
                      transition:
                        'background 0.22s cubic-bezier(0.4,0,0.2,1), box-shadow 0.22s cubic-bezier(0.4,0,0.2,1)',
                      '&:hover': {
                        background: theme.palette.secondary.dark || theme.palette.secondary.main, // Fallback if dark is not defined
                        color: '#fff',
                        boxShadow: `0 6px 24px 0 ${alpha(theme.palette.secondary.dark || theme.palette.secondary.main, 0.18)}`,
                      },
                    }),
                    ...(link.label === 'Sign In' && {
                      color: theme.palette.secondary.main,
                      fontWeight: 700,
                      background: 'none',
                      '&:hover': {
                        color: theme.palette.secondary.dark || theme.palette.secondary.main,
                        background: alpha(theme.palette.secondary.main, 0.07),
                      },
                    }),
                  }}
                >
                  <ListItemText
                    primary={link.label}
                    primaryTypographyProps={{
                      fontWeight: link.label === 'Get Started' ? 800 : 700,
                      fontSize: link.label === 'Get Started' ? '1.13rem' : '1.08rem',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </Fade>
          )
        })}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ borderColor: theme.palette.divider, mt: 2, mb: 1 }} />
      <Box sx={{ px: 2, pb: 2, textAlign: 'center', color: '#b0b8c1', fontSize: '0.97rem' }}>
        &copy; {new Date().getFullYear()} EstateLink
      </Box>
    </Drawer>
  )
}

export default MobileMenuDrawer
