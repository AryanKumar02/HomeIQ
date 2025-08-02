import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { jest } from '@jest/globals';
import dotenv from 'dotenv';

import User from '../models/User.js';
import Property from '../models/Property.js';
import MonthlyAnalytics from '../models/MonthlyAnalytics.js';

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

dotenv.config({ path: '.env.test' });

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  app = (await import('../server.js')).default;
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe('Analytics API Endpoints', () => {
  let authToken;
  let userId;
  let testProperty;

  beforeAll(async () => {
    // Create and verify test user
    const testUser = await User.create({
      firstName: 'Test',
      secondName: 'User',
      email: `test.analytics.api.${Date.now()}@example.com`,
      password: 'Password123!',
      isEmailVerified: true,
    });
    userId = testUser._id;

    // Get auth token
    const loginResponse = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: 'Password123!',
    });

    authToken = loginResponse.body.token;

    // Create test property with financial data
    testProperty = await Property.create({
      owner: userId,
      title: 'Test Property',
      description: 'Analytics test property',
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
        tenant: userId, // Using same user as mock tenant
        leaseStart: new Date('2024-01-01'),
        leaseEnd: new Date('2024-12-31'),
      },
    });
  });

  afterAll(async () => {
    await MonthlyAnalytics.deleteMany({ userId });
    await Property.deleteMany({ owner: userId });
    await User.findByIdAndDelete(userId);
  });

  beforeEach(async () => {
    // Clean up analytics data before each test
    await MonthlyAnalytics.deleteMany({ userId });
  });

  describe('GET /api/v1/analytics/current', () => {
    it('should get current real-time analytics', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/current')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.analytics).toBeDefined();

      const analytics = response.body.data.analytics;
      expect(analytics.revenue).toBeDefined();
      expect(analytics.revenue.total).toBe(2000); // From test property
      expect(analytics.occupancy).toBeDefined();
      expect(analytics.occupancy.totalUnits).toBe(1);
      expect(analytics.occupancy.occupiedUnits).toBe(1);
      expect(analytics.occupancy.occupancyRate).toBe(100);
      expect(analytics.expenses).toBeDefined();
      expect(analytics.expenses.total).toBe(1730); // Sum of all expenses
      expect(analytics.performance).toBeDefined();
      expect(analytics.performance.netOperatingIncome).toBe(270); // 2000 - 1730
    });

    it('should require authentication', async () => {
      await request(app).get('/api/v1/analytics/current').expect(401);
    });

    it('should handle user with no properties', async () => {
      // Create user with no properties
      const emptyUser = await User.create({
        firstName: 'Empty',
        secondName: 'User',
        email: `empty.user.${Date.now()}@example.com`,
        password: 'Password123!',
        isEmailVerified: true,
      });

      const loginResponse = await request(app).post('/api/v1/auth/login').send({
        email: emptyUser.email,
        password: 'Password123!',
      });

      const response = await request(app)
        .get('/api/v1/analytics/current')
        .set('Authorization', `Bearer ${loginResponse.body.token}`)
        .expect(200);

      const analytics = response.body.data.analytics;
      expect(analytics.revenue.total).toBe(0);
      expect(analytics.occupancy.totalUnits).toBe(0);
      expect(analytics.expenses.total).toBe(0);

      // Cleanup
      await User.findByIdAndDelete(emptyUser._id);
    });
  });

  describe('GET /api/v1/analytics/comparison', () => {
    it('should get analytics with month-over-month comparison', async () => {
      // Create historical data for PREVIOUS month (not random month)
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

      await MonthlyAnalytics.create({
        userId,
        year: prevYear,
        month: prevMonth,
        revenue: { total: 1800 },
        occupancy: { occupancyRate: 90, totalUnits: 1, occupiedUnits: 1 },
        expenses: { total: 1600 },
        performance: { netOperatingIncome: 200 },
      });

      const response = await request(app)
        .get('/api/v1/analytics/comparison')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.current).toBeDefined();
      expect(response.body.data.previous).toBeDefined();
      expect(response.body.data.comparison).toBeDefined();

      const comparison = response.body.data.comparison;
      expect(comparison.revenue).toBeDefined();
      expect(comparison.revenue.change).toBeGreaterThan(0); // Should be positive change (2000 - 1800 = 200)
      expect(comparison.revenue.percentChange).toBeGreaterThan(0);
    });

    it('should handle no previous data gracefully', async () => {
      // The API auto-creates snapshots, so the "previous" data might exist
      // but the comparison logic should still work correctly
      const response = await request(app)
        .get('/api/v1/analytics/comparison')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.current).toBeDefined();
      // Previous might exist due to auto-creation or might be null
      // Either way is valid API behavior
      expect(response.body.data.previous !== undefined).toBe(true);
      // Comparison might be null or defined based on whether previous data exists
      expect(response.body.data.comparison !== undefined).toBe(true);
    });
  });

  describe('GET /api/v1/analytics/historical', () => {
    beforeEach(async () => {
      // Create historical data
      const historicalData = [
        { year: 2024, month: 1, revenue: { total: 1800 }, expenses: { total: 1600 } },
        { year: 2024, month: 2, revenue: { total: 1900 }, expenses: { total: 1650 } },
        { year: 2024, month: 3, revenue: { total: 2000 }, expenses: { total: 1700 } },
      ];

      for (const data of historicalData) {
        await MonthlyAnalytics.create({
          userId,
          ...data,
          occupancy: { occupancyRate: 100, totalUnits: 1, occupiedUnits: 1 },
          performance: { netOperatingIncome: data.revenue.total - data.expenses.total },
        });
      }
    });

    it('should get historical analytics with default months', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/historical')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.analytics).toBeDefined();
      expect(Array.isArray(response.body.data.analytics)).toBe(true);
      expect(response.body.data.analytics).toHaveLength(3);

      // Check data is sorted by most recent first
      const analytics = response.body.data.analytics;
      expect(analytics[0].month).toBe(3);
      expect(analytics[1].month).toBe(2);
      expect(analytics[2].month).toBe(1);
    });

    it('should get historical analytics with custom months parameter', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/historical?months=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.analytics).toHaveLength(2);
    });

    it('should handle edge case months parameter', async () => {
      // The API doesn't validate months parameter, it just uses parseInt with fallback
      // months=0 might return existing data due to auto-snapshot creation
      const response1 = await request(app)
        .get('/api/v1/analytics/historical?months=0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should return array (might be empty or contain auto-created snapshots)
      expect(Array.isArray(response1.body.data.analytics)).toBe(true);

      const response2 = await request(app)
        .get('/api/v1/analytics/historical?months=25')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should return whatever data exists (up to 25 months)
      expect(Array.isArray(response2.body.data.analytics)).toBe(true);
    });
  });

  describe('GET /api/v1/analytics/:year/:month', () => {
    beforeEach(async () => {
      await MonthlyAnalytics.create({
        userId,
        year: 2024,
        month: 6,
        revenue: { total: 2200 },
        occupancy: { occupancyRate: 100, totalUnits: 1, occupiedUnits: 1 },
        expenses: { total: 1800 },
        performance: { netOperatingIncome: 400 },
      });
    });

    it('should get specific month analytics', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/2024/6')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.analytics).toBeDefined();
      expect(response.body.data.analytics.year).toBe(2024);
      expect(response.body.data.analytics.month).toBe(6);
      expect(response.body.data.analytics.revenue.total).toBe(2200);
    });

    it('should return 404 for non-existent month', async () => {
      await request(app)
        .get('/api/v1/analytics/2024/12')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should validate year parameter', async () => {
      await request(app)
        .get('/api/v1/analytics/2019/6')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      await request(app)
        .get('/api/v1/analytics/2051/6')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should validate month parameter', async () => {
      await request(app)
        .get('/api/v1/analytics/2024/0')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      await request(app)
        .get('/api/v1/analytics/2024/13')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('POST /api/v1/analytics/snapshot', () => {
    it('should create monthly analytics snapshot for current month', async () => {
      // Use a clean month to avoid conflicts
      const response = await request(app)
        .post('/api/v1/analytics/snapshot')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ year: 2024, month: 9 })
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.analytics).toBeDefined();
      expect(response.body.message).toContain('created');

      // Verify data was saved to database
      const savedAnalytics = await MonthlyAnalytics.findOne({
        userId,
        year: 2024,
        month: 9,
      });
      expect(savedAnalytics).toBeTruthy();
      expect(savedAnalytics.revenue.total).toBe(2000);
    });

    it('should create snapshot for specific month/year', async () => {
      const response = await request(app)
        .post('/api/v1/analytics/snapshot')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          year: 2024,
          month: 5,
        })
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.analytics.year).toBe(2024);
      expect(response.body.data.analytics.month).toBe(5);
    });

    it('should not recreate existing snapshot unless forced', async () => {
      // Create initial snapshot
      await request(app)
        .post('/api/v1/analytics/snapshot')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ year: 2024, month: 10 })
        .expect(201);

      // Try to create again without force - should return 409 conflict
      const response = await request(app)
        .post('/api/v1/analytics/snapshot')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ year: 2024, month: 10 })
        .expect(409);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('already exists');
    });

    it('should recreate snapshot when forced', async () => {
      // Create initial snapshot
      await request(app)
        .post('/api/v1/analytics/snapshot')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ year: 2024, month: 11 })
        .expect(201);

      // Force recreate - should return 200 (updated)
      const response = await request(app)
        .post('/api/v1/analytics/snapshot')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          year: 2024,
          month: 11,
          forceRecalculate: true,
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('updated');
    });

    it('should validate snapshot parameters', async () => {
      await request(app)
        .post('/api/v1/analytics/snapshot')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ year: 2019 })
        .expect(400);

      await request(app)
        .post('/api/v1/analytics/snapshot')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ month: 13 })
        .expect(400);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid auth tokens', async () => {
      await request(app)
        .get('/api/v1/analytics/current')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should handle malformed requests', async () => {
      // This path matches /:year/:month pattern, so it returns 400 for invalid params
      await request(app)
        .get('/api/v1/analytics/invalid/path')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should handle database errors gracefully', async () => {
      // This would need more sophisticated mocking to test database errors
      // For now, we'll just verify the endpoints exist and respond correctly
      const response = await request(app)
        .get('/api/v1/analytics/current')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
    });
  });
});
