import mongoose from 'mongoose';

import Property from '../models/Property.js';
import Tenant from '../models/Tenant.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import logger from '../utils/logger.js';
import { deleteS3Object, extractS3KeyFromUrl } from '../utils/s3Utils.js';
import { deleteAllPropertyImages, getUserStorageStats } from '../utils/multiUserS3.js';
import { processMultipleImages, getProcessingOptions } from '../utils/imageProcessor.js';
import { uploadImageVariants } from '../utils/s3Upload.js';
import { cacheWrapper, CACHE_KEYS, CACHE_TTL, invalidatePropertyCache } from '../utils/cache.js';
import { emitAnalyticsUpdate } from '../services/realTimeAnalytics.js';

// Get all properties for the authenticated user
export const getMyProperties = catchAsync(async (req, res) => {
  const cacheKey = `${CACHE_KEYS.USER_PROPERTIES}${req.user.id}`;

  const response = await cacheWrapper(
    cacheKey,
    async () => {
      const properties = await Property.find({
        owner: req.user.id,
      })
        .select('-images.metadata -__v') // Exclude large metadata and version field
        .sort({ createdAt: -1 })
        .lean(); // Return plain JS objects instead of Mongoose documents

      logger.info(`Retrieved ${properties.length} properties for user ${req.user.id}`);

      return {
        status: 'success',
        results: properties.length,
        data: {
          properties,
        },
      };
    },
    CACHE_TTL.MEDIUM,
  );

  res.status(200).json(response);
});

// Get a single property by ID
export const getProperty = catchAsync(async (req, res, next) => {
  const cacheKey = `${CACHE_KEYS.PROPERTY_DETAILS}${req.params.id}`;

  const response = await cacheWrapper(
    cacheKey,
    async () => {
      const property = await Property.findOne({
        _id: req.params.id,
        owner: req.user.id,
      }).populate(
        'occupancy.tenant',
        'personalInfo.firstName personalInfo.lastName contactInfo.email',
      );

      if (!property) {
        throw new AppError('Property not found', 404);
      }

      logger.info(`Retrieved property ${property._id} for user ${req.user.id}`);

      return {
        status: 'success',
        data: {
          property,
        },
      };
    },
    CACHE_TTL.MEDIUM,
  );

  res.status(200).json(response);
});

