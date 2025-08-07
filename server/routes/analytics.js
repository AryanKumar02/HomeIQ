import express from 'express';
import { body, param } from 'express-validator';

import {
  getCurrentAnalytics,
  getMonthlyAnalytics,
  getHistoricalAnalytics,
  createMonthlySnapshot,
  getAnalyticsWithComparison,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Validation rules
const monthYearValidation = [
  param('year').isInt({ min: 2020, max: 2050 }).withMessage('Year must be between 2020 and 2050'),
  param('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
];

const snapshotValidation = [
  body('year')
    .optional()
    .isInt({ min: 2020, max: 2050 })
    .withMessage('Year must be between 2020 and 2050'),
  body('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('forceRecalculate').optional().isBoolean().withMessage('forceRecalculate must be a boolean'),
];

// Routes

// GET /api/v1/analytics/current
// Get real-time analytics calculated from current properties
router.get('/current', getCurrentAnalytics);

// GET /api/v1/analytics/comparison
// Get current analytics with comparison to previous month
router.get('/comparison', getAnalyticsWithComparison);

// GET /api/v1/analytics/historical?months=6
// Get historical analytics snapshots (default: last 6 months)
router.get('/historical', getHistoricalAnalytics);

// GET /api/v1/analytics/:year/:month
// Get specific month's analytics snapshot
router.get('/:year/:month', monthYearValidation, getMonthlyAnalytics);

// POST /api/v1/analytics/snapshot
// Create monthly analytics snapshot
router.post('/snapshot', snapshotValidation, createMonthlySnapshot);

export default router;
