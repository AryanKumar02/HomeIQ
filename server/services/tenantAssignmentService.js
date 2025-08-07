import mongoose from 'mongoose';

import Tenant from '../models/Tenant.js';
import Property from '../models/Property.js';
import AppError from '../utils/appError.js';
import logger from '../utils/logger.js';

import { emitAnalyticsUpdate } from './realTimeAnalytics.js';

/**
 * Bulletproof Tenant Assignment Service
 * Ensures data consistency between Tenant and Property models
 * Uses MongoDB transactions to prevent data corruption
 */

/**
 * Safely assign a tenant to a property with full data consistency
 * @param {Object} params - Assignment parameters
 * @param {string} params.tenantId - Tenant ID
 * @param {string} params.propertyId - Property ID
 * @param {string} params.unitId - Unit ID (optional for single-unit properties)
 * @param {Object} params.leaseData - Lease details
 * @param {string} params.userId - User ID for validation
 * @returns {Object} Assignment result with tenant, property, and lease data
 */
export const assignTenantToProperty = async ({
  tenantId,
  propertyId,
  unitId,
  leaseData = {},
  userId,
}) => {
  const session = await mongoose.startSession();

  try {
    // Start transaction
    await session.startTransaction();

    logger.info(
      `Starting tenant assignment: ${tenantId} → ${propertyId}${unitId ? ` (Unit: ${unitId})` : ''}`,
    );

    // 1. Fetch and validate tenant
    const tenant = await Tenant.findOne({
      _id: tenantId,
      createdBy: userId,
      isActive: true,
    }).session(session);

    if (!tenant) {
      throw new AppError('Tenant not found or access denied', 404);
    }

    // 2. Fetch and validate property
    const property = await Property.findOne({
      _id: propertyId,
      owner: userId,
    }).session(session);

    if (!property) {
      throw new AppError('Property not found or access denied', 404);
    }

    // 3. Validate assignment requirements
    await validateAssignmentRequirements(tenant, property, unitId);

    // 4. Check for existing active assignments
    await validateNoExistingAssignment(tenant, propertyId, unitId);

    // 5. Check property/unit availability
    await validatePropertyAvailability(property, unitId);

    // 6. Create lease object with proper defaults
    const lease = createLeaseObject({
      propertyId,
      unitId,
      leaseData,
      property,
    });

    // 7. Execute assignment in transaction
    const result = await executeAssignment({
      tenant,
      property,
      lease,
      unitId,
      session,
    });

    // 8. Commit transaction
    await session.commitTransaction();

    // 9. Emit analytics update (outside transaction)
    try {
      if (global.io) {
        await emitAnalyticsUpdate(global.io, userId, 'analytics:lease-assigned');
      }
    } catch (emitError) {
      logger.warn('Failed to emit analytics update after assignment:', emitError);
    }

    logger.info(`✅ Tenant assignment completed successfully: ${tenantId} → ${propertyId}`);

    return result;
  } catch (error) {
    // Rollback transaction on any error
    await session.abortTransaction();
    logger.error('❌ Tenant assignment failed:', error);
    throw error;
  } finally {
    await session.endSession();
  }
};

/**
 * Safely unassign a tenant from a property with full data consistency
 */
export const unassignTenantFromProperty = async ({
  tenantId,
  propertyId,
  unitId,
  userId,
  terminationReason = 'Manual unassignment',
}) => {
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    logger.info(
      `Starting tenant unassignment: ${tenantId} ← ${propertyId}${unitId ? ` (Unit: ${unitId})` : ''}`,
    );

    // 1. Fetch and validate tenant
    const tenant = await Tenant.findOne({
      _id: tenantId,
      createdBy: userId,
      isActive: true,
    }).session(session);

    if (!tenant) {
      throw new AppError('Tenant not found or access denied', 404);
    }

    // 2. Fetch and validate property
    const property = await Property.findOne({
      _id: propertyId,
      owner: userId,
    }).session(session);

    if (!property) {
      throw new AppError('Property not found or access denied', 404);
    }

    // 3. Find active lease
    const activeLease = tenant.leases.find(
      lease =>
        lease.property.toString() === propertyId &&
        lease.status === 'active' &&
        (!unitId || lease.unit === unitId),
    );

    if (!activeLease) {
      throw new AppError('No active lease found for this tenant-property combination', 404);
    }

    // 4. Execute unassignment in transaction
    const result = await executeUnassignment({
      tenant,
      property,
      activeLease,
      unitId,
      terminationReason,
      session,
    });

    // 5. Commit transaction
    await session.commitTransaction();

    // 6. Emit analytics update
    try {
      if (global.io) {
        await emitAnalyticsUpdate(global.io, userId, 'analytics:lease-terminated');
      }
    } catch (emitError) {
      logger.warn('Failed to emit analytics update after unassignment:', emitError);
    }

    logger.info(`✅ Tenant unassignment completed successfully: ${tenantId} ← ${propertyId}`);

    return result;
  } catch (error) {
    await session.abortTransaction();
    logger.error('❌ Tenant unassignment failed:', error);
    throw error;
  } finally {
    await session.endSession();
  }
};

