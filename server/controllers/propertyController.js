import mongoose from 'mongoose';

import Property from '../models/Property.js';
import AppError from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import logger from '../utils/logger.js';

// Get all properties for the authenticated user
export const getMyProperties = catchAsync(async (req, res) => {
  const properties = await Property.find({
    owner: req.user.id,
    isActive: true,
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
    isActive: true,
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
    isActive: true,
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

// Soft delete a property
export const deleteProperty = catchAsync(async (req, res, next) => {
  const property = await Property.findOne({
    _id: req.params.id,
    owner: req.user.id,
    isActive: true,
  });

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  property.isActive = false;
  await property.save();

  logger.info(`Deleted property ${property._id} for user ${req.user.id}`);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Add images to a property
export const addPropertyImages = catchAsync(async (req, res, next) => {
  const property = await Property.findOne({
    _id: req.params.id,
    owner: req.user.id,
    isActive: true,
  });

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  const { images } = req.body;

  if (!images || !Array.isArray(images)) {
    return next(new AppError('Images array is required', 400));
  }

  // Add new images
  property.images.push(...images);
  await property.save();

  logger.info(`Added ${images.length} images to property ${property._id}`);

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
    isActive: true,
  });

  if (!property) {
    return next(new AppError('Property not found', 404));
  }

  const { imageId } = req.params;
  const imageIndex = property.images.findIndex(img => img._id.toString() === imageId);

  if (imageIndex === -1) {
    return next(new AppError('Image not found', 404));
  }

  property.images.splice(imageIndex, 1);
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
    isActive: true,
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
    isActive: true,
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
    isActive: true,
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
        isActive: true,
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
    isActive: true,
  };

  if (propertyType) {
    filter.propertyType = propertyType;
  }
  if (status) {
    filter.status = status;
  }
  if (city) {
    filter['address.city'] = new RegExp(city, 'i');
  }
  if (state) {
    filter['address.state'] = new RegExp(state, 'i');
  }

  if (minBedrooms || maxBedrooms) {
    filter.bedrooms = {};
    if (minBedrooms) {
      filter.bedrooms.$gte = parseInt(minBedrooms);
    }
    if (maxBedrooms) {
      filter.bedrooms.$lte = parseInt(maxBedrooms);
    }
  }

  if (minBathrooms || maxBathrooms) {
    filter.bathrooms = {};
    if (minBathrooms) {
      filter.bathrooms.$gte = parseFloat(minBathrooms);
    }
    if (maxBathrooms) {
      filter.bathrooms.$lte = parseFloat(maxBathrooms);
    }
  }

  if (minRent || maxRent) {
    filter['financials.monthlyRent'] = {};
    if (minRent) {
      filter['financials.monthlyRent'].$gte = parseFloat(minRent);
    }
    if (maxRent) {
      filter['financials.monthlyRent'].$lte = parseFloat(maxRent);
    }
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  const properties = await Property.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Property.countDocuments(filter);

  logger.info(`Search returned ${properties.length} properties for user ${req.user.id}`);

  res.status(200).json({
    status: 'success',
    results: properties.length,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
    data: {
      properties,
    },
  });
});
