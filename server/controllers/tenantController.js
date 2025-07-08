import Tenant from '../models/Tenant.js';
import Property from '../models/Property.js';
import { catchAsync } from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Get all tenants for the authenticated user
export const getTenants = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = {
    createdBy: req.user.id,
    isActive: true,
  };

  // Add search functionality
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  // Add status filter
  if (req.query.status) {
    filter['applicationStatus.status'] = req.query.status;
  }

  // Add property filter
  if (req.query.property) {
    filter['leases.property'] = req.query.property;
  }

  // Add lease status filter
  if (req.query.leaseStatus) {
    filter['leases.status'] = req.query.leaseStatus;
  }

  const tenants = await Tenant.find(filter)
    .populate('leases.property', 'title address propertyType')
    .populate('createdBy', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Tenant.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: tenants.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    data: {
      tenants,
    },
  });
});

// Get a single tenant by ID
export const getTenant = catchAsync(async (req, res, next) => {
  const tenant = await Tenant.findOne({
    _id: req.params.id,
    createdBy: req.user.id,
    isActive: true,
  })
    .populate('leases.property', 'title address propertyType images')
    .populate('createdBy', 'firstName lastName email')
    .populate('user', 'firstName lastName email')
    .populate('references.contactedBy', 'firstName lastName')
    .populate('documents.uploadedBy', 'firstName lastName')
    .populate('documents.verifiedBy', 'firstName lastName');

  if (!tenant) {
    return next(new AppError('Tenant not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tenant,
    },
  });
});

// Create a new tenant
export const createTenant = catchAsync(async (req, res, next) => {
  // Ensure the user creating the tenant is set as createdBy
  const tenantData = {
    ...req.body,
    createdBy: req.user.id,
  };

  // Validate email uniqueness
  const existingTenant = await Tenant.findOne({
    'contactInfo.email': tenantData.contactInfo?.email,
    isActive: true,
  });

  if (existingTenant) {
    return next(new AppError('A tenant with this email already exists', 400));
  }

  const tenant = await Tenant.create(tenantData);

  // Populate the created tenant for response
  await tenant.populate('createdBy', 'firstName lastName email');

  res.status(201).json({
    status: 'success',
    data: {
      tenant,
    },
  });
});

// Update a tenant
export const updateTenant = catchAsync(async (req, res, next) => {
  // Find tenant and ensure it belongs to the authenticated user
  const tenant = await Tenant.findOne({
    _id: req.params.id,
    createdBy: req.user.id,
    isActive: true,
  });

  if (!tenant) {
    return next(new AppError('Tenant not found', 404));
  }

  // Check email uniqueness if email is being updated
  if (req.body.contactInfo?.email && req.body.contactInfo.email !== tenant.contactInfo.email) {
    const existingTenant = await Tenant.findOne({
      'contactInfo.email': req.body.contactInfo.email,
      _id: { $ne: tenant._id },
      isActive: true,
    });

    if (existingTenant) {
      return next(new AppError('A tenant with this email already exists', 400));
    }
  }

  // Handle nested updates properly
  if (req.body.personalInfo) {
    Object.assign(tenant.personalInfo, req.body.personalInfo);
  }
  if (req.body.contactInfo) {
    Object.assign(tenant.contactInfo, req.body.contactInfo);
  }
  if (req.body.addresses) {
    Object.assign(tenant.addresses, req.body.addresses);
  }
  if (req.body.employment) {
    Object.assign(tenant.employment, req.body.employment);
  }
  if (req.body.financialInfo) {
    Object.assign(tenant.financialInfo, req.body.financialInfo);
  }
  if (req.body.applicationStatus) {
    Object.assign(tenant.applicationStatus, req.body.applicationStatus);
  }
  if (req.body.referencing) {
    Object.assign(tenant.referencing, req.body.referencing);
  }
  if (req.body.privacy) {
    Object.assign(tenant.privacy, req.body.privacy);
  }

  // Update other top-level fields
  const {
    personalInfo: _personalInfo,
    contactInfo: _contactInfo,
    addresses: _addresses,
    employment: _employment,
    financialInfo: _financialInfo,
    applicationStatus: _applicationStatus,
    referencing: _referencing,
    privacy: _privacy,
    ...otherFields
  } = req.body;
  Object.assign(tenant, otherFields);

  await tenant.save();

  // Populate for response
  await tenant.populate('leases.property', 'title address propertyType');
  await tenant.populate('createdBy', 'firstName lastName email');

  res.status(200).json({
    status: 'success',
    data: {
      tenant,
    },
  });
});

