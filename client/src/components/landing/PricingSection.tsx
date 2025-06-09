import React from 'react'
import { Box, Container, Typography, Button, Paper, Stack, Grid, Link } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import { useNavigate } from 'react-router-dom'
import { useCurrency } from '../../hooks/useCurrency'

interface Plan {
  name: string
  price: number
  features: string[]
  cta: string
  highlight?: boolean
}

const plans: Plan[] = [
  {
    name: 'Starter',
    price: 29,
    features: [
      'Up to 10 properties',
      'Basic tenant management',
      'Online rent collection',
      'Email support',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Professional',
    price: 79,
    features: [
      'Up to 50 properties',
      'Advanced tenant management',
      'Maintenance tracking',
      'Analytics & reporting',
      'Priority support',
    ],
    cta: 'Get Started',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 199,
    features: [
      'Unlimited properties',
      'Multi-user access',
      'Custom integrations',
      'Advanced analytics',
      '24/7 phone support',
    ],
    cta: 'Contact Sales',
  },
]

const PricingPlansSection: React.FC = () => {
  const navigate = useNavigate()
  const { formatPrice } = useCurrency()

  const handleCtaClick = (planName: string, cta: string) => {
    if (cta === 'Get Started') {
      void navigate('/signup', { state: { selectedPlan: planName } })
    }
  }

  return (
    <Box
      id="pricing"
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: 'background.default',
        textAlign: 'center',
      }}
    >
      <Container maxWidth="lg">
        {/* Headings */}
        <Typography
          variant="h4"
          component="h2"
          fontWeight={700}
          sx={{ mb: 2, color: 'text.primary' }}
        >
          Simple, transparent pricing
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: { xs: 6, md: 8 }, color: 'text.secondary' }}>
          Choose the plan that&apos;s right for your business
        </Typography>

        {/* Plans Grid */}
        <Grid container columnSpacing={{ xs: 4, md: 6 }} rowSpacing={4} justifyContent="center">
          {plans.map((plan) => (
            <Grid
              key={plan.name}
              size={{ xs: 12, md: 4 }}
              sx={{ display: 'flex', justifyContent: 'center' }}
            >
              <Paper
                elevation={plan.highlight ? 8 : 1}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  width: '100%',
                  maxWidth: 360,
                  border: plan.highlight ? '2px solid' : '1px solid',
                  borderColor: plan.highlight ? 'secondary.main' : 'divider',
                  position: 'relative',
                  bgcolor: 'background.paper',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: plan.highlight ? 12 : 4,
                  },
                }}
              >
                {/* Highlight badge */}
                {plan.highlight && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -18,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      bgcolor: 'secondary.main',
                      color: 'common.white',
                      px: 2,
                      py: 0.5,
                      borderRadius: 20,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    Most Popular
                  </Box>
                )}

                {/* Plan name */}
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ mb: 3, mt: plan.highlight ? 3 : 0, color: 'text.primary' }}
                >
                  {plan.name}
                </Typography>

                {/* Price */}
                <Typography variant="h3" fontWeight={700} component="div" color="text.primary">
                  {formatPrice(plan.price)}
                  <Typography
                    component="span"
                    variant="h6"
                    sx={{ color: 'text.secondary', ml: 0.5 }}
                  >
                    /month
                  </Typography>
                </Typography>

                {/* Features */}
                <Stack spacing={1.5} sx={{ my: 3, textAlign: 'left', px: { xs: 1, md: 2 } }}>
                  {plan.features.map((feat) => (
                    <Box key={feat} sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckIcon sx={{ color: 'secondary.main', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {feat}
                      </Typography>
                    </Box>
                  ))}
                </Stack>

                {/* CTA Button */}
                {plan.cta === 'Contact Sales' ? (
                  <Link
                    href="mailto:sales@homeiq.com"
                    underline="none"
                    sx={{ width: '100%', display: 'block' }}
                  >
                    <Button
                      fullWidth
                      variant={plan.highlight ? 'contained' : 'outlined'}
                      color={plan.highlight ? 'secondary' : 'primary'}
                      sx={{
                        mt: 2,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                        },
                        transition: 'transform 0.2s ease-in-out',
                      }}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                ) : (
                  <Button
                    fullWidth
                    variant={plan.highlight ? 'contained' : 'outlined'}
                    color={plan.highlight ? 'secondary' : 'primary'}
                    onClick={() => handleCtaClick(plan.name, plan.cta)}
                    sx={{
                      mt: 2,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      },
                      transition: 'transform 0.2s ease-in-out',
                    }}
                  >
                    {plan.cta}
                  </Button>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}

export default PricingPlansSection
