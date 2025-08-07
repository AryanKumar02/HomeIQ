// Debug script to identify tenant assignment issues
// Run this in your server directory with: node debug_tenant_assignment.js

import mongoose from 'mongoose';

import Tenant from './models/Tenant.js';
import Property from './models/Property.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.DATABASE_URI ||
        'mongodb+srv://lynxdr4g0n:6A19OE0PYYfNgSKz@cluster0.gfk1mwb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    );
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const debugTenantAssignments = async () => {
  try {
    console.log('\n🔍 DEBUGGING TENANT ASSIGNMENTS...\n');

    // 1. Find all tenants with active leases
    const tenantsWithActiveLeases = await Tenant.find({
      'leases.status': 'active',
    }).populate('leases.property');

    console.log(`📊 Found ${tenantsWithActiveLeases.length} tenants with active leases:`);

    for (const tenant of tenantsWithActiveLeases) {
      const fullName =
        `${tenant.personalInfo?.firstName || ''} ${tenant.personalInfo?.lastName || ''}`.trim();
      console.log(`\n👤 TENANT: ${fullName} (ID: ${tenant._id})`);

      const activeLeases = tenant.leases.filter(lease => lease.status === 'active');

      for (const lease of activeLeases) {
        console.log(
          `  📋 Lease: Property ${lease.property} | Unit: ${lease.unit || 'Main'} | Status: ${lease.status}`,
        );

        // Check if this tenant appears in the property's units
        const property = await Property.findById(lease.property);
        if (property) {
          console.log(`  🏠 Property: ${property.address?.street || 'Unknown'}`);

          // Check occupancy object for tenant assignment
          if (
            property.occupancy?.tenant &&
            property.occupancy.tenant.toString() === tenant._id.toString()
          ) {
            console.log('  ✅ Tenant assigned to property occupancy');
          } else if (property.tenant && property.tenant.toString() === tenant._id.toString()) {
            console.log('  ✅ Tenant assigned to main property');
          } else {
            // Check units for tenant assignment
            if (property.units && property.units.length > 0) {
              const assignedUnit = property.units.find(
                unit => unit.tenant && unit.tenant.toString() === tenant._id.toString(),
              );

              if (assignedUnit) {
                console.log(`  ✅ Tenant assigned to unit: ${assignedUnit.unitNumber}`);
              } else {
                console.log(
                  '  ❌ ISSUE: Tenant has active lease but NOT assigned to any unit in property',
                );
                console.log(`    🔧 FIX NEEDED: Assign tenant to unit ${lease.unit || 'Main'}`);
              }
            } else {
              console.log(
                '  ❌ ISSUE: Tenant has active lease but NOT assigned to property occupancy',
              );
              console.log('    🔧 FIX NEEDED: Assign tenant to property occupancy');
            }
          }
        } else {
          console.log(`  ❌ ISSUE: Property ${lease.property} not found`);
        }
      }
    }

    // 2. Find properties with tenant assignments but no corresponding lease
    console.log('\n\n🔍 CHECKING PROPERTIES WITH TENANT ASSIGNMENTS...\n');

    const propertiesWithTenants = await Property.find({
      $or: [
        { tenant: { $exists: true, $ne: null } },
        { 'units.tenant': { $exists: true, $ne: null } },
      ],
    })
      .populate('tenant')
      .populate('units.tenant');

    for (const property of propertiesWithTenants) {
      console.log(`\n🏠 PROPERTY: ${property.address?.street || 'Unknown'} (ID: ${property._id})`);

      // Check main property tenant
      if (property.tenant) {
        const tenant = property.tenant;
        const fullName =
          `${tenant.personalInfo?.firstName || ''} ${tenant.personalInfo?.lastName || ''}`.trim();
        console.log(`  👤 Main tenant: ${fullName}`);

        // Check if tenant has active lease for this property
        const hasActiveLease = tenant.leases.some(
          lease =>
            lease.property.toString() === property._id.toString() && lease.status === 'active',
        );

        if (!hasActiveLease) {
          console.log('  ❌ ISSUE: Tenant assigned to property but no active lease found');
          console.log('  🔧 FIX: Either create active lease or remove tenant assignment');
        }
      }

      // Check units
      if (property.units && property.units.length > 0) {
        property.units.forEach(unit => {
          if (unit.tenant) {
            const tenant = unit.tenant;
            const fullName =
              `${tenant.personalInfo?.firstName || ''} ${tenant.personalInfo?.lastName || ''}`.trim();
            console.log(`  👤 Unit ${unit.unitNumber} tenant: ${fullName}`);

            // Check if tenant has active lease for this property/unit
            const hasActiveLease = tenant.leases.some(
              lease =>
                lease.property.toString() === property._id.toString() &&
                lease.status === 'active' &&
                (lease.unit === unit.unitNumber || (!lease.unit && unit.unitNumber === 'Main')),
            );

            if (!hasActiveLease) {
              console.log('  ❌ ISSUE: Tenant assigned to unit but no active lease found');
              console.log('  🔧 FIX: Either create active lease or remove tenant assignment');
            }
          }
        });
      }
    }

    console.log('\n\n📝 SUMMARY OF ISSUES FOUND:');
    console.log('1. Check for tenants with active leases but not assigned to property units');
    console.log('2. Check for tenants assigned to properties but without active leases');
    console.log('3. Use the fix functions below to resolve issues');
  } catch (error) {
    console.error('❌ Error during debugging:', error);
  }
};

