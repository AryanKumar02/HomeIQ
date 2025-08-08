import dotenv from 'dotenv';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { jest } from '@jest/globals';

// Ensure mongodb-memory-server uses a unique download dir in CI to avoid lockfile conflicts
// Note: MONGOMS_DOWNLOAD_DIR is now set via Jest setupFiles in tests/setupEnv.js

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock the email service to prevent actual email sending during tests
jest.mock('../services/emailService', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
}));

// eslint-disable-next-line import/first
import app from '../server.js';
// eslint-disable-next-line import/first
import User from '../models/User.js';
// eslint-disable-next-line import/first
import Tenant from '../models/Tenant.js';
// eslint-disable-next-line import/first
import Property from '../models/Property.js';

let mongoServer;

describe('Tenant Validators', () => {
  let authToken;

  // Test user data
  const testUser = {
    firstName: 'Test',
    secondName: 'Landlord',
    email: 'validator.test@example.com',
    password: 'TestPass123!',
  };

  beforeAll(async () => {
    // Start in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to the in-memory database
    await mongoose.connect(mongoUri);
  }, 30000);

  afterAll(async () => {
    // Clean up
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
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

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200);

    authToken = loginResponse.body.token;
  });

  describe('validateCreateTenant', () => {
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

    describe('Personal Information Validation', () => {
      it('should accept valid personal information', async () => {
        await request(app)
          .post('/api/v1/tenants')
          .set('Authorization', `Bearer ${authToken}`)
          .send(validTenantData)
          .expect(201);
      });

      it('should reject missing first name', async () => {
        const invalidData = {
          ...validTenantData,
          personalInfo: {
            ...validTenantData.personalInfo,
            firstName: '',
          },
        };

        const response = await request(app)
          .post('/api/v1/tenants')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);

        expect(response.body.message).toContain('First name is required');
      });

      it('should reject missing last name', async () => {
        const invalidData = {
          ...validTenantData,
          personalInfo: {
            ...validTenantData.personalInfo,
            lastName: '',
          },
        };

        await request(app)
          .post('/api/v1/tenants')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);
      });

      it('should reject invalid title', async () => {
        const invalidData = {
          ...validTenantData,
          personalInfo: {
            ...validTenantData.personalInfo,
            title: 'InvalidTitle',
          },
        };

        await request(app)
          .post('/api/v1/tenants')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);
      });

      it('should reject invalid date of birth format', async () => {
        const invalidData = {
          ...validTenantData,
          personalInfo: {
            ...validTenantData.personalInfo,
            dateOfBirth: 'invalid-date',
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
            dateOfBirth: new Date(Date.now() - 17 * 365 * 24 * 60 * 60 * 1000).toISOString(),
          },
        };

        const response = await request(app)
          .post('/api/v1/tenants')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);

        expect(response.body.message).toContain('at least 18 years old');
      });

      it('should reject invalid National Insurance Number format', async () => {
        const invalidData = {
          ...validTenantData,
          personalInfo: {
            ...validTenantData.personalInfo,
            nationalInsuranceNumber: 'INVALID123',
          },
        };

        const response = await request(app)
          .post('/api/v1/tenants')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);

        expect(response.body.message).toContain('valid UK National Insurance Number');
      });

      it('should reject invalid driving licence format', async () => {
        const invalidData = {
          ...validTenantData,
          personalInfo: {
            ...validTenantData.personalInfo,
            drivingLicenceNumber: 'INVALID123',
          },
        };

        const response = await request(app)
          .post('/api/v1/tenants')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);

        expect(response.body.message).toContain('valid UK driving licence number');
      });

      it('should reject invalid immigration status', async () => {
        const invalidData = {
          ...validTenantData,
          personalInfo: {
            ...validTenantData.personalInfo,
            immigrationStatus: 'invalid-status',
          },
        };

        await request(app)
          .post('/api/v1/tenants')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);
      });

      it('should require right to rent verification status', async () => {
        const invalidData = {
          ...validTenantData,
          personalInfo: {
            ...validTenantData.personalInfo,
            rightToRent: {},
          },
        };

        const response = await request(app)
          .post('/api/v1/tenants')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);

        expect(response.body.message).toContain('Right to rent verification is required');
      });
    });

    describe('Contact Information Validation', () => {
      it('should reject missing email', async () => {
        const invalidData = {
          ...validTenantData,
          contactInfo: {
            ...validTenantData.contactInfo,
            email: '',
          },
        };

        const response = await request(app)
          .post('/api/v1/tenants')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);

        expect(response.body.message).toContain('Email is required');
      });

      it('should reject invalid email format', async () => {
        const invalidData = {
          ...validTenantData,
          contactInfo: {
            ...validTenantData.contactInfo,
            email: 'invalid-email',
          },
        };

        const response = await request(app)
          .post('/api/v1/tenants')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);

        expect(response.body.message).toContain('valid email address');
      });

      it('should reject invalid UK phone number format', async () => {
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

        const response = await request(app)
          .post('/api/v1/tenants')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);

        expect(response.body.message).toContain('valid UK phone number');
      });

      it('should accept valid UK phone number formats', async () => {
        const validPhoneNumbers = ['07700900123', '07700900124', '07700900125'];

        for (const phoneNumber of validPhoneNumbers) {
          const testData = {
            ...validTenantData,
            contactInfo: {
              ...validTenantData.contactInfo,
              email: `test${Math.random()}@example.com`, // Unique email for each test
              phone: {
                primary: {
                  number: phoneNumber,
                  type: 'mobile',
                },
              },
            },
            personalInfo: {
              ...validTenantData.personalInfo,
              firstName: `Test${Math.random()}`, // Unique name for each test
            },
          };

          await request(app)
            .post('/api/v1/tenants')
            .set('Authorization', `Bearer ${authToken}`)
            .send(testData)
            .expect(201);
        }
      });

      it('should reject invalid phone type', async () => {
        const invalidData = {
          ...validTenantData,
          contactInfo: {
            ...validTenantData.contactInfo,
            phone: {
              primary: {
                number: '07700900123',
                type: 'invalid-type',
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

      it('should reject missing emergency contact name', async () => {
        const invalidData = {
          ...validTenantData,
          contactInfo: {
            ...validTenantData.contactInfo,
            emergencyContact: {
              ...validTenantData.contactInfo.emergencyContact,
              name: '',
            },
          },
        };

        const response = await request(app)
          .post('/api/v1/tenants')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);

        expect(response.body.message).toContain('Emergency contact name is required');
      });

      it('should reject invalid emergency contact relationship', async () => {
        const invalidData = {
          ...validTenantData,
          contactInfo: {
            ...validTenantData.contactInfo,
            emergencyContact: {
              ...validTenantData.contactInfo.emergencyContact,
              relationship: 'invalid-relationship',
            },
          },
        };

        await request(app)
          .post('/api/v1/tenants')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);
      });
    });

    describe('Address Information Validation', () => {
      it('should reject invalid UK postcode format', async () => {
        const invalidData = {
          ...validTenantData,
          addresses: {
            current: {
              ...validTenantData.addresses.current,
              postcode: '12345', // Invalid UK postcode
            },
          },
        };

        const response = await request(app)
          .post('/api/v1/tenants')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);

        expect(response.body.message).toContain('valid UK postcode');
      });

      it('should accept valid UK postcode formats', async () => {
        const validPostcodes = ['SW1A 1AA', 'M1 1AA', 'B33 8TH', 'W1A 0AX', 'EC1A 1BB'];

        for (const postcode of validPostcodes) {
          const testData = {
            ...validTenantData,
            contactInfo: {
              ...validTenantData.contactInfo,
              email: `test${Math.random()}@example.com`,
            },
            personalInfo: {
              ...validTenantData.personalInfo,
              firstName: `Test${Math.random()}`,
            },
            addresses: {
              current: {
                ...validTenantData.addresses.current,
                postcode,
              },
            },
          };

          await request(app)
            .post('/api/v1/tenants')
            .set('Authorization', `Bearer ${authToken}`)
            .send(testData)
            .expect(201);
        }
      });
    });

    describe('Employment Information Validation', () => {
      it('should reject missing employment status', async () => {
        const invalidData = {
          ...validTenantData,
          employment: {
            current: {
              ...validTenantData.employment.current,
              status: '',
            },
          },
        };

        const response = await request(app)
          .post('/api/v1/tenants')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);

        expect(response.body.message).toContain('Employment status is required');
      });

      it('should reject invalid employment status', async () => {
        const invalidData = {
          ...validTenantData,
          employment: {
            current: {
              ...validTenantData.employment.current,
              status: 'invalid-status',
            },
          },
        };

        await request(app)
          .post('/api/v1/tenants')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);
      });

      it('should reject invalid contract type', async () => {
        const invalidData = {
          ...validTenantData,
          employment: {
            current: {
              ...validTenantData.employment.current,
              employer: {
                ...validTenantData.employment.current.employer,
                contractType: 'invalid-type',
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

      it('should reject negative income values', async () => {
        const invalidData = {
          ...validTenantData,
          employment: {
            current: {
              ...validTenantData.employment.current,
              income: {
                ...validTenantData.employment.current.income,
                gross: {
                  monthly: -1000,
                  annual: -12000,
                },
              },
            },
          },
        };

        const response = await request(app)
          .post('/api/v1/tenants')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);

        expect(response.body.message).toContain('cannot be negative');
      });

      it('should reject invalid pay frequency', async () => {
        const invalidData = {
          ...validTenantData,
          employment: {
            current: {
              ...validTenantData.employment.current,
              income: {
                ...validTenantData.employment.current.income,
                payFrequency: 'invalid-frequency',
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

      it('should reject invalid verification method', async () => {
        const invalidData = {
          ...validTenantData,
          employment: {
            current: {
              ...validTenantData.employment.current,
              income: {
                ...validTenantData.employment.current.income,
                verificationMethod: 'invalid-method',
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

      it('should reject negative benefits amount', async () => {
        const invalidData = {
          ...validTenantData,
          employment: {
            current: {
              ...validTenantData.employment.current,
              benefits: {
                receives: true,
                monthlyAmount: -100,
              },
            },
          },
        };

        const response = await request(app)
          .post('/api/v1/tenants')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);

        expect(response.body.message).toContain('cannot be negative');
      });
    });

    describe('Privacy Validation', () => {
      it('should require data retention consent', async () => {
        const invalidData = {
          ...validTenantData,
          privacy: {},
        };

        const response = await request(app)
          .post('/api/v1/tenants')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);

        expect(response.body.message).toContain('Data retention consent is required');
      });

      it('should reject non-boolean data retention consent', async () => {
        const invalidData = {
          ...validTenantData,
          privacy: {
            dataRetentionConsent: 'yes',
          },
        };

        const response = await request(app)
          .post('/api/v1/tenants')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);

        expect(response.body.message).toContain('must be true or false');
      });
    });
  });

  describe('validateLease', () => {
    let tenantId;
    let propertyId;

    beforeEach(async () => {
      // Create a test property first
      const propertyData = {
        title: 'Test Property for Lease',
        description: 'A test property for lease validation',
        propertyType: 'apartment',
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

      const propertyResponse = await request(app)
        .post('/api/v1/property')
        .set('Authorization', `Bearer ${authToken}`)
        .send(propertyData);

      propertyId = propertyResponse.body.data.property._id;

      // Create a test tenant
      const tenantData = {
        personalInfo: {
          firstName: 'John',
          lastName: 'Smith',
          dateOfBirth: '1990-05-15',
          rightToRent: { verified: true },
        },
        contactInfo: {
          email: 'john.lease@example.com',
          phone: { primary: { number: '07700900123', type: 'mobile' } },
          emergencyContact: {
            name: 'Jane Smith',
            relationship: 'spouse',
            phone: '07700900124',
          },
        },
        employment: { current: { status: 'employed-full-time' } },
        privacy: { dataRetentionConsent: true },
      };

      const response = await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tenantData);

      tenantId = response.body.data.tenant._id;
    });

    const getValidLeaseData = () => ({
      property: propertyId,
      tenancyType: 'assured-shorthold',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      monthlyRent: 1500,
      securityDeposit: 1500,
      rentDueDate: 1,
    });

    it('should accept valid lease data', async () => {
      await request(app)
        .post(`/api/v1/tenants/${tenantId}/leases`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(getValidLeaseData())
        .expect(200);
    });

    it('should reject missing property ID', async () => {
      const invalidData = { ...getValidLeaseData() };
      delete invalidData.property;

      const response = await request(app)
        .post(`/api/v1/tenants/${tenantId}/leases`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toContain('Property ID is required');
    });

    it('should reject invalid property ID format', async () => {
      const invalidData = {
        ...getValidLeaseData(),
        property: 'invalid-id',
      };

      const response = await request(app)
        .post(`/api/v1/tenants/${tenantId}/leases`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toContain('valid MongoDB ObjectId');
    });

    it('should reject invalid UK tenancy type', async () => {
      const invalidData = {
        ...getValidLeaseData(),
        tenancyType: 'invalid-type',
      };

      const response = await request(app)
        .post(`/api/v1/tenants/${tenantId}/leases`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toContain('Invalid UK tenancy type');
    });

    it('should reject missing start date', async () => {
      const invalidData = { ...getValidLeaseData() };
      delete invalidData.startDate;

      const response = await request(app)
        .post(`/api/v1/tenants/${tenantId}/leases`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toContain('start date is required');
    });

    it('should reject missing end date', async () => {
      const invalidData = { ...getValidLeaseData() };
      delete invalidData.endDate;

      const response = await request(app)
        .post(`/api/v1/tenants/${tenantId}/leases`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toContain('end date is required');
    });

    it('should reject end date before start date', async () => {
      const invalidData = {
        ...getValidLeaseData(),
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      };

      const response = await request(app)
        .post(`/api/v1/tenants/${tenantId}/leases`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toContain('End date must be after start date');
    });

    it('should reject missing monthly rent', async () => {
      const invalidData = { ...getValidLeaseData() };
      delete invalidData.monthlyRent;

      const response = await request(app)
        .post(`/api/v1/tenants/${tenantId}/leases`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toContain('Monthly rent is required');
    });

    it('should reject zero or negative monthly rent', async () => {
      const invalidData = {
        ...getValidLeaseData(),
        monthlyRent: 0,
      };

      const response = await request(app)
        .post(`/api/v1/tenants/${tenantId}/leases`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toContain('greater than 0');
    });

    it('should reject negative security deposit', async () => {
      const invalidData = {
        ...getValidLeaseData(),
        securityDeposit: -100,
      };

      const response = await request(app)
        .post(`/api/v1/tenants/${tenantId}/leases`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toContain('cannot be negative');
    });

    it('should reject invalid rent due date', async () => {
      const invalidData = {
        ...getValidLeaseData(),
        rentDueDate: 35, // Must be between 1-31
      };

      const response = await request(app)
        .post(`/api/v1/tenants/${tenantId}/leases`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toContain('between 1 and 31');
    });
  });

  describe('validateAffordabilityAssessment', () => {
    let tenantId;

    beforeEach(async () => {
      const tenantData = {
        personalInfo: {
          firstName: 'John',
          lastName: 'Smith',
          dateOfBirth: '1990-05-15',
          rightToRent: { verified: true },
        },
        contactInfo: {
          email: 'john.affordability@example.com',
          phone: { primary: { number: '07700900123', type: 'mobile' } },
          emergencyContact: {
            name: 'Jane Smith',
            relationship: 'spouse',
            phone: '07700900124',
          },
        },
        employment: { current: { status: 'employed-full-time' } },
        privacy: { dataRetentionConsent: true },
      };

      const response = await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tenantData);

      tenantId = response.body.data.tenant._id;
    });

    it('should accept valid affordability assessment', async () => {
      const assessmentData = {
        monthlyIncome: 4000,
        monthlyExpenses: 1500,
        monthlyCommitments: 500,
      };

      await request(app)
        .patch(`/api/v1/tenants/${tenantId}/affordability`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(assessmentData)
        .expect(200);
    });

    it('should reject missing monthly income', async () => {
      const assessmentData = {
        monthlyExpenses: 1500,
        monthlyCommitments: 500,
      };

      const response = await request(app)
        .patch(`/api/v1/tenants/${tenantId}/affordability`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(assessmentData)
        .expect(400);

      expect(response.body.message).toContain('Monthly income must be a number');
    });

    it('should reject zero or negative monthly income', async () => {
      const assessmentData = {
        monthlyIncome: 0,
        monthlyExpenses: 1500,
      };

      const response = await request(app)
        .patch(`/api/v1/tenants/${tenantId}/affordability`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(assessmentData)
        .expect(400);

      expect(response.body.message).toContain('greater than 0');
    });

    it('should reject negative monthly expenses', async () => {
      const assessmentData = {
        monthlyIncome: 4000,
        monthlyExpenses: -100,
      };

      const response = await request(app)
        .patch(`/api/v1/tenants/${tenantId}/affordability`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(assessmentData)
        .expect(400);

      expect(response.body.message).toContain('cannot be negative');
    });

    it('should reject negative monthly commitments', async () => {
      const assessmentData = {
        monthlyIncome: 4000,
        monthlyCommitments: -100,
      };

      const response = await request(app)
        .patch(`/api/v1/tenants/${tenantId}/affordability`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(assessmentData)
        .expect(400);

      expect(response.body.message).toContain('cannot be negative');
    });
  });

  describe('validateReferencingOutcome', () => {
    let tenantId;

    beforeEach(async () => {
      const tenantData = {
        personalInfo: {
          firstName: 'John',
          lastName: 'Smith',
          dateOfBirth: '1990-05-15',
          rightToRent: { verified: true },
        },
        contactInfo: {
          email: 'john.referencing@example.com',
          phone: { primary: { number: '07700900123', type: 'mobile' } },
          emergencyContact: {
            name: 'Jane Smith',
            relationship: 'spouse',
            phone: '07700900124',
          },
        },
        employment: { current: { status: 'employed-full-time' } },
        privacy: { dataRetentionConsent: true },
      };

      const response = await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tenantData);

      tenantId = response.body.data.tenant._id;
    });

    it('should accept valid referencing outcome', async () => {
      const referencingData = {
        outcome: 'pass',
        provider: 'HomeLet',
        reference: 'HL123456',
        notes: 'All checks passed successfully',
      };

      await request(app)
        .patch(`/api/v1/tenants/${tenantId}/referencing`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(referencingData)
        .expect(200);
    });

    it('should allow partial update without outcome', async () => {
      const referencingData = {
        provider: 'HomeLet',
        reference: 'HL123456',
      };

      await request(app)
        .patch(`/api/v1/tenants/${tenantId}/referencing`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(referencingData)
        .expect(200);
    });

    it('should reject invalid outcome', async () => {
      const referencingData = {
        outcome: 'invalid-outcome',
        provider: 'HomeLet',
      };

      const response = await request(app)
        .patch(`/api/v1/tenants/${tenantId}/referencing`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(referencingData)
        .expect(400);

      expect(response.body.message).toContain('Invalid referencing outcome');
    });

    it('should reject provider name that is too long', async () => {
      const referencingData = {
        outcome: 'pass',
        provider: 'A'.repeat(101), // Exceeds 100 character limit
      };

      const response = await request(app)
        .patch(`/api/v1/tenants/${tenantId}/referencing`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(referencingData)
        .expect(400);

      expect(response.body.message).toContain('cannot exceed 100 characters');
    });
  });

  describe('validateIncomeQualification', () => {
    let tenantId;

    beforeEach(async () => {
      const tenantData = {
        personalInfo: {
          firstName: 'John',
          lastName: 'Smith',
          dateOfBirth: '1990-05-15',
          rightToRent: { verified: true },
        },
        contactInfo: {
          email: 'john.income@example.com',
          phone: { primary: { number: '07700900123', type: 'mobile' } },
          emergencyContact: {
            name: 'Jane Smith',
            relationship: 'spouse',
            phone: '07700900124',
          },
        },
        employment: { current: { status: 'employed-full-time' } },
        privacy: { dataRetentionConsent: true },
      };

      const response = await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tenantData);

      tenantId = response.body.data.tenant._id;
    });

    it('should accept valid monthly rent for qualification check', async () => {
      const qualificationData = {
        monthlyRent: 1500,
      };

      await request(app)
        .post(`/api/v1/tenants/${tenantId}/qualification`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(qualificationData)
        .expect(200);
    });

    it('should reject missing monthly rent', async () => {
      const response = await request(app)
        .post(`/api/v1/tenants/${tenantId}/qualification`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.message).toContain('Monthly rent must be a number');
    });

    it('should reject zero or negative monthly rent', async () => {
      const qualificationData = {
        monthlyRent: 0,
      };

      const response = await request(app)
        .post(`/api/v1/tenants/${tenantId}/qualification`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(qualificationData)
        .expect(400);

      expect(response.body.message).toContain('greater than 0');
    });

    it('should reject non-numeric monthly rent', async () => {
      const qualificationData = {
        monthlyRent: 'invalid',
      };

      const response = await request(app)
        .post(`/api/v1/tenants/${tenantId}/qualification`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(qualificationData)
        .expect(400);

      expect(response.body.message).toContain('must be a number');
    });
  });

  describe('validateBulkOperation', () => {
    let tenant1Id, tenant2Id;

    beforeEach(async () => {
      // Create two test tenants
      const tenant1Data = {
        personalInfo: {
          firstName: 'John',
          lastName: 'Smith',
          dateOfBirth: '1990-05-15',
          rightToRent: { verified: true },
        },
        contactInfo: {
          email: 'john.bulk1@example.com',
          phone: { primary: { number: '07700900123', type: 'mobile' } },
          emergencyContact: {
            name: 'Jane Smith',
            relationship: 'spouse',
            phone: '07700900124',
          },
        },
        employment: { current: { status: 'employed-full-time' } },
        privacy: { dataRetentionConsent: true },
      };

      const tenant2Data = {
        ...tenant1Data,
        contactInfo: { ...tenant1Data.contactInfo, email: 'jane.bulk2@example.com' },
        personalInfo: { ...tenant1Data.personalInfo, firstName: 'Jane' },
      };

      const response1 = await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tenant1Data);

      const response2 = await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tenant2Data);

      tenant1Id = response1.body.data.tenant._id;
      tenant2Id = response2.body.data.tenant._id;
    });

    it('should accept valid bulk operation', async () => {
      const bulkData = {
        tenantIds: [tenant1Id, tenant2Id],
        operation: 'approve',
      };

      await request(app)
        .patch('/api/v1/tenants/bulk-update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bulkData)
        .expect(200);
    });

    it('should reject missing tenant IDs', async () => {
      const bulkData = {
        operation: 'approve',
      };

      const response = await request(app)
        .patch('/api/v1/tenants/bulk-update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bulkData)
        .expect(400);

      expect(response.body.message).toContain('At least one tenant ID is required');
    });

    it('should reject empty tenant IDs array', async () => {
      const bulkData = {
        tenantIds: [],
        operation: 'approve',
      };

      const response = await request(app)
        .patch('/api/v1/tenants/bulk-update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bulkData)
        .expect(400);

      expect(response.body.message).toContain('At least one tenant ID is required');
    });

    it('should reject invalid tenant ID format', async () => {
      const bulkData = {
        tenantIds: ['invalid-id'],
        operation: 'approve',
      };

      const response = await request(app)
        .patch('/api/v1/tenants/bulk-update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bulkData)
        .expect(400);

      expect(response.body.message).toContain('valid MongoDB ObjectIds');
    });

    it('should reject missing operation', async () => {
      const bulkData = {
        tenantIds: [tenant1Id, tenant2Id],
      };

      const response = await request(app)
        .patch('/api/v1/tenants/bulk-update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bulkData)
        .expect(400);

      expect(response.body.message).toContain('Operation is required');
    });

    it('should reject invalid operation', async () => {
      const bulkData = {
        tenantIds: [tenant1Id, tenant2Id],
        operation: 'invalid-operation',
      };

      const response = await request(app)
        .patch('/api/v1/tenants/bulk-update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bulkData)
        .expect(400);

      expect(response.body.message).toContain('Invalid bulk operation');
    });
  });
});
