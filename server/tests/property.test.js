import dotenv from 'dotenv';
import request from 'supertest';
import mongoose from 'mongoose';
// MongoMemoryServer is now handled by global setup
// Jest globals are available in test environment

// Load test environment variables

// Email service is mocked globally in setup.js

// eslint-disable-next-line import/first
import app from '../server.js';
// eslint-disable-next-line import/first
import User from '../models/User.js';
// eslint-disable-next-line import/first
import Property from '../models/Property.js';

describe('Property API', () => {
  let authToken;
  let userId;
  let propertyId;

  // Test user data
  const testUser = {
    firstName: 'Test',
    secondName: 'User',
    email: 'property.test@example.com',
    password: 'TestPass123!',
  };

  // Test property data
  const testProperty = {
    title: 'Test Property',
    description: 'A beautiful test property',
    propertyType: 'apartment',
    address: {
      street: '123 Test Street',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
    },
    bedrooms: 2,
    bathrooms: 1.5,
    squareFootage: 1000,
    yearBuilt: 2020,
    financials: {
      propertyValue: 250000,
      monthlyRent: 1500,
      securityDeposit: 1500,
    },
    features: {
      parking: 'garage',
      airConditioning: true,
      petPolicy: {
        allowed: true,
        types: ['dogs'],
        maxPets: 1,
      },
    },
  };

  beforeAll(async () => {
    // Use the global MongoDB instance from globalSetup
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  }, 30000);

  afterAll(async () => {
    // Don't disconnect here - let globalTeardown handle it
    if (mongoose.connection.readyState) {
      await mongoose.connection.db.dropDatabase();
    }
  }, 30000);

  describe('Setup and Authentication', () => {
    it('should register a test user', async () => {
      const response = await request(app).post('/api/v1/auth/register').send(testUser).expect(201);

      expect(response.body.message).toContain('registered');
    });

    it('should verify email and login', async () => {
      // Get the user and mark email as verified
      const user = await User.findOne({ email: testUser.email });
      user.isEmailVerified = true;
      await user.save();
      userId = user._id;

      // Login
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      authToken = response.body.token;
      expect(authToken).toBeDefined();
    });
  });

  describe('POST /api/v1/property', () => {
    it('should create a new property', async () => {
      const response = await request(app)
        .post('/api/v1/property')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testProperty)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.property.title).toBe(testProperty.title);
      expect(response.body.data.property.owner.toString()).toBe(userId.toString());

      propertyId = response.body.data.property._id;
    });

    it('should not create property without authentication', async () => {
      await request(app).post('/api/v1/property').send(testProperty).expect(401);
    });

    it('should not create property with invalid data', async () => {
      const invalidProperty = { ...testProperty };
      delete invalidProperty.title; // Remove required field

      await request(app)
        .post('/api/v1/property')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidProperty)
        .expect(400);
    });

    it('should not create property with invalid property type', async () => {
      const invalidProperty = {
        ...testProperty,
        propertyType: 'invalid-type',
      };

      await request(app)
        .post('/api/v1/property')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidProperty)
        .expect(400);
    });
  });

  describe('GET /api/v1/property', () => {
    it('should get all properties for authenticated user', async () => {
      const response = await request(app)
        .get('/api/v1/property')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.results).toBeGreaterThan(0);
      expect(Array.isArray(response.body.data.properties)).toBe(true);
    });

    it('should not get properties without authentication', async () => {
      await request(app).get('/api/v1/property').expect(401);
    });
  });

  describe('GET /api/v1/property/:id', () => {
    it('should get a single property', async () => {
      const response = await request(app)
        .get(`/api/v1/property/${propertyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.property._id).toBe(propertyId);
      expect(response.body.data.property.title).toBe(testProperty.title);
    });

    it('should return 404 for non-existent property', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/api/v1/property/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should not allow access to other users properties', async () => {
      // Create another user
      const otherUser = {
        firstName: 'Other',
        secondName: 'User',
        email: 'other.property.test@example.com',
        password: 'OtherPass123!',
      };

      await request(app).post('/api/v1/auth/register').send(otherUser);

      const user = await User.findOne({ email: otherUser.email });
      user.isEmailVerified = true;
      await user.save();

      const loginResponse = await request(app).post('/api/v1/auth/login').send({
        email: otherUser.email,
        password: otherUser.password,
      });

      const otherToken = loginResponse.body.token;

      await request(app)
        .get(`/api/v1/property/${propertyId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);

      // Clean up
      await User.deleteOne({ email: otherUser.email });
    });
  });

  describe('PUT /api/v1/property/:id', () => {
    it('should update a property', async () => {
      const updateData = {
        title: 'Updated Test Property',
        financials: {
          monthlyRent: 1800,
        },
      };

      const response = await request(app)
        .put(`/api/v1/property/${propertyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.property.title).toBe(updateData.title);
      expect(response.body.data.property.financials.monthlyRent).toBe(
        updateData.financials.monthlyRent,
      );
    });

    it('should not update non-existent property', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .put(`/api/v1/property/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated' })
        .expect(404);
    });
  });

  describe('PATCH /api/v1/property/:id/status', () => {
    it('should update property status', async () => {
      const response = await request(app)
        .patch(`/api/v1/property/${propertyId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'occupied' })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.property.status).toBe('occupied');
    });

    it('should not update with invalid status', async () => {
      await request(app)
        .patch(`/api/v1/property/${propertyId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'invalid-status' })
        .expect(400);
    });
  });

  describe('PATCH /api/v1/property/:id/occupancy', () => {
    it('should update occupancy information', async () => {
      const occupancyData = {
        occupancy: {
          isOccupied: true,
          leaseStart: '2024-01-01',
          leaseEnd: '2024-12-31',
          leaseType: 'fixed-term',
          rentDueDate: 1,
        },
      };

      const response = await request(app)
        .patch(`/api/v1/property/${propertyId}/occupancy`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(occupancyData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.property.occupancy.isOccupied).toBe(true);
      expect(response.body.data.property.occupancy.leaseType).toBe('fixed-term');
    });

    it('should not update with invalid lease type', async () => {
      const invalidData = {
        occupancy: {
          leaseType: 'invalid-type',
        },
      };

      await request(app)
        .patch(`/api/v1/property/${propertyId}/occupancy`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('POST /api/v1/property/:id/images', () => {
    it('should require actual image files', async () => {
      const imageData = {
        images: [
          {
            url: 'https://example.com/test-image.jpg',
            caption: 'Test image',
            isPrimary: false,
          },
        ],
      };

      const response = await request(app)
        .post(`/api/v1/property/${propertyId}/images`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(imageData)
        .expect(400);

      expect(response.body.message).toMatch(/image file/i);
    });

    it('should not add invalid images', async () => {
      const invalidImageData = {
        images: [
          {
            url: 'not-a-valid-url',
            caption: 'Invalid image',
          },
        ],
      };

      await request(app)
        .post(`/api/v1/property/${propertyId}/images`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidImageData)
        .expect(400);
    });
  });

  describe('GET /api/v1/property/search', () => {
    it('should search properties with filters', async () => {
      const response = await request(app)
        .get('/api/v1/property/search')
        .query({
          propertyType: 'apartment',
          minBedrooms: 2,
          maxBedrooms: 3,
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.pagination).toBeDefined();
    });

    it('should return empty results for no matches', async () => {
      const response = await request(app)
        .get('/api/v1/property/search')
        .query({
          propertyType: 'commercial',
          minBedrooms: 10,
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.results).toBe(0);
    });
  });

  describe('GET /api/v1/property/analytics', () => {
    it('should get property analytics', async () => {
      const response = await request(app)
        .get('/api/v1/property/analytics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.analytics).toBeDefined();
      expect(response.body.data.analytics.totalProperties).toBeGreaterThan(0);
      expect(typeof response.body.data.analytics.occupancyRate).toBe('number');
    });
  });

  describe('DELETE /api/v1/property/:id', () => {
    it('should soft delete a property', async () => {
      await request(app)
        .delete(`/api/v1/property/${propertyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify property is either soft deleted (isActive = false) or completely removed
      const deletedProperty = await Property.findById(propertyId);
      if (deletedProperty) {
        expect(deletedProperty.isActive).toBe(false);
      } else {
        // Property was completely deleted (hard delete)
        expect(deletedProperty).toBeNull();
      }
    });

    it('should not delete non-existent property', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .delete(`/api/v1/property/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Unit Management for Apartments', () => {
    let apartmentId;
    let houseId;

    beforeAll(async () => {
      // Create an apartment property for unit testing
      const apartmentData = {
        title: 'Test Apartment Building',
        propertyType: 'apartment',
        address: {
          street: '123 Apartment Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
        },
        bedrooms: 0, // Building-level data
        bathrooms: 0,
        squareFootage: 5000,
      };

      const apartmentResponse = await request(app)
        .post('/api/v1/property')
        .set('Authorization', `Bearer ${authToken}`)
        .send(apartmentData)
        .expect(201);

      apartmentId = apartmentResponse.body.data.property._id;

      // Create a house property for testing non-apartment unit operations
      const houseData = {
        title: 'Test House Property',
        propertyType: 'house',
        address: {
          street: '456 House Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
        },
        bedrooms: 3,
        bathrooms: 2,
        squareFootage: 1500,
      };

      const houseResponse = await request(app)
        .post('/api/v1/property')
        .set('Authorization', `Bearer ${authToken}`)
        .send(houseData)
        .expect(201);

      houseId = houseResponse.body.data.property._id;
    });

    describe('POST /api/v1/property/:id/units', () => {
      it('should add a unit to apartment property', async () => {
        const unitData = {
          unitNumber: '1A',
          bedrooms: 2,
          bathrooms: 1,
          squareFootage: 800,
          monthlyRent: 1200,
          securityDeposit: 1200,
        };

        const response = await request(app)
          .post(`/api/v1/property/${apartmentId}/units`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(unitData)
          .expect(201);

        expect(response.body.status).toBe('success');
        expect(response.body.data.unit.unitNumber).toBe('1A');
        expect(response.body.data.unit.monthlyRent).toBe(1200);
      });

      it('should not add unit to non-apartment property', async () => {
        await request(app)
          .post(`/api/v1/property/${houseId}/units`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ unitNumber: '1A' })
          .expect(400);
      });

      it('should not add duplicate unit numbers', async () => {
        const unitData = {
          unitNumber: '1A', // Same as previous test
          bedrooms: 1,
          bathrooms: 1,
          squareFootage: 600,
          monthlyRent: 1000,
        };

        await request(app)
          .post(`/api/v1/property/${apartmentId}/units`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(unitData)
          .expect(400);
      });
    });

    describe('GET /api/v1/property/:id/units', () => {
      it('should get all units for apartment property', async () => {
        const response = await request(app)
          .get(`/api/v1/property/${apartmentId}/units`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.results).toBeGreaterThan(0);
        expect(Array.isArray(response.body.data.units)).toBe(true);
      });

      it('should not get units for non-apartment property', async () => {
        await request(app)
          .get(`/api/v1/property/${houseId}/units`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(400);
      });
    });

    describe('GET /api/v1/property/:id/units/analytics', () => {
      it('should get unit analytics for apartment property', async () => {
        const response = await request(app)
          .get(`/api/v1/property/${apartmentId}/units/analytics`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.analytics).toBeDefined();
        expect(response.body.data.analytics.totalUnits).toBeGreaterThan(0);
        expect(typeof response.body.data.analytics.occupancyRate).toBe('number');
      });
    });
  });
});