// Delete a tenant (soft delete)
export const deleteTenant = catchAsync(async (req, res, next) => {
  const tenant = await Tenant.findOne({
    _id: req.params.id,
    createdBy: req.user.id,
    isActive: true,
  });

  if (!tenant) {
    return next(new AppError('Tenant not found', 404));
  }

  // Check if tenant has active leases
  const hasActiveLeases = tenant.leases.some(lease => lease.status === 'active');

  if (hasActiveLeases) {
    return next(
      new AppError('Cannot delete tenant with active leases. Please terminate leases first.', 400),
    );
  }

  // Soft delete
  tenant.isActive = false;
  await tenant.save();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Add a lease to a tenant
export const addLease = catchAsync(async (req, res, next) => {
  const tenant = await Tenant.findOne({
    _id: req.params.id,
    createdBy: req.user.id,
    isActive: true,
  });

  if (!tenant) {
    return next(new AppError('Tenant not found', 404));
  }

  // Verify the property belongs to the user
  const property = await Property.findOne({
    _id: req.body.property,
    owner: req.user.id,
  });

  if (!property) {
    return next(new AppError('Property not found or you do not have access to it', 404));
  }

  // Check if property/unit is available
  if (req.body.unit) {
    // Multi-unit property
    const unit = property.units.id(req.body.unit);
    if (!unit) {
      return next(new AppError('Unit not found', 404));
    }
    if (unit.occupancy.isOccupied) {
      return next(new AppError('Unit is already occupied', 400));
    }
  } else {
    // Single-unit property
    if (property.occupancy.isOccupied) {
      return next(new AppError('Property is already occupied', 400));
    }
  }

  // Add lease to tenant
  await tenant.addLease(req.body);

  // Update property occupancy
  if (req.body.unit) {
    const unit = property.units.id(req.body.unit);
    unit.occupancy.isOccupied = true;
    unit.occupancy.tenant = tenant._id;
    unit.occupancy.leaseStart = req.body.startDate;
    unit.occupancy.leaseEnd = req.body.endDate;
    unit.occupancy.leaseType = req.body.leaseType;
    unit.status = 'occupied';
  } else {
    property.occupancy.isOccupied = true;
    property.occupancy.tenant = tenant._id;
    property.occupancy.leaseStart = req.body.startDate;
    property.occupancy.leaseEnd = req.body.endDate;
    property.occupancy.leaseType = req.body.leaseType;
    property.status = 'occupied';
  }

  await property.save();

  // Populate and return updated tenant
  await tenant.populate('leases.property', 'title address propertyType');

  res.status(200).json({
    status: 'success',
    data: {
      tenant,
    },
  });
});

// Update lease status
export const updateLeaseStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  if (!status || !['active', 'pending', 'terminated', 'expired', 'renewed'].includes(status)) {
    return next(new AppError('Valid lease status is required', 400));
  }

  const tenant = await Tenant.findOne({
    _id: req.params.tenantId,
    createdBy: req.user.id,
    isActive: true,
  });

  if (!tenant) {
    return next(new AppError('Tenant not found', 404));
  }

  // Update lease status
  await tenant.updateLeaseStatus(req.params.leaseId, status);

  // If terminating lease, update property occupancy
  if (status === 'terminated' || status === 'expired') {
    const lease = tenant.leases.id(req.params.leaseId);
    if (lease) {
      const property = await Property.findById(lease.property);
      if (property) {
        if (lease.unit) {
          const unit = property.units.id(lease.unit);
          if (unit) {
            unit.occupancy.isOccupied = false;
            unit.occupancy.tenant = null;
            unit.status = 'available';
          }
        } else {
          property.occupancy.isOccupied = false;
          property.occupancy.tenant = null;
          property.status = 'available';
        }
        await property.save();
      }
    }
  }

  await tenant.populate('leases.property', 'title address propertyType');

  res.status(200).json({
    status: 'success',
    data: {
      tenant,
    },
  });
});

