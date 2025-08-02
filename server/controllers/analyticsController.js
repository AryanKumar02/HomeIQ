import { validationResult } from 'express-validator';

import MonthlyAnalytics from '../models/MonthlyAnalytics.js';
import Property from '../models/Property.js';
import {
  ensureCurrentMonthSnapshot,
  calculateAnalyticsFromProperties,
} from '../services/analyticsService.js';

// Get current month analytics (calculated in real-time)
export const getCurrentAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const analytics = await calculateAnalyticsFromProperties(userId);

    res.status(200).json({
      status: 'success',
      data: {
        analytics: {
          ...analytics,
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          calculatedAt: new Date(),
          isRealTime: true,
        },
      },
    });
  } catch (error) {
    console.error('Get current analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to calculate current analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get monthly analytics snapshot
export const getMonthlyAnalytics = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { year, month } = req.params;
    const userId = req.user.id;

    const analytics = await MonthlyAnalytics.getForMonth(userId, parseInt(year), parseInt(month));

    if (!analytics) {
      return res.status(404).json({
        status: 'error',
        message: 'Analytics data not found for the specified month',
      });
    }

    // Get month-over-month comparison
    const comparison = await analytics.compareWithPrevious();

    res.status(200).json({
      status: 'success',
      data: {
        analytics,
        comparison,
      },
    });
  } catch (error) {
    console.error('Get monthly analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve monthly analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get historical analytics (last N months)
export const getHistoricalAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const months = parseInt(req.query.months) || 6;

    const analytics = await MonthlyAnalytics.getLastNMonths(userId, months);

    res.status(200).json({
      status: 'success',
      results: analytics.length,
      data: {
        analytics,
      },
    });
  } catch (error) {
    console.error('Get historical analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve historical analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Create/Update monthly snapshot
export const createMonthlySnapshot = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const { year, month, forceRecalculate } = req.body;

    const targetYear = year || new Date().getFullYear();
    const targetMonth = month || new Date().getMonth() + 1;

    // Check if snapshot already exists
    const existingSnapshot = await MonthlyAnalytics.getForMonth(userId, targetYear, targetMonth);

    if (existingSnapshot && !forceRecalculate) {
      return res.status(409).json({
        status: 'error',
        message: 'Monthly snapshot already exists. Use forceRecalculate=true to overwrite.',
        data: { analytics: existingSnapshot },
      });
    }

    // Calculate analytics from current properties
    const calculatedAnalytics = await calculateAnalyticsFromProperties(userId);

    // Create or update snapshot
    const snapshotData = {
      userId,
      year: targetYear,
      month: targetMonth,
      ...calculatedAnalytics,
      calculatedAt: new Date(),
      dataSource: 'manual',
    };

    let snapshot;
    if (existingSnapshot) {
      // Update existing
      Object.assign(existingSnapshot, snapshotData);
      snapshot = await existingSnapshot.save();
    } else {
      // Create new
      snapshot = new MonthlyAnalytics(snapshotData);
      await snapshot.save();
    }

    // Get comparison with previous month
    const comparison = await snapshot.compareWithPrevious();

    res.status(existingSnapshot ? 200 : 201).json({
      status: 'success',
      message: existingSnapshot
        ? 'Monthly snapshot updated successfully'
        : 'Monthly snapshot created successfully',
      data: {
        analytics: snapshot,
        comparison,
      },
    });
  } catch (error) {
    console.error('Create monthly snapshot error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        status: 'error',
        message: 'Monthly snapshot already exists for this period',
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Failed to create monthly snapshot',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get analytics with comparison (current vs specified month)
export const getAnalyticsWithComparison = async (req, res) => {
  try {
    const userId = req.user.id;

    // Automatically ensure current month snapshot exists (silently in background)
    try {
      await ensureCurrentMonthSnapshot(userId);
    } catch (snapshotError) {
      console.warn('Failed to auto-create snapshot, continuing:', snapshotError);
    }

    // Get current analytics
    const currentAnalytics = await calculateAnalyticsFromProperties(userId);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Get previous month for comparison
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const previousSnapshot = await MonthlyAnalytics.getForMonth(userId, prevYear, prevMonth);

    let comparison = null;
    if (previousSnapshot) {
      comparison = {
        revenue: {
          change: currentAnalytics.revenue.total - previousSnapshot.revenue.total,
          percentChange:
            previousSnapshot.revenue.total > 0
              ? ((currentAnalytics.revenue.total - previousSnapshot.revenue.total) /
                  previousSnapshot.revenue.total) *
                100
              : 0,
        },
        occupancy: {
          change:
            currentAnalytics.occupancy.occupancyRate - previousSnapshot.occupancy.occupancyRate,
          percentChange:
            currentAnalytics.occupancy.occupancyRate - previousSnapshot.occupancy.occupancyRate,
        },
        expenses: {
          change: currentAnalytics.expenses.total - previousSnapshot.expenses.total,
          percentChange:
            previousSnapshot.expenses.total > 0
              ? ((currentAnalytics.expenses.total - previousSnapshot.expenses.total) /
                  previousSnapshot.expenses.total) *
                100
              : 0,
        },
      };
    }

    res.status(200).json({
      status: 'success',
      data: {
        current: {
          ...currentAnalytics,
          year: currentYear,
          month: currentMonth,
          calculatedAt: new Date(),
        },
        previous: previousSnapshot,
        comparison,
      },
    });
  } catch (error) {
    console.error('Get analytics with comparison error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve analytics with comparison',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