/**
 * Force unassign tenant (for cleanup/admin purposes)
 */
export const forceUnassignTenant = async (tenantId, userId) => {
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    logger.info(`Force unassigning tenant: ${tenantId}`);

    const tenant = await Tenant.findOne({
      _id: tenantId,
      createdBy: userId,
    }).session(session);

    if (!tenant) {
      throw new AppError('Tenant not found', 404);
    }

    // Find all properties where this tenant is assigned
    const properties = await Property.find({
      $or: [{ 'occupancy.tenant': tenantId }, { 'units.tenant': tenantId }],
      owner: userId,
    }).session(session);

    // Remove tenant from all properties
    for (const property of properties) {
      // Remove from main occupancy
      if (property.occupancy?.tenant?.toString() === tenantId) {
        property.occupancy.tenant = null;
        property.occupancy.isOccupied = false;
        property.status = 'available';
      }

      // Remove from units
      if (property.units && property.units.length > 0) {
        property.units.forEach(unit => {
          if (unit.tenant?.toString() === tenantId) {
            unit.tenant = null;
            unit.isOccupied = false;
            unit.status = 'available';
          }
        });
      }

      await property.save({ session });
    }

    // Terminate all leases
    tenant.leases.forEach(lease => {
      if (lease.status === 'active') {
        lease.status = 'terminated';
        lease.terminationDate = new Date();
        lease.terminationReason = 'Force unassigned for cleanup';
      }
    });

    await tenant.save({ session });

    await session.commitTransaction();

    logger.info(`✅ Force unassignment completed: ${tenantId}`);

    return {
      status: 'success',
      message: 'Tenant force unassigned successfully',
      propertiesUpdated: properties.length,
      leasesTerminated: tenant.leases.filter(l => l.status === 'terminated').length,
    };
  } catch (error) {
    await session.abortTransaction();
    logger.error('❌ Force unassignment failed:', error);
    throw error;
  } finally {
    await session.endSession();
  }
};

/**
 * Sync all tenant assignments (cleanup function)
 */
export const syncTenantAssignments = async userId => {
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    logger.info(`Syncing tenant assignments for user: ${userId}`);

    // Find all tenants with active leases
    const tenantsWithActiveLeases = await Tenant.find({
      'leases.status': 'active',
      createdBy: userId,
    }).session(session);

    let syncedCount = 0;

    for (const tenant of tenantsWithActiveLeases) {
      const activeLeases = tenant.leases.filter(lease => lease.status === 'active');

      for (const lease of activeLeases) {
        const property = await Property.findById(lease.property).session(session);
        if (!property) {
          continue;
        }

        let needsUpdate = false;

        if (property.units && property.units.length > 0) {
          // Multi-unit property
          const unitNumber = lease.unit || 'Main';
          const unit = property.units.find(u => u.unitNumber === unitNumber);

          if (unit && (!unit.tenant || unit.tenant.toString() !== tenant._id.toString())) {
            unit.tenant = tenant._id;
            unit.isOccupied = true;
            needsUpdate = true;
            syncedCount++;
          }
        } else {
          // Single-unit property
          if (
            !property.occupancy?.tenant ||
            property.occupancy.tenant.toString() !== tenant._id.toString()
          ) {
            if (!property.occupancy) {
              property.occupancy = {};
            }
            property.occupancy.tenant = tenant._id;
            property.occupancy.isOccupied = true;
            needsUpdate = true;
            syncedCount++;
          }
        }

        if (needsUpdate) {
          await property.save({ session });
          logger.info(
            `Synced assignment: ${tenant.personalInfo?.firstName} ${tenant.personalInfo?.lastName} → ${property.address?.street}`,
          );
        }
      }
    }

    await session.commitTransaction();

    logger.info(`✅ Sync completed. Updated ${syncedCount} assignments`);

    return {
      status: 'success',
      message: `Synced ${syncedCount} tenant assignments`,
      syncedCount,
    };
  } catch (error) {
    await session.abortTransaction();
    logger.error('❌ Sync failed:', error);
    throw error;
  } finally {
    await session.endSession();
  }
};

