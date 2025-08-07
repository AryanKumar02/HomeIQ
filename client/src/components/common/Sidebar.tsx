import React, { useState, useEffect, useRef } from 'react'
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Paper,
  useMediaQuery,
  IconButton,
} from '@mui/material'
import gsap from 'gsap'
import HomeIcon from '@mui/icons-material/Home'
import BusinessIcon from '@mui/icons-material/Business'
import PeopleIcon from '@mui/icons-material/People'
import BarChartIcon from '@mui/icons-material/BarChart'
import BuildIcon from '@mui/icons-material/Build'
import SettingsIcon from '@mui/icons-material/Settings'
import MenuIcon from '@mui/icons-material/Menu'
import LogoutIcon from '@mui/icons-material/Logout'
import { useTheme } from '@mui/material/styles'
import { useNavigate, useLocation } from 'react-router-dom'
import { prefetchByPath } from '../../utils/prefetchRoutes'
import { useAuthUser } from '../../stores/authStoreNew'
import { useLogout } from '../../hooks/useAuthSimple'

const drawerWidth = 280
const mobileDrawerWidth = 240

const Sidebar: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'))
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthUser()
  const logoutMutation = useLogout()

  // Menu items configuration
  const menuItems = [
    { text: 'Dashboard', icon: <HomeIcon />, path: '/dashboard' },
    { text: 'Properties', icon: <BusinessIcon />, path: '/properties' },
    { text: 'Tenants', icon: <PeopleIcon />, path: '/tenants' },
    { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics' },
    { text: 'Maintenance', icon: <BuildIcon />, path: '/maintenance' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ]

  // Determine selected index based on current route
  const getSelectedIndex = () => {
    const currentPath = location.pathname
    const index = menuItems.findIndex((item) => currentPath.startsWith(item.path))
    return index >= 0 ? index : 0
  }

  const [selectedIndex, setSelectedIndex] = useState(getSelectedIndex())
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Check if animations have already been played this session
  const hasAnimated = sessionStorage.getItem('sidebarAnimated') === 'true'

  // Refs for GSAP animations
  const headerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLImageElement>(null)
  const navigationRef = useRef<HTMLDivElement>(null)
  const menuItemsRef = useRef<(HTMLLIElement | null)[]>([])
  const profileRef = useRef<HTMLDivElement>(null)

  // GSAP entrance animations - only run once per session
  useEffect(() => {
    let timer: number | null = null

    if (!hasAnimated && !isLoaded) {
      // Use a small delay to ensure DOM elements are fully mounted
      timer = window.setTimeout(() => {
        // Check if all refs are available before animating
        if (
          !headerRef.current ||
          !logoRef.current ||
          !navigationRef.current ||
          !profileRef.current
        ) {
          return
        }

        const tl = gsap.timeline()

        // Set initial states
        gsap.set(headerRef.current, { y: -30, opacity: 0 })
        gsap.set(logoRef.current, { scale: 0.8, opacity: 0 })
        gsap.set(navigationRef.current, { x: -20, opacity: 0 })
        gsap.set(menuItemsRef.current.filter(Boolean), { x: -20, opacity: 0 })
        gsap.set(profileRef.current, { y: 20, opacity: 0 })

        // Animate all elements together with slight offsets
        tl.to(headerRef.current, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, 0)

        tl.to(logoRef.current, { scale: 1, opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.1)

        tl.to(navigationRef.current, { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.15)

        tl.to(
          menuItemsRef.current.filter(Boolean),
          {
            x: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.05,
            ease: 'power2.out',
          },
          0.2
        )

        tl.to(profileRef.current, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.25)

        setIsLoaded(true)
        sessionStorage.setItem('sidebarAnimated', 'true')
      }, 50) // Small delay to ensure DOM is ready
    } else if (hasAnimated && !isLoaded) {
      // If we've already animated but component re-mounted, set everything to final state immediately
      const elements = [
        headerRef.current,
        logoRef.current,
        navigationRef.current,
        profileRef.current,
      ].filter(Boolean)
      const menuElements = menuItemsRef.current.filter(Boolean)

      if (elements.length > 0) {
        gsap.set(elements, {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
        })
      }

      if (menuElements.length > 0) {
        gsap.set(menuElements, {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
        })
      }

      setIsLoaded(true)
    }

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [hasAnimated, isLoaded])

  // Update selected index when route changes
  useEffect(() => {
    setSelectedIndex(getSelectedIndex())
  }, [location.pathname])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keyboard navigation when sidebar is visible (not on mobile when closed)
      if (isMobile && !mobileOpen) return

      // Check if the active element is within the sidebar or is an input/textarea
      const activeElement = document.activeElement
      const isInputField =
        activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA'

      // Don't intercept keyboard events if user is typing in an input field
      if (isInputField) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % menuItems.length)
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + menuItems.length) % menuItems.length)
          break
        case 'Enter':
        case ' ': {
          event.preventDefault()
          // Just navigate to the selected tab without triggering click animation
          handleListItemClick(selectedIndex)
          break
        }
        case 'Home':
          event.preventDefault()
          setSelectedIndex(0)
          break
        case 'End':
          event.preventDefault()
          setSelectedIndex(menuItems.length - 1)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMobile, mobileOpen, selectedIndex])

  const handleListItemClick = (index: number) => {
    if (index === selectedIndex) return
    setSelectedIndex(index)
    void navigate(menuItems[index].path)
    if (isMobile) {
      setMobileOpen(false)
    }
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleLogout = () => {
    // GSAP animation for logout
    if (profileRef.current) {
      gsap.to(profileRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
        onComplete: () => logoutMutation.mutate(),
      })
    } else {
      logoutMutation.mutate()
    }
  }

  // Hover animations for menu items
  const handleMenuItemHover = (index: number, isHovering: boolean) => {
    const item = menuItemsRef.current[index]
    if (item && index !== selectedIndex) {
      // Kill any existing animations on this item
      gsap.killTweensOf(item)

      gsap.to(item, {
        x: isHovering ? 6 : 0,
        scale: isHovering ? 1.02 : 1,
        duration: 0.3,
        ease: 'power2.out',
      })
    }
  }

  const currentDrawerWidth = isMobile ? mobileDrawerWidth : drawerWidth
  const logoSize = isMobile ? 48 : isTablet ? 64 : 80
  const headerHeight = isMobile ? 70 : 100

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U'
    const firstInitial = user.firstName?.charAt(0)?.toUpperCase() || ''
    const lastInitial = user.lastName?.charAt(0)?.toUpperCase() || ''
    const initials = firstInitial + lastInitial

    // If no name initials, use email initial
    if (!initials && user.email) {
      return user.email.charAt(0).toUpperCase()
    }

    return initials || 'U'
  }

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return 'User'
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
    return fullName || user.email || 'User'
  }

  const drawerContent = (
    <>
      {/* Header Section */}
      <Box
        ref={headerRef}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: headerHeight,
          px: isMobile ? 2 : 3,
          py: isMobile ? 1 : 2,
          backgroundColor: theme.palette.secondary.main,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          },
        }}
      >
        <Box
          ref={logoRef}
          component="img"
          src="/assets/logo.png"
          alt="Estate Link Logo"
          sx={{
            height: logoSize,
            width: logoSize,
            filter: 'brightness(0) invert(1)',
          }}
        />
      </Box>

      {/* Navigation Menu */}
      <Box ref={navigationRef} sx={{ px: isMobile ? 1 : 2, py: isMobile ? 2 : 3 }}>
        <Typography
          variant="overline"
          sx={{
            px: 2,
            mb: 1,
            display: 'block',
            fontSize: isMobile ? '0.65rem' : '0.75rem',
            fontWeight: 600,
            color: 'grey.500',
            letterSpacing: '1px',
            fontFamily: theme.typography.fontFamily,
          }}
        >
          NAVIGATION
        </Typography>
        <List sx={{ p: 0 }}>
          {menuItems.map((item, index) => (
            <ListItem
              key={item.text}
              disablePadding
              sx={{ mb: 0.5 }}
              ref={(el) => {
                menuItemsRef.current[index] = el
              }}
            >
              <ListItemButton
                disableRipple
                disableTouchRipple
                selected={selectedIndex === index}
                tabIndex={selectedIndex === index ? 0 : -1}
                onClick={() => handleListItemClick(index)}
                onMouseEnter={() => {
                  handleMenuItemHover(index, true)
                  prefetchByPath(menuItems[index].path)
                }}
                onMouseLeave={() => handleMenuItemHover(index, false)}
                onMouseDown={() => {
                  // Reset on click to prevent stuck states
                  const item = menuItemsRef.current[index]
                  if (item) {
                    gsap.killTweensOf(item)
                  }
                }}
                sx={{
                  transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  borderRadius: theme.shape.borderRadius,
                  mx: isMobile ? 0.5 : 1,
                  py: isMobile ? 1 : 1.5,
                  px: isMobile ? 1.5 : 2,
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.secondary.main,
                    color: 'white',
                    boxShadow: `0 4px 12px 0 rgba(61, 130, 247, 0.3)`,
                    '&:hover': {
                      backgroundColor: theme.palette.secondary.dark,
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                    '& .MuiListItemText-primary': {
                      fontWeight: 600,
                      color: 'white',
                    },
                  },
                  '&:hover': {
                    backgroundColor:
                      selectedIndex === index ? 'transparent' : theme.palette.background.section,
                  },
                  '& .MuiListItemIcon-root': {
                    minWidth: isMobile ? 35 : 40,
                    color: selectedIndex === index ? 'white' : theme.palette.grey[600],
                    transition: 'color 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  },
                  '& .MuiListItemText-primary': {
                    fontSize: isMobile ? '0.85rem' : '0.95rem',
                    fontWeight: selectedIndex === index ? 600 : 500,
                    color: selectedIndex === index ? 'white' : theme.palette.grey[700],
                    transition: 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      {/* User Profile Section */}
      <Box ref={profileRef} sx={{ p: isMobile ? 2 : 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: isMobile ? 2 : 2.5,
            borderRadius: theme.shape.borderRadius + 2,
            background: 'linear-gradient(135deg, #f7f8fa 0%, #ffffff 100%)',
            border: '1px solid',
            borderColor: theme.palette.grey[200],
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Avatar
                src={user?.avatar}
                sx={{
                  bgcolor: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  width: isMobile ? 36 : 44,
                  height: isMobile ? 36 : 44,
                  mr: isMobile ? 1.5 : 2,
                  fontSize: isMobile ? '0.9rem' : '1.1rem',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px 0 rgba(3, 108, 163, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {getUserInitials()}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontSize: isMobile ? '0.85rem' : '0.95rem',
                    fontWeight: 600,
                    color: theme.palette.grey[800],
                    lineHeight: 1.2,
                    transition: 'color 0.3s ease',
                    fontFamily: theme.typography.fontFamily,
                  }}
                >
                  {getUserDisplayName()}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.grey[600],
                    fontSize: isMobile ? '0.7rem' : '0.8rem',
                    mt: 0.5,
                    transition: 'color 0.3s ease',
                    fontFamily: theme.typography.fontFamily,
                  }}
                >
                  {user?.role || 'Property Manager'}
                </Typography>
              </Box>
            </Box>

            {/* Logout Button */}
            <IconButton
              onClick={handleLogout}
              size="small"
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  scale: 1.05,
                  duration: 0.2,
                  ease: 'power2.out',
                })
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  scale: 1,
                  duration: 0.2,
                  ease: 'power2.out',
                })
              }}
              sx={{
                color: theme.palette.grey[600],
                backgroundColor: theme.palette.grey[100],
                width: isMobile ? 32 : 36,
                height: isMobile ? 32 : 36,
                ml: 1,
                transition: 'background-color 0.2s ease, transform 0.2s ease, color 0.2s ease',
                '&:hover': {
                  backgroundColor: theme.palette.error.main,
                  color: theme.palette.common.white,
                },
              }}
            >
              <LogoutIcon fontSize={isMobile ? 'small' : 'medium'} />
            </IconButton>
          </Box>
        </Paper>
      </Box>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button - Only show when drawer is closed */}
      {isMobile && !mobileOpen && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            top: { xs: 13, sm: 12, md: 20 }, // Fine-tune position - one pixel up on mobile
            left: { xs: 20, sm: 20, md: 20 }, // Add more space on the right by moving further right
            zIndex: theme.zIndex.drawer + 1,
            backgroundColor: 'transparent',
            color: theme.palette.text.primary,
            width: 'auto',
            height: 'auto',
            borderRadius: 0,
            boxShadow: 'none',
            p: 0, // Remove padding to align precisely
            transition: 'color 0.2s ease',
            '&:hover': {
              backgroundColor: 'transparent',
              color: theme.palette.secondary.main,
            },
            '&:active': {
              transform: 'none',
            },
          }}
        >
          <MenuIcon sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }} />
        </IconButton>
      )}

      {/* Desktop Drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: currentDrawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: currentDrawerWidth,
              boxSizing: 'border-box',
              borderRight: 'none',
              background: `linear-gradient(to bottom, #ffffff, ${theme.palette.background.default})`,
              boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: currentDrawerWidth,
              boxSizing: 'border-box',
              borderRight: 'none',
              background: `linear-gradient(to bottom, #ffffff, ${theme.palette.background.default})`,
              boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  )
}

export default Sidebar
