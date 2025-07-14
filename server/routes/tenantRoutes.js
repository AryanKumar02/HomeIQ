import express from 'express';

import {
  getTenants,
  getTenant,
  createTenant,
  updateTenant,
  deleteTenant,
  addLease,
  updateLeaseStatus,
  updateApplicationStatus,
  addDocument,
  verifyDocument,
  getTenantStats,
  searchTenants,
  checkQualification,
  updateReferencingStatus,
  updateAffordabilityAssessment,
  updateRightToRent,
  bulkUpdateTenants,
  assignTenantToProperty,
  unassignTenantFromProperty,
} from '../controllers/tenantController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  validateCreateTenant,
  validateUpdateTenant,
  validateLease,
  validateGetTenant,
  validateDeleteTenant,
  validateDocument,
  validateAffordabilityAssessment,
  validateReferencingOutcome,
  validateTenantSearch,
  validateIncomeQualification,
  validateBulkOperation,
} from '../validators/tenantValidators.js';

const router = express.Router();

// Protect all tenant routes
router.use(protect);

// Basic CRUD routes
router.route('/').get(validateTenantSearch, getTenants).post(validateCreateTenant, createTenant);

router.route('/stats').get(getTenantStats);

router.route('/search').get(validateTenantSearch, searchTenants);

router.route('/bulk-update').patch(validateBulkOperation, bulkUpdateTenants);

// Property assignment routes
router.route('/assign-to-property').post(assignTenantToProperty);
router.route('/unassign-from-property').post(unassignTenantFromProperty);

router
  .route('/:id')
  .get(validateGetTenant, getTenant)
  .patch(validateUpdateTenant, updateTenant)
  .delete(validateDeleteTenant, deleteTenant);

// Lease management
router.route('/:id/leases').post(validateLease, addLease);

router.route('/:tenantId/leases/:leaseId/status').patch(updateLeaseStatus);

// Application management
router.route('/:id/application-status').patch(updateApplicationStatus);

// Document management
router.route('/:id/documents').post(validateDocument, addDocument);

router.route('/:tenantId/documents/:documentId/verify').patch(verifyDocument);

// Qualification check (UK standards)
router.route('/:id/qualification').post(validateIncomeQualification, checkQualification);

// UK-specific tenant management routes
router.route('/:id/referencing').patch(validateReferencingOutcome, updateReferencingStatus);

router
  .route('/:id/affordability')
  .patch(validateAffordabilityAssessment, updateAffordabilityAssessment);

router.route('/:id/right-to-rent').patch(updateRightToRent);

// Additional routes can be added here as needed

export default router;
