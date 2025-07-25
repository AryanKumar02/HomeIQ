import React, { useEffect, useRef } from 'react'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import ListAltIcon from '@mui/icons-material/ListAlt'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import gsap from 'gsap'

const InteractiveDashboard: React.FC = () => {
  const theme = useTheme()
  const panelRef = useRef<HTMLDivElement>(null)
  const card1Ref = useRef<HTMLDivElement>(null)
  const card2Ref = useRef<HTMLDivElement>(null)
  const card3Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cards = [card1Ref.current, card2Ref.current, card3Ref.current].filter(Boolean)
    const panel = panelRef.current

    if (!panel) return

    // Card hover animations
    cards.forEach((card) => {
      if (card) {
        const initialBoxShadow = window.getComputedStyle(card).boxShadow
        card.addEventListener('mouseenter', () => {
          gsap.set(card, { boxShadow: '0px 12px 24px rgba(0,0,0,0.2)' }) // Apply hover shadow instantly
          gsap.to(card, {
            scale: 1.03,
            y: -4,
            // boxShadow property removed from this tween, as it's set instantly above
            duration: 0.25,
            ease: 'power2.out',
          })
        })
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            scale: 1,
            y: 0,
            boxShadow: initialBoxShadow, // Animate shadow back to initial state
            duration: 0.25,
            ease: 'power2.out',
          })
        })
      }
    })

    // Panel mouse move parallax effect
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event
      const { top, left, width, height } = panel.getBoundingClientRect()

      const xPercent = (clientX - left - width / 2) / (width / 2)
      const yPercent = (clientY - top - height / 2) / (height / 2)

      cards.forEach((card, index) => {
        if (card) {
          gsap.to(card, {
            x: xPercent * (5 + index * 1.5), // Staggered effect, move opposite to mouse
            y: yPercent * (5 + index * 1.5) - (gsap.getProperty(card, 'scale') === 1 ? 0 : 4), // Adjust y based on hover state
            rotationY: xPercent * 3, // Slight 3D tilt
            rotationX: -yPercent * 2,
            duration: 0.5,
            ease: 'power3.out',
          })
        }
      })
    }

    const handleMouseLeavePanel = () => {
      cards.forEach((card) => {
        if (card) {
          gsap.to(card, {
            x: 0,
            // y is handled by hover, ensure it resets if not hovering
            y: gsap.getProperty(card, 'scale') === 1 ? 0 : -4,
            rotationY: 0,
            rotationX: 0,
            duration: 0.5,
            ease: 'power3.out',
          })
        }
      })
    }

    panel.addEventListener('mousemove', handleMouseMove)
    panel.addEventListener('mouseleave', handleMouseLeavePanel)

    return () => {
      panel.removeEventListener('mousemove', handleMouseMove)
      panel.removeEventListener('mouseleave', handleMouseLeavePanel)
      cards.forEach((card) => {
        if (card) {
          // Might need to clear listeners from cards too if they were added with options
          // but gsap.to doesn't add persistent listeners in the same way.
        }
      })
    }
  }, [])

  return (
    <Grid
      ref={panelRef}
      container
      spacing={2}
      sx={{
        p: { xs: 1.5, sm: 2.5 },
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.17)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        width: '100%',
        transformStyle: 'preserve-3d', // Needed for 3D rotations
        perspective: '1000px', // For 3D effect
        transform: 'rotateX(5deg) rotateY(-10deg)', // Added static rotation for angled view
      }}
    >
      <Grid size={{ xs: 12, sm: 6 }}>
        <Paper
          ref={card1Ref}
          elevation={2}
          sx={{
            p: 2,
            borderRadius: 2,
            height: '100%',
            backgroundColor: 'background.paper',
            transformStyle: 'preserve-3d',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TrendingUpIcon sx={{ mr: 1, color: 'secondary.main' }} />
            <Typography variant="h6" component="h3">
              Occupancy Rate
            </Typography>
          </Box>
          <Typography variant="h4" component="p" fontWeight="bold">
            92%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Occupancy Rate
          </Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Paper
          ref={card2Ref}
          elevation={2}
          sx={{
            p: 2,
            borderRadius: 2,
            height: '100%',
            backgroundColor: 'background.paper',
            transformStyle: 'preserve-3d',
          }}
        >
          <Typography variant="h6" component="h3" gutterBottom>
            Quick Stats
          </Typography>
          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ListAltIcon sx={{ mr: 0.5, color: 'secondary.main', fontSize: '1.1rem' }} />
              <Typography variant="body1" component="span" fontWeight="medium">
                150
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ pl: '22px' }}>
              Active Listings
            </Typography>
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AssignmentTurnedInIcon sx={{ mr: 0.5, color: 'secondary.main', fontSize: '1.1rem' }} />
              <Typography variant="body1" component="span" fontWeight="medium">
                12
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ pl: '22px' }}>
              Paid Tenants
            </Typography>
          </Box>
        </Paper>
      </Grid>
      <Grid size={12}>
        <Paper
          ref={card3Ref}
          elevation={2}
          sx={{
            p: 2,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 120,
            backgroundColor: 'background.paper',
            transformStyle: 'preserve-3d',
          }}
        >
          <Typography variant="h6" component="h3" gutterBottom align="left">
            Gross Profit
          </Typography>
          <Box
            sx={{
              height: 60,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              px: 1,
              mb: 1,
            }}
          >
            {[0.3, 0.5, 0.7, 0.4, 0.8, 0.6, 0.9].map((h, i) => (
              <Box
                key={i}
                sx={{
                  width: '10%',
                  height: `${h * 100}%`,
                  backgroundColor: theme.palette.secondary.light,
                  borderRadius: '2px 2px 0 0',
                  transition: 'background-color 0.3s',
                  '&:hover': {
                    backgroundColor: theme.palette.secondary.main,
                  },
                }}
              />
            ))}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  )
}

export default InteractiveDashboard
