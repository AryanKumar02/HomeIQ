import mongoose from 'mongoose';

const monthlyAnalyticsSchema = new mongoose.Schema(
  {
    // User who owns this data
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },

    // Time period
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [2020, 'Year must be 2020 or later'],
      max: [2050, 'Year must be 2050 or earlier'],
    },
    month: {
      type: Number,
      required: [true, 'Month is required'],
      min: [1, 'Month must be between 1 and 12'],
      max: [12, 'Month must be between 1 and 12'],
    },

    // Core analytics metrics (new simplified structure)
    totalProperties: {
      type: Number,
      default: 0,
      min: [0, 'Total properties cannot be negative'],
    },
    activeTenants: {
      type: Number,
      default: 0,
      min: [0, 'Active tenants cannot be negative'],
    },
    portfolioValue: {
      type: Number,
      default: 0,
      min: [0, 'Portfolio value cannot be negative'],
    },
    occupancyRate: {
      type: Number,
      default: 0,
      min: [0, 'Occupancy rate cannot be negative'],
      max: [100, 'Occupancy rate cannot exceed 100%'],
    },
    monthlyRevenue: {
      type: Number,
      default: 0,
      min: [0, 'Monthly revenue cannot be negative'],
    },
    monthlyExpenses: {
      type: Number,
      default: 0,
      min: [0, 'Monthly expenses cannot be negative'],
    },
    netOperatingIncome: {
      type: Number,
      default: 0,
    },

    // Revenue metrics (legacy structure for backward compatibility)
    revenue: {
      total: {
        type: Number,
        default: 0,
        min: [0, 'Total revenue cannot be negative'],
      },
      expected: {
        type: Number,
        default: 0,
        min: [0, 'Expected revenue cannot be negative'],
      },
      collected: {
        type: Number,
        default: 0,
        min: [0, 'Collected revenue cannot be negative'],
      },
      collectionRate: {
        type: Number,
        default: 0,
        min: [0, 'Collection rate cannot be negative'],
        max: [100, 'Collection rate cannot exceed 100%'],
      },
    },

    // Occupancy metrics
    occupancy: {
      totalUnits: {
        type: Number,
        default: 0,
        min: [0, 'Total units cannot be negative'],
      },
      occupiedUnits: {
        type: Number,
        default: 0,
        min: [0, 'Occupied units cannot be negative'],
      },
      occupancyRate: {
        type: Number,
        default: 0,
        min: [0, 'Occupancy rate cannot be negative'],
        max: [100, 'Occupancy rate cannot exceed 100%'],
      },
      vacantUnits: {
        type: Number,
        default: 0,
        min: [0, 'Vacant units cannot be negative'],
      },
    },

    // Expense metrics
    expenses: {
      total: {
        type: Number,
        default: 0,
        min: [0, 'Total expenses cannot be negative'],
      },
      breakdown: {
        mortgage: {
          type: Number,
          default: 0,
          min: [0, 'Mortgage expenses cannot be negative'],
        },
        taxes: {
          type: Number,
          default: 0,
          min: [0, 'Tax expenses cannot be negative'],
        },
        insurance: {
          type: Number,
          default: 0,
          min: [0, 'Insurance expenses cannot be negative'],
        },
        maintenance: {
          type: Number,
          default: 0,
          min: [0, 'Maintenance expenses cannot be negative'],
        },
        utilities: {
          type: Number,
          default: 0,
          min: [0, 'Utility expenses cannot be negative'],
        },
      },
    },

    // Performance metrics
    performance: {
      netOperatingIncome: {
        type: Number,
        default: 0,
      },
      cashFlow: {
        type: Number,
        default: 0,
      },
      profitMargin: {
        type: Number,
        default: 0,
        min: [-100, 'Profit margin cannot be less than -100%'],
      },
    },

    // Portfolio summary
    portfolio: {
      totalProperties: {
        type: Number,
        default: 0,
        min: [0, 'Total properties cannot be negative'],
      },
      occupiedProperties: {
        type: Number,
        default: 0,
        min: [0, 'Occupied properties cannot be negative'],
      },
      vacantProperties: {
        type: Number,
        default: 0,
        min: [0, 'Vacant properties cannot be negative'],
      },
    },

    // Metadata
    calculatedAt: {
      type: Date,
      default: Date.now,
    },
    dataSource: {
      type: String,
      enum: ['automatic', 'manual', 'import'],
      default: 'automatic',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound index for efficient queries
monthlyAnalyticsSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

// Index for time-based queries
monthlyAnalyticsSchema.index({ year: 1, month: 1 });
monthlyAnalyticsSchema.index({ calculatedAt: 1 });

// Virtual for month string (e.g., "2024-01")
monthlyAnalyticsSchema.virtual('monthString').get(function () {
  return `${this.year}-${String(this.month).padStart(2, '0')}`;
});

// Virtual for display date
monthlyAnalyticsSchema.virtual('displayDate').get(function () {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `${monthNames[this.month - 1]} ${this.year}`;
});

// Static method to get analytics for a specific month
monthlyAnalyticsSchema.statics.getForMonth = function (userId, year, month) {
  return this.findOne({ userId, year, month });
};

// Static method to get last N months of analytics
monthlyAnalyticsSchema.statics.getLastNMonths = function (userId, n = 6) {
  return this.find({ userId }).sort({ year: -1, month: -1 }).limit(n);
};

// Static method to get year-to-date data
monthlyAnalyticsSchema.statics.getYearToDate = function (userId, year) {
  return this.find({ userId, year }).sort({ month: 1 });
};

// Instance method to calculate month-over-month changes
monthlyAnalyticsSchema.methods.compareWithPrevious = async function () {
  const prevMonth = this.month === 1 ? 12 : this.month - 1;
  const prevYear = this.month === 1 ? this.year - 1 : this.year;

  const previousData = await this.constructor.getForMonth(this.userId, prevYear, prevMonth);

  if (!previousData) {
    return null;
  }

  return {
    revenue: {
      change: this.revenue.total - previousData.revenue.total,
      percentChange:
        previousData.revenue.total > 0
          ? ((this.revenue.total - previousData.revenue.total) / previousData.revenue.total) * 100
          : 0,
    },
    occupancy: {
      change: this.occupancy.occupancyRate - previousData.occupancy.occupancyRate,
      percentChange: this.occupancy.occupancyRate - previousData.occupancy.occupancyRate, // Percentage points
    },
    expenses: {
      change: this.expenses.total - previousData.expenses.total,
      percentChange:
        previousData.expenses.total > 0
          ? ((this.expenses.total - previousData.expenses.total) / previousData.expenses.total) *
            100
          : 0,
    },
  };
};

export default mongoose.model('MonthlyAnalytics', monthlyAnalyticsSchema);
