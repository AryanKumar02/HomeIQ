import mongoose from 'mongoose';

import Property from '../models/Property.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import logger from '../utils/logger.js';
import { deleteS3Object, extractS3KeyFromUrl } from '../utils/s3Utils.js';
import { deleteAllPropertyImages, getUserStorageStats } from '../utils/multiUserS3.js';

// Get all properties for the authenticated user
export const getMyProperties = catchAsync(async (req, res) => {
  const properties = await Property.find({
    owner: req.user.id,
  }).sort({ createdAt: -1 });

  logger.info(`Retrieved ${properties.length} properties for user ${req.user.id}`);

  res.status(200).json({
    status: 'success',
    results: properties.length,
    data: {
      properties,
    },
  });
});

// Get a single property by ID
export const getProperty = catchAsync(async (req, res, next) => {
  const property = await Property.findOne({
    _id: req.params.id,
    owner: req.user.id,
  }).populate('occupancy.tenant', 'firstName secondName email');

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  logger.info(`Retrieved property ${property._id} for user ${req.user.id}`);

  res.status(200).json({
    status: 'success',
    data: {
      property,
    },
  });
});

// Create a new property
export const createProperty = catchAsync(async (req, res, next) => {
  // Add the owner to the property data
  const propertyData = {
    ...req.body,
    owner: req.user.id,
  };

  const property = await Property.create(propertyData);

  logger.info(`Created new property ${property._id} for user ${req.user.id}`);

  res.status(201).json({
    status: 'success',
    data: {
      property,
    },
  });
});

// Update a property
export const updateProperty = catchAsync(async (req, res, next) => {
  const property = await Property.findOne({
    _id: req.params.id,
    owner: req.user.id,
  });

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  // Update the property with new data
  Object.keys(req.body).forEach(key => {
    if (key !== 'owner') {
      // Prevent changing owner
      property[key] = req.body[key];
    }
  });

  await property.save();

  logger.info(`Updated property ${property._id} for user ${req.user.id}`);

  res.status(200).json({
    status: 'success',
    data: {
      property,
    },
  });
});