// Fix function to sync tenant assignments
const fixTenantAssignments = async () => {
  try {
    console.log('\n🔧 FIXING TENANT ASSIGNMENTS...\n');

    // Find tenants with active leases and ensure they're assigned to properties
    const tenantsWithActiveLeases = await Tenant.find({
      'leases.status': 'active',
    });

    for (const tenant of tenantsWithActiveLeases) {
      const activeLeases = tenant.leases.filter(lease => lease.status === 'active');

      for (const lease of activeLeases) {
        const property = await Property.findById(lease.property);
        if (!property) {
          continue;
        }

        const fullName =
          `${tenant.personalInfo?.firstName || ''} ${tenant.personalInfo?.lastName || ''}`.trim();

        if (property.units && property.units.length > 0) {
          // Multi-unit property
          const unitNumber = lease.unit || 'Main';
          const unitIndex = property.units.findIndex(unit => unit.unitNumber === unitNumber);

          if (unitIndex >= 0) {
            if (
              !property.units[unitIndex].tenant ||
              property.units[unitIndex].tenant.toString() !== tenant._id.toString()
            ) {
              console.log(
                `🔧 Assigning ${fullName} to ${property.address?.street} Unit ${unitNumber}`,
              );
              property.units[unitIndex].tenant = tenant._id;
              property.units[unitIndex].isOccupied = true;
              await property.save();
            }
          }
        } else {
          // Single-unit property - use occupancy object
          if (
            !property.occupancy?.tenant ||
            property.occupancy.tenant.toString() !== tenant._id.toString()
          ) {
            console.log(`🔧 Assigning ${fullName} to ${property.address?.street}`);
            if (!property.occupancy) {
              property.occupancy = {};
            }
            property.occupancy.tenant = tenant._id;
            property.occupancy.isOccupied = true;
            await property.save();
          }
        }
      }
    }

    console.log('✅ Tenant assignments fixed!');
  } catch (error) {
    console.error('❌ Error fixing tenant assignments:', error);
  }
};

// Force unassign tenant function
const forceUnassignTenant = async tenantId => {
  try {
    console.log(`\n🔧 FORCE UNASSIGNING TENANT: ${tenantId}\n`);

    // Remove tenant from all properties
    await Property.updateMany({ tenant: tenantId }, { $unset: { tenant: 1 } });

    // Remove tenant from all units
    await Property.updateMany(
      { 'units.tenant': tenantId },
      {
        $set: {
          'units.$.tenant': null,
          'units.$.isOccupied': false,
        },
      },
    );

    // Update all leases to terminated
    await Tenant.updateOne(
      { _id: tenantId },
      {
        $set: {
          'leases.$[].status': 'terminated',
          'leases.$[].terminationDate': new Date(),
          'leases.$[].terminationReason': 'Force unassigned for deletion',
        },
      },
    );

    console.log('✅ Tenant force unassigned! You can now delete the tenant.');
  } catch (error) {
    console.error('❌ Error force unassigning tenant:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();

  const args = process.argv.slice(2);

  if (args[0] === 'debug') {
    await debugTenantAssignments();
  } else if (args[0] === 'fix') {
    await fixTenantAssignments();
  } else if (args[0] === 'unassign' && args[1]) {
    await forceUnassignTenant(args[1]);
  } else {
    console.log('Usage:');
    console.log('  node debug_tenant_assignment.js debug    - Debug tenant assignments');
    console.log('  node debug_tenant_assignment.js fix      - Fix tenant assignments');
    console.log('  node debug_tenant_assignment.js unassign <tenantId> - Force unassign tenant');
  }

  await mongoose.connection.close();
  console.log('\n✅ Done!');
};

main();
