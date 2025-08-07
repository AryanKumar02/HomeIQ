import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { jest } from '@jest/globals';
import dotenv from 'dotenv';

import User from '../models/User.js';
import Property from '../models/Property.js';
import Tenant from '../models/Tenant.js';
import {
  calculateRealTimeAnalytics,
  emitAnalyticsUpdate,
  emitAnalyticsToSocket,
} from '../services/realTimeAnalytics.js';

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
    email: `test.realtime.analytics.${Date.now()}@example.com`,
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

// Helper function to create valid tenant data
const createValidTenant = (overrides = {}) => ({
  createdBy: userId,
  personalInfo: {
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: new Date('1990-01-01'),
  },
  contactInfo: {
    email: `tenant.${Date.now()}@example.com`,
    phone: {
      primary: {
        number: '07123456789', // Valid UK mobile number
      },
    },
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'spouse',
      phone: '07987654321', // Valid UK mobile number
    },
    currentAddress: {
      street: '456 Current St',
      city: 'Current City',
      state: 'Current State',
      zipCode: '54321',
      country: 'United Kingdom',
    },
  },
  employment: {
    current: {
      status: 'employed-full-time', // Valid enum value
    },
  },
  isActive: true,
  leases: [
    {
      property: userId, // Mock property ID
      tenancyType: 'assured-shorthold',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      monthlyRent: 2000,
      status: 'active',
    },
  ],
  privacy: {
    dataRetentionConsent: true,
  },
  ...overrides,
});

// Note: Cleanup is handled per test suite to avoid interference

