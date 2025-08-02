import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { jest } from '@jest/globals';
import dotenv from 'dotenv';

import User from '../models/User.js';
import MonthlyAnalytics from '../models/MonthlyAnalytics.js';

// Mock Redis to avoid connection issues in tests
jest.mock('../config/redis.js', () => ({
  connect: jest.fn().mockResolvedValue(),
  disconnect: jest.fn().mockResolvedValue(),
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
  exists: jest.fn().mockResolvedValue(0),
}));

dotenv.config({ path: '.env.test' });

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('MonthlyAnalytics Model', () => {
  let userId;
  let testAnalytics;

  beforeAll(async () => {
    // Create a test user
    const testUser = await User.create({
      firstName: 'Test',
      secondName: 'User',
      email: `test.analytics.${Date.now()}@example.com`,
      password: 'Password123!',
      isEmailVerified: true,
    });
    userId = testUser._id;
  });

  afterAll(async () => {
    // Clean up test data
    await MonthlyAnalytics.deleteMany({ userId });
    await User.findByIdAndDelete(userId);
  });

  beforeEach(async () => {
    // Clean up any existing analytics for this user
    await MonthlyAnalytics.deleteMany({ userId });
  });

  describe('Schema Validation', () => {
    it('should create a valid monthly analytics document', async () => {
      const analyticsData = {
        userId,
        year: 2024,
        month: 1,
        revenue: {
          total: 5000,
          expected: 5200,
          collected: 4800,
          collectionRate: 92.3,
        },
        occupancy: {
          totalUnits: 10,
          occupiedUnits: 8,
          occupancyRate: 80,
          vacantUnits: 2,
        },
        expenses: {
          total: 3000,
          breakdown: {
            mortgage: 1500,
            taxes: 500,
            insurance: 300,
            maintenance: 400,
            utilities: 300,
          },
        },
        performance: {
          netOperatingIncome: 2000,
          cashFlow: 2000,
          profitMargin: 40,
        },
        portfolio: {
          totalProperties: 5,
          occupiedProperties: 4,
          vacantProperties: 1,
        },
      };

      const analytics = await MonthlyAnalytics.create(analyticsData);
      expect(analytics._id).toBeDefined();
      expect(analytics.userId.toString()).toBe(userId.toString());
      expect(analytics.year).toBe(2024);
      expect(analytics.month).toBe(1);
      expect(analytics.revenue.total).toBe(5000);
      expect(analytics.occupancy.occupancyRate).toBe(80);
      expect(analytics.expenses.total).toBe(3000);
      expect(analytics.performance.netOperatingIncome).toBe(2000);
    });

    it('should require userId, year, and month', async () => {
      const invalidData = {
        revenue: { total: 1000 },
      };

      await expect(MonthlyAnalytics.create(invalidData)).rejects.toThrow();
    });

    it('should validate year range', async () => {
      const invalidData = {
        userId,
        year: 2019, // Below minimum
        month: 1,
      };

      await expect(MonthlyAnalytics.create(invalidData)).rejects.toThrow();
    });

    it('should validate month range', async () => {
      const invalidData = {
        userId,
        year: 2024,
        month: 13, // Above maximum
      };

      await expect(MonthlyAnalytics.create(invalidData)).rejects.toThrow();
    });

    it('should not allow negative revenue values', async () => {
      const invalidData = {
        userId,
        year: 2024,
        month: 1,
        revenue: {
          total: -1000, // Negative value
        },
      };

      await expect(MonthlyAnalytics.create(invalidData)).rejects.toThrow();
    });

    it('should enforce unique constraint on userId, year, month', async () => {
      const analyticsData = {
        userId,
        year: 2024,
        month: 1,
        revenue: { total: 1000 },
      };

      // Create first document
      await MonthlyAnalytics.create(analyticsData);

      // Try to create duplicate
      await expect(MonthlyAnalytics.create(analyticsData)).rejects.toThrow();
    });
  });

  describe('Virtual Fields', () => {
    beforeEach(async () => {
      testAnalytics = await MonthlyAnalytics.create({
        userId,
        year: 2024,
        month: 3,
        revenue: { total: 1000 },
      });
    });

    it('should generate monthString virtual field', () => {
      expect(testAnalytics.monthString).toBe('2024-03');
    });

    it('should generate displayDate virtual field', () => {
      expect(testAnalytics.displayDate).toBe('March 2024');
    });
  });

  describe('Static Methods', () => {
    beforeEach(async () => {
      // Create test data for multiple months
      const months = [
        { year: 2024, month: 1, revenue: { total: 1000 } },
        { year: 2024, month: 2, revenue: { total: 1200 } },
        { year: 2024, month: 3, revenue: { total: 1100 } },
        { year: 2023, month: 12, revenue: { total: 900 } },
      ];

      for (const monthData of months) {
        await MonthlyAnalytics.create({
          userId,
          ...monthData,
        });
      }
    });

    it('should get analytics for a specific month', async () => {
      const result = await MonthlyAnalytics.getForMonth(userId, 2024, 2);
      expect(result).toBeTruthy();
      expect(result.year).toBe(2024);
      expect(result.month).toBe(2);
      expect(result.revenue.total).toBe(1200);
    });

    it('should return null for non-existent month', async () => {
      const result = await MonthlyAnalytics.getForMonth(userId, 2024, 6);
      expect(result).toBeNull();
    });

    it('should get last N months of analytics', async () => {
      const results = await MonthlyAnalytics.getLastNMonths(userId, 3);
      expect(results).toHaveLength(3);
      expect(results[0].year).toBe(2024); // Most recent first
      expect(results[0].month).toBe(3);
      expect(results[1].month).toBe(2);
      expect(results[2].month).toBe(1);
    });

    it('should get year-to-date data', async () => {
      const results = await MonthlyAnalytics.getYearToDate(userId, 2024);
      expect(results).toHaveLength(3);
      expect(results[0].month).toBe(1); // Sorted by month ascending
      expect(results[1].month).toBe(2);
      expect(results[2].month).toBe(3);
    });
  });

  describe('Instance Methods', () => {
    it('should compare with previous month correctly', async () => {
      // Create previous month data
      await MonthlyAnalytics.create({
        userId,
        year: 2024,
        month: 1,
        revenue: { total: 1000 },
        occupancy: { occupancyRate: 80 },
        expenses: { total: 600 },
      });

      // Create current month data
      const currentMonth = await MonthlyAnalytics.create({
        userId,
        year: 2024,
        month: 2,
        revenue: { total: 1200 },
        occupancy: { occupancyRate: 85 },
        expenses: { total: 650 },
      });

      const comparison = await currentMonth.compareWithPrevious();
      expect(comparison).toBeTruthy();
      expect(comparison.revenue.change).toBe(200); // 1200 - 1000
      expect(comparison.revenue.percentChange).toBe(20); // 20% increase
      expect(comparison.occupancy.change).toBe(5); // 85 - 80
      expect(comparison.expenses.change).toBe(50); // 650 - 600
    });

    it('should handle year boundary for previous month comparison', async () => {
      // Create December of previous year
      await MonthlyAnalytics.create({
        userId,
        year: 2023,
        month: 12,
        revenue: { total: 1000 },
        occupancy: { occupancyRate: 75 },
        expenses: { total: 500 },
      });

      // Create January of current year
      const januaryData = await MonthlyAnalytics.create({
        userId,
        year: 2024,
        month: 1,
        revenue: { total: 1100 },
        occupancy: { occupancyRate: 80 },
        expenses: { total: 550 },
      });

      const comparison = await januaryData.compareWithPrevious();
      expect(comparison).toBeTruthy();
      expect(comparison.revenue.change).toBe(100); // 1100 - 1000
      expect(comparison.occupancy.change).toBe(5); // 80 - 75
    });

    it('should return null when no previous month exists', async () => {
      const firstMonth = await MonthlyAnalytics.create({
        userId,
        year: 2024,
        month: 1,
        revenue: { total: 1000 },
      });

      const comparison = await firstMonth.compareWithPrevious();
      expect(comparison).toBeNull();
    });

    it('should handle zero division in percentage calculations', async () => {
      // Create previous month with zero revenue
      await MonthlyAnalytics.create({
        userId,
        year: 2024,
        month: 1,
        revenue: { total: 0 },
        expenses: { total: 0 },
      });

      // Create current month
      const currentMonth = await MonthlyAnalytics.create({
        userId,
        year: 2024,
        month: 2,
        revenue: { total: 1000 },
        expenses: { total: 500 },
      });

      const comparison = await currentMonth.compareWithPrevious();
      expect(comparison.revenue.percentChange).toBe(0); // Should handle division by zero
    });
  });

  describe('Indexes', () => {
    it('should have proper indexes for efficient queries', async () => {
      const indexes = await MonthlyAnalytics.collection.getIndexes();

      // Check for compound unique index
      const compoundIndex = Object.keys(indexes).find(key =>
        key.includes('userId_1_year_1_month_1'),
      );
      expect(compoundIndex).toBeTruthy();

      // Check for time-based indexes
      const yearMonthIndex = Object.keys(indexes).find(key => key.includes('year_1_month_1'));
      expect(yearMonthIndex).toBeTruthy();
    });
  });
});
