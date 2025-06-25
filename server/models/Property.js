import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  // Basic Property Information
  title: {
    type: String,
    required: [true, 'Property title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  propertyType: {
    type: String,
    required: [true, 'Property type is required'],
    enum: ['house', 'apartment', 'condo', 'townhouse', 'duplex', 'commercial', 'land', 'other'],
  },

  // Address Information
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    zipCode: {
      type: String,
      required: [true, 'ZIP code is required'],
      trim: true,
    },
    country: {
      type: String,
      default: 'United States',
      trim: true,
    },
  },

  // Property Details
  bedrooms: {
    type: Number,
    required: [true, 'Number of bedrooms is required'],
    min: [0, 'Bedrooms cannot be negative'],
    max: [50, 'Bedrooms cannot exceed 50'],
  },
  bathrooms: {
    type: Number,
    required: [true, 'Number of bathrooms is required'],
    min: [0, 'Bathrooms cannot be negative'],
    max: [50, 'Bathrooms cannot exceed 50'],
  },
  squareFootage: {
    type: Number,
    required: [true, 'Square footage is required'],
    min: [1, 'Square footage must be at least 1'],
    max: [1000000, 'Square footage cannot exceed 1,000,000'],
  },
  yearBuilt: {
    type: Number,
    min: [1800, 'Year built cannot be before 1800'],
    max: [new Date().getFullYear() + 5, 'Year built cannot be more than 5 years in the future'],
  },
  lotSize: {
    type: Number,
    min: [0, 'Lot size cannot be negative'],
  },

  // Images
  images: [
    {
      url: {
        type: String,
        required: true,
      },
      caption: {
        type: String,
        trim: true,
        maxlength: [200, 'Caption cannot exceed 200 characters'],
      },
      isPrimary: {
        type: Boolean,
        default: false,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  // Financial Information
  financials: {
    // Purchase/Value Information
    propertyValue: {
      type: Number,
      min: [0, 'Property value cannot be negative'],
    },
    purchasePrice: {
      type: Number,
      min: [0, 'Purchase price cannot be negative'],
    },
    purchaseDate: {
      type: Date,
    },

    // Rental Information
    monthlyRent: {
      type: Number,
      min: [0, 'Monthly rent cannot be negative'],
    },
    securityDeposit: {
      type: Number,
      min: [0, 'Security deposit cannot be negative'],
    },
    petDeposit: {
      type: Number,
      min: [0, 'Pet deposit cannot be negative'],
      default: 0,
    },

    // Expenses
    monthlyMortgage: {
      type: Number,
      min: [0, 'Monthly mortgage cannot be negative'],
      default: 0,
    },
    propertyTaxes: {
      type: Number,
      min: [0, 'Property taxes cannot be negative'],
      default: 0,
    },
    insurance: {
      type: Number,
      min: [0, 'Insurance cannot be negative'],
      default: 0,
    },
    maintenance: {
      type: Number,
      min: [0, 'Maintenance cost cannot be negative'],
      default: 0,
    },
    utilities: {
      type: Number,
      min: [0, 'Utilities cannot be negative'],
      default: 0,
    },
  },

  // Property Status
  status: {
    type: String,
    required: [true, 'Property status is required'],
    enum: ['available', 'occupied', 'maintenance', 'off-market', 'pending'],
    default: 'available',
  },

  // Occupancy Information
  occupancy: {
    isOccupied: {
      type: Boolean,
      default: false,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    leaseStart: {
      type: Date,
    },
    leaseEnd: {
      type: Date,
    },
    leaseType: {
      type: String,
      enum: ['month-to-month', 'fixed-term', 'week-to-week'],
    },
    rentDueDate: {
      type: Number,
      min: [1, 'Rent due date must be between 1 and 31'],
      max: [31, 'Rent due date must be between 1 and 31'],
      default: 1,
    },
  },

  // Property Features
  features: {
    parking: {
      type: String,
      enum: ['none', 'street', 'driveway', 'garage', 'covered'],
      default: 'none',
    },
    airConditioning: {
      type: Boolean,
      default: false,
    },
    heating: {
      type: String,
      enum: ['none', 'central', 'baseboard', 'radiator', 'fireplace'],
      default: 'none',
    },
    laundry: {
      type: String,
      enum: ['none', 'in-unit', 'shared', 'hookups'],
      default: 'none',
    },
    petPolicy: {
      allowed: {
        type: Boolean,
        default: false,
      },
      types: [
        {
          type: String,
          enum: ['dogs', 'cats', 'birds', 'fish', 'other'],
        },
      ],
      maxPets: {
        type: Number,
        min: [0, 'Max pets cannot be negative'],
        default: 0,
      },
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
  },

  // Owner Information
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Property must have an owner'],
  },

  // Metadata
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for better query performance
propertySchema.index({ owner: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ 'address.city': 1, 'address.state': 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ bedrooms: 1, bathrooms: 1 });
propertySchema.index({ 'financials.monthlyRent': 1 });

// Update the updatedAt timestamp before saving
propertySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure only one primary image
propertySchema.pre('save', function (next) {
  if (this.images && this.images.length > 0) {
    let primaryCount = 0;
    this.images.forEach(image => {
      if (image.isPrimary) {
        primaryCount++;
      }
    });

    // If no primary image, make the first one primary
    if (primaryCount === 0 && this.images.length > 0) {
      this.images[0].isPrimary = true;
    }

    // If multiple primary images, keep only the first one
    if (primaryCount > 1) {
      let foundFirst = false;
      this.images.forEach(image => {
        if (image.isPrimary && foundFirst) {
          image.isPrimary = false;
        } else if (image.isPrimary && !foundFirst) {
          foundFirst = true;
        }
      });
    }
  }
  next();
});

// Virtual for full address
propertySchema.virtual('fullAddress').get(function () {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}`;
});

// Virtual for monthly cash flow
propertySchema.virtual('monthlyCashFlow').get(function () {
  const income = this.financials.monthlyRent || 0;
  const expenses =
    (this.financials.monthlyMortgage || 0) +
    (this.financials.propertyTaxes || 0) / 12 +
    (this.financials.insurance || 0) / 12 +
    (this.financials.maintenance || 0) +
    (this.financials.utilities || 0);
  return income - expenses;
});

// Virtual for primary image
propertySchema.virtual('primaryImage').get(function () {
  if (this.images && this.images.length > 0) {
    const primary = this.images.find(img => img.isPrimary);
    return primary || this.images[0];
  }
  return null;
});

// Ensure virtuals are included in JSON output
propertySchema.set('toJSON', { virtuals: true });
propertySchema.set('toObject', { virtuals: true });

const Property = mongoose.model('Property', propertySchema);
export default Property;