describe('Real-Time Analytics Service', () => {
  describe('calculateRealTimeAnalytics', () => {
    beforeEach(async () => {
      await Property.deleteMany({ owner: userId });
      await Tenant.deleteMany({ createdBy: userId });
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

      // Create active tenant
      await Tenant.create(createValidTenant());

      const analytics = await calculateRealTimeAnalytics(userId);

      expect(analytics.revenue.total).toBe(2000);
      expect(analytics.expenses.total).toBe(1730); // 1200+200+100+150+80
      expect(analytics.occupancy.totalUnits).toBe(1);
      expect(analytics.occupancy.occupiedUnits).toBe(1);
      expect(analytics.occupancy.occupancyRate).toBe(100);
      expect(analytics.performance.netOperatingIncome).toBe(270); // 2000-1730
      expect(analytics.portfolio.totalProperties).toBe(1);
      expect(analytics.portfolio.occupiedProperties).toBe(1);
      expect(analytics.tenants.active).toBe(1);
      expect(analytics.tenants.total).toBe(1);
      expect(analytics.timestamp).toBeInstanceOf(Date);
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

      const analytics = await calculateRealTimeAnalytics(userId);

      expect(analytics.revenue.total).toBe(0); // No revenue from vacant property
      expect(analytics.expenses.total).toBe(1175); // Still have expenses
      expect(analytics.occupancy.totalUnits).toBe(1);
      expect(analytics.occupancy.occupiedUnits).toBe(0);
      expect(analytics.occupancy.occupancyRate).toBe(0);
      expect(analytics.performance.netOperatingIncome).toBe(-1175); // Negative NOI
      expect(analytics.portfolio.totalProperties).toBe(1);
      expect(analytics.portfolio.occupiedProperties).toBe(0);
      expect(analytics.tenants.active).toBe(0);
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

      const analytics = await calculateRealTimeAnalytics(userId);

      expect(analytics.revenue.total).toBe(2500); // 1200 + 1300 (occupied units only)
      expect(analytics.expenses.total).toBe(3050); // 2000+400+200+300+150
      expect(analytics.occupancy.totalUnits).toBe(3);
      expect(analytics.occupancy.occupiedUnits).toBe(2);
      expect(analytics.occupancy.occupancyRate).toBeCloseTo(66.67, 2); // 2/3 * 100
      expect(analytics.performance.netOperatingIncome).toBe(-550); // 2500-3050
      expect(analytics.portfolio.totalProperties).toBe(1);
      expect(analytics.portfolio.occupiedProperties).toBe(0); // Base property not occupied
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

      // Create multiple tenants
      await Tenant.create(
        createValidTenant({
          personalInfo: {
            firstName: 'Alice',
            lastName: 'Smith',
            dateOfBirth: new Date('1985-05-15'),
          },
          contactInfo: {
            email: 'alice.smith@example.com',
            phone: {
              primary: {
                number: '07111222333',
              },
            },
            emergencyContact: {
              name: 'Bob Smith',
              relationship: 'spouse',
              phone: '07111222334',
            },
            currentAddress: {
              street: '100 Main St',
              city: 'Test City',
              state: 'Test State',
              zipCode: '12345',
              country: 'United Kingdom',
            },
          },
          leases: [
            {
              property: userId,
              tenancyType: 'assured-shorthold',
              startDate: new Date('2024-01-01'),
              endDate: new Date('2024-12-31'),
              monthlyRent: 2200,
              status: 'active',
            },
          ],
        }),
      );

      await Tenant.create(
        createValidTenant({
          personalInfo: {
            firstName: 'Bob',
            lastName: 'Johnson',
            dateOfBirth: new Date('1992-03-20'),
          },
          contactInfo: {
            email: 'bob.johnson@example.com',
            phone: {
              primary: {
                number: '07222333444',
              },
            },
            emergencyContact: {
              name: 'Carol Johnson',
              relationship: 'sibling',
              phone: '07222333445',
            },
            currentAddress: {
              street: '300 Pine St',
              city: 'Other City',
              state: 'Other State',
              zipCode: '67890',
              country: 'United Kingdom',
            },
          },
          leases: [
            {
              property: userId,
              tenancyType: 'assured-shorthold',
              startDate: new Date('2024-06-01'),
              endDate: new Date('2025-05-31'),
              monthlyRent: 1800,
              status: 'active',
            },
          ],
        }),
      );

      const analytics = await calculateRealTimeAnalytics(userId);

      expect(analytics.revenue.total).toBe(2200); // Only from occupied house
      expect(analytics.expenses.total).toBe(3420); // Both properties' expenses
      expect(analytics.occupancy.totalUnits).toBe(2);
      expect(analytics.occupancy.occupiedUnits).toBe(1);
      expect(analytics.occupancy.occupancyRate).toBe(50);
      expect(analytics.performance.netOperatingIncome).toBe(-1220); // 2200-3420
      expect(analytics.portfolio.totalProperties).toBe(2);
      expect(analytics.portfolio.occupiedProperties).toBe(1);
      expect(analytics.tenants.active).toBe(2); // Two active tenants
    });

    it('should handle user with no properties', async () => {
      const analytics = await calculateRealTimeAnalytics(userId);

      expect(analytics.revenue.total).toBe(0);
      expect(analytics.expenses.total).toBe(0);
      expect(analytics.occupancy.totalUnits).toBe(0);
      expect(analytics.occupancy.occupiedUnits).toBe(0);
      expect(analytics.occupancy.occupancyRate).toBe(0);
      expect(analytics.performance.netOperatingIncome).toBe(0);
      expect(analytics.portfolio.totalProperties).toBe(0);
      expect(analytics.portfolio.occupiedProperties).toBe(0);
      expect(analytics.tenants.active).toBe(0);
      expect(analytics.timestamp).toBeInstanceOf(Date);
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

      const analytics = await calculateRealTimeAnalytics(userId);

      expect(analytics.revenue.total).toBe(1500);
      expect(analytics.expenses.total).toBe(800); // Only mortgage counted
      expect(analytics.performance.netOperatingIncome).toBe(700);
    });

    it('should handle database errors gracefully', async () => {
      // Mock Property.find to throw error
      const originalFind = Property.find;
      Property.find = jest.fn().mockRejectedValue(new Error('Database error'));

      await expect(calculateRealTimeAnalytics(userId)).rejects.toThrow('Database error');

      // Restore original method
      Property.find = originalFind;
    });

    it('should handle tenant count errors gracefully', async () => {
      // Create a property first
      await Property.create({
        owner: userId,
        title: 'Test Property',
        description: 'Test',
        address: {
          street: '123 Street',
          city: 'City',
          state: 'State',
          zipCode: '12345',
          country: 'Country',
        },
        propertyType: 'house',
        bedrooms: 2,
        bathrooms: 1,
        squareFootage: 1000,
        financials: {
          monthlyRent: 1000,
          monthlyMortgage: 600,
        },
        occupancy: {
          isOccupied: true,
          tenant: userId,
        },
      });

      // Mock Tenant.countDocuments to throw error
      const originalCount = Tenant.countDocuments;
      Tenant.countDocuments = jest.fn().mockRejectedValue(new Error('Tenant count error'));

      await expect(calculateRealTimeAnalytics(userId)).rejects.toThrow('Tenant count error');

      // Restore original method
      Tenant.countDocuments = originalCount;
    });
  });

  describe('emitAnalyticsUpdate', () => {
    beforeEach(async () => {
      await Property.deleteMany({ owner: userId });
      await Tenant.deleteMany({ createdBy: userId });
    });

    it('should emit analytics to all user sockets', async () => {
      // Create test property for analytics calculation
      await Property.create({
        owner: userId,
        title: 'Test Property',
        description: 'Test property for socket emission',
        address: {
          street: '123 Socket St',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country',
        },
        propertyType: 'house',
        bedrooms: 2,
        bathrooms: 1,
        squareFootage: 1200,
        financials: {
          monthlyRent: 1800,
          monthlyMortgage: 1000,
        },
        occupancy: {
          isOccupied: true,
          tenant: userId,
        },
      });

      // Mock socket.io
      const mockSocket1 = {
        user: { _id: userId },
        emit: jest.fn(),
      };
      const mockSocket2 = {
        user: { _id: userId },
        emit: jest.fn(),
      };
      const mockSocket3 = {
        user: { _id: new mongoose.Types.ObjectId() }, // Different user
        emit: jest.fn(),
      };

      const mockIo = {
        fetchSockets: jest.fn().mockResolvedValue([mockSocket1, mockSocket2, mockSocket3]),
      };

      const analytics = await emitAnalyticsUpdate(mockIo, userId, 'test:analytics');

      // Verify analytics were calculated
      expect(analytics.revenue.total).toBe(1800);
      expect(analytics.timestamp).toBeInstanceOf(Date);

      // Verify only user's sockets received the emission
      expect(mockSocket1.emit).toHaveBeenCalledWith('test:analytics', {
        analytics,
        timestamp: expect.any(Date),
        eventType: 'test:analytics',
      });

      expect(mockSocket2.emit).toHaveBeenCalledWith('test:analytics', {
        analytics,
        timestamp: expect.any(Date),
        eventType: 'test:analytics',
      });

      // Different user's socket should not receive emission
      expect(mockSocket3.emit).not.toHaveBeenCalled();
    });

    it('should handle empty socket list', async () => {
      const mockIo = {
        fetchSockets: jest.fn().mockResolvedValue([]),
      };

      const analytics = await emitAnalyticsUpdate(mockIo, userId);

      expect(analytics.revenue.total).toBe(0); // No properties
      expect(analytics.timestamp).toBeInstanceOf(Date);
    });

    it('should use default event type', async () => {
      const mockSocket = {
        user: { _id: userId },
        emit: jest.fn(),
      };

      const mockIo = {
        fetchSockets: jest.fn().mockResolvedValue([mockSocket]),
      };

      await emitAnalyticsUpdate(mockIo, userId);

      expect(mockSocket.emit).toHaveBeenCalledWith('analytics:updated', expect.any(Object));
    });

    it('should handle analytics calculation errors', async () => {
      // Mock calculateRealTimeAnalytics to throw error
      const originalFind = Property.find;
      Property.find = jest.fn().mockRejectedValue(new Error('Analytics error'));

      const mockIo = {
        fetchSockets: jest.fn().mockResolvedValue([]),
      };

      await expect(emitAnalyticsUpdate(mockIo, userId)).rejects.toThrow('Analytics error');

      // Restore original method
      Property.find = originalFind;
    });

    it('should handle socket fetch errors', async () => {
      const mockIo = {
        fetchSockets: jest.fn().mockRejectedValue(new Error('Socket fetch error')),
      };

      await expect(emitAnalyticsUpdate(mockIo, userId)).rejects.toThrow('Socket fetch error');
    });
  });

  describe('emitAnalyticsToSocket', () => {
    beforeEach(async () => {
      await Property.deleteMany({ owner: userId });
      await Tenant.deleteMany({ createdBy: userId });
    });

    it('should emit analytics to specific socket', async () => {
      // Create test property
      await Property.create({
        owner: userId,
        title: 'Socket Test Property',
        description: 'Property for socket testing',
        address: {
          street: '456 Socket Ave',
          city: 'Test City',
          state: 'Test State',
          zipCode: '12345',
          country: 'Test Country',
        },
        propertyType: 'condo',
        bedrooms: 1,
        bathrooms: 1,
        squareFootage: 800,
        financials: {
          monthlyRent: 1400,
          monthlyMortgage: 700,
        },
        occupancy: {
          isOccupied: true,
          tenant: userId,
        },
      });

      const mockSocket = {
        user: { _id: userId },
        emit: jest.fn(),
      };

      const analytics = await emitAnalyticsToSocket(mockSocket, 'socket:test');

      expect(analytics.revenue.total).toBe(1400);
      expect(analytics.timestamp).toBeInstanceOf(Date);

      expect(mockSocket.emit).toHaveBeenCalledWith('socket:test', {
        analytics,
        timestamp: expect.any(Date),
        eventType: 'socket:test',
      });
    });

    it('should use default event type', async () => {
      const mockSocket = {
        user: { _id: userId },
        emit: jest.fn(),
      };

      await emitAnalyticsToSocket(mockSocket);

      expect(mockSocket.emit).toHaveBeenCalledWith('analytics:updated', expect.any(Object));
    });

    it('should throw error for unauthenticated socket', async () => {
      const mockSocket = {
        // No user property
        emit: jest.fn(),
      };

      await expect(emitAnalyticsToSocket(mockSocket)).rejects.toThrow(
        'Socket has no authenticated user',
      );

      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it('should throw error for socket with no user ID', async () => {
      const mockSocket = {
        user: {}, // No _id property
        emit: jest.fn(),
      };

      await expect(emitAnalyticsToSocket(mockSocket)).rejects.toThrow(
        'Socket has no authenticated user',
      );
    });

    it('should handle analytics calculation errors', async () => {
      // Mock Property.find to throw error
      const originalFind = Property.find;
      Property.find = jest.fn().mockRejectedValue(new Error('Analytics error'));

      const mockSocket = {
        user: { _id: userId },
        emit: jest.fn(),
      };

      await expect(emitAnalyticsToSocket(mockSocket)).rejects.toThrow('Analytics error');

      // Restore original method
      Property.find = originalFind;
    });
  });
});
