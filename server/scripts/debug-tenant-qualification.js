import dotenv from 'dotenv';
import mongoose from 'mongoose';

import Tenant from '../models/Tenant.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Debug tenant qualification
const debugTenantQualification = async tenantId => {
  try {
    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
      console.log('❌ Tenant not found');
      return;
    }

    console.log('\n=== TENANT QUALIFICATION DEBUG ===');
    console.log(`Tenant: ${tenant.personalInfo.firstName} ${tenant.personalInfo.lastName}`);
    console.log(`ID: ${tenant._id}`);

    // Get qualification status
    const qualification = tenant.getQualificationStatus();

    console.log('\n--- QUALIFICATION STATUS ---');
    console.log(`Status: ${qualification.status}`);
    console.log(`Summary: ${qualification.summary}`);

    if (qualification.issues.length > 0) {
      console.log('\n--- SPECIFIC ISSUES ---');
      qualification.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }

    console.log('\n--- DETAILED DATA CHECK ---');

    // Check Right to Rent
    console.log(`Right to Rent Verified: ${tenant.personalInfo?.rightToRent?.verified || false}`);

    // Check Referencing
    console.log(`Referencing Outcome: ${tenant.referencing?.outcome || 'NOT SET'}`);
    if (tenant.referencing?.conditions) {
      console.log(`Referencing Conditions: ${tenant.referencing.conditions}`);
    }

    // Check Income
    const hasIncome =
      tenant.employment?.current?.income?.gross?.monthly ||
      tenant.employment?.current?.income?.net?.monthly ||
      tenant.financialInfo?.affordabilityAssessment?.monthlyIncome;
    console.log(`Has Income Information: ${!!hasIncome}`);
    if (hasIncome) {
      console.log(`Income: £${hasIncome}`);
    }

    // Check Employment
    console.log(`Employment Status: ${tenant.employment?.current?.status || 'NOT SET'}`);
    console.log(`Receives Benefits: ${tenant.employment?.current?.benefits?.receives || false}`);

    // Check Guarantor
    console.log(`Guarantor Required: ${tenant.financialInfo?.guarantor?.required || false}`);
    console.log(`Guarantor Provided: ${tenant.financialInfo?.guarantor?.provided || false}`);

    // Check Application Status
    console.log(`Application Status: ${tenant.applicationStatus?.status || 'NOT SET'}`);
  } catch (error) {
    console.error('Error debugging tenant qualification:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();

  // Get tenant ID from command line arguments
  const tenantId = process.argv[2];

  if (!tenantId) {
    console.log('Usage: node debug-tenant-qualification.js <tenant-id>');
    console.log('Example: node debug-tenant-qualification.js 507f1f77bcf86cd799439011');
    process.exit(1);
  }

  await debugTenantQualification(tenantId);

  // Close connection
  await mongoose.connection.close();
  console.log('\nDatabase connection closed.');
};

main().catch(console.error);
