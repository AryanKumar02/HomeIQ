import React from 'react'
import { Box, Container, Grid, Typography, Link, Stack } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'

const Footer: React.FC = () => {
  const theme = useTheme()

  const footerLinks = {
    product: [
      { label: 'Features', to: '/#features' },
      { label: 'Pricing', to: '/#pricing' },
      { label: 'About', to: '/#about' },
    ],
    legal: [
      { label: 'Terms of Service', to: '/terms-of-service' },
      { label: 'Privacy Policy', to: '/privacy-policy' },
    ],
    company: [
      { label: 'Contact', to: 'mailto:sales@homeiq.com' },
      { label: 'Support', to: 'mailto:support@homeiq.com' },
    ],
  }

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        py: { xs: 6, md: 8 },
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo and Description */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ mb: 3 }}>
              <Box
                component={RouterLink}
                to="/"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  mb: 2,
                }}
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
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
                Streamline your property management with our all-in-one platform. Trusted by
                thousands of property managers worldwide.
              </Typography>
            </Box>
          </Grid>

          {/* Links */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
                  Product
                </Typography>
                <Stack spacing={1}>
                  {footerLinks.product.map((link) => (
                    <Link
                      key={link.label}
                      component={link.to.startsWith('mailto:') ? 'a' : RouterLink}
                      href={link.to.startsWith('mailto:') ? link.to : undefined}
                      to={!link.to.startsWith('mailto:') ? link.to : undefined}
                      color="text.secondary"
                      sx={{
                        textDecoration: 'none',
                        '&:hover': {
                          color: 'secondary.main',
                        },
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </Stack>
              </Grid>

              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
                  Legal
                </Typography>
                <Stack spacing={1}>
                  {footerLinks.legal.map((link) => (
                    <Link
                      key={link.label}
                      component={RouterLink}
                      to={link.to}
                      color="text.secondary"
                      sx={{
                        textDecoration: 'none',
                        '&:hover': {
                          color: 'secondary.main',
                        },
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </Stack>
              </Grid>

              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
                  Company
                </Typography>
                <Stack spacing={1}>
                  {footerLinks.company.map((link) => (
                    <Link
                      key={link.label}
                      component="a"
                      href={link.to}
                      color="text.secondary"
                      sx={{
                        textDecoration: 'none',
                        '&:hover': {
                          color: 'secondary.main',
                        },
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Copyright */}
        <Box
          sx={{
            mt: { xs: 6, md: 8 },
            pt: 3,
            borderTop: '1px solid',
            borderColor: 'divider',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} EstateLink. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer
