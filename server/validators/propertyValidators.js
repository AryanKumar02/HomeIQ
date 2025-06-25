import { body } from 'express-validator';
import mongoose from 'mongoose';

// Helper function to validate MongoDB ObjectId
const isValidObjectId = value => mongoose.Types.ObjectId.isValid(value);

// Create property validators
export const createPropertyValidators = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Property title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('propertyType')
    .notEmpty()
    .withMessage('Property type is required')
    .isIn(['house', 'apartment', 'condo', 'townhouse', 'duplex', 'commercial', 'land', 'other'])
    .withMessage('Invalid property type'),

  // Address validation
  body('address.street').trim().notEmpty().withMessage('Street address is required'),

  body('address.city').trim().notEmpty().withMessage('City is required'),

  body('address.state').trim().notEmpty().withMessage('State is required'),

  body('address.zipCode').trim().notEmpty().withMessage('ZIP code is required'),

  body('address.country').optional().trim(),

  // Property details validation
  body('bedrooms').isInt({ min: 0, max: 50 }).withMessage('Bedrooms must be between 0 and 50'),

  body('bathrooms').isFloat({ min: 0, max: 50 }).withMessage('Bathrooms must be between 0 and 50'),

  body('squareFootage')
    .isInt({ min: 1, max: 1000000 })
    .withMessage('Square footage must be between 1 and 1,000,000'),

  body('yearBuilt')
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() + 5 })
    .withMessage('Year built must be between 1800 and 5 years in the future'),

  body('lotSize').optional().isFloat({ min: 0 }).withMessage('Lot size cannot be negative'),

  // Financial validation
  body('financials.propertyValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Property value cannot be negative'),

  body('financials.purchasePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Purchase price cannot be negative'),

  body('financials.monthlyRent')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monthly rent cannot be negative'),

  body('financials.securityDeposit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Security deposit cannot be negative'),

  body('financials.petDeposit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Pet deposit cannot be negative'),

  // Status validation
  body('status')
    .optional()
    .isIn(['available', 'occupied', 'maintenance', 'off-market', 'pending'])
    .withMessage('Invalid property status'),

  // Images validation
  body('images').optional().isArray().withMessage('Images must be an array'),

  body('images.*.url').optional().isURL().withMessage('Image URL must be valid'),

  body('images.*.caption')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Image caption cannot exceed 200 characters'),
];

// Update property validators (similar to create but all fields optional)
export const updatePropertyValidators = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Property title cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('propertyType')
    .optional()
    .isIn(['house', 'apartment', 'condo', 'townhouse', 'duplex', 'commercial', 'land', 'other'])
    .withMessage('Invalid property type'),

  body('bedrooms')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Bedrooms must be between 0 and 50'),

  body('bathrooms')
    .optional()
    .isFloat({ min: 0, max: 50 })
    .withMessage('Bathrooms must be between 0 and 50'),

  body('squareFootage')
    .optional()
    .isInt({ min: 1, max: 1000000 })
    .withMessage('Square footage must be between 1 and 1,000,000'),

  body('yearBuilt')
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() + 5 })
    .withMessage('Year built must be between 1800 and 5 years in the future'),

  body('financials.monthlyRent')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monthly rent cannot be negative'),

  body('financials.securityDeposit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Security deposit cannot be negative'),
];

// Update status validators
export const updateStatusValidators = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['available', 'occupied', 'maintenance', 'off-market', 'pending'])
    .withMessage('Invalid property status'),
];

// Update occupancy validators
export const updateOccupancyValidators = [
  body('occupancy.isOccupied').optional().isBoolean().withMessage('isOccupied must be a boolean'),

  body('occupancy.tenant')
    .optional()
    .custom(isValidObjectId)
    .withMessage('Invalid tenant ID format'),

  body('occupancy.leaseStart')
    .optional()
    .isISO8601()
    .withMessage('Lease start date must be a valid date'),

  body('occupancy.leaseEnd')
    .optional()
    .isISO8601()
    .withMessage('Lease end date must be a valid date'),

  body('occupancy.leaseType')
    .optional()
    .isIn(['month-to-month', 'fixed-term', 'week-to-week'])
    .withMessage('Invalid lease type'),

  body('occupancy.rentDueDate')
    .optional()
    .isInt({ min: 1, max: 31 })
    .withMessage('Rent due date must be between 1 and 31'),
];

// Add images validators
export const addImagesValidators = [
  body('images').isArray({ min: 1 }).withMessage('At least one image is required'),

  body('images.*.url').isURL().withMessage('Image URL must be valid'),

  body('images.*.caption')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Image caption cannot exceed 200 characters'),

  body('images.*.isPrimary').optional().isBoolean().withMessage('isPrimary must be a boolean'),
];

// Search properties validators
export const searchPropertiesValidators = [
  body('propertyType')
    .optional()
    .isIn(['house', 'apartment', 'condo', 'townhouse', 'duplex', 'commercial', 'land', 'other'])
    .withMessage('Invalid property type'),

  body('minBedrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum bedrooms must be a non-negative integer'),

  body('maxBedrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum bedrooms must be a non-negative integer'),

  body('minBathrooms')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum bathrooms must be a non-negative number'),

  body('maxBathrooms')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum bathrooms must be a non-negative number'),

  body('minRent')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum rent must be a non-negative number'),

  body('maxRent')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum rent must be a non-negative number'),

  body('status')
    .optional()
    .isIn(['available', 'occupied', 'maintenance', 'off-market', 'pending'])
    .withMessage('Invalid property status'),

  body('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];
