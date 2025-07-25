import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'
// Icons
import CheckIcon from '@mui/icons-material/Check'
import Grid from '@mui/material/Grid'
import InteractiveDashboard from './InteractiveDashboard'

const HeroSection: React.FC = () => {
  const theme = useTheme()

  return (
    <Box
      component="section"
      sx={{
        background: `linear-gradient(to right bottom, ${theme.palette.secondary.light}10, ${theme.palette.background.paper})`, // Blue theme gradient
        py: 10, // Padding top and bottom
        flexGrow: 1, // Make this Box fill available vertical space
        display: 'flex', // To control alignment of the child Container
        alignItems: 'center', // To vertically center the Container
        width: '100vw', // span full viewport width
        position: 'relative',
        left: '50%',
        transform: 'translateX(-50%)', // recenters the 100vw box
      }}
    >
      <Grid
        container
        spacing={4}
        sx={{
          width: '100%',
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            component="h1" // Semantically this block is the main heading
            sx={{
              mb: 3, // Kept bottom margin from original heading
              pl: { xs: 2, sm: 3, md: 4 }, // Added responsive left padding
            }}
          >
            <Typography
              variant="h2" // Maintain visual style
              component="div" // Each part is a block within the h1
              fontWeight="bold"
              color="black"
              lineHeight={1.2}
              sx={{ fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' } }} // Font size from previous adjustment
            >
              Property
            </Typography>
            <Typography
              variant="h2"
              component="div"
              fontWeight="bold"
              color="black"
              lineHeight={1.2}
              sx={{ fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' } }}
            >
              Management
            </Typography>
            <Typography
              variant="h2"
              component="div"
              fontWeight="bold"
              color="secondary.main" // "Simplified" is in primary color
              lineHeight={1.2}
              sx={{ fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' } }}
            >
              Simplified
            </Typography>
          </Box>
          <Box sx={{ pl: { xs: 2, sm: 3, md: 4 }, mb: 4 }}>
            <Typography
              component="div"
              color="grey.700"
              lineHeight={1.7}
              sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}
            >
              Streamline your property management with our comprehensive
            </Typography>
            <Typography
              component="div"
              color="grey.700"
              lineHeight={1.7}
              sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}
            >
              platform. Manage tenants, track rent, handle maintenance, and
            </Typography>
            <Typography
              component="div"
              color="grey.700"
              lineHeight={1.7}
              sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}
            >
              analyse performance all in one place.
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              mb: 4,
              pl: { xs: 2, sm: 3, md: 4 },
            }}
          >
            {' '}
            {/* Added pl for alignment */}
            <Button
              variant="contained"
              color="secondary" // Use secondary blue color
              size="large"
              sx={{
                px: 3, // px-8 (MUI large button has decent padding, adjust if needed)
                py: 1.5, // py-4
                fontSize: '1rem', // text-lg
                fontWeight: 600, // font-semibold
                color: 'common.white',
                boxShadow: 'lg',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    pointerEvents: 'none',
                  },
                },
                '&:active': {
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    pointerEvents: 'none',
                  },
                },
              }}
            >
              Start Free Trial
            </Button>
            <Button
              variant="outlined"
              color="inherit" // border-gray-300 text-gray-700
              size="large"
              sx={{
                px: 3,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderColor: 'grey.400',
                color: 'grey.800',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  borderColor: 'grey.500',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    pointerEvents: 'none',
                  },
                },
                '&:active': {
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                    pointerEvents: 'none',
                  },
                },
              }}
            >
              Watch Demo
            </Button>
          </Box>
          <Box
            sx={{
              mt: 4,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { sm: 'center' },
              gap: { xs: 1.5, sm: 3 },
              pl: { xs: 2, sm: 3, md: 4 },
            }}
          >
            {' '}
            {/* Added pl for alignment */}
            {['14-day free trial', 'No credit card required', 'Cancel anytime'].map((text) => (
              <Box
                key={text}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'grey.600' /* text-gray-500 */,
                }}
              >
                <CheckIcon sx={{ color: 'success.main', mr: 1, fontSize: '1.25rem' }} />{' '}
                {/* Changed icon and text-green-500 */}
                <Typography variant="body2" component="span" sx={{ fontSize: '0.9rem' }}>
                  {' '}
                  {/* text-sm */}
                  {text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Grid>
        <Grid
          size={{ xs: 12, md: 6 }}
          display="flex"
          flexDirection="column"
          alignItems={{ xs: 'center', md: 'stretch' }} // md: 'stretch' allows InteractiveDashboard to control its own width/maxwidth
          justifyContent="center"
          sx={{
            pl: { md: 2 },
            pr: { md: 2 },
            py: { xs: 4, md: 0 }, // Add some vertical padding on mobile for the dashboard
            maxWidth: { xs: '100%', sm: 500, md: 'calc(50% - 16px)' }, // Control max width here
            mx: { xs: 'auto', md: 0 }, // Center on xs, default on md
          }}
        >
          <InteractiveDashboard />
        </Grid>
      </Grid>
    </Box>
  )
}

export default HeroSection