// Delete a property permanently
export const deleteProperty = catchAsync(async (req, res, next) => {
  // Find the property to delete
  const property = await Property.findOne({
    _id: req.params.id,
    owner: req.user.id,
  });

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  // Delete all associated images from S3
  const deletedImages = await deleteAllPropertyImages(req.user.id, req.params.id);
  if (!deletedImages) {
    logger.warn(`Failed to delete some images for property ${property._id}`);
  }

  // Actually delete the property from MongoDB
  await Property.findByIdAndDelete(req.params.id);

  logger.info(`Permanently deleted property ${property._id} for user ${req.user.id}`);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Add images to a property (with file upload)
export const addPropertyImages = catchAsync(async (req, res, next) => {
  const property = await Property.findOne({
    _id: req.params.id,
    owner: req.user.id,
  });

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  // Check if files were uploaded
  if (!req.files || req.files.length === 0) {
    return next(new AppError('At least one image file is required', 400));
  }

  // Process uploaded files
  const newImages = req.files.map((file, index) => ({
    url: file.location, // S3 URL from multer-s3
    caption: req.body.captions ? req.body.captions[index] || '' : '',
    isPrimary: property.images.length === 0 && index === 0, // First image of empty property becomes primary
    uploadedAt: new Date(),
  }));

  // Add new images to property
  property.images.push(...newImages);

  // Ensure only one primary image exists
  const primaryImages = property.images.filter(img => img.isPrimary);
  if (primaryImages.length > 1) {
    property.images.forEach((img, index) => {
      img.isPrimary = index === 0; // Make first image primary
    });
  }

  await property.save();

  logger.info(`Added ${newImages.length} images to property ${property._id}`);

  res.status(200).json({
    status: 'success',
    data: {
      property,
    },
  });
});

// Remove an image from a property
export const removePropertyImage = catchAsync(async (req, res, next) => {
  const property = await Property.findOne({
    _id: req.params.id,
    owner: req.user.id,
  });

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  const { imageId } = req.params;
  const imageIndex = property.images.findIndex(img => img._id.toString() === imageId);

  if (imageIndex === -1) {
    return next(new AppError('Image not found', 404));
  }

  const imageToDelete = property.images[imageIndex];

  // Delete from S3 if it's an S3 URL
  const s3Key = extractS3KeyFromUrl(imageToDelete.url);
  if (s3Key) {
    const deleted = await deleteS3Object(s3Key);
    if (!deleted) {
      logger.warn(`Failed to delete S3 object: ${s3Key}`);
    }
  }

  // If removing primary image, set another image as primary
  const wasPrimary = imageToDelete.isPrimary;
  property.images.splice(imageIndex, 1);

  if (wasPrimary && property.images.length > 0) {
    property.images[0].isPrimary = true;
  }

  await property.save();

  logger.info(`Removed image ${imageId} from property ${property._id}`);

  res.status(200).json({
    status: 'success',
    data: {
      property,
    },
  });
});

// Set primary image
export const setPrimaryImage = catchAsync(async (req, res, next) => {
  const property = await Property.findOne({
    _id: req.params.id,
    owner: req.user.id,
  });

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  const { imageId } = req.params;
  const image = property.images.find(img => img._id.toString() === imageId);

  if (!image) {
    return next(new AppError('Image not found', 404));
  }

  // Reset all images to not primary
  property.images.forEach(img => {
    img.isPrimary = false;
  });

  // Set the selected image as primary
  image.isPrimary = true;
  await property.save();

  logger.info(`Set image ${imageId} as primary for property ${property._id}`);

  res.status(200).json({
    status: 'success',
    data: {
      property,
    },
  });
});

// Update property status
export const updatePropertyStatus = catchAsync(async (req, res, next) => {
  const property = await Property.findOne({
    _id: req.params.id,
    owner: req.user.id,
  });

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  const { status } = req.body;

  if (!status) {
    return next(new AppError('Status is required', 400));
  }

  property.status = status;
  await property.save();

  logger.info(`Updated property ${property._id} status to ${status}`);

  res.status(200).json({
    status: 'success',
    data: {
      property,
    },
  });
});

// Update occupancy information
export const updateOccupancy = catchAsync(async (req, res, next) => {
  const property = await Property.findOne({
    _id: req.params.id,
    owner: req.user.id,
  });

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  const { occupancy } = req.body;

  if (!occupancy) {
    return next(new AppError('Occupancy data is required', 400));
  }

  // Update occupancy information
  Object.keys(occupancy).forEach(key => {
    property.occupancy[key] = occupancy[key];
  });

  await property.save();

  logger.info(`Updated occupancy for property ${property._id}`);

  res.status(200).json({
    status: 'success',
    data: {
      property,
    },
  });
});

// Get property analytics/summary
export const getPropertyAnalytics = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const analytics = await Property.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: null,
        totalProperties: { $sum: 1 },
        occupiedProperties: {
          $sum: {
            $cond: [{ $eq: ['$occupancy.isOccupied', true] }, 1, 0],
          },
        },
        totalMonthlyRent: { $sum: '$financials.monthlyRent' },
        totalPropertyValue: { $sum: '$financials.propertyValue' },
        averageRent: { $avg: '$financials.monthlyRent' },
        averagePropertyValue: { $avg: '$financials.propertyValue' },
      },
    },
    {
      $project: {
        _id: 0,
        totalProperties: 1,
        occupiedProperties: 1,
        vacantProperties: { $subtract: ['$totalProperties', '$occupiedProperties'] },
        occupancyRate: {
          $cond: [
            { $eq: ['$totalProperties', 0] },
            0,
            { $multiply: [{ $divide: ['$occupiedProperties', '$totalProperties'] }, 100] },
          ],
        },
        totalMonthlyRent: { $round: ['$totalMonthlyRent', 2] },
        totalPropertyValue: { $round: ['$totalPropertyValue', 2] },
        averageRent: { $round: ['$averageRent', 2] },
        averagePropertyValue: { $round: ['$averagePropertyValue', 2] },
      },
    },
  ]);

  const result = analytics[0] || {
    totalProperties: 0,
    occupiedProperties: 0,
    vacantProperties: 0,
    occupancyRate: 0,
    totalMonthlyRent: 0,
    totalPropertyValue: 0,
    averageRent: 0,
    averagePropertyValue: 0,
  };

  logger.info(`Retrieved analytics for user ${userId}`);

  res.status(200).json({
    status: 'success',
    data: {
      analytics: result,
    },
  });
});