// Update application status
export const updateApplicationStatus = catchAsync(async (req, res, next) => {
  const { status, notes, rejectionReason } = req.body;

  if (
    !status ||
    ![
      'pending',
      'under-review',
      'approved',
      'rejected',
      'waitlisted',
      'withdrawn',
      'expired',
    ].includes(status)
  ) {
    return next(new AppError('Valid application status is required', 400));
  }

  const tenant = await Tenant.findOne({
    _id: req.params.id,
    createdBy: req.user.id,
    isActive: true,
  });

  if (!tenant) {
    return next(new AppError('Tenant not found', 404));
  }

  // Update application status
  tenant.applicationStatus.status = status;
  tenant.applicationStatus.reviewDate = Date.now();
  tenant.applicationStatus.reviewedBy = req.user.id;

  if (notes) {
    tenant.applicationStatus.notes = notes;
  }

  if (status === 'approved') {
    tenant.applicationStatus.approvalDate = Date.now();
  }

  if (status === 'rejected' && rejectionReason) {
    tenant.applicationStatus.rejectionReason = rejectionReason;
  }

  await tenant.save();

  res.status(200).json({
    status: 'success',
    data: {
      tenant,
    },
  });
});

// Add a document to tenant
export const addDocument = catchAsync(async (req, res, next) => {
  const tenant = await Tenant.findOne({
    _id: req.params.id,
    createdBy: req.user.id,
    isActive: true,
  });

  if (!tenant) {
    return next(new AppError('Tenant not found', 404));
  }

  const documentData = {
    ...req.body,
    uploadedBy: req.user.id,
  };

  tenant.documents.push(documentData);
  await tenant.save();

  res.status(200).json({
    status: 'success',
    data: {
      tenant,
    },
  });
});

// Verify a document
export const verifyDocument = catchAsync(async (req, res, next) => {
  const tenant = await Tenant.findOne({
    _id: req.params.tenantId,
    createdBy: req.user.id,
    isActive: true,
  });

  if (!tenant) {
    return next(new AppError('Tenant not found', 404));
  }

  const document = tenant.documents.id(req.params.documentId);
  if (!document) {
    return next(new AppError('Document not found', 404));
  }

  document.isVerified = true;
  document.verifiedAt = Date.now();
  document.verifiedBy = req.user.id;

  if (req.body.notes) {
    document.notes = req.body.notes;
  }

  await tenant.save();

  res.status(200).json({
    status: 'success',
    data: {
      tenant,
    },
  });
});

// Get tenant statistics
export const getTenantStats = catchAsync(async (req, res, next) => {
  const stats = await Tenant.aggregate([
    {
      $match: {
        createdBy: req.user._id,
        isActive: true,
      },
    },
    {
      $group: {
        _id: null,
        totalTenants: { $sum: 1 },
        activeTenants: {
          $sum: {
            $cond: [{ $eq: ['$leases.status', 'active'] }, 1, 0],
          },
        },
        pendingApplications: {
          $sum: {
            $cond: [{ $eq: ['$applicationStatus.status', 'pending'] }, 1, 0],
          },
        },
        approvedApplications: {
          $sum: {
            $cond: [{ $eq: ['$applicationStatus.status', 'approved'] }, 1, 0],
          },
        },
      },
    },
  ]);

  const result = stats[0] || {
    totalTenants: 0,
    activeTenants: 0,
    pendingApplications: 0,
    approvedApplications: 0,
  };

  res.status(200).json({
    status: 'success',
    data: {
      stats: result,
    },
  });
});

