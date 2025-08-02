import React from 'react'
import { Box } from '@mui/material'
import Sidebar from '../../components/common/Sidebar'
import Titlebar from '../../components/basic/Titlebar'
import {
  TotalPropertiesMetricCard,
  ActiveTenantsMetricCard,
  OccupancyRateMetricCard,
  PortfolioValueMetricCard,
  RevenueBreakdownCard,
  CashFlowTrendsCard,
} from '../../components/analytics'

const Analytics: React.FC = () => {
  const handleAddAnalyticsItem = () => {
    console.log('Add analytics item clicked')
  }

  const handleSearchAnalytics = (searchTerm: string) => {
    console.log('Analytics search:', searchTerm)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Titlebar at the top */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: { xs: 0, md: '280px' },
          right: 0,
          zIndex: 1200,
          backgroundColor: 'background.paper',
          borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
        }}
      >
        <Titlebar
          title="Analytics"
          searchPlaceholder="Search analytics..."
          addButtonText="Add Report"
          onAdd={handleAddAnalyticsItem}
          onSearch={handleSearchAnalytics}
        />
      </Box>

      {/* Main layout with sidebar and content */}
      <Box sx={{ display: 'flex', flexGrow: 1, pt: { xs: '80px', md: '100px' } }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, px: { xs: 1.5, sm: 2 }, py: 2 }}>
          {/* Top Row - Analytics Metrics */}
          <Box
            sx={{
              display: 'flex',
              gap: { xs: 0.5, sm: 1 },
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Box
              sx={{
                flex: {
                  xs: '1 1 calc(50% - 4px)',
                  sm: '1 1 calc(50% - 8px)',
                  md: '1 1 calc(25% - 8px)',
                },
                minWidth: { xs: 150, sm: 180, md: 200 },
              }}
            >
              <TotalPropertiesMetricCard />
            </Box>
            <Box
              sx={{
                flex: {
                  xs: '1 1 calc(50% - 4px)',
                  sm: '1 1 calc(50% - 8px)',
                  md: '1 1 calc(25% - 8px)',
                },
                minWidth: { xs: 150, sm: 180, md: 200 },
              }}
            >
              <ActiveTenantsMetricCard />
            </Box>
            <Box
              sx={{
                flex: {
                  xs: '1 1 calc(50% - 4px)',
                  sm: '1 1 calc(50% - 8px)',
                  md: '1 1 calc(25% - 8px)',
                },
                minWidth: { xs: 150, sm: 180, md: 200 },
              }}
            >
              <OccupancyRateMetricCard />
            </Box>
            <Box
              sx={{
                flex: {
                  xs: '1 1 calc(50% - 4px)',
                  sm: '1 1 calc(50% - 8px)',
                  md: '1 1 calc(25% - 8px)',
                },
                minWidth: { xs: 150, sm: 180, md: 200 },
              }}
            >
              <PortfolioValueMetricCard />
            </Box>
          </Box>

          {/* Second Row - Revenue Breakdown */}
          <Box
            sx={{
              display: 'flex',
              gap: { xs: 2, sm: 1 },
              mb: 2,
              flexDirection: { xs: 'column', md: 'row' },
            }}
          >
            <Box
              sx={{
                flex: { xs: '1 1 100%', md: '1 1 calc(50% - 4px)' },
                minWidth: { xs: 300, md: 400 },
              }}
            >
              <RevenueBreakdownCard />
            </Box>
            {/* Cash Flow Trends Card */}
            <Box
              sx={{
                flex: { xs: '1 1 100%', md: '1 1 calc(50% - 4px)' },
                minWidth: { xs: 300, md: 400 },
              }}
            >
              <CashFlowTrendsCard />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Analytics