// Create a new property
export const createProperty = catchAsync(async (req, res, next) => {
  // Add the owner to the property data
  const propertyData = {
    ...req.body,
    owner: req.user.id,
  };

  const property = await Property.create(propertyData);

  // Invalidate user's property cache
  await invalidatePropertyCache(req.user.id, property._id);

  // Emit real-time analytics update
  try {
    if (global.io) {
      await emitAnalyticsUpdate(global.io, req.user.id, 'analytics:property-created');
    }
  } catch (emitError) {
    logger.warn('Failed to emit analytics update after property creation:', emitError);
  }

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
  // Remove owner from update data to prevent changing owner
  // eslint-disable-next-line no-unused-vars
  const { owner, ...updateData } = req.body;

  // Use atomic findOneAndUpdate operation
  const property = await Property.findOneAndUpdate(
    {
      _id: req.params.id,
      owner: req.user.id,
    },
    updateData,
    {
      new: true, // Return the updated document
      runValidators: true, // Run schema validators
      upsert: false, // Don't create if not found
    },
  );

  if (!property) {
    // Check if property exists but belongs to different user
    const anyProperty = await Property.findById(req.params.id);
    if (anyProperty) {
      return next(new AppError('You do not have permission to update this property', 403));
    }
    return next(new AppError('Property not found', 404));
  }

  // Synchronize lease data with tenant records if relevant fields changed
  const needsLeaseSync =
    (req.body.occupancy && (req.body.occupancy.leaseStart || req.body.occupancy.leaseEnd)) ||
    (req.body.financials && req.body.financials.monthlyRent) ||
    (req.body.financials && req.body.financials.securityDeposit);

  if (needsLeaseSync) {
    const tenantId = property.occupancy?.tenant;
    if (tenantId) {
      try {
        const updateFields = {
          'leases.$.updatedAt': new Date(),
        };

        // Update lease dates if they changed
        if (req.body.occupancy?.leaseStart) {
          updateFields['leases.$.startDate'] = property.occupancy.leaseStart;
        }
        if (req.body.occupancy?.leaseEnd) {
          updateFields['leases.$.endDate'] = property.occupancy.leaseEnd;
        }

        // Update rent if it changed
        if (req.body.financials?.monthlyRent) {
          updateFields['leases.$.monthlyRent'] = property.financials.monthlyRent;
        }

        // Update security deposit if it changed
        if (req.body.financials?.securityDeposit) {
          updateFields['leases.$.securityDeposit'] = property.financials.securityDeposit;
        }

        await Tenant.findOneAndUpdate(
          {
            _id: tenantId,
            'leases.property': property._id,
            'leases.status': 'active',
          },
          {
            $set: updateFields,
          },
        );

        const updatedFields = Object.keys(updateFields).filter(key => key !== 'leases.$.updatedAt');
        logger.info(
          `Synchronized lease data for tenant ${tenantId} with property ${property._id}. Updated: ${updatedFields.join(', ')}`,
        );
      } catch (syncError) {
        logger.warn(`Failed to sync lease data for tenant ${tenantId}: ${syncError.message}`);
        // Don't fail the property update if sync fails
      }
    }
  }

  // Synchronize unit-specific lease data for multi-unit properties
  if (req.body.units && Array.isArray(req.body.units)) {
    for (const unit of property.units) {
      if (unit.occupancy?.tenant) {
        try {
          const unitUpdateFields = {
            'leases.$.updatedAt': new Date(),
          };

          // Find the corresponding updated unit data
          const updatedUnit = req.body.units.find(
            u => u._id && u._id.toString() === unit._id.toString(),
          );
          if (updatedUnit) {
            // Update unit rent if it changed
            if (updatedUnit.monthlyRent !== undefined) {
              unitUpdateFields['leases.$.monthlyRent'] = unit.monthlyRent;
            }

            // Update unit security deposit if it changed
            if (updatedUnit.securityDeposit !== undefined) {
              unitUpdateFields['leases.$.securityDeposit'] = unit.securityDeposit;
            }

            // Update lease dates for this unit if they changed
            if (updatedUnit.occupancy?.leaseStart) {
              unitUpdateFields['leases.$.startDate'] = unit.occupancy.leaseStart;
            }
            if (updatedUnit.occupancy?.leaseEnd) {
              unitUpdateFields['leases.$.endDate'] = unit.occupancy.leaseEnd;
            }

            // Only update if there are actual changes
            const hasChanges = Object.keys(unitUpdateFields).length > 1; // More than just updatedAt
            if (hasChanges) {
              await Tenant.findOneAndUpdate(
                {
                  _id: unit.occupancy.tenant,
                  'leases.property': property._id,
                  'leases.unit': unit._id,
                  'leases.status': 'active',
                },
                {
                  $set: unitUpdateFields,
                },
              );

              const updatedFields = Object.keys(unitUpdateFields).filter(
                key => key !== 'leases.$.updatedAt',
              );
              logger.info(
                `Synchronized unit lease data for tenant ${unit.occupancy.tenant}, unit ${unit._id}. Updated: ${updatedFields.join(', ')}`,
              );
            }
          }
        } catch (unitSyncError) {
          logger.warn(
            `Failed to sync unit lease data for tenant ${unit.occupancy.tenant}, unit ${unit._id}: ${unitSyncError.message}`,
          );
          // Don't fail the property update if sync fails
        }
      }
    }
  }

  // Invalidate property cache
  await invalidatePropertyCache(req.user.id, property._id);

  // Emit real-time analytics update
  try {
    if (global.io) {
      await emitAnalyticsUpdate(global.io, req.user.id, 'analytics:property-updated');
    }
  } catch (emitError) {
    logger.warn('Failed to emit analytics update after property update:', emitError);
  }

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
  // Use atomic findOneAndDelete operation
  const property = await Property.findOneAndDelete({
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

  // Property already deleted by findOneAndDelete above

  // Invalidate property cache
  await invalidatePropertyCache(req.user.id, property._id);

  // Emit real-time analytics update
  try {
    if (global.io) {
      await emitAnalyticsUpdate(global.io, req.user.id, 'analytics:property-deleted');
    }
  } catch (emitError) {
    logger.warn('Failed to emit analytics update after property deletion:', emitError);
  }

  logger.info(`Permanently deleted property ${property._id} for user ${req.user.id}`);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Add images to a property (with optimized image processing)
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

  logger.info(`Processing ${req.files.length} images for property ${property._id}`);

  try {
    // Extract image buffers from uploaded files
    const imageBuffers = req.files.map(file => file.buffer);

    // Get processing options for property images
    const processingOptions = getProcessingOptions('property');

    // Process all images with sharp
    const processedResults = await processMultipleImages(imageBuffers, processingOptions);

    // Upload processed images to S3 and create image records
    const newImages = [];
    const uploadedS3Keys = []; // Track uploaded files for cleanup on failure

    for (let i = 0; i < processedResults.length; i++) {
      const result = processedResults[i];
      const originalFile = req.files[i];

      if (!result.success) {
        logger.error(`Failed to process image ${i}: ${result.error}`);
        continue; // Skip failed images
      }

      try {
        // Upload all variants to S3
        const imageUrls = await uploadImageVariants(
          result.variants,
          req.user.id,
          property._id.toString(),
          'webp',
        );

        // Track S3 keys for potential cleanup
        Object.values(imageUrls).forEach(url => {
          const key = url.split('.amazonaws.com/')[1];
          if (key) {
            uploadedS3Keys.push(key);
          }
        });

        // Create image record with multiple sizes
        const imageRecord = {
          url: imageUrls.original, // Primary URL for backward compatibility
          urls: imageUrls, // All variants
          originalName: originalFile.originalname,
          caption: req.body.captions ? req.body.captions[i] || '' : '',
          isPrimary: property.images.length === 0 && i === 0, // First image of empty property becomes primary
          uploadedAt: new Date(),
          optimized: true,
          variants: Object.keys(result.variants),
        };

        newImages.push(imageRecord);

        logger.info(`Successfully processed and uploaded image ${i} for property ${property._id}`);
      } catch (uploadError) {
        logger.error(`Failed to upload processed image ${i}: ${uploadError.message}`);
        // Continue with other images
      }
    }

    if (newImages.length === 0) {
      return next(new AppError('Failed to process any images', 500));
    }

    // Add new images to property
    property.images.push(...newImages);

    // Ensure only one primary image exists
    const primaryImages = property.images.filter(img => img.isPrimary);
    if (primaryImages.length > 1) {
      property.images.forEach((img, index) => {
        img.isPrimary = index === 0; // Make first image primary
      });
    }

    try {
      // Attempt to save to database
      await property.save();

      // Invalidate property cache
      await invalidatePropertyCache(req.user.id, property._id);

      logger.info(`Added ${newImages.length} optimized images to property ${property._id}`);

      res.status(200).json({
        status: 'success',
        message: `Successfully uploaded and optimized ${newImages.length} images`,
        data: {
          property,
          processedImages: newImages.length,
          failedImages: req.files.length - newImages.length,
        },
      });
    } catch (saveError) {
      // If database save fails, clean up uploaded S3 files
      logger.error(`Database save failed, cleaning up S3 files: ${saveError.message}`);

      const cleanupPromises = uploadedS3Keys.map(async key => {
        try {
          await deleteS3Object(key);
          logger.info(`Cleaned up S3 file: ${key}`);
        } catch (deleteError) {
          logger.error(`Failed to cleanup S3 file ${key}: ${deleteError.message}`);
        }
      });

      await Promise.allSettled(cleanupPromises);

      return next(new AppError('Failed to save images to database', 500));
    }
  } catch (error) {
    logger.error(`Image processing failed for property ${property._id}: ${error.message}`);
    return next(new AppError('Failed to process images', 500));
  }
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

  // Delete all variants from S3 if it's an optimized image
  const urlsToDelete = [];

  if (imageToDelete.optimized && imageToDelete.urls) {
    // If image has multiple variants, delete all of them
    Object.values(imageToDelete.urls.toObject()).forEach(url => {
      const s3Key = extractS3KeyFromUrl(url);
      if (s3Key) {
        urlsToDelete.push(s3Key);
      }
    });
  } else {
    // Legacy single URL deletion
    const s3Key = extractS3KeyFromUrl(imageToDelete.url);
    if (s3Key) {
      urlsToDelete.push(s3Key);
    }
  }

  // Delete all S3 objects
  const deletionPromises = urlsToDelete.map(async key => {
    try {
      const deleted = await deleteS3Object(key);
      if (!deleted) {
        logger.warn(`Failed to delete S3 object: ${key}`);
      } else {
        logger.info(`Successfully deleted S3 object: ${key}`);
      }
    } catch (error) {
      logger.error(`Error deleting S3 object ${key}: ${error.message}`);
    }
  });

  await Promise.allSettled(deletionPromises);

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

  // If assigning a tenant, verify tenant exists and belongs to the user
  if (occupancy.tenant) {
    const tenant = await Tenant.findOne({
      _id: occupancy.tenant,
      createdBy: req.user.id,
      isActive: true,
    });

    if (!tenant) {
      return next(new AppError('Tenant not found or you do not have access to it', 404));
    }
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
  const cacheKey = `${CACHE_KEYS.PROPERTY_ANALYTICS}${userId}`;

  const response = await cacheWrapper(
    cacheKey,
    async () => {
      const analytics = await Property.aggregate([
        {
          $match: {
            owner: mongoose.Types.ObjectId.createFromHexString(userId),
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

      return {
        status: 'success',
        data: {
          analytics: result,
        },
      };
    },
    CACHE_TTL.LONG,
  );

  res.status(200).json(response);
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

  // Build filter object with whitelisted fields only
  const filter = {
    owner: req.user.id,
  };

  // Whitelist of allowed property types
  const allowedPropertyTypes = [
    'house',
    'apartment',
    'condo',
    'townhouse',
    'duplex',
    'commercial',
    'land',
    'other',
  ];
  const allowedStatuses = ['available', 'occupied', 'maintenance', 'off-market', 'pending'];

  if (propertyType && allowedPropertyTypes.includes(propertyType)) {
    filter.propertyType = propertyType;
  }
  if (status && allowedStatuses.includes(status)) {
    filter.status = status;
  }
  if (city && typeof city === 'string' && city.length <= 100) {
    // Escape special regex characters to prevent injection
    const escapedCity = city.toString().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter['address.city'] = new RegExp(escapedCity, 'i');
  }
  if (state && typeof state === 'string' && state.length <= 100) {
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
  const validatedLimit =
    !isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100 ? parsedLimit : 10;
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
  }).populate(
    'units.occupancy.tenant',
    'personalInfo.firstName personalInfo.lastName contactInfo.email',
  );

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
  const newUnitData = {
    unitNumber: req.body.unitNumber,
    bedrooms: req.body.bedrooms,
    bathrooms: req.body.bathrooms,
    squareFootage: req.body.squareFootage,
    monthlyRent: req.body.monthlyRent,
    securityDeposit: req.body.securityDeposit,
    status: req.body.status,
    features: req.body.features,
  };

  property.units.push(newUnitData);
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

  // Verify tenant exists and belongs to the user
  const tenant = await Tenant.findOne({
    _id: occupancy.tenant,
    createdBy: req.user.id,
    isActive: true,
  });

  if (!tenant) {
    return next(new AppError('Tenant not found or you do not have access to it', 404));
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
