import React from 'react'
import { Box, Container, Typography, Link, Stack, IconButton } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import FacebookIcon from '@mui/icons-material/Facebook'
import TwitterIcon from '@mui/icons-material/Twitter'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import InstagramIcon from '@mui/icons-material/Instagram'

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 3, md: 6 }}
          justifyContent="space-between"
          alignItems={{ xs: 'center', md: 'flex-start' }}
        >
          {/* Logo and Description */}
          <Box sx={{ maxWidth: 300, textAlign: { xs: 'center', md: 'left' } }}>
            <picture>
              <source srcSet="/assets/logo.webp" type="image/webp" />
              <Box
                component="img"
                src="/assets/logo.png"
                alt="EstateLink logo"
                sx={{ height: 40, width: 40, mb: 1 }}
              />
            </picture>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Streamline your property management with EstateLink. The all-in-one solution for
              modern property managers.
            </Typography>
            <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', md: 'flex-start' }}>
              <IconButton size="small" color="primary" aria-label="Facebook">
                <FacebookIcon />
              </IconButton>
              <IconButton size="small" color="primary" aria-label="Twitter">
                <TwitterIcon />
              </IconButton>
              <IconButton size="small" color="primary" aria-label="LinkedIn">
                <LinkedInIcon />
              </IconButton>
              <IconButton size="small" color="primary" aria-label="Instagram">
                <InstagramIcon />
              </IconButton>
            </Stack>
          </Box>

          {/* Quick Links */}
          <Stack spacing={2} alignItems={{ xs: 'center', md: 'flex-start' }}>
            <Typography variant="subtitle2" fontWeight={600} color="text.primary">
              Quick Links
            </Typography>
            <Link href="/#features" color="text.secondary" underline="hover">
              Features
            </Link>
            <Link href="/#about" color="text.secondary" underline="hover">
              About
            </Link>
            <Link href="/#pricing" color="text.secondary" underline="hover">
              Pricing
            </Link>
            <Link href="mailto:sales@homeiq.com" color="text.secondary" underline="hover">
              Contact
            </Link>
          </Stack>

          {/* Legal */}
          <Stack spacing={2} alignItems={{ xs: 'center', md: 'flex-start' }}>
            <Typography variant="subtitle2" fontWeight={600} color="text.primary">
              Legal
            </Typography>
            <Link component={RouterLink} to="/privacy" color="text.secondary" underline="hover">
              Privacy Policy
            </Link>
            <Link component={RouterLink} to="/terms" color="text.secondary" underline="hover">
              Terms of Service
            </Link>
          </Stack>

          {/* Contact */}
          <Stack spacing={2} alignItems={{ xs: 'center', md: 'flex-start' }}>
            <Typography variant="subtitle2" fontWeight={600} color="text.primary">
              Contact Us
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: sales@homeiq.com
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Phone: (555) 123-4567
            </Typography>
          </Stack>
        </Stack>

        {/* Copyright */}
        <Box
          sx={{
            mt: 4,
            pt: 2,
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