// Search properties with filters
export const searchProperties = catchAsync(async (req, res) => {
  const {
    propertyType,
    minBedrooms,
    maxBedrooms,
    minBathrooms,
    maxBathrooms,
    minRent,
    maxRent,
    status,
    city,
    state,
    page = 1,
    limit = 10,
  } = req.query;

  // Build filter object
  const filter = {
    owner: req.user.id,
  };

  if (propertyType) {
    filter.propertyType = propertyType;
  }
  if (status) {
    filter.status = status;
  }
  if (city) {
    // Escape special regex characters to prevent injection
    const escapedCity = city.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter['address.city'] = new RegExp(escapedCity, 'i');
  }
  if (state) {
    // Escape special regex characters to prevent injection
    const escapedState = state.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter['address.state'] = new RegExp(escapedState, 'i');
  }

  if (minBedrooms || maxBedrooms) {
    filter.bedrooms = {};
    if (minBedrooms) {
      const parsedMinBedrooms = parseInt(minBedrooms, 10);
      if (!isNaN(parsedMinBedrooms) && parsedMinBedrooms >= 0) {
        filter.bedrooms.$gte = parsedMinBedrooms;
      }
    }
    if (maxBedrooms) {
      const parsedMaxBedrooms = parseInt(maxBedrooms, 10);
      if (!isNaN(parsedMaxBedrooms) && parsedMaxBedrooms >= 0) {
        filter.bedrooms.$lte = parsedMaxBedrooms;
      }
    }
  }

  if (minBathrooms || maxBathrooms) {
    filter.bathrooms = {};
    if (minBathrooms) {
      const parsedMinBathrooms = parseFloat(minBathrooms);
      if (!isNaN(parsedMinBathrooms) && parsedMinBathrooms >= 0) {
        filter.bathrooms.$gte = parsedMinBathrooms;
      }
    }
    if (maxBathrooms) {
      const parsedMaxBathrooms = parseFloat(maxBathrooms);
      if (!isNaN(parsedMaxBathrooms) && parsedMaxBathrooms >= 0) {
        filter.bathrooms.$lte = parsedMaxBathrooms;
      }
    }
  }

  if (minRent || maxRent) {
    filter['financials.monthlyRent'] = {};
    if (minRent) {
      const parsedMinRent = parseFloat(minRent);
      if (!isNaN(parsedMinRent) && parsedMinRent >= 0) {
        filter['financials.monthlyRent'].$gte = parsedMinRent;
      }
    }
    if (maxRent) {
      const parsedMaxRent = parseFloat(maxRent);
      if (!isNaN(parsedMaxRent) && parsedMaxRent >= 0) {
        filter['financials.monthlyRent'].$lte = parsedMaxRent;
      }
    }
  }

  // Calculate pagination with proper validation
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);
  const validatedPage = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const validatedLimit = !isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100 ? parsedLimit : 10;
  const skip = (validatedPage - 1) * validatedLimit;

  const properties = await Property.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(validatedLimit);

  const total = await Property.countDocuments(filter);

  logger.info(`Search returned ${properties.length} properties for user ${req.user.id}`);

  res.status(200).json({
    status: 'success',
    results: properties.length,
    pagination: {
      page: validatedPage,
      limit: validatedLimit,
      total,
      pages: Math.ceil(total / validatedLimit),
    },
    data: {
      properties,
    },
  });
});

// UNIT MANAGEMENT FOR APARTMENTS

// Get all units for a property
export const getUnits = catchAsync(async (req, res, next) => {
  const property = await Property.findOne({
    _id: req.params.id,
    owner: req.user.id,
  }).populate('units.occupancy.tenant', 'firstName secondName email');

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  if (property.propertyType !== 'apartment') {
    return next(new AppError('Units are only available for apartment properties', 400));
  }

  logger.info(`Retrieved ${property.units.length} units for property ${property._id}`);

  res.status(200).json({
    status: 'success',
    results: property.units.length,
    data: {
      units: property.units,
    },
  });
});

// Add a new unit to apartment property
export const addUnit = catchAsync(async (req, res, next) => {
  const property = await Property.findOne({
    _id: req.params.id,
    owner: req.user.id,
  });

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  if (property.propertyType !== 'apartment') {
    return next(new AppError('Units can only be added to apartment properties', 400));
  }

  // Check for duplicate unit numbers
  const existingUnit = property.units.find(unit => unit.unitNumber === req.body.unitNumber);
  if (existingUnit) {
    return next(new AppError('Unit number already exists', 400));
  }

  // Add the new unit
  property.units.push(req.body);
  await property.save();

  const newUnit = property.units[property.units.length - 1];

  logger.info(`Added unit ${newUnit.unitNumber} to property ${property._id}`);

  res.status(201).json({
    status: 'success',
    data: {
      unit: newUnit,
    },
  });
});

