import mongoose from 'mongoose';

import Tenant from '../models/Tenant.js';
import Property from '../models/Property.js';
import AppError from '../utils/appError.js';
import logger from '../utils/logger.js';

/**
 * Middleware to ensure tenant assignment consistency
 * This runs validation checks before tenant-related operations
 */

/**
 * Validates that tenant assignments are consistent before operations
 */
export const validateTenantConsistency = async (req, res, next) => {
  try {
    // Skip validation in test environment to avoid interference
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    // Only run on tenant assignment/unassignment operations
    const operationPaths = ['/assign-to-property', '/unassign-from-property', '/leases'];

    const isAssignmentOperation = operationPaths.some(
      path => req.path.includes(path) || req.originalUrl.includes(path),
    );

    if (!isAssignmentOperation) {
      return next();
    }

    logger.info(`Running tenant consistency validation for ${req.method} ${req.path}`);

    // For assignment operations, validate no existing conflicts
    if (req.path.includes('assign-to-property') && req.body.tenantId && req.body.propertyId) {
      await validateNoAssignmentConflicts(req.body.tenantId, req.body.propertyId, req.body.unitId);
    }

    next();
  } catch (error) {
    logger.error('Tenant consistency validation failed:', error);
    return next(new AppError('Data consistency validation failed', 400));
  }
};

/**
 * Validates that a tenant doesn't already have conflicting assignments
 */
const validateNoAssignmentConflicts = async (tenantId, propertyId, unitId) => {
  // Check if tenant already has active lease for this property/unit
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new AppError('Tenant not found', 404);
  }

  const existingLease = tenant.leases.find(
    lease =>
      lease.property.toString() === propertyId &&
      lease.status === 'active' &&
      (!unitId || lease.unit === unitId),
  );

  if (existingLease) {
    throw new AppError('Tenant already has an active lease for this property/unit', 400);
  }

  // Check if property/unit is already occupied
  const property = await Property.findById(propertyId);
  if (!property) {
    throw new AppError('Property not found', 404);
  }

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

/**
 * Post-operation consistency check
 * Validates that the operation resulted in consistent data
 */
export const validatePostOperationConsistency = async (req, res, next) => {
  // Skip validation in test environment
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  // Store original json method
  const originalJson = res.json;

  // Override json method to add post-validation
  res.json = function (data) {
    // Only validate on successful operations
    if (data?.status === 'success' && req.body?.tenantId && req.body?.propertyId) {
      // Run async validation without blocking response
      setImmediate(async () => {
        try {
          await runPostOperationValidation(req.body.tenantId, req.body.propertyId, req.body.unitId);
        } catch (error) {
          logger.error('Post-operation consistency validation failed:', error);
        }
      });
    }

    // Call original json method
    return originalJson.call(this, data);
  };

  next();
};

/**
 * Runs post-operation validation to ensure consistency
 */
const runPostOperationValidation = async (tenantId, propertyId, unitId) => {
  const tenant = await Tenant.findById(tenantId);
  const property = await Property.findById(propertyId);

  if (!tenant || !property) {
    logger.warn(`Post-validation: Missing tenant or property - ${tenantId}, ${propertyId}`);
    return;
  }

  const activeLease = tenant.leases.find(
    lease =>
      lease.property.toString() === propertyId &&
      lease.status === 'active' &&
      (!unitId || lease.unit === unitId),
  );

  if (activeLease) {
    // Tenant has active lease - check property assignment
    let propertyHasTenant = false;

    if (unitId) {
      const unit = property.units.find(u => u._id.toString() === unitId || u.unitNumber === unitId);
      propertyHasTenant = unit?.tenant?.toString() === tenantId;
    } else {
      propertyHasTenant = property.occupancy?.tenant?.toString() === tenantId;
    }

    if (!propertyHasTenant) {
      logger.error(
        `CONSISTENCY ERROR: Tenant ${tenantId} has active lease but is not assigned to property ${propertyId}`,
      );
    }
  } else {
    // No active lease - check property has no assignment
    let propertyHasTenant = false;

    if (unitId) {
      const unit = property.units.find(u => u._id.toString() === unitId || u.unitNumber === unitId);
      propertyHasTenant = unit?.tenant?.toString() === tenantId;
    } else {
      propertyHasTenant = property.occupancy?.tenant?.toString() === tenantId;
    }

    if (propertyHasTenant) {
      logger.error(
        `CONSISTENCY ERROR: Tenant ${tenantId} has no active lease but is assigned to property ${propertyId}`,
      );
    }
  }
};

/**
 * Mongoose hooks to prevent direct model updates that could cause inconsistencies
 */
export const addModelValidationHooks = () => {
  // Skip adding hooks in test environment
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  // Hook for Tenant model saves
  const tenantSchema = mongoose.model('Tenant').schema;

  tenantSchema.pre('save', async function () {
    if (this.isModified('leases')) {
      logger.info(`Tenant ${this._id} leases modified - running validation`);

      // Validate lease consistency
      const activeLeases = this.leases.filter(lease => lease.status === 'active');

      for (const lease of activeLeases) {
        try {
          const property = await Property.findById(lease.property);
          if (property) {
            let isAssigned = false;

            if (lease.unit) {
              const unit = property.units.find(u => u.unitNumber === lease.unit);
              isAssigned = unit?.tenant?.toString() === this._id.toString();
            } else {
              isAssigned = property.occupancy?.tenant?.toString() === this._id.toString();
            }

            if (!isAssigned) {
              logger.warn(
                `POTENTIAL INCONSISTENCY: Tenant ${this._id} has active lease for property ${lease.property} but property assignment may be missing`,
              );
            }
          }
        } catch (error) {
          logger.error('Error validating lease consistency:', error);
        }
      }
    }
  });

  // Hook for Property model saves
  const propertySchema = mongoose.model('Property').schema;

  propertySchema.pre('save', async function () {
    if (this.isModified('occupancy') || this.isModified('units')) {
      logger.info(`Property ${this._id} occupancy modified - running validation`);

      // Check main occupancy
      if (this.occupancy?.tenant) {
        try {
          const tenant = await Tenant.findById(this.occupancy.tenant);
          if (tenant) {
            const hasActiveLease = tenant.leases.some(
              lease =>
                lease.property.toString() === this._id.toString() && lease.status === 'active',
            );

            if (!hasActiveLease) {
              logger.warn(
                `POTENTIAL INCONSISTENCY: Property ${this._id} has tenant ${this.occupancy.tenant} assigned but no active lease found`,
              );
            }
          }
        } catch (error) {
          logger.error('Error validating property occupancy consistency:', error);
        }
      }

      // Check units
      if (this.units && this.units.length > 0) {
        for (const unit of this.units) {
          if (unit.tenant) {
            try {
              const tenant = await Tenant.findById(unit.tenant);
              if (tenant) {
                const hasActiveLease = tenant.leases.some(
                  lease =>
                    lease.property.toString() === this._id.toString() &&
                    lease.status === 'active' &&
                    lease.unit === unit.unitNumber,
                );

                if (!hasActiveLease) {
                  logger.warn(
                    `POTENTIAL INCONSISTENCY: Property ${this._id} unit ${unit.unitNumber} has tenant ${unit.tenant} assigned but no active lease found`,
                  );
                }
              }
            } catch (error) {
              logger.error('Error validating unit occupancy consistency:', error);
            }
          }
        }
      }
    }
  });
};

export default {
  validateTenantConsistency,
  validatePostOperationConsistency,
  addModelValidationHooks,
};
