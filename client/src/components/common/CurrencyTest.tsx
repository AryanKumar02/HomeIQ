import React from 'react'
import { Box, Typography, Paper, Stack } from '@mui/material'
import { useCurrency } from '../../hooks/useCurrency'

const testPrices = [10, 29, 79, 199, 999, 1999]

const CurrencyTest: React.FC = () => {
  const { currency, formatPrice } = useCurrency()

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stack spacing={4}>
          <Typography variant="h4" gutterBottom>
            Currency Test Component
          </Typography>

          <Box>
            <Typography variant="h6" gutterBottom>
              Current Currency: {currency}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your browser&apos;s locale: {navigator.language}
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Test Prices:
            </Typography>
            <Stack spacing={1}>
              {testPrices.map((price) => (
                <Typography key={price} variant="body1">
                  {formatPrice(price)}
                </Typography>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Note: This component demonstrates the automatic currency detection based on your
              browser&apos;s locale. To test different currencies, you can change your
              browser&apos;s language settings.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  )
}

export default CurrencyTest
