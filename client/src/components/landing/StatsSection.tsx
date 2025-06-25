import React, { useEffect, useRef } from 'react'
import { Box, Container, Grid, Typography } from '@mui/material'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

const stats = [
  { value: 10000, label: 'Properties Managed' },
  { value: 5000, label: 'Happy Customers' },
  { value: 99.9, label: 'Uptime' },
  { value: 24, label: 'Support' },
] as const

interface GSAPContext {
  targets: () => Array<{ textContent: number }>
}

/**
 * A simple "social proof / stats" band:
 *  ─ Blue background
 *  ─ Headline + sub‑headline centered
 *  ─ Four key numbers in a responsive grid
 */
const StatsSection: React.FC = () => {
  const statsRef = useRef<HTMLDivElement>(null)
  const numberRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    if (!statsRef.current) return

    // Create animation for each stat number
    numberRefs.current.forEach((element, index) => {
      if (!element) return

      const stat = stats[index]
      const isPercentage = stat.label === 'Uptime'
      const isHours = stat.label === 'Support'

      // Set initial state to be invisible
      gsap.set(element, { opacity: 0 })

      gsap.fromTo(
        element,
        {
          textContent: 0,
          opacity: 0,
        },
        {
          textContent: stat.value,
          opacity: 1,
          duration: 2,
          ease: 'power2.out',
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top bottom', // Start when the top of the section hits the bottom of the viewport
            toggleActions: 'play none none none', // Only play once
            once: true, // Ensure it only plays once
          },
          onUpdate: function (this: GSAPContext) {
            if (!element) return
            const target = this.targets()[0]
            const value = Math.round(target.textContent)
            element.textContent = isPercentage
              ? `${value.toFixed(1)}%`
              : isHours
                ? `${value}/7`
                : value.toLocaleString()
          },
        }
      )
    })
  }, [])

  return (
    <Box
      id="about"
      component="section"
      sx={{
        py: { xs: 8, md: 10 },
        px: { xs: 2, sm: 3, md: 4 },
        backgroundColor: 'secondary.main',
        color: 'white',
        textAlign: 'center',
      }}
    >
      <Container maxWidth="lg">
        {/* Headline */}
        <Typography variant="h4" component="h2" fontWeight={700} sx={{ mb: 2 }}>
          Trusted by property managers worldwide
        </Typography>

        {/* Sub‑headline */}
        <Typography variant="subtitle1" sx={{ mb: { xs: 6, md: 8 }, opacity: 0.85 }}>
          Join thousands of satisfied customers who have streamlined their property management
        </Typography>

        {/* Stats grid */}
        <Grid container spacing={4} justifyContent="center" ref={statsRef}>
          {stats.map((stat, index) => (
            <Grid
              key={stat.label}
              size={{ xs: 6, md: 3 }}
              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <Typography
                variant="h4"
                component="span"
                fontWeight={700}
                ref={(el) => {
                  numberRefs.current[index] = el
                }}
              >
                {stat.label === 'Uptime'
                  ? `${stat.value}%`
                  : stat.label === 'Support'
                    ? `${stat.value}/7`
                    : stat.value.toLocaleString()}
              </Typography>
              <Typography variant="subtitle2" component="span" sx={{ opacity: 0.9 }}>
                {stat.label}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}

export default StatsSection
