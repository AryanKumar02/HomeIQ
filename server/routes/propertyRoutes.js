import express from 'express';

import * as propertyController from '../controllers/propertyController.js';
import { protect } from '../middleware/authMiddleware.js';
import validateMiddleware from '../middleware/validateMiddleware.js';
import {
  createPropertyValidators,
  updatePropertyValidators,
  updateStatusValidators,
  updateOccupancyValidators,
  addImagesValidators,
} from '../validators/propertyValidators.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Property CRUD operations
router.get('/', propertyController.getMyProperties);
router.get('/search', propertyController.searchProperties);
router.get('/analytics', propertyController.getPropertyAnalytics);
router.post('/', createPropertyValidators, validateMiddleware, propertyController.createProperty);

router.get('/:id', propertyController.getProperty);
router.put('/:id', updatePropertyValidators, validateMiddleware, propertyController.updateProperty);
router.delete('/:id', propertyController.deleteProperty);

// Property status management
router.patch(
  '/:id/status',
  updateStatusValidators,
  validateMiddleware,
  propertyController.updatePropertyStatus,
);

// Occupancy management
router.patch(
  '/:id/occupancy',
  updateOccupancyValidators,
  validateMiddleware,
  propertyController.updateOccupancy,
);

// Image management
router.post(
  '/:id/images',
  addImagesValidators,
  validateMiddleware,
  propertyController.addPropertyImages,
);
router.delete('/:id/images/:imageId', propertyController.removePropertyImage);
router.patch('/:id/images/:imageId/primary', propertyController.setPrimaryImage);

export default router;