// Update a specific unit
export const updateUnit = catchAsync(async (req, res, next) => {
  const property = await Property.findOne({
    _id: req.params.id,
    owner: req.user.id,
  });

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  const unit = property.units.id(req.params.unitId);
  if (!unit) {
    return next(new AppError('Unit not found', 404));
  }

  // Check for duplicate unit numbers if unitNumber is being updated
  if (req.body.unitNumber && req.body.unitNumber !== unit.unitNumber) {
    const existingUnit = property.units.find(
      u => u.unitNumber === req.body.unitNumber && u._id.toString() !== req.params.unitId,
    );
    if (existingUnit) {
      return next(new AppError('Unit number already exists', 400));
    }
  }

  // Update unit properties
  Object.keys(req.body).forEach(key => {
    if (key !== '_id') {
      unit[key] = req.body[key];
    }
  });

  unit.updatedAt = new Date();
  await property.save();

  logger.info(`Updated unit ${unit.unitNumber} in property ${property._id}`);

  res.status(200).json({
    status: 'success',
    data: {
      unit,
    },
  });
});

// Delete a unit
export const deleteUnit = catchAsync(async (req, res, next) => {
  const property = await Property.findOne({
    _id: req.params.id,
    owner: req.user.id,
  });

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  const unit = property.units.id(req.params.unitId);
  if (!unit) {
    return next(new AppError('Unit not found', 404));
  }

  // Check if unit is occupied
  if (unit.occupancy.isOccupied) {
    return next(new AppError('Cannot delete an occupied unit', 400));
  }

  property.units.pull(req.params.unitId);
  await property.save();

  logger.info(`Deleted unit ${unit.unitNumber} from property ${property._id}`);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Assign tenant to a unit
export const assignTenantToUnit = catchAsync(async (req, res, next) => {
  const property = await Property.findOne({
    _id: req.params.id,
    owner: req.user.id,
  });

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  const unit = property.units.id(req.params.unitId);
  if (!unit) {
    return next(new AppError('Unit not found', 404));
  }

  if (unit.occupancy.isOccupied) {
    return next(new AppError('Unit is already occupied', 400));
  }

  const { occupancy } = req.body;
  if (!occupancy || !occupancy.tenant) {
    return next(new AppError('Tenant information is required', 400));
  }

  // Update unit occupancy
  Object.keys(occupancy).forEach(key => {
    unit.occupancy[key] = occupancy[key];
  });

  unit.occupancy.isOccupied = true;
  unit.status = 'occupied';
  unit.updatedAt = Date.now();

  await property.save();

  logger.info(`Assigned tenant ${occupancy.tenant} to unit ${unit.unitNumber}`);

  res.status(200).json({
    status: 'success',
    data: {
      unit,
    },
  });
});

// Remove tenant from a unit
export const removeTenantFromUnit = catchAsync(async (req, res, next) => {
  const property = await Property.findOne({
    _id: req.params.id,
    owner: req.user.id,
  });

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  const unit = property.units.id(req.params.unitId);
  if (!unit) {
    return next(new AppError('Unit not found', 404));
  }

  if (!unit.occupancy.isOccupied) {
    return next(new AppError('Unit is not currently occupied', 400));
  }

  // Clear occupancy data
  unit.occupancy = {
    isOccupied: false,
    tenant: null,
    leaseStart: null,
    leaseEnd: null,
    leaseType: null,
    rentDueDate: 1,
  };

  unit.status = 'available';
  unit.updatedAt = Date.now();

  await property.save();

  logger.info(`Removed tenant from unit ${unit.unitNumber}`);

  res.status(200).json({
    status: 'success',
    data: {
      unit,
    },
  });
});

// Get unit analytics for an apartment property
export const getUnitAnalytics = catchAsync(async (req, res, next) => {
  const property = await Property.findOne({
    _id: req.params.id,
    owner: req.user.id,
  });

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  if (property.propertyType !== 'apartment') {
    return next(new AppError('Unit analytics are only available for apartment properties', 400));
  }

  const totalUnits = property.units.length;
  const occupiedUnits = property.units.filter(unit => unit.occupancy.isOccupied).length;
  const vacantUnits = totalUnits - occupiedUnits;
  const totalMonthlyRent = property.units.reduce((sum, unit) => sum + (unit.monthlyRent || 0), 0);
  const averageRent = totalUnits > 0 ? totalMonthlyRent / totalUnits : 0;
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

  const analytics = {
    totalUnits,
    occupiedUnits,
    vacantUnits,
    occupancyRate: Math.round(occupancyRate * 100) / 100,
    totalMonthlyRent: Math.round(totalMonthlyRent * 100) / 100,
    averageRent: Math.round(averageRent * 100) / 100,
  };

  logger.info(`Retrieved unit analytics for property ${property._id}`);

  res.status(200).json({
    status: 'success',
    data: {
      analytics,
    },
  });
});

// Get user storage analytics
export const getUserStorageAnalytics = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const storageStats = await getUserStorageStats(userId);

  logger.info(`Retrieved storage analytics for user ${userId}`);

  res.status(200).json({
    status: 'success',
    data: {
      storage: storageStats,
    },
  });
});
