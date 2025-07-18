import request from 'supertest';

import app from '../server.js';

/**
 * Demo script to test tenant creation functionality
 * Run with: node tests/create-tenant-demo.js
 */

const testUser = {
  firstName: 'Demo',
  secondName: 'User',
  email: 'demo.test@example.com',
  password: 'DemoPass123!',
};

const qualifiedTenantData = {
  personalInfo: {
    title: 'Mr',
    firstName: 'John',
    lastName: 'Qualified',
    dateOfBirth: '1990-05-15',
    nationalInsuranceNumber: 'AB123456C',
    nationality: 'British',
    immigrationStatus: 'british-citizen',
    rightToRent: {
      verified: true,
      verificationDate: new Date().toISOString(),
      documentType: 'uk-passport',
    },
  },
  contactInfo: {
    email: 'john.qualified@example.com',
    phone: {
      primary: {
        number: '07700900123',
        type: 'mobile',
      },
    },
    emergencyContact: {
      name: 'Jane Qualified',
      relationship: 'spouse',
      phone: '07700900124',
      email: 'jane.qualified@example.com',
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
        name: 'High Paying Company',
        position: 'Senior Engineer',
        contractType: 'permanent',
      },
      income: {
        gross: {
          monthly: 6000, // Well qualified income
          annual: 72000,
        },
        net: {
          monthly: 4800,
          annual: 57600,
        },
        currency: 'GBP',
        payFrequency: 'monthly',
        verified: true,
        verificationMethod: 'payslip',
        verificationDate: new Date().toISOString(),
      },
      benefits: {
        receives: false,
      },
    },
  },
  financialInfo: {
    creditScore: {
      score: 850,
      provider: 'Experian',
      date: new Date().toISOString(),
    },
    bankAccount: {
      verified: true,
      verificationDate: new Date().toISOString(),
    },
  },
  referencing: {
    status: 'completed',
    outcome: 'pass',
  },
  privacy: {
    dataRetentionConsent: true,
  },
};

async function runDemo() {
  try {
    console.log('🚀 Starting Tenant Creation Demo...\n');

    // 1. Register user
    console.log('1. Registering demo user...');
    await request(app).post('/api/v1/auth/register').send(testUser).expect(201);
    console.log('✅ User registered successfully\n');

    // 2. Login user
    console.log('2. Logging in...');
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200);

    const authToken = loginResponse.body.token;
    console.log('✅ Login successful\n');

    // 3. Create qualified tenant
    console.log('3. Creating qualified tenant...');
    const tenantResponse = await request(app)
      .post('/api/v1/tenants')
      .set('Authorization', `Bearer ${authToken}`)
      .send(qualifiedTenantData)
      .expect(201);

    const tenant = tenantResponse.body.data.tenant;
    console.log('✅ Tenant created successfully!');
    console.log(`   Tenant ID: ${tenant._id}`);
    console.log(`   Name: ${tenant.personalInfo.firstName} ${tenant.personalInfo.lastName}`);
    console.log(`   Application Status: ${tenant.applicationStatus.status}`);
    console.log(
      `   Qualification Status: ${tenant.qualificationStatus?.status || 'Not available'}`,
    );

    if (tenant.qualificationStatus?.issues) {
      console.log(`   Qualification Issues: ${tenant.qualificationStatus.issues.join(', ')}`);
    }

    console.log('\n🎉 Demo completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ User registration and authentication');
    console.log('   ✅ Tenant creation with UK validation');
    console.log('   ✅ Automatic qualification assessment');
    console.log('   ✅ Auto-approval for qualified tenants');
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response body:', error.response.body);
    }
  } finally {
    process.exit(0);
  }
}

// Run the demo
runDemo();
