import dotenv from 'dotenv';
import request from 'supertest';
import mongoose from 'mongoose';
// MongoMemoryServer is now handled by global setup
// Jest globals are available in test environment

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Email service is mocked globally in setup.js

// eslint-disable-next-line import/first
import app from '../server.js';
// eslint-disable-next-line import/first
import User from '../models/User.js';
// eslint-disable-next-line import/first
import Tenant from '../models/Tenant.js';
// eslint-disable-next-line import/first
import Property from '../models/Property.js';

// MongoDB server is handled globally

describe('Tenant API', () => {
  let authToken;
  let userId;
  let tenantId;
  let propertyId;

  // Test user data
  const testUser = {
    firstName: 'Test',
    secondName: 'Landlord',
    email: 'tenant.test@example.com',
    password: 'TestPass123!',
  };

  // Test property data
  const testProperty = {
    title: 'Test Property',
    description: 'A test property for tenant tests',
    propertyType: 'house',
    address: {
      street: '123 Test Street',
      city: 'London',
      state: 'Greater London',
      zipCode: 'SW1A 1AA',
    },
    bedrooms: 2,
    bathrooms: 1,
    squareFootage: 800,
    financials: {
      monthlyRent: 1500,
    },
  };

  // Valid UK tenant data
  const validTenantData = {
    personalInfo: {
      title: 'Mr',
      firstName: 'John',
      lastName: 'Smith',
      dateOfBirth: '1990-05-15',
      nationalInsuranceNumber: 'AB123456C',
      nationality: 'British',
      immigrationStatus: 'british-citizen',
      rightToRent: {
        verified: true,
        documentType: 'uk-passport',
      },
    },
    contactInfo: {
      email: 'john.smith@example.com',
      phone: {
        primary: {
          number: '07700900123',
          type: 'mobile',
        },
      },
      emergencyContact: {
        name: 'Jane Smith',
        relationship: 'spouse',
        phone: '07700900124',
        email: 'jane.smith@example.com',
      },
    },
    addresses: {
      current: {
        addressLine1: '456 Current Street',
        city: 'London',
        county: 'Greater London',
        postcode: 'SW1A 1BB',
        country: 'United Kingdom',
      },
    },
    employment: {
      current: {
        status: 'employed-full-time',
        employer: {
          name: 'Test Company Ltd',
          position: 'Software Engineer',
          contractType: 'permanent',
        },
        income: {
          gross: {
            monthly: 4000,
            annual: 48000,
          },
          net: {
            monthly: 3200,
            annual: 38400,
          },
          currency: 'GBP',
          payFrequency: 'monthly',
          verified: true,
          verificationMethod: 'payslip',
        },
        benefits: {
          receives: false,
        },
      },
    },
    privacy: {
      dataRetentionConsent: true,
    },
  };

  beforeAll(async () => {
    // Use the global MongoDB instance from globalSetup
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  afterAll(async () => {
    // Clean up test data but don't disconnect
    if (mongoose.connection.readyState) {
      await mongoose.connection.db.dropDatabase();
    }
  });

  beforeEach(async () => {
    // Clear the database before each test
    await User.deleteMany({});
    await Tenant.deleteMany({});
    await Property.deleteMany({});

    // Create and authenticate a test user
    await request(app).post('/api/v1/auth/register').send(testUser).expect(201);

    // Get the user and mark email as verified
    const user = await User.findOne({ email: testUser.email });
    user.isEmailVerified = true;
    await user.save();
    userId = user._id;

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200);

    authToken = loginResponse.body.token;

    // Create a test property
    const propertyResponse = await request(app)
      .post('/api/v1/property')
      .set('Authorization', `Bearer ${authToken}`)
      .send(testProperty)
      .expect(201);

    propertyId = propertyResponse.body.data.property._id;
  });

  describe('Tenant Model', () => {
    describe('Schema Validation', () => {
      it('should create a valid tenant with UK data', async () => {
        const tenantData = {
          ...validTenantData,
          createdBy: userId,
        };

        const tenant = new Tenant(tenantData);
        await tenant.save();

        expect(tenant.personalInfo.firstName).toBe('John');
        expect(tenant.personalInfo.lastName).toBe('Smith');
        expect(tenant.contactInfo.email).toBe('john.smith@example.com');
        expect(tenant.tenantId).toMatch(/^TNT-\d{8}-[A-F0-9]{4}$/);
        expect(tenant.personalInfo.rightToRent.verified).toBe(true);
      });

      it('should validate UK phone numbers correctly', async () => {
        const invalidPhoneData = {
          ...validTenantData,
          createdBy: userId,
          contactInfo: {
            ...validTenantData.contactInfo,
            phone: {
              primary: {
                number: '123456789', // Invalid UK phone
                type: 'mobile',
              },
            },
          },
        };

        const tenant = new Tenant(invalidPhoneData);
        await expect(tenant.save()).rejects.toThrow('Please provide a valid UK phone number');
      });

      it('should validate UK postcodes correctly', async () => {
        const invalidPostcodeData = {
          ...validTenantData,
          createdBy: userId,
          addresses: {
            current: {
              ...validTenantData.addresses.current,
              postcode: '12345', // Invalid UK postcode
            },
          },
        };

        const tenant = new Tenant(invalidPostcodeData);
        await expect(tenant.save()).rejects.toThrow('Please provide a valid UK postcode');
      });

      it('should validate National Insurance Number format', async () => {
        const invalidNIData = {
          ...validTenantData,
          createdBy: userId,
          personalInfo: {
            ...validTenantData.personalInfo,
            nationalInsuranceNumber: 'INVALID123', // Invalid NI format
          },
        };

        const tenant = new Tenant(invalidNIData);
        await expect(tenant.save()).rejects.toThrow(
          'Please provide a valid UK National Insurance Number',
        );
      });

      it('should require minimum age of 18', async () => {
        const underageData = {
          ...validTenantData,
          createdBy: userId,
          personalInfo: {
            ...validTenantData.personalInfo,
            dateOfBirth: new Date().toISOString(), // Born today (age 0)
          },
        };

        const tenant = new Tenant(underageData);
        await expect(tenant.save()).rejects.toThrow('Tenant must be at least 18 years old');
      });

      it('should require unique email addresses', async () => {
        const tenant1 = new Tenant({
          ...validTenantData,
          createdBy: userId,
        });
        await tenant1.save();

        const tenant2 = new Tenant({
          ...validTenantData,
          createdBy: userId,
          personalInfo: {
            ...validTenantData.personalInfo,
            firstName: 'Jane',
          },
        });

        await expect(tenant2.save()).rejects.toThrow();
      });
    });

    describe('Virtual Properties', () => {
      let tenant;

      beforeEach(async () => {
        tenant = new Tenant({
          ...validTenantData,
          createdBy: userId,
        });
        await tenant.save();
      });

      it('should calculate full name correctly', () => {
        expect(tenant.fullName).toBe('John Smith');
      });

      it('should calculate display name with preferred name', async () => {
        tenant.personalInfo.preferredName = 'Johnny';
        await tenant.save();
        expect(tenant.displayName).toBe('Johnny');
      });

      it('should calculate age correctly', () => {
        const expectedAge = new Date().getFullYear() - 1990;
        expect(tenant.age).toBeGreaterThanOrEqual(expectedAge - 1);
        expect(tenant.age).toBeLessThanOrEqual(expectedAge);
      });

      it('should format current address correctly', () => {
        expect(tenant.currentAddressFormatted).toContain('456 Current Street');
        expect(tenant.currentAddressFormatted).toContain('London');
        expect(tenant.currentAddressFormatted).toContain('SW1A 1BB');
      });
    });

    describe('Instance Methods', () => {
      let tenant;

      beforeEach(async () => {
        tenant = new Tenant({
          ...validTenantData,
          createdBy: userId,
          financialInfo: {
            affordabilityAssessment: {
              monthlyIncome: 4000,
              monthlyExpenses: 1500,
              monthlyCommitments: 500,
            },
          },
        });
        await tenant.save();
      });

      it('should check income qualification with UK standards', () => {
        const monthlyRent = 1500;
        const qualification = tenant.checkIncomeQualification(monthlyRent);

        expect(qualification.qualified).toBe(true);
        expect(qualification.ratio).toBeGreaterThanOrEqual(2.5);
      });

      it('should fail qualification for insufficient income', () => {
        const monthlyRent = 2000; // Higher than 2.5x income
        const qualification = tenant.checkIncomeQualification(monthlyRent);

        expect(qualification.qualified).toBe(false);
        expect(qualification.reason).toContain('less than 2.5x rent');
      });

      it('should check affordability correctly', () => {
        const monthlyRent = 1500;
        const affordability = tenant.checkAffordability(monthlyRent);

        expect(affordability.affordable).toBe(true);
        expect(affordability.disposableAfterRent).toBe(500); // 4000 - 1500 - 500 - 1500
      });

      it('should fail affordability for insufficient disposable income', () => {
        const monthlyRent = 2500; // More than disposable income
        const affordability = tenant.checkAffordability(monthlyRent);

        expect(affordability.affordable).toBe(false);
        expect(affordability.shortfall).toBe(500); // 2500 - 2000
      });

      it('should add lease correctly', async () => {
        const leaseData = {
          property: propertyId,
          tenancyType: 'assured-shorthold',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          monthlyRent: 1500,
        };

        await tenant.addLease(leaseData);
        expect(tenant.leases).toHaveLength(1);
        expect(tenant.leases[0].property.toString()).toBe(propertyId);
      });
    });
  });

  describe('POST /api/v1/tenants', () => {
    it('should create a new tenant with valid UK data', async () => {
      const response = await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validTenantData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.tenant.personalInfo.firstName).toBe('John');
      expect(response.body.data.tenant.personalInfo.rightToRent.verified).toBe(true);
      expect(response.body.data.tenant.tenantId).toMatch(/^TNT-\d{8}-[A-F0-9]{4}$/);

      tenantId = response.body.data.tenant._id;
    });

    it('should reject tenant creation with invalid UK phone number', async () => {
      const invalidData = {
        ...validTenantData,
        contactInfo: {
          ...validTenantData.contactInfo,
          phone: {
            primary: {
              number: '123456789', // Invalid UK phone
              type: 'mobile',
            },
          },
        },
      };

      await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should reject tenant creation with invalid postcode', async () => {
      const invalidData = {
        ...validTenantData,
        addresses: {
          current: {
            ...validTenantData.addresses.current,
            postcode: '12345', // Invalid UK postcode
          },
        },
      };

      await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should reject tenant under 18 years old', async () => {
      const invalidData = {
        ...validTenantData,
        personalInfo: {
          ...validTenantData.personalInfo,
          dateOfBirth: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000 * 17).toISOString(), // 17 years old
        },
      };

      await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should require authentication', async () => {
      await request(app).post('/api/v1/tenants').send(validTenantData).expect(401);
    });
  });

  describe('GET /api/v1/tenants', () => {
    beforeEach(async () => {
      // Create test tenant
      const response = await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validTenantData);

      tenantId = response.body.data.tenant._id;
    });

    it('should get all tenants for authenticated user', async () => {
      const response = await request(app)
        .get('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.results).toBe(1);
      expect(response.body.data.tenants).toHaveLength(1);
      expect(response.body.data.tenants[0].personalInfo.firstName).toBe('John');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/tenants?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });

    it('should support filtering by status', async () => {
      const response = await request(app)
        .get('/api/v1/tenants?status=pending')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
    });
  });

  describe('GET /api/v1/tenants/:id', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validTenantData);

      tenantId = response.body.data.tenant._id;
    });

    it('should get a specific tenant by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/tenants/${tenantId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.tenant._id).toBe(tenantId);
      expect(response.body.data.tenant.personalInfo.firstName).toBe('John');
    });

    it('should return 404 for non-existent tenant', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/api/v1/tenants/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should reject invalid ObjectId format', async () => {
      await request(app)
        .get('/api/v1/tenants/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('PATCH /api/v1/tenants/:id', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validTenantData);

      tenantId = response.body.data.tenant._id;
    });

    it('should update tenant information', async () => {
      const updateData = {
        personalInfo: {
          firstName: 'Johnny',
          preferredName: 'Johnny',
        },
      };

      const response = await request(app)
        .patch(`/api/v1/tenants/${tenantId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.tenant.personalInfo.firstName).toBe('Johnny');
      expect(response.body.data.tenant.personalInfo.preferredName).toBe('Johnny');
    });

    it('should prevent email duplication on update', async () => {
      // Create another tenant
      const anotherTenant = {
        ...validTenantData,
        contactInfo: {
          ...validTenantData.contactInfo,
          email: 'another@example.com',
        },
        personalInfo: {
          ...validTenantData.personalInfo,
          firstName: 'Jane',
        },
      };

      await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(anotherTenant);

      // Try to update first tenant with second tenant's email
      const updateData = {
        contactInfo: {
          email: 'another@example.com',
        },
      };

      await request(app)
        .patch(`/api/v1/tenants/${tenantId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);
    });
  });

  describe('DELETE /api/v1/tenants/:id', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validTenantData);

      tenantId = response.body.data.tenant._id;
    });

    it('should soft delete a tenant', async () => {
      await request(app)
        .delete(`/api/v1/tenants/${tenantId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify tenant is soft deleted
      const tenant = await Tenant.findById(tenantId);
      expect(tenant.isActive).toBe(false);
    });

    it('should prevent deletion of tenant with active leases', async () => {
      // Add an active lease
      const leaseData = {
        property: propertyId,
        tenancyType: 'assured-shorthold',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        monthlyRent: 1500,
      };

      await request(app)
        .post(`/api/v1/tenants/${tenantId}/leases`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(leaseData);

      // Update lease status to active
      const tenant = await Tenant.findById(tenantId);
      tenant.leases[0].status = 'active';
      await tenant.save();

      await request(app)
        .delete(`/api/v1/tenants/${tenantId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('UK-Specific Endpoints', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validTenantData);

      tenantId = response.body.data.tenant._id;
    });

    describe('GET /api/v1/tenants/:id/qualification-status', () => {
      it('should return general qualification status', async () => {
        const response = await request(app)
          .get(`/api/v1/tenants/${tenantId}/qualification-status`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.qualification).toBeDefined();
        expect(response.body.data.qualification.status).toMatch(
          /^(qualified|needs-review|not-qualified)$/,
        );
        expect(response.body.data.computedApplicationStatus).toBeDefined();
      });
    });

    describe('Property Qualification Check', () => {
      it('should check qualification for specific property rent', async () => {
        // First update the tenant with referencing data
        await request(app)
          .patch(`/api/v1/tenants/${tenantId}/referencing`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            status: 'completed',
            outcome: 'pass',
          });

        const qualificationData = {
          monthlyRent: 1200, // Affordable for test tenant
        };

        const response = await request(app)
          .post(`/api/v1/tenants/${tenantId}/qualification`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(qualificationData)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.qualification.monthlyRent).toBe(1200);
        expect(response.body.data.qualification.overallQualifies).toBe(true);
        expect(response.body.data.qualification.tenant.grossIncome).toBe(4000);
      });
    });

    describe('Tenant Assignment to Property', () => {
      it('should assign qualified tenant to property', async () => {
        const assignmentData = {
          tenantId: tenantId,
          propertyId: propertyId,
          leaseData: {
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            monthlyRent: 1500,
            securityDeposit: 1500,
            tenancyType: 'assured-shorthold',
          },
        };

        const response = await request(app)
          .post('/api/v1/tenants/assign-to-property')
          .set('Authorization', `Bearer ${authToken}`)
          .send(assignmentData)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.tenant._id).toBe(tenantId);
        expect(response.body.data.property._id).toBe(propertyId);
        expect(response.body.data.lease.monthlyRent).toBe(1500);

        // Verify property is now occupied
        expect(response.body.data.property.occupancy.isOccupied).toBe(true);
        expect(
          response.body.data.property.occupancy.tenant._id ||
            response.body.data.property.occupancy.tenant,
        ).toBe(tenantId);
      });

      it('should unassign tenant from property', async () => {
        // First assign the tenant
        const assignmentData = {
          tenantId: tenantId,
          propertyId: propertyId,
          leaseData: {
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            monthlyRent: 1500,
            securityDeposit: 1500,
            tenancyType: 'assured-shorthold',
          },
        };

        await request(app)
          .post('/api/v1/tenants/assign-to-property')
          .set('Authorization', `Bearer ${authToken}`)
          .send(assignmentData);

        // Now unassign
        const unassignData = {
          tenantId: tenantId,
          propertyId: propertyId,
        };

        const response = await request(app)
          .post('/api/v1/tenants/unassign-from-property')
          .set('Authorization', `Bearer ${authToken}`)
          .send(unassignData)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.message).toBe('Tenant unassigned successfully');

        // Verify property is no longer occupied
        expect(response.body.data.property.occupancy.isOccupied).toBe(false);
        expect(response.body.data.property.occupancy.tenant).toBeNull();
      });

      it('should prevent assignment to already occupied property', async () => {
        // First assignment
        const assignmentData = {
          tenantId: tenantId,
          propertyId: propertyId,
          leaseData: {
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            monthlyRent: 1500,
            securityDeposit: 1500,
            tenancyType: 'assured-shorthold',
          },
        };

        await request(app)
          .post('/api/v1/tenants/assign-to-property')
          .set('Authorization', `Bearer ${authToken}`)
          .send(assignmentData);

        // Create another tenant
        const anotherTenantData = {
          ...validTenantData,
          contactInfo: { ...validTenantData.contactInfo, email: 'another.tenant@example.com' },
          personalInfo: { ...validTenantData.personalInfo, firstName: 'Another' },
        };

        const anotherTenantResponse = await request(app)
          .post('/api/v1/tenants')
          .set('Authorization', `Bearer ${authToken}`)
          .send(anotherTenantData);

        const anotherTenantId = anotherTenantResponse.body.data.tenant._id;

        // Try to assign second tenant to same property
        const secondAssignment = {
          tenantId: anotherTenantId,
          propertyId: propertyId,
          leaseData: {
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            monthlyRent: 1500,
            securityDeposit: 1500,
            tenancyType: 'assured-shorthold',
          },
        };

        await request(app)
          .post('/api/v1/tenants/assign-to-property')
          .set('Authorization', `Bearer ${authToken}`)
          .send(secondAssignment)
          .expect(400);
      });
    });

    describe('POST /api/v1/tenants/:id/qualification', () => {
      it('should check tenant qualification with UK standards', async () => {
        // First update the tenant with referencing data
        await request(app)
          .patch(`/api/v1/tenants/${tenantId}/referencing`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            status: 'completed',
            outcome: 'pass',
          });

        const qualificationData = {
          monthlyRent: 1500,
        };

        const response = await request(app)
          .post(`/api/v1/tenants/${tenantId}/qualification`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(qualificationData)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.qualification.overallQualifies).toBe(true);
        expect(response.body.data.qualification.checks.income).toBe(true);
        expect(response.body.data.qualification.checks.rightToRent).toBe(true);
      });

      it('should fail qualification for insufficient income', async () => {
        const qualificationData = {
          monthlyRent: 2000, // More than 2.5x income
        };

        const response = await request(app)
          .post(`/api/v1/tenants/${tenantId}/qualification`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(qualificationData)
          .expect(200);

        expect(response.body.data.qualification.overallQualifies).toBe(false);
        expect(response.body.data.qualification.checks.income).toBe(false);
      });
    });

    describe('PATCH /api/v1/tenants/:id/right-to-rent', () => {
      it('should update right to rent verification', async () => {
        const rightToRentData = {
          verified: true,
          documentType: 'uk-passport',
          documentExpiryDate: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Passport verified successfully',
        };

        const response = await request(app)
          .patch(`/api/v1/tenants/${tenantId}/right-to-rent`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(rightToRentData)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.tenant.personalInfo.rightToRent.verified).toBe(true);
        expect(response.body.data.tenant.personalInfo.rightToRent.documentType).toBe('uk-passport');
      });
    });

    describe('PATCH /api/v1/tenants/:id/referencing', () => {
      it('should update referencing status', async () => {
        const referencingData = {
          status: 'completed',
          provider: 'HomeLet',
          reference: 'HL123456',
          outcome: 'pass',
          notes: 'All checks passed successfully',
        };

        const response = await request(app)
          .patch(`/api/v1/tenants/${tenantId}/referencing`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(referencingData)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.tenant.referencing.status).toBe('completed');
        expect(response.body.data.tenant.referencing.outcome).toBe('pass');
      });
    });

    describe('PATCH /api/v1/tenants/:id/affordability', () => {
      it('should update affordability assessment', async () => {
        const affordabilityData = {
          monthlyIncome: 4500,
          monthlyExpenses: 1800,
          monthlyCommitments: 600,
        };

        const response = await request(app)
          .patch(`/api/v1/tenants/${tenantId}/affordability`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(affordabilityData)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.tenant.financialInfo.affordabilityAssessment.monthlyIncome).toBe(
          4500,
        );
        expect(
          response.body.data.tenant.financialInfo.affordabilityAssessment.disposableIncome,
        ).toBe(2100);
      });
    });
  });

  describe('Bulk Operations', () => {
    let tenant1Id, tenant2Id; // eslint-disable-line no-unused-vars

    beforeEach(async () => {
      // Create two test tenants
      const response1 = await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validTenantData);

      tenant1Id = response1.body.data.tenant._id;

      const tenant2Data = {
        ...validTenantData,
        contactInfo: {
          ...validTenantData.contactInfo,
          email: 'jane.doe@example.com',
        },
        personalInfo: {
          ...validTenantData.personalInfo,
          firstName: 'Jane',
          lastName: 'Doe',
        },
      };

      const response2 = await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tenant2Data);

      tenant2Id = response2.body.data.tenant._id;
    });

    describe('PATCH /api/v1/tenants/bulk-update', () => {
      it('should reject invalid operation', async () => {
        const bulkData = {
          tenantIds: [tenant1Id],
          operation: 'invalid-operation',
        };

        await request(app)
          .patch('/api/v1/tenants/bulk-update')
          .set('Authorization', `Bearer ${authToken}`)
          .send(bulkData)
          .expect(400);
      });
    });
  });

  describe('Lease Management', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validTenantData);

      tenantId = response.body.data.tenant._id;
    });

    describe('POST /api/v1/tenants/:id/leases', () => {
      it('should add a new lease to tenant', async () => {
        const leaseData = {
          property: propertyId,
          tenancyType: 'assured-shorthold',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          monthlyRent: 1500,
          securityDeposit: 1500,
          rentDueDate: 1,
        };

        const response = await request(app)
          .post(`/api/v1/tenants/${tenantId}/leases`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(leaseData)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.tenant.leases).toHaveLength(1);
        expect(response.body.data.tenant.leases[0].monthlyRent).toBe(1500);
        expect(response.body.data.tenant.leases[0].tenancyType).toBe('assured-shorthold');
      });

      it('should reject lease with invalid tenancy type', async () => {
        const leaseData = {
          property: propertyId,
          tenancyType: 'invalid-type',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          monthlyRent: 1500,
        };

        await request(app)
          .post(`/api/v1/tenants/${tenantId}/leases`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(leaseData)
          .expect(400);
      });

      it('should reject lease with end date before start date', async () => {
        const leaseData = {
          property: propertyId,
          tenancyType: 'assured-shorthold',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
          monthlyRent: 1500,
        };

        await request(app)
          .post(`/api/v1/tenants/${tenantId}/leases`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(leaseData)
          .expect(400);
      });
    });
  });

  describe('Search and Statistics', () => {
    beforeEach(async () => {
      // Create multiple test tenants for search testing
      const tenants = [
        {
          ...validTenantData,
          personalInfo: {
            ...validTenantData.personalInfo,
            firstName: 'Alice',
            lastName: 'Johnson',
          },
          contactInfo: { ...validTenantData.contactInfo, email: 'alice@example.com' },
        },
        {
          ...validTenantData,
          personalInfo: { ...validTenantData.personalInfo, firstName: 'Bob', lastName: 'Wilson' },
          contactInfo: { ...validTenantData.contactInfo, email: 'bob@example.com' },
        },
      ];

      for (const tenant of tenants) {
        await request(app)
          .post('/api/v1/tenants')
          .set('Authorization', `Bearer ${authToken}`)
          .send(tenant);
      }
    });

    describe('GET /api/v1/tenants/search', () => {
      it('should search tenants by name', async () => {
        const response = await request(app)
          .get('/api/v1/tenants/search?name=Alice')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.results).toBe(1);
        expect(response.body.data.tenants[0].personalInfo.firstName).toBe('Alice');
      });

      it('should search tenants by email', async () => {
        const response = await request(app)
          .get('/api/v1/tenants/search?email=bob@example.com')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.results).toBe(1);
        expect(response.body.data.tenants[0].contactInfo.email).toBe('bob@example.com');
      });
    });

    describe('GET /api/v1/tenants/stats', () => {
      it('should return tenant statistics', async () => {
        const response = await request(app)
          .get('/api/v1/tenants/stats')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.status).toBe('success');
        expect(response.body.data.stats.totalTenants).toBeGreaterThan(0);
        expect(response.body.data.stats.pendingApplications).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
