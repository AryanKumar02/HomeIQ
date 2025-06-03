import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'

// Icons
import CheckIcon from '@mui/icons-material/Check'

const HeroSection: React.FC = () => {
  const theme = useTheme()

  return (
    <Box
      component="section"
      sx={{
        background: 'linear-gradient(to right bottom, #eff6ff, #ffffff)', // Applied user's specified gradient
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
      <Box
        sx={{
          width: '100%',
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
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
            analyze performance all in one place.
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
            color="secondary" // bg-blue-500
            size="large"
            sx={{
              px: 3, // px-8 (MUI large button has decent padding, adjust if needed)
              py: 1.5, // py-4
              fontSize: '1rem', // text-lg
              fontWeight: 600, // font-semibold
              color: 'common.white',
              boxShadow: 'lg',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark, // hover:bg-blue-600
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
              '&:hover': {
                backgroundColor: 'grey.100', // hover:bg-gray-50
                borderColor: 'grey.500',
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
              sx={{ display: 'flex', alignItems: 'center', color: 'grey.600' /* text-gray-500 */ }}
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
      </Box>
    </Box>
  )
}

export default HeroSection
