import { body, param, query, validationResult } from 'express-validator';

import AppError from '../utils/appError.js';

// Helper function to handle validation results
const handleValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new AppError(`Validation failed: ${errorMessages.join(', ')}`, 400));
  }
  next();
};

// Common validation helpers
const tenantIdValidation = param('id').isMongoId().withMessage('Invalid tenant ID format');

const ukPhoneValidation = field =>
  body(field)
    .optional()
    .matches(/^(\+44\s?)?(\(?0\d{4}\)?\s?\d{6}|\(?0\d{3}\)?\s?\d{7}|\(?0\d{2}\)?\s?\d{8}|07\d{9})$/)
    .withMessage('Please provide a valid UK phone number');

const ukPostcodeValidation = field =>
  body(field)
    .optional()
    .matches(/^[A-Z]{1,2}[0-9R][0-9A-Z]? ?[0-9][A-Z]{2}$/i)
    .withMessage('Please provide a valid UK postcode');

// Validate tenant creation
export const validateCreateTenant = [
  // Personal Information
  body('personalInfo.title')
    .optional()
    .isIn(['Mr', 'Mrs', 'Miss', 'Ms', 'Dr', 'Prof', 'Rev', 'Other'])
    .withMessage('Invalid title'),

  body('personalInfo.firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .trim(),

  body('personalInfo.lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .trim(),

  body('personalInfo.middleName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Middle name cannot exceed 50 characters')
    .trim(),

  body('personalInfo.preferredName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Preferred name cannot exceed 50 characters')
    .trim(),

  body('personalInfo.dateOfBirth')
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Date of birth must be a valid date')
    .custom(value => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 18) {
        throw new Error('Tenant must be at least 18 years old');
      }
      return true;
    }),

  body('personalInfo.nationalInsuranceNumber')
    .optional()
    .isLength({ max: 13 })
    .withMessage('National Insurance Number cannot exceed 13 characters')
    .matches(/^[A-CEGHJ-PR-TW-Z]{1}[A-CEGHJ-NPR-TW-Z]{1}[0-9]{6}[A-D]{1}$/)
    .withMessage('Please provide a valid UK National Insurance Number')
    .trim(),

  body('personalInfo.drivingLicenceNumber')
    .optional()
    .isLength({ max: 16 })
    .withMessage('UK driving licence number cannot exceed 16 characters')
    .matches(/^[A-Z9]{5}[0-9]{6}[A-Z9]{2}[0-9A-Z]{3}$/)
    .withMessage('Please provide a valid UK driving licence number')
    .trim(),

  body('personalInfo.nationality')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Nationality cannot exceed 50 characters')
    .trim(),

  body('personalInfo.immigrationStatus')
    .optional()
    .isIn([
      'british-citizen',
      'british-national',
      'irish-citizen',
      'eu-settled-status',
      'eu-pre-settled-status',
      'indefinite-leave-to-remain',
      'work-visa',
      'student-visa',
      'spouse-visa',
      'family-visa',
      'refugee-status',
      'other',
    ])
    .withMessage('Invalid immigration status'),

  // Right to rent validation (mandatory in UK)
  body('personalInfo.rightToRent.verified')
    .isBoolean()
    .withMessage('Right to rent verification is required'),

  body('personalInfo.rightToRent.documentType')
    .optional()
    .isIn([
      'uk-passport',
      'eu-passport',
      'other-passport',
      'uk-driving-licence',
      'birth-certificate',
      'brp-card',
      'visa',
      'settlement-document',
      'other',
    ])
    .withMessage('Invalid document type'),

  // Contact Information
  body('contactInfo.email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  // UK phone validation
  ukPhoneValidation('contactInfo.phone.primary.number'),
  ukPhoneValidation('contactInfo.phone.secondary.number'),

  body('contactInfo.phone.primary.type')
    .optional()
    .isIn(['mobile', 'home', 'work'])
    .withMessage('Primary phone type must be mobile, home, or work'),

  body('contactInfo.phone.secondary.type')
    .optional()
    .isIn(['mobile', 'home', 'work'])
    .withMessage('Secondary phone type must be mobile, home, or work'),

  // Emergency Contact
  body('contactInfo.emergencyContact.name')
    .notEmpty()
    .withMessage('Emergency contact name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Emergency contact name must be between 1 and 100 characters')
    .trim(),

  body('contactInfo.emergencyContact.relationship')
    .notEmpty()
    .withMessage('Emergency contact relationship is required')
    .isIn([
      'parent',
      'sibling',
      'spouse',
      'partner',
      'child',
      'relative',
      'friend',
      'colleague',
      'other',
    ])
    .withMessage('Invalid emergency contact relationship'),

  ukPhoneValidation('contactInfo.emergencyContact.phone'),

  body('contactInfo.emergencyContact.email')
    .optional()
    .isEmail()
    .withMessage('Emergency contact email must be valid')
    .normalizeEmail(),

  // Address Information
  body('addresses.current.country')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Country must be between 1 and 100 characters')
    .trim(),

  body('addresses.current.addressLine1')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Address line 1 cannot exceed 200 characters')
    .trim(),

  body('addresses.current.addressLine2')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Address line 2 cannot exceed 200 characters')
    .trim(),

  body('addresses.current.city')
    .optional()
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters')
    .trim(),

  body('addresses.current.county')
    .optional()
    .isLength({ max: 100 })
    .withMessage('County cannot exceed 100 characters')
    .trim(),

  // UK postcode validation
  ukPostcodeValidation('addresses.current.postcode'),

  // Employment Information
  body('employment.current.status')
    .notEmpty()
    .withMessage('Employment status is required')
    .isIn([
      'employed-full-time',
      'employed-part-time',
      'self-employed',
      'unemployed',
      'student',
      'retired',
      'on-benefits',
      'contractor',
      'apprentice',
      'other',
    ])
    .withMessage('Invalid employment status'),

  body('employment.current.employer.contractType')
    .optional()
    .isIn(['permanent', 'fixed-term', 'zero-hours', 'casual', 'agency', 'apprenticeship'])
    .withMessage('Invalid contract type'),

  body('employment.current.employer.name')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Employer name cannot exceed 200 characters')
    .trim(),

  body('employment.current.employer.position')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Position cannot exceed 100 characters')
    .trim(),

  // Income validation (new UK structure)
  body('employment.current.income.gross.monthly')
    .optional()
    .isNumeric()
    .withMessage('Monthly gross income must be a number')
    .custom(value => {
      if (value < 0) {
        throw new Error('Monthly gross income cannot be negative');
      }
      return true;
    }),

  body('employment.current.income.gross.annual')
    .optional()
    .isNumeric()
    .withMessage('Annual gross income must be a number')
    .custom(value => {
      if (value < 0) {
        throw new Error('Annual gross income cannot be negative');
      }
      return true;
    }),

  body('employment.current.income.net.monthly')
    .optional()
    .isNumeric()
    .withMessage('Monthly net income must be a number')
    .custom(value => {
      if (value < 0) {
        throw new Error('Monthly net income cannot be negative');
      }
      return true;
    }),

  body('employment.current.income.net.annual')
    .optional()
    .isNumeric()
    .withMessage('Annual net income must be a number')
    .custom(value => {
      if (value < 0) {
        throw new Error('Annual net income cannot be negative');
      }
      return true;
    }),

  body('employment.current.income.currency')
    .optional()
    .isLength({ max: 3 })
    .withMessage('Currency code must be 3 characters')
    .trim(),

  body('employment.current.income.payFrequency')
    .optional()
    .isIn(['weekly', 'fortnightly', 'monthly', 'annually'])
    .withMessage('Invalid pay frequency'),

  body('employment.current.income.verificationMethod')
    .optional()
    .isIn(['payslip', 'p60', 'employment-contract', 'bank-statement', 'sa302', 'other'])
    .withMessage('Invalid verification method'),

  // Benefits validation
  body('employment.current.benefits.receives')
    .optional()
    .isBoolean()
    .withMessage('Benefits status must be true or false'),

  body('employment.current.benefits.monthlyAmount')
    .optional()
    .isNumeric()
    .withMessage('Benefits amount must be a number')
    .custom(value => {
      if (value < 0) {
        throw new Error('Benefits amount cannot be negative');
      }
      return true;
    }),

  // Privacy consent
  body('privacy.dataRetentionConsent')
    .notEmpty()
    .withMessage('Data retention consent is required')
    .isBoolean()
    .withMessage('Data retention consent must be true or false'),

  handleValidationResult,
];

// Validate tenant update
export const validateUpdateTenant = [
  // Most fields are optional for updates, but if provided, they should be valid
  body('personalInfo.firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .trim(),

  body('personalInfo.lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .trim(),

  body('personalInfo.dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date')
    .custom(value => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 18) {
        throw new Error('Tenant must be at least 18 years old');
      }
      return true;
    }),

  body('contactInfo.email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('employment.current.status')
    .optional()
    .isIn([
      'employed-full-time',
      'employed-part-time',
      'self-employed',
      'unemployed',
      'student',
      'retired',
      'on-benefits',
      'contractor',
      'apprentice',
      'other',
    ])
    .withMessage('Invalid employment status'),

  // Backward-compat: support legacy flat monthly income if provided
  body('employment.current.income.monthly')
    .optional()
    .isNumeric()
    .withMessage('Monthly income must be a number')
    .custom(value => {
      if (value < 0) {
        throw new Error('Monthly income cannot be negative');
      }
      return true;
    }),

  body('financialInfo.creditScore.score')
    .optional()
    .isNumeric()
    .withMessage('Credit score must be a number')
    .custom(value => {
      if (value < 300 || value > 850) {
        throw new Error('Credit score must be between 300 and 850');
      }
      return true;
    }),

  handleValidationResult,
];

// Validate lease creation (UK tenancies)
export const validateLease = [
  body('property')
    .notEmpty()
    .withMessage('Property ID is required')
    .isMongoId()
    .withMessage('Property ID must be a valid MongoDB ObjectId'),

  body('unit').optional().trim(),

  body('tenancyType')
    .notEmpty()
    .withMessage('Tenancy type is required')
    .isIn(['assured-shorthold', 'assured', 'regulated', 'contractual', 'periodic'])
    .withMessage('Invalid UK tenancy type'),

  body('startDate')
    .notEmpty()
    .withMessage('Lease start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid date'),

  body('endDate')
    .notEmpty()
    .withMessage('Lease end date is required')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(value);
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  body('monthlyRent')
    .notEmpty()
    .withMessage('Monthly rent is required')
    .isNumeric()
    .withMessage('Monthly rent must be a number')
    .custom(value => {
      if (value <= 0) {
        throw new Error('Monthly rent must be greater than 0');
      }
      return true;
    }),

  body('securityDeposit')
    .optional()
    .isNumeric()
    .withMessage('Security deposit must be a number')
    .custom(value => {
      if (value < 0) {
        throw new Error('Security deposit cannot be negative');
      }
      return true;
    }),

  body('petDeposit')
    .optional()
    .isNumeric()
    .withMessage('Pet deposit must be a number')
    .custom(value => {
      if (value < 0) {
        throw new Error('Pet deposit cannot be negative');
      }
      return true;
    }),

  body('currency')
    .optional()
    .isLength({ max: 3 })
    .withMessage('Currency code must be 3 characters')
    .trim(),

  body('rentDueDate')
    .optional()
    .isInt({ min: 1, max: 31 })
    .withMessage('Rent due date must be between 1 and 31'),

  handleValidationResult,
];

// Validate pet information
export const validatePet = [
  body('name')
    .notEmpty()
    .withMessage('Pet name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Pet name must be between 1 and 50 characters')
    .trim(),

  body('type')
    .notEmpty()
    .withMessage('Pet type is required')
    .isIn(['dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster', 'reptile', 'other'])
    .withMessage('Pet type must be dog, cat, bird, fish, rabbit, hamster, reptile, or other'),

  body('breed')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Pet breed cannot exceed 100 characters')
    .trim(),

  body('age')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Pet age must be between 0 and 50 years'),

  body('weight')
    .optional()
    .isNumeric()
    .withMessage('Pet weight must be a number')
    .custom(value => {
      if (value < 0) {
        throw new Error('Pet weight cannot be negative');
      }
      return true;
    }),

  body('weightUnit').optional().isIn(['kg', 'lbs']).withMessage('Weight unit must be kg or lbs'),

  body('vaccinationStatus')
    .optional()
    .isIn(['up-to-date', 'expired', 'unknown'])
    .withMessage('Vaccination status must be up-to-date, expired, or unknown'),

  body('isServiceAnimal')
    .optional()
    .isBoolean()
    .withMessage('Service animal status must be true or false'),

  handleValidationResult,
];

// Validate vehicle information
export const validateVehicle = [
  body('make')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Vehicle make cannot exceed 50 characters')
    .trim(),

  body('model')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Vehicle model cannot exceed 50 characters')
    .trim(),

  body('year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 2 })
    .withMessage(`Vehicle year must be between 1900 and ${new Date().getFullYear() + 2}`),

  body('color')
    .optional()
    .isLength({ max: 30 })
    .withMessage('Vehicle color cannot exceed 30 characters')
    .trim(),

  body('registrationNumber')
    .optional()
    .isLength({ max: 8 })
    .withMessage('UK registration number cannot exceed 8 characters')
    .matches(
      /^[A-Z]{2}[0-9]{2}\s?[A-Z]{3}$|^[A-Z][0-9]{1,3}\s?[A-Z]{3}$|^[A-Z]{3}\s?[0-9]{1,3}[A-Z]$/,
    )
    .withMessage('Please provide a valid UK vehicle registration')
    .trim(),

  handleValidationResult,
];

// Validate document upload
export const validateDocument = [
  body('type')
    .notEmpty()
    .withMessage('Document type is required')
    .isIn([
      'application',
      'background-check',
      'credit-report',
      'income-verification',
      'employment-verification',
      'bank-statement',
      'reference-letter',
      'id-copy',
      'passport-copy',
      'insurance',
      'other',
    ])
    .withMessage('Invalid document type'),

  body('name')
    .notEmpty()
    .withMessage('Document name is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Document name must be between 1 and 200 characters')
    .trim(),

  body('url')
    .notEmpty()
    .withMessage('Document URL is required')
    .isURL()
    .withMessage('Document URL must be valid'),

  body('fileSize').optional().isNumeric().withMessage('File size must be a number'),

  body('mimeType').optional().trim(),

  body('expirationDate').optional().isISO8601().withMessage('Expiration date must be a valid date'),

  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
    .trim(),

  handleValidationResult,
];

// Validate reference information
export const validateReference = [
  body('type')
    .notEmpty()
    .withMessage('Reference type is required')
    .isIn(['personal', 'professional', 'previous-landlord', 'employer'])
    .withMessage('Reference type must be personal, professional, previous-landlord, or employer'),

  body('name')
    .notEmpty()
    .withMessage('Reference name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Reference name must be between 1 and 100 characters')
    .trim(),

  body('relationship')
    .notEmpty()
    .withMessage('Relationship is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Relationship must be between 1 and 100 characters')
    .trim(),

  body('phone').notEmpty().withMessage('Reference phone is required').trim(),

  body('email').optional().isEmail().withMessage('Reference email must be valid').normalizeEmail(),

  body('company')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters')
    .trim(),

  body('yearsKnown')
    .optional()
    .isNumeric()
    .withMessage('Years known must be a number')
    .custom(value => {
      if (value < 0) {
        throw new Error('Years known cannot be negative');
      }
      return true;
    }),

  handleValidationResult,
];

// UK-specific validation for deposit protection
export const validateDepositProtection = [
  tenantIdValidation,

  body('depositProtection.scheme')
    .notEmpty()
    .withMessage('Deposit protection scheme is required')
    .isIn(['tds', 'dps', 'mydeposits', 'not-protected'])
    .withMessage('Invalid UK deposit protection scheme'),

  body('depositProtection.referenceNumber')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Reference number cannot exceed 50 characters')
    .trim(),

  body('depositProtection.prescribedInfo.provided')
    .optional()
    .isBoolean()
    .withMessage('Prescribed information status must be true or false'),

  handleValidationResult,
];

// Validate affordability assessment
export const validateAffordabilityAssessment = [
  tenantIdValidation,

  body('monthlyIncome')
    .isNumeric()
    .withMessage('Monthly income must be a number')
    .custom(value => {
      if (value <= 0) {
        throw new Error('Monthly income must be greater than 0');
      }
      return true;
    }),

  body('monthlyExpenses')
    .optional()
    .isNumeric()
    .withMessage('Monthly expenses must be a number')
    .custom(value => {
      if (value < 0) {
        throw new Error('Monthly expenses cannot be negative');
      }
      return true;
    }),

  body('monthlyCommitments')
    .optional()
    .isNumeric()
    .withMessage('Monthly commitments must be a number')
    .custom(value => {
      if (value < 0) {
        throw new Error('Monthly commitments cannot be negative');
      }
      return true;
    }),

  handleValidationResult,
];

// Validate referencing outcome
export const validateReferencingOutcome = [
  tenantIdValidation,

  // Allow partial updates: outcome is optional on PATCH
  body('outcome')
    .optional()
    .isIn(['pass', 'pass-with-conditions', 'fail', 'pending'])
    .withMessage('Invalid referencing outcome'),

  body('provider')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Referencing provider cannot exceed 100 characters')
    .trim(),

  body('reference')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Reference number cannot exceed 50 characters')
    .trim(),

  body('conditions')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Conditions cannot exceed 500 characters')
    .trim(),

  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
    .trim(),

  handleValidationResult,
];

// Validate tenant search/filter parameters
export const validateTenantSearch = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),

  query('status')
    .optional()
    .isIn(['pending', 'under-review', 'approved', 'rejected', 'waitlisted', 'withdrawn', 'expired'])
    .withMessage('Invalid application status filter'),

  query('employmentStatus')
    .optional()
    .isIn([
      'employed-full-time',
      'employed-part-time',
      'self-employed',
      'unemployed',
      'student',
      'retired',
      'on-benefits',
      'contractor',
      'apprentice',
      'other',
    ])
    .withMessage('Invalid employment status filter'),

  query('propertyId').optional().isMongoId().withMessage('Invalid property ID format'),

  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Search term cannot exceed 100 characters')
    .trim(),

  query('immigrationStatus')
    .optional()
    .isIn([
      'british-citizen',
      'british-national',
      'irish-citizen',
      'eu-settled-status',
      'eu-pre-settled-status',
      'indefinite-leave-to-remain',
      'work-visa',
      'student-visa',
      'spouse-visa',
      'family-visa',
      'refugee-status',
      'other',
    ])
    .withMessage('Invalid immigration status filter'),

  handleValidationResult,
];

// Validate income qualification check
export const validateIncomeQualification = [
  tenantIdValidation,

  body('monthlyRent')
    .isNumeric()
    .withMessage('Monthly rent must be a number')
    .custom(value => {
      if (value <= 0) {
        throw new Error('Monthly rent must be greater than 0');
      }
      return true;
    }),

  handleValidationResult,
];

// Additional validators for tenant ID params
export const validateGetTenant = [tenantIdValidation, handleValidationResult];
export const validateDeleteTenant = [tenantIdValidation, handleValidationResult];

// Bulk operations validator
export const validateBulkOperation = [
  body('tenantIds').isArray({ min: 1 }).withMessage('At least one tenant ID is required'),

  body('tenantIds.*').isMongoId().withMessage('All tenant IDs must be valid MongoDB ObjectIds'),

  body('operation')
    .notEmpty()
    .withMessage('Operation is required')
    .isIn(['approve', 'reject', 'archive', 'activate'])
    .withMessage('Invalid bulk operation'),

  handleValidationResult,
];
