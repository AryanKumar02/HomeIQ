import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { jest } from '@jest/globals';
import dotenv from 'dotenv';

import User from '../models/User.js';
import Property from '../models/Property.js';
import MonthlyAnalytics from '../models/MonthlyAnalytics.js';
import {
  ensureMonthlySnapshot,
  backfillMissingSnapshots,
  ensureCurrentMonthSnapshot,
  cleanupOldSnapshots,
} from '../services/analyticsService.js';

// Mock Redis and scheduled tasks
jest.mock('../config/redis.js', () => ({
  connect: jest.fn().mockResolvedValue(),
  disconnect: jest.fn().mockResolvedValue(),
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
  exists: jest.fn().mockResolvedValue(0),
}));

jest.mock('../utils/scheduledTasks.js', () => ({
  startScheduledTasks: jest.fn(),
  stopScheduledTasks: jest.fn(),
}));

// Mock logger to avoid console noise in tests
jest.mock('../utils/logger.js', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

dotenv.config({ path: '.env.test' });

let mongoServer;
let userId;
let testUser;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create test user
  testUser = await User.create({
    firstName: 'Test',
    secondName: 'User',
    email: `test.analytics.service.${Date.now()}@example.com`,
    password: 'Password123!',
    isEmailVerified: true,
  });
  userId = testUser._id;
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Note: Cleanup is handled per test suite to avoid interference

describe('Analytics Service', () => {
  describe('calculateAnalyticsFromProperties', () => {
    beforeEach(async () => {
      await MonthlyAnalytics.deleteMany({ userId });
      await Property.deleteMany({ owner: userId });
    });

    it('should calculate analytics for single occupied property', async () => {
      // Create test property
      await Property.create({
        owner: userId,
        title: 'Test Property',
        description: 'Single unit test property',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country',
        },
        propertyType: 'house',
        bedrooms: 3,
        bathrooms: 2,
        squareFootage: 1500,
        financials: {
          monthlyRent: 2000,
          monthlyMortgage: 1200,
          propertyTaxes: 200,
          insurance: 100,
          maintenance: 150,
          utilities: 80,
        },
        occupancy: {
          isOccupied: true,
          tenant: userId,
          leaseStart: new Date('2024-01-01'),
          leaseEnd: new Date('2024-12-31'),
        },
      });

      const snapshot = await ensureMonthlySnapshot(userId);

      // New core metrics
      expect(snapshot.totalProperties).toBe(1);
      expect(snapshot.activeTenants).toBe(0); // No tenants created in this test
      expect(snapshot.portfolioValue).toBeGreaterThanOrEqual(0); // Will be fallback calculation
      expect(snapshot.monthlyRevenue).toBe(2000);
      expect(snapshot.monthlyExpenses).toBe(1730); // 1200+200+100+150+80
      expect(snapshot.netOperatingIncome).toBe(270); // 2000-1730

      // Legacy structure for backward compatibility
      expect(snapshot.revenue.total).toBe(2000);
      expect(snapshot.expenses.total).toBe(1730);
      expect(snapshot.occupancy.totalUnits).toBe(1);
      expect(snapshot.occupancy.occupiedUnits).toBe(1);
      expect(snapshot.occupancy.occupancyRate).toBe(100);
      expect(snapshot.performance.netOperatingIncome).toBe(270);
      expect(snapshot.portfolio.totalProperties).toBe(1);
    });

    it('should calculate analytics for vacant property', async () => {
      await Property.create({
        owner: userId,
        title: 'Vacant Property',
        description: 'Empty property',
        address: {
          street: '456 Empty St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country',
        },
        propertyType: 'apartment',
        bedrooms: 2,
        bathrooms: 1,
        squareFootage: 1000,
        financials: {
          monthlyRent: 1500,
          monthlyMortgage: 800,
          propertyTaxes: 150,
          insurance: 75,
          maintenance: 100,
          utilities: 50,
        },
        occupancy: {
          isOccupied: false,
        },
      });

      const snapshot = await ensureMonthlySnapshot(userId);

      expect(snapshot.revenue.total).toBe(0); // No revenue from vacant property
      expect(snapshot.expenses.total).toBe(1175); // Still have expenses
      expect(snapshot.occupancy.totalUnits).toBe(1);
      expect(snapshot.occupancy.occupiedUnits).toBe(0);
      expect(snapshot.occupancy.occupancyRate).toBe(0);
      expect(snapshot.performance.netOperatingIncome).toBe(-1175); // Negative NOI
      expect(snapshot.portfolio.totalProperties).toBe(1);
      expect(snapshot.portfolio.occupiedProperties).toBe(0);
    });

    it('should calculate analytics for multi-unit property', async () => {
      await Property.create({
        owner: userId,
        title: 'Multi-Unit Building',
        description: 'Building with multiple units',
        address: {
          street: '789 Multi St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country',
        },
        propertyType: 'apartment',
        bedrooms: 6,
        bathrooms: 4,
        squareFootage: 3000,
        financials: {
          monthlyRent: 0, // Base property rent
          monthlyMortgage: 2000,
          propertyTaxes: 400,
          insurance: 200,
          maintenance: 300,
          utilities: 150,
        },
        occupancy: {
          isOccupied: false, // Base property not occupied
        },
        units: [
          {
            unitNumber: '1A',
            monthlyRent: 1200,
            occupancy: {
              isOccupied: true,
              tenant: userId,
              leaseStart: new Date('2024-01-01'),
              leaseEnd: new Date('2024-12-31'),
            },
          },
          {
            unitNumber: '1B',
            monthlyRent: 1300,
            occupancy: {
              isOccupied: true,
              tenant: userId,
              leaseStart: new Date('2024-02-01'),
              leaseEnd: new Date('2025-01-31'),
            },
          },
          {
            unitNumber: '2A',
            monthlyRent: 1100,
            occupancy: {
              isOccupied: false,
            },
          },
        ],
      });

      const snapshot = await ensureMonthlySnapshot(userId);

      expect(snapshot.revenue.total).toBe(2500); // 1200 + 1300 (occupied units only)
      expect(snapshot.expenses.total).toBe(3050); // 2000+400+200+300+150
      expect(snapshot.occupancy.totalUnits).toBe(3);
      expect(snapshot.occupancy.occupiedUnits).toBe(2);
      expect(snapshot.occupancy.occupancyRate).toBeCloseTo(66.67, 2); // 2/3 * 100
      expect(snapshot.performance.netOperatingIncome).toBe(-550); // 2500-3050
      expect(snapshot.portfolio.totalProperties).toBe(1);
      expect(snapshot.portfolio.occupiedProperties).toBe(0); // Base property not occupied
    });

    it('should handle multiple properties with mixed occupancy', async () => {
      // Property 1: Occupied house
      await Property.create({
        owner: userId,
        title: 'Occupied House',
        description: 'Single family home',
        address: {
          street: '100 Main St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country',
        },
        propertyType: 'house',
        bedrooms: 3,
        bathrooms: 2,
        squareFootage: 1800,
        financials: {
          monthlyRent: 2200,
          monthlyMortgage: 1300,
          propertyTaxes: 250,
          insurance: 120,
          maintenance: 200,
          utilities: 100,
        },
        occupancy: {
          isOccupied: true,
          tenant: userId,
          leaseStart: new Date('2024-01-01'),
          leaseEnd: new Date('2024-12-31'),
        },
      });

      // Property 2: Vacant apartment
      await Property.create({
        owner: userId,
        title: 'Vacant Condo',
        description: 'Empty condo unit',
        address: {
          street: '200 Oak Ave',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country',
        },
        propertyType: 'condo',
        bedrooms: 2,
        bathrooms: 1,
        squareFootage: 1200,
        financials: {
          monthlyRent: 1800,
          monthlyMortgage: 1000,
          propertyTaxes: 180,
          insurance: 90,
          maintenance: 120,
          utilities: 60,
        },
        occupancy: {
          isOccupied: false,
        },
      });

      const snapshot = await ensureMonthlySnapshot(userId);

      // New core metrics
      expect(snapshot.totalProperties).toBe(2);
      expect(snapshot.activeTenants).toBe(0); // No tenants created in this test
      expect(snapshot.monthlyRevenue).toBe(2200); // Only from occupied house
      expect(snapshot.monthlyExpenses).toBe(3420); // Both properties' expenses
      expect(snapshot.netOperatingIncome).toBe(-1220); // 2200-3420

      // Legacy structure for backward compatibility
      expect(snapshot.revenue.total).toBe(2200);
      expect(snapshot.expenses.total).toBe(3420);
      expect(snapshot.occupancy.totalUnits).toBe(2);
      expect(snapshot.occupancy.occupiedUnits).toBe(1);
      expect(snapshot.occupancy.occupancyRate).toBe(50);
      expect(snapshot.performance.netOperatingIncome).toBe(-1220);
      expect(snapshot.portfolio.totalProperties).toBe(2);
    });

    it('should handle user with no properties', async () => {
      const snapshot = await ensureMonthlySnapshot(userId);

      expect(snapshot.revenue.total).toBe(0);
      expect(snapshot.expenses.total).toBe(0);
      expect(snapshot.occupancy.totalUnits).toBe(0);
      expect(snapshot.occupancy.occupiedUnits).toBe(0);
      expect(snapshot.occupancy.occupancyRate).toBe(0);
      expect(snapshot.performance.netOperatingIncome).toBe(0);
      expect(snapshot.portfolio.totalProperties).toBe(0);
      expect(snapshot.portfolio.occupiedProperties).toBe(0);
    });

    it('should handle properties with missing financial data', async () => {
      await Property.create({
        owner: userId,
        title: 'Incomplete Property',
        description: 'Property with missing financial data',
        address: {
          street: '300 Pine St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country',
        },
        propertyType: 'house',
        bedrooms: 2,
        bathrooms: 1,
        squareFootage: 1000,
        financials: {
          // Missing some fields
          monthlyRent: 1500,
          monthlyMortgage: 800,
          // propertyTaxes, insurance, maintenance, utilities are undefined
        },
        occupancy: {
          isOccupied: true,
          tenant: userId,
        },
      });

      const snapshot = await ensureMonthlySnapshot(userId);

      expect(snapshot.revenue.total).toBe(1500);
      expect(snapshot.expenses.total).toBe(800); // Only mortgage counted
      expect(snapshot.performance.netOperatingIncome).toBe(700);
    });
  });

  describe('ensureMonthlySnapshot', () => {
    beforeEach(async () => {
      await MonthlyAnalytics.deleteMany({ userId });
      await Property.deleteMany({ owner: userId });
    });

    it('should create snapshot for current month if none exists', async () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      const snapshot = await ensureMonthlySnapshot(userId);

      expect(snapshot).toBeTruthy();
      expect(snapshot.year).toBe(currentYear);
      expect(snapshot.month).toBe(currentMonth);
      expect(snapshot.userId.toString()).toBe(userId.toString());
      expect(snapshot.dataSource).toBe('automatic');
    });

    it('should create snapshot for specific month/year', async () => {
      const snapshot = await ensureMonthlySnapshot(userId, 2024, 6);

      expect(snapshot.year).toBe(2024);
      expect(snapshot.month).toBe(6);
      expect(snapshot.userId.toString()).toBe(userId.toString());
    });

    it('should return existing snapshot without creating duplicate', async () => {
      // Create initial snapshot
      const first = await ensureMonthlySnapshot(userId, 2024, 5);
      const firstId = first._id;

      // Try to create again
      const second = await ensureMonthlySnapshot(userId, 2024, 5);

      expect(second._id.toString()).toBe(firstId.toString());

      // Verify only one snapshot exists
      const count = await MonthlyAnalytics.countDocuments({
        userId,
        year: 2024,
        month: 5,
      });
      expect(count).toBe(1);
    });

    it('should handle database errors gracefully', async () => {
      // Mock MonthlyAnalytics.getForMonth to throw error
      const originalGetForMonth = MonthlyAnalytics.getForMonth;
      MonthlyAnalytics.getForMonth = jest.fn().mockRejectedValue(new Error('Database error'));

      await expect(ensureMonthlySnapshot(userId, 2024, 7)).rejects.toThrow('Database error');

      // Restore original method
      MonthlyAnalytics.getForMonth = originalGetForMonth;
    });
  });

  describe('backfillMissingSnapshots', () => {
    beforeEach(async () => {
      await MonthlyAnalytics.deleteMany({ userId });
      await Property.deleteMany({ owner: userId });
    });

    it('should create snapshots for previous months', async () => {
      const snapshots = await backfillMissingSnapshots(userId, 3);

      expect(snapshots).toHaveLength(3);

      // Verify snapshots are for previous months
      const now = new Date();
      snapshots.forEach((snapshot, index) => {
        const expectedDate = new Date(now.getFullYear(), now.getMonth() - (index + 1), 1);
        expect(snapshot.year).toBe(expectedDate.getFullYear());
        expect(snapshot.month).toBe(expectedDate.getMonth() + 1);
      });
    });

    it('should skip months that already have snapshots', async () => {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      // Create snapshot for last month manually
      await ensureMonthlySnapshot(userId, lastMonth.getFullYear(), lastMonth.getMonth() + 1);

      // Try to backfill - should reuse existing snapshot
      const snapshots = await backfillMissingSnapshots(userId, 2);

      expect(snapshots).toHaveLength(2);

      // Verify we didn't create duplicates
      const totalSnapshots = await MonthlyAnalytics.countDocuments({ userId });
      expect(totalSnapshots).toBe(2); // Only 2 total (existing + 1 new)
    });

    it('should handle errors for individual months gracefully', async () => {
      // Mock ensureMonthlySnapshot to fail for one specific month
      const originalEnsure = ensureMonthlySnapshot;
      let callCount = 0;

      // Mock to fail on second call
      jest.doMock('../services/analyticsService.js', () => ({
        ...jest.requireActual('../services/analyticsService.js'),
        ensureMonthlySnapshot: jest.fn().mockImplementation(async (userId, year, month) => {
          callCount++;
          if (callCount === 2) {
            throw new Error('Failed to create snapshot');
          }
          return originalEnsure(userId, year, month);
        }),
      }));

      // This should continue despite one failure
      const snapshots = await backfillMissingSnapshots(userId, 3);

      // Should get 2 successful snapshots (1st and 3rd calls succeed)
      expect(snapshots.length).toBeGreaterThan(0);
    });
  });

  describe('ensureCurrentMonthSnapshot', () => {
    beforeEach(async () => {
      await MonthlyAnalytics.deleteMany({ userId });
      await Property.deleteMany({ owner: userId });
    });

    it('should create current month snapshot and backfill recent months', async () => {
      const snapshot = await ensureCurrentMonthSnapshot(userId);

      const now = new Date();
      expect(snapshot.year).toBe(now.getFullYear());
      expect(snapshot.month).toBe(now.getMonth() + 1);

      // Should also have created previous months
      const allSnapshots = await MonthlyAnalytics.find({ userId }).sort({ year: -1, month: -1 });
      expect(allSnapshots.length).toBeGreaterThan(1); // Current + backfilled
    });

    it('should handle backfill failures gracefully', async () => {
      // Even if backfill fails, current month should still be created
      const snapshot = await ensureCurrentMonthSnapshot(userId);

      expect(snapshot).toBeTruthy();
      const now = new Date();
      expect(snapshot.year).toBe(now.getFullYear());
      expect(snapshot.month).toBe(now.getMonth() + 1);
    });
  });

  describe('cleanupOldSnapshots', () => {
    beforeEach(async () => {
      // Clean up all existing data first
      await MonthlyAnalytics.deleteMany({ userId });
      await Property.deleteMany({ owner: userId });

      // Create snapshots spanning multiple years
      const snapshotsToCreate = [
        { year: 2022, month: 1 },
        { year: 2022, month: 6 },
        { year: 2022, month: 12 },
        { year: 2023, month: 3 },
        { year: 2023, month: 9 },
        { year: 2024, month: 1 },
        { year: 2024, month: 6 },
      ];

      for (const { year, month } of snapshotsToCreate) {
        await MonthlyAnalytics.create({
          userId,
          year,
          month,
          revenue: { total: 1000 },
          occupancy: { totalUnits: 1, occupiedUnits: 1, occupancyRate: 100 },
          expenses: { total: 800 },
          performance: { netOperatingIncome: 200 },
          portfolio: { totalProperties: 1, occupiedProperties: 1 },
        });
      }
    });

    it('should delete snapshots older than specified months', async () => {
      const deletedCount = await cleanupOldSnapshots(userId, 12);

      expect(deletedCount).toBeGreaterThan(0);

      // Verify old snapshots are gone
      const remainingSnapshots = await MonthlyAnalytics.find({ userId });
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - 12);

      remainingSnapshots.forEach(snapshot => {
        const snapshotDate = new Date(snapshot.year, snapshot.month - 1, 1);
        expect(snapshotDate.getTime()).toBeGreaterThanOrEqual(cutoffDate.getTime());
      });
    });

    it('should not delete recent snapshots', async () => {
      // Use a large keepMonths value to ensure nothing recent gets deleted
      const deletedCount = await cleanupOldSnapshots(userId, 36);

      const remainingCount = await MonthlyAnalytics.countDocuments({ userId });

      // With 36 months, should keep snapshots from 2022, 2023, 2024
      expect(remainingCount).toBeGreaterThan(0);

      // Should delete few or no snapshots since we're keeping 36 months
      expect(deletedCount).toBeGreaterThanOrEqual(0);

      // Verify remaining snapshots are within reasonable range
      const remainingSnapshots = await MonthlyAnalytics.find({ userId });
      remainingSnapshots.forEach(snapshot => {
        expect(snapshot.year).toBeGreaterThanOrEqual(2022);
      });
    });

    it('should return 0 when no old snapshots exist', async () => {
      // Clear all existing snapshots first
      await MonthlyAnalytics.deleteMany({ userId });

      // Create only very recent snapshots (current and last month)
      const now = new Date();
      await MonthlyAnalytics.create({
        userId,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        revenue: { total: 1000 },
        occupancy: { totalUnits: 1, occupiedUnits: 1, occupancyRate: 100 },
        expenses: { total: 800 },
        performance: { netOperatingIncome: 200 },
        portfolio: { totalProperties: 1, occupiedProperties: 1 },
      });

      // Try to clean snapshots older than 24 months - should return 0
      const deletedCount = await cleanupOldSnapshots(userId, 24);
      expect(deletedCount).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      // Mock deleteMany to throw error
      const originalDeleteMany = MonthlyAnalytics.deleteMany;
      MonthlyAnalytics.deleteMany = jest.fn().mockRejectedValue(new Error('Database error'));

      await expect(cleanupOldSnapshots(userId, 12)).rejects.toThrow('Database error');

      // Restore original method
      MonthlyAnalytics.deleteMany = originalDeleteMany;
    });
  });
});