// Helper Functions

const validateAssignmentRequirements = async (tenant, property, unitId) => {
  // Check if multi-unit property requires unit ID
  if (['apartment', 'duplex'].includes(property.propertyType) && !unitId) {
    throw new AppError('Unit ID is required for multi-unit properties', 400);
  }

  // Check if single-unit property shouldn't have unit ID
  if (!['apartment', 'duplex'].includes(property.propertyType) && unitId) {
    throw new AppError('Unit ID not allowed for single-unit properties', 400);
  }

  // Validate unit exists
  if (unitId) {
    const unit = property.units.find(u => u._id.toString() === unitId || u.unitNumber === unitId);
    if (!unit) {
      throw new AppError('Specified unit not found in property', 404);
    }
  }
};

const validateNoExistingAssignment = async (tenant, propertyId, unitId) => {
  // Check if tenant already has active lease for this property/unit
  const existingLease = tenant.leases.find(
    lease =>
      lease.property.toString() === propertyId &&
      lease.status === 'active' &&
      (!unitId || lease.unit === unitId),
  );

  if (existingLease) {
    throw new AppError('Tenant already has an active lease for this property/unit', 400);
  }
};

const validatePropertyAvailability = async (property, unitId) => {
  if (unitId) {
    // Multi-unit property
    const unit = property.units.find(u => u._id.toString() === unitId || u.unitNumber === unitId);
    if (unit?.tenant || unit?.isOccupied) {
      throw new AppError('Unit is already occupied', 400);
    }
  } else {
    // Single-unit property
    if (property.occupancy?.tenant || property.occupancy?.isOccupied) {
      throw new AppError('Property is already occupied', 400);
    }
  }
};

const createLeaseObject = ({ propertyId, unitId, leaseData, property }) => {
  const now = new Date();
  const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

  return {
    property: propertyId,
    unit: unitId,
    startDate: leaseData.startDate || now,
    endDate: leaseData.endDate || oneYearFromNow,
    monthlyRent: leaseData.monthlyRent || property.financials?.monthlyRent || 0,
    securityDeposit: leaseData.securityDeposit || property.financials?.securityDeposit || 0,
    tenancyType: leaseData.tenancyType || 'assured-shorthold',
    status: 'active',
    rentDueDate: leaseData.rentDueDate || 1,
    ...leaseData,
  };
};

const executeAssignment = async ({ tenant, property, lease, unitId, session }) => {
  // Add lease to tenant
  tenant.leases.push(lease);
  await tenant.save({ session });

  // Update property occupancy
  if (unitId) {
    // Multi-unit property
    const unit = property.units.find(u => u._id.toString() === unitId || u.unitNumber === unitId);
    unit.tenant = tenant._id;
    unit.isOccupied = true;
    unit.status = 'occupied';
  } else {
    // Single-unit property
    if (!property.occupancy) {
      property.occupancy = {};
    }
    property.occupancy.tenant = tenant._id;
    property.occupancy.isOccupied = true;
    property.occupancy.leaseStart = lease.startDate;
    property.occupancy.leaseEnd = lease.endDate;
    property.status = 'occupied';
  }

  await property.save({ session });

  // Populate for response
  await tenant.populate('leases.property', 'title address propertyType');

  return {
    status: 'success',
    data: {
      tenant,
      property,
      lease: tenant.leases[tenant.leases.length - 1],
    },
  };
};

const executeUnassignment = async ({
  tenant,
  property,
  activeLease,
  unitId,
  terminationReason,
  session,
}) => {
  // Terminate lease
  activeLease.status = 'terminated';
  activeLease.terminationDate = new Date();
  activeLease.terminationReason = terminationReason;
  await tenant.save({ session });

  // Update property occupancy
  if (unitId) {
    // Multi-unit property
    const unit = property.units.find(u => u._id.toString() === unitId || u.unitNumber === unitId);
    if (unit) {
      unit.tenant = null;
      unit.isOccupied = false;
      unit.status = 'available';
    }
  } else {
    // Single-unit property
    property.occupancy.tenant = null;
    property.occupancy.isOccupied = false;
    property.status = 'available';
  }

  await property.save({ session });

  return {
    status: 'success',
    data: {
      message: 'Tenant unassigned successfully',
      tenant,
      property,
    },
  };
};

export default {
  assignTenantToProperty,
  unassignTenantFromProperty,
  forceUnassignTenant,
  syncTenantAssignments,
};
