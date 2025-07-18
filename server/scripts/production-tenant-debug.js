#!/usr/bin/env node

/**
 * Production-safe tenant qualification debugging script
 * 
 * Usage:
 *   NODE_ENV=production node scripts/production-tenant-debug.js list
 *   NODE_ENV=production node scripts/production-tenant-debug.js debug <tenant-id>
 * 
 * This script is safe to use in production as it only reads data
 * and doesn't modify anything.
 */

import mongoose from 'mongoose';
import Tenant from '../models/Tenant.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Ensure we're not accidentally modifying production data
const PRODUCTION_SAFE = true;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to MongoDB (${process.env.NODE_ENV || 'development'})`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const listTenants = async () => {
  const tenants = await Tenant.find({ isActive: true });
  
  console.log('\n=== TENANT QUALIFICATION STATUS ===\n');
  
  tenants.forEach((tenant, index) => {
    const qualification = tenant.getQualificationStatus();
    const name = `${tenant.personalInfo.firstName} ${tenant.personalInfo.lastName}`;
    
    console.log(`${index + 1}. ${name} (${tenant._id})`);
    console.log(`   Status: ${qualification.status}`);
    console.log(`   App Status: ${tenant.applicationStatus?.status || 'NOT SET'}`);
    
    if (qualification.issues.length > 0) {
      console.log(`   Issues: ${qualification.issues.join(', ')}`);
    }
    console.log('');
  });
};

const debugTenant = async (tenantId) => {
  const tenant = await Tenant.findById(tenantId);
  
  if (!tenant) {
    console.log('❌ Tenant not found');
    return;
  }

  const qualification = tenant.getQualificationStatus();
  const name = `${tenant.personalInfo.firstName} ${tenant.personalInfo.lastName}`;
  
  console.log(`\n=== TENANT DEBUG: ${name} ===`);
  console.log(`ID: ${tenant._id}`);
  console.log(`Qualification: ${qualification.status}`);
  console.log(`Issues: ${qualification.issues.join(', ') || 'None'}`);
  
  console.log('\n--- Data Check ---');
  console.log(`Right to Rent: ${tenant.personalInfo?.rightToRent?.verified || false}`);
  console.log(`Referencing: ${tenant.referencing?.outcome || 'NOT SET'}`);
  console.log(`Employment: ${tenant.employment?.current?.status || 'NOT SET'}`);
  console.log(`Income: ${tenant.employment?.current?.income?.gross?.monthly || 'NOT SET'}`);
  console.log(`App Status: ${tenant.applicationStatus?.status || 'NOT SET'}`);
};

const main = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️  Running in PRODUCTION mode (read-only)');
  }
  
  await connectDB();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'list':
      await listTenants();
      break;
    case 'debug':
      const tenantId = process.argv[3];
      if (!tenantId) {
        console.log('Usage: node production-tenant-debug.js debug <tenant-id>');
        process.exit(1);
      }
      await debugTenant(tenantId);
      break;
    default:
      console.log('Usage:');
      console.log('  node production-tenant-debug.js list');
      console.log('  node production-tenant-debug.js debug <tenant-id>');
      process.exit(1);
  }
  
  await mongoose.connection.close();
};

main().catch(console.error);