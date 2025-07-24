import express from 'express';

import * as propertyController from '../controllers/propertyController.js';
import { uploadMemory } from '../config/s3.js';
import { protect } from '../middleware/authMiddleware.js';
import validateMiddleware from '../middleware/validateMiddleware.js';
import {
  generalLimiter,
  strictLimiter,
  uploadLimiter,
  searchLimiter,
} from '../middleware/rateLimitMiddleware.js';
import { csrfProtection } from '../middleware/csrfMiddleware.js';
import {
  createPropertyValidators,
  updatePropertyValidators,
  updateStatusValidators,
  updateOccupancyValidators,
  addImagesValidators,
  addUnitValidators,
  updateUnitValidators,
  assignTenantValidators,
} from '../validators/propertyValidators.js';

const router = express.Router();

// All routes require authentication and CSRF protection
router.use(protect);
router.use(csrfProtection);

// Property CRUD operations
router.get('/', generalLimiter, propertyController.getMyProperties);
router.get('/search', searchLimiter, propertyController.searchProperties);
router.get('/analytics', generalLimiter, propertyController.getPropertyAnalytics);
router.get('/storage', generalLimiter, propertyController.getUserStorageAnalytics);
router.post(
  '/',
  strictLimiter,
  createPropertyValidators,
  validateMiddleware,
  propertyController.createProperty,
);

router.get('/:id', generalLimiter, propertyController.getProperty);
router.put(
  '/:id',
  strictLimiter,
  updatePropertyValidators,
  validateMiddleware,
  propertyController.updateProperty,
);
router.delete('/:id', strictLimiter, propertyController.deleteProperty);

// Property status management
router.patch(
  '/:id/status',
  strictLimiter,
  updateStatusValidators,
  validateMiddleware,
  propertyController.updatePropertyStatus,
);

// Occupancy management
router.patch(
  '/:id/occupancy',
  strictLimiter,
  updateOccupancyValidators,
  validateMiddleware,
  propertyController.updateOccupancy,
);

// Image management
router.post(
  '/:id/images',
  uploadLimiter,
  uploadMemory.array('images', 10), // Use memory storage for processing
  addImagesValidators,
  validateMiddleware,
  propertyController.addPropertyImages,
);
router.delete('/:id/images/:imageId', strictLimiter, propertyController.removePropertyImage);
router.patch('/:id/images/:imageId/primary', strictLimiter, propertyController.setPrimaryImage);

// Unit management (for apartment properties)
router.get('/:id/units', generalLimiter, propertyController.getUnits);
router.post(
  '/:id/units',
  strictLimiter,
  addUnitValidators,
  validateMiddleware,
  propertyController.addUnit,
);
router.get('/:id/units/analytics', generalLimiter, propertyController.getUnitAnalytics);
router.put(
  '/:id/units/:unitId',
  strictLimiter,
  updateUnitValidators,
  validateMiddleware,
  propertyController.updateUnit,
);
router.delete('/:id/units/:unitId', strictLimiter, propertyController.deleteUnit);

// Unit tenant management
router.post(
  '/:id/units/:unitId/tenant',
  strictLimiter,
  assignTenantValidators,
  validateMiddleware,
  propertyController.assignTenantToUnit,
);
router.delete('/:id/units/:unitId/tenant', strictLimiter, propertyController.removeTenantFromUnit);

export default router;
