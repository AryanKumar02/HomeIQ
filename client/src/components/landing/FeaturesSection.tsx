import React from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useTheme, alpha } from '@mui/material/styles'
import type { SvgIconProps } from '@mui/material/SvgIcon'

//Icons
import ApartmentIcon from '@mui/icons-material/Apartment'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import BuildIcon from '@mui/icons-material/Build'
import BarChartIcon from '@mui/icons-material/BarChart'
import SecurityIcon from '@mui/icons-material/Security'

interface FeatureCardProps {
  icon: React.ReactElement<SvgIconProps>
  title: string
  description: string
  iconBgColorKey: 'primary' | 'success' | 'secondary' | 'warning' | 'error' | 'info'
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, iconBgColorKey }) => {
  const theme = useTheme()
  const iconColor = theme.palette[iconBgColorKey].light
  const iconBgColor = alpha(iconColor, 0.15)

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: '16px',
        border: '1px solid rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'left',
        height: '100%',
        minHeight: 280,
        transition: theme.transitions.create(['box-shadow', 'transform'], {
          duration: theme.transitions.duration.short,
        }),
        boxShadow: '0px 2px 6px rgba(0,0,0,0.04)',
        '&:hover': {
          boxShadow: '0 10px 24px -6px rgba(0,0,0,0.12)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          backgroundColor: iconBgColor,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          color: iconColor,
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: '1.5rem' } })}
      </Box>
      <Typography
        variant="h6"
        component="h3"
        fontWeight={600}
        color="text.primary"
        sx={{ mb: 1.25, fontSize: { xs: '1.25rem', md: '1.35rem' } }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontSize: { xs: '0.9rem', md: '0.95rem' }, maxWidth: 300 }}
      >
        {description}
      </Typography>
    </Paper>
  )
}

const featuresData: Omit<FeatureCardProps, 'iconBgColor' | 'iconColor'>[] = [
  {
    icon: <ApartmentIcon />,
    title: 'Property Management',
    description:
      'Easily manage all your properties in one place. Track occupancy, maintenance schedules, and property details with intuitive tools.',
    iconBgColorKey: 'primary',
  },
  {
    icon: <PeopleOutlineIcon />,
    title: 'Tenant Management',
    description:
      'Keep track of tenant information, lease agreements, and communication history. Streamline the entire tenant lifecycle.',
    iconBgColorKey: 'success',
  },
  {
    icon: <AttachMoneyIcon />,
    title: 'Rent Collection',
    description:
      'Automate rent collection with online payments, track payment history, and send automated reminders for late payments.',
    iconBgColorKey: 'secondary',
  },
  {
    icon: <BuildIcon />,
    title: 'Maintenance Tracking',
    description:
      'Manage maintenance requests, schedule repairs, and track work orders. Keep your properties in top condition.',
    iconBgColorKey: 'warning',
  },
  {
    icon: <BarChartIcon />,
    title: 'Analytics & Reporting',
    description:
      'Get insights into your property performance with detailed analytics, financial reports, and occupancy trends.',
    iconBgColorKey: 'error',
  },
  {
    icon: <SecurityIcon />,
    title: 'Secure & Reliable',
    description:
      'Your data is protected with enterprise-grade security. Enjoy 99.9% uptime and automatic backups.',
    iconBgColorKey: 'info',
  },
]

const FeaturesSection: React.FC = () => {
  const theme = useTheme()
  return (
    <Box
      id="features"
      sx={{
        py: { xs: 6, md: 10 },
        px: { xs: 2, sm: 3, md: 4 },
        backgroundColor: theme.palette.common.white,
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, md: 4 } }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
          <Typography
            variant="h3"
            component="h2"
            fontWeight="bold"
            color="text.primary"
            sx={{ mb: 2 }}
          >
            Everything you need to manage properties
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '768px', mx: 'auto' }}>
            From tenant management to financial reporting, Estate Link provides all the tools you
            need to run your property business efficiently.
          </Typography>
        </Box>

        <Grid
          container
          columnSpacing={{ xs: 6, md: 8 }} // wider horizontal gaps
          rowSpacing={{ xs: 4, md: 6 }} // keep vertical gap moderate
          justifyContent="center"
          alignItems="stretch"
        >
          {featuresData.map((feature, index) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 4 }}
              key={index}
              sx={{ height: '100%', display: 'flex' }}
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                iconBgColorKey={feature.iconBgColorKey}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}

export default FeaturesSection