// Search tenants (advanced search)
export const searchTenants = catchAsync(async (req, res, next) => {
  const {
    name,
    email,
    phone,
    propertyId,
    leaseStatus,
    applicationStatus,
    creditScoreMin,
    creditScoreMax,
    incomeMin,
    incomeMax,
  } = req.query;

  const filter = {
    createdBy: req.user.id,
    isActive: true,
  };

  // Name search (first name, last name, or preferred name)
  if (name) {
    filter.$or = [
      { 'personalInfo.firstName': { $regex: name, $options: 'i' } },
      { 'personalInfo.lastName': { $regex: name, $options: 'i' } },
      { 'personalInfo.preferredName': { $regex: name, $options: 'i' } },
    ];
  }

  // Email search
  if (email) {
    filter['contactInfo.email'] = { $regex: email, $options: 'i' };
  }

  // Phone search
  if (phone) {
    filter.$or = [
      { 'contactInfo.phone.primary.number': { $regex: phone, $options: 'i' } },
      { 'contactInfo.phone.secondary.number': { $regex: phone, $options: 'i' } },
    ];
  }

  // Property filter
  if (propertyId) {
    filter['leases.property'] = propertyId;
  }

  // Lease status filter
  if (leaseStatus) {
    filter['leases.status'] = leaseStatus;
  }

  // Application status filter
  if (applicationStatus) {
    filter['applicationStatus.status'] = applicationStatus;
  }

  // Credit score range
  if (creditScoreMin || creditScoreMax) {
    filter['financialInfo.creditScore.score'] = {};
    if (creditScoreMin) {
      filter['financialInfo.creditScore.score'].$gte = parseInt(creditScoreMin);
    }
    if (creditScoreMax) {
      filter['financialInfo.creditScore.score'].$lte = parseInt(creditScoreMax);
    }
  }

  // Income range
  if (incomeMin || incomeMax) {
    filter['employment.current.income.monthly'] = {};
    if (incomeMin) {
      filter['employment.current.income.monthly'].$gte = parseInt(incomeMin);
    }
    if (incomeMax) {
      filter['employment.current.income.monthly'].$lte = parseInt(incomeMax);
    }
  }

  const tenants = await Tenant.find(filter)
    .populate('leases.property', 'title address propertyType')
    .populate('createdBy', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(50); // Limit search results

  res.status(200).json({
    status: 'success',
    results: tenants.length,
    data: {
      tenants,
    },
  });
});

// Check tenant qualification for a property (UK standards)
export const checkQualification = catchAsync(async (req, res, next) => {
  const tenant = await Tenant.findOne({
    _id: req.params.id,
    createdBy: req.user.id,
    isActive: true,
  });

  if (!tenant) {
    return next(new AppError('Tenant not found', 404));
  }

  const { monthlyRent } = req.body;

  if (!monthlyRent || monthlyRent <= 0) {
    return next(new AppError('Valid monthly rent is required', 400));
  }

  // Use tenant model methods for UK standards
  const incomeQualification = tenant.checkIncomeQualification(monthlyRent);
  const affordabilityCheck = tenant.checkAffordability(monthlyRent);

  const qualification = {
    monthlyRent,
    tenant: {
      grossIncome: tenant.employment.current.income.gross.monthly,
      netIncome: tenant.employment.current.income.net.monthly,
      benefits: tenant.employment.current.benefits?.monthlyAmount || 0,
    },
    checks: {
      income: incomeQualification,
      affordability: affordabilityCheck,
      rightToRent: tenant.personalInfo.rightToRent.verified,
      referencing: tenant.referencing?.outcome || 'pending',
    },
    overallQualifies: false,
    summary: [],
  };

  // Determine overall qualification
  let qualifies = true;
  const reasons = [];

  // Income qualification check
  if (!incomeQualification.qualified) {
    qualifies = false;
    reasons.push(incomeQualification.reason);
  }

  // Affordability check
  if (!affordabilityCheck.affordable) {
    qualifies = false;
    reasons.push(affordabilityCheck.reason);
  }

  // Right to rent check (mandatory in UK)
  if (!tenant.personalInfo.rightToRent.verified) {
    qualifies = false;
    reasons.push('Right to rent not verified - mandatory requirement in UK');
  }

  // Referencing check
  const referencingOutcome = tenant.referencing?.outcome;
  if (referencingOutcome === 'fail') {
    qualifies = false;
    reasons.push('Failed referencing checks');
  } else if (referencingOutcome === 'pass-with-conditions') {
    reasons.push(`Referencing passed with conditions: ${tenant.referencing?.conditions || ''}`);
  }

  // Check for guarantor requirement
  if (tenant.financialInfo?.guarantor?.required && !tenant.financialInfo?.guarantor?.provided) {
    qualifies = false;
    reasons.push('Guarantor required but not provided');
  }

  qualification.overallQualifies = qualifies;
  qualification.summary = reasons;

  res.status(200).json({
    status: 'success',
    data: {
      qualification,
    },
  });
});

// UK-specific: Update referencing status
export const updateReferencingStatus = catchAsync(async (req, res, next) => {
  const tenant = await Tenant.findOne({
    _id: req.params.id,
    createdBy: req.user.id,
    isActive: true,
  });

  if (!tenant) {
    return next(new AppError('Tenant not found', 404));
  }

  const { status, provider, reference, outcome, conditions, notes } = req.body;

  // Update referencing information
  if (status) {
    tenant.referencing.status = status;
  }
  if (provider) {
    tenant.referencing.provider = provider;
  }
  if (reference) {
    tenant.referencing.reference = reference;
  }
  if (outcome) {
    tenant.referencing.outcome = outcome;
  }
  if (conditions) {
    tenant.referencing.conditions = conditions;
  }
  if (notes) {
    tenant.referencing.notes = notes;
  }

  if (status === 'completed') {
    tenant.referencing.completedDate = new Date();
  }

  await tenant.save();

  res.status(200).json({
    status: 'success',
    data: {
      tenant,
    },
  });
});

// UK-specific: Update affordability assessment
export const updateAffordabilityAssessment = catchAsync(async (req, res, next) => {
  const tenant = await Tenant.findOne({
    _id: req.params.id,
    createdBy: req.user.id,
    isActive: true,
  });

  if (!tenant) {
    return next(new AppError('Tenant not found', 404));
  }

  const { monthlyIncome, monthlyExpenses, monthlyCommitments } = req.body;

  // Update affordability assessment
  if (monthlyIncome) {
    tenant.financialInfo.affordabilityAssessment.monthlyIncome = monthlyIncome;
  }
  if (monthlyExpenses) {
    tenant.financialInfo.affordabilityAssessment.monthlyExpenses = monthlyExpenses;
  }
  if (monthlyCommitments) {
    tenant.financialInfo.affordabilityAssessment.monthlyCommitments = monthlyCommitments;
  }

  // Calculate disposable income and rent ratio
  const totalExpenses = (monthlyExpenses || 0) + (monthlyCommitments || 0);
  tenant.financialInfo.affordabilityAssessment.disposableIncome = monthlyIncome - totalExpenses;

  await tenant.save();

  res.status(200).json({
    status: 'success',
    data: {
      tenant,
      affordabilityRatio: tenant.affordabilityRatio,
    },
  });
});

// UK-specific: Update right to rent verification
export const updateRightToRent = catchAsync(async (req, res, next) => {
  const tenant = await Tenant.findOne({
    _id: req.params.id,
    createdBy: req.user.id,
    isActive: true,
  });

  if (!tenant) {
    return next(new AppError('Tenant not found', 404));
  }

  const { verified, documentType, documentExpiryDate, recheckRequired, recheckDate, notes } =
    req.body;

  // Update right to rent information
  tenant.personalInfo.rightToRent.verified = verified;
  tenant.personalInfo.rightToRent.verificationDate = new Date();

  if (documentType) {
    tenant.personalInfo.rightToRent.documentType = documentType;
  }
  if (documentExpiryDate) {
    tenant.personalInfo.rightToRent.documentExpiryDate = documentExpiryDate;
  }
  if (recheckRequired !== undefined) {
    tenant.personalInfo.rightToRent.recheckRequired = recheckRequired;
  }
  if (recheckDate) {
    tenant.personalInfo.rightToRent.recheckDate = recheckDate;
  }
  if (notes) {
    tenant.personalInfo.rightToRent.notes = notes;
  }

  await tenant.save();

  res.status(200).json({
    status: 'success',
    data: {
      tenant,
    },
  });
});

// UK-specific: Bulk operations
export const bulkUpdateTenants = catchAsync(async (req, res, next) => {
  const { tenantIds, operation } = req.body;

  if (!tenantIds || !Array.isArray(tenantIds) || tenantIds.length === 0) {
    return next(new AppError('Tenant IDs array is required', 400));
  }

  const validOperations = ['approve', 'reject', 'archive', 'activate'];
  if (!validOperations.includes(operation)) {
    return next(new AppError('Invalid bulk operation', 400));
  }

  const tenants = await Tenant.find({
    _id: { $in: tenantIds },
    createdBy: req.user.id,
  });

  if (tenants.length !== tenantIds.length) {
    return next(new AppError('Some tenants were not found or you do not have access to them', 404));
  }

  const updateData = {};
  switch (operation) {
    case 'approve':
      updateData['applicationStatus.status'] = 'approved';
      updateData['applicationStatus.approvalDate'] = new Date();
      updateData['applicationStatus.reviewedBy'] = req.user.id;
      break;
    case 'reject':
      updateData['applicationStatus.status'] = 'rejected';
      updateData['applicationStatus.reviewDate'] = new Date();
      updateData['applicationStatus.reviewedBy'] = req.user.id;
      break;
    case 'archive':
      updateData.isActive = false;
      break;
    case 'activate':
      updateData.isActive = true;
      break;
  }

  await Tenant.updateMany({ _id: { $in: tenantIds }, createdBy: req.user.id }, updateData);

  res.status(200).json({
    status: 'success',
    data: {
      message: `${operation} operation completed for ${tenants.length} tenants`,
      affected: tenants.length,
    },
  });
});
