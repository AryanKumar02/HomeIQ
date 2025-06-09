import React from 'react'
import { Box, Container, Grid, Typography } from '@mui/material'

const stats = [
  { value: '10,000+', label: 'Properties Managed' },
  { value: '5,000+', label: 'Happy Customers' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' },
] as const

/**
 * A simple "social proof / stats" band:
 *  ─ Blue background
 *  ─ Headline + sub‑headline centered
 *  ─ Four key numbers in a responsive grid
 */
const StatsSection: React.FC = () => {
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
        <Grid container spacing={4} justifyContent="center">
          {stats.map((stat) => (
            <Grid
              key={stat.label}
              size={{ xs: 6, md: 3 }}
              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <Typography variant="h4" component="span" fontWeight={700}>
                {stat.value}
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
