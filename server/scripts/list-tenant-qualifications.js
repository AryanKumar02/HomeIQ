import mongoose from 'mongoose';
import Tenant from './models/Tenant.js';
import dotenv from 'dotenv';

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

// List all tenants with qualification status
const listTenantQualifications = async () => {
  try {
    const tenants = await Tenant.find({ isActive: true });
    
    console.log('\n=== ALL TENANTS QUALIFICATION STATUS ===\n');
    
    tenants.forEach((tenant, index) => {
      const qualification = tenant.getQualificationStatus();
      const name = `${tenant.personalInfo.firstName} ${tenant.personalInfo.lastName}`;
      
      console.log(`${index + 1}. ${name}`);
      console.log(`   ID: ${tenant._id}`);
      console.log(`   Status: ${qualification.status}`);
      console.log(`   Application Status: ${tenant.applicationStatus?.status || 'NOT SET'}`);
      
      if (qualification.status === 'needs-review') {
        console.log(`   ⚠️  NEEDS REVIEW - Issues:`);
        qualification.issues.forEach((issue, i) => {
          console.log(`      ${i + 1}. ${issue}`);
        });
      } else if (qualification.status === 'not-qualified') {
        console.log(`   ❌ NOT QUALIFIED - Issues:`);
        qualification.issues.forEach((issue, i) => {
          console.log(`      ${i + 1}. ${issue}`);
        });
      } else {
        console.log(`   ✅ QUALIFIED`);
      }
      
      console.log('');
    });
    
    // Summary
    const qualified = tenants.filter(t => t.getQualificationStatus().status === 'qualified').length;
    const needsReview = tenants.filter(t => t.getQualificationStatus().status === 'needs-review').length;
    const notQualified = tenants.filter(t => t.getQualificationStatus().status === 'not-qualified').length;
    
    console.log('=== SUMMARY ===');
    console.log(`Total Tenants: ${tenants.length}`);
    console.log(`✅ Qualified: ${qualified}`);
    console.log(`⚠️  Needs Review: ${needsReview}`);
    console.log(`❌ Not Qualified: ${notQualified}`);
    
  } catch (error) {
    console.error('Error listing tenant qualifications:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await listTenantQualifications();
  
  // Close connection
  await mongoose.connection.close();
  console.log('\nDatabase connection closed.');
};

main().catch(console.error);