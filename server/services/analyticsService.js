import MonthlyAnalytics from '../models/MonthlyAnalytics.js';
import Property from '../models/Property.js';
import Tenant from '../models/Tenant.js';
import logger from '../utils/logger.js';

// Helper function to calculate analytics from properties
export const calculateAnalyticsFromProperties = async userId => {
  const properties = await Property.find({ owner: userId });

  // Get active tenants count
  const activeTenants = await Tenant.countDocuments({
    createdBy: userId,
    isActive: true,
    'leases.status': 'active',
  });

  let totalRevenue = 0;
  let totalExpenses = 0;
  let totalUnits = 0;
  let occupiedUnits = 0;
  let portfolioValue = 0;
  let occupiedProperties = 0;

  // Expense breakdown totals
  let totalMortgage = 0;
  let totalTaxes = 0;
  let totalInsurance = 0;
  let totalMaintenance = 0;
  let totalUtilities = 0;

  properties.forEach(property => {
    // Portfolio value calculation (using current market value, then purchase price as fallback)
    portfolioValue +=
      Number(property.financials.propertyValue) ||
      Number(property.financials.purchasePrice) ||
      Number(property.financials.monthlyRent * 300) ||
      0; // Fallback: 25 years of rent

    // Multi-unit properties
    if (property.units && property.units.length > 0) {
      totalUnits += property.units.length;
      property.units.forEach(unit => {
        if (unit.occupancy.isOccupied) {
          totalRevenue += Number(unit.monthlyRent) || 0;
          occupiedUnits++;
        }
      });
      // For multi-unit properties, only count as occupied if base property is occupied
      if (property.occupancy.isOccupied) {
        occupiedProperties++;
      }
    } else {
      // Single-unit property
      totalUnits++;
      if (property.occupancy.isOccupied) {
        totalRevenue += Number(property.financials.monthlyRent) || 0;
        occupiedUnits++;
        occupiedProperties++;
      }
    }

    // Expense calculation with breakdown tracking
    const expenses = property.financials;
    const mortgage = Number(expenses.monthlyMortgage) || 0;
    const taxes = Number(expenses.propertyTaxes) || 0;
    const insurance = Number(expenses.insurance) || 0;
    const maintenance = Number(expenses.maintenance) || 0;
    const utilities = Number(expenses.utilities) || 0;

    totalMortgage += mortgage;
    totalTaxes += taxes;
    totalInsurance += insurance;
    totalMaintenance += maintenance;
    totalUtilities += utilities;

    totalExpenses += mortgage + taxes + insurance + maintenance + utilities;
  });

  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
  const netOperatingIncome = totalRevenue - totalExpenses;

  return {
    // Core metrics you requested
    totalProperties: properties.length,
    activeTenants: activeTenants,
    portfolioValue: portfolioValue,

    // Additional useful metrics
    occupancyRate: occupancyRate,
    monthlyRevenue: totalRevenue,
    monthlyExpenses: totalExpenses,
    netOperatingIncome: netOperatingIncome,

    // Legacy structure for backward compatibility (can remove later)
    revenue: {
      total: totalRevenue,
      expected: totalRevenue,
      collected: totalRevenue,
      collectionRate: 100,
    },
    occupancy: {
      totalUnits,
      occupiedUnits,
      occupancyRate,
      vacantUnits: totalUnits - occupiedUnits,
    },
    expenses: {
      total: totalExpenses,
      breakdown: {
        mortgage: totalMortgage,
        taxes: totalTaxes,
        insurance: totalInsurance,
        maintenance: totalMaintenance,
        utilities: totalUtilities,
      },
    },
    performance: {
      netOperatingIncome,
      cashFlow: netOperatingIncome,
    },
    portfolio: {
      totalProperties: properties.length,
      occupiedProperties: occupiedProperties,
      value: portfolioValue,
    },
    tenants: {
      active: activeTenants,
      total: activeTenants,
    },
  };
};

// Automatically create or update monthly snapshot
export const ensureMonthlySnapshot = async (userId, year = null, month = null) => {
  try {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;

    // Check if snapshot already exists for this month
    const existingSnapshot = await MonthlyAnalytics.getForMonth(userId, targetYear, targetMonth);

    // Only create if doesn't exist (don't overwrite existing data)
    if (existingSnapshot) {
      logger.info(
        `Monthly snapshot already exists for user ${userId} - ${targetYear}-${targetMonth}`,
      );
      return existingSnapshot;
    }

    // Calculate analytics from current properties
    const calculatedAnalytics = await calculateAnalyticsFromProperties(userId);

    // Create new snapshot
    const snapshotData = {
      userId,
      year: targetYear,
      month: targetMonth,
      ...calculatedAnalytics,
      calculatedAt: new Date(),
      dataSource: 'automatic',
      notes: 'Automatically created snapshot',
    };

    const snapshot = new MonthlyAnalytics(snapshotData);
    await snapshot.save();

    logger.info(
      `Monthly snapshot created automatically for user ${userId} - ${targetYear}-${targetMonth}`,
    );
    return snapshot;
  } catch (error) {
    logger.error('Error ensuring monthly snapshot:', error);
    throw error;
  }
};

// Create snapshots for previous months if they don't exist
export const backfillMissingSnapshots = async (userId, monthsBack = 3) => {
  try {
    const now = new Date();
    const snapshots = [];

    for (let i = 1; i <= monthsBack; i++) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const targetYear = targetDate.getFullYear();
      const targetMonth = targetDate.getMonth() + 1;

      try {
        const snapshot = await ensureMonthlySnapshot(userId, targetYear, targetMonth);
        snapshots.push(snapshot);
      } catch (error) {
        logger.warn(`Failed to create backfill snapshot for ${targetYear}-${targetMonth}:`, error);
      }
    }

    logger.info(`Backfilled ${snapshots.length} snapshots for user ${userId}`);
    return snapshots;
  } catch (error) {
    logger.error('Error backfilling snapshots:', error);
    throw error;
  }
};

// Ensure current month snapshot exists (main function for automatic creation)
export const ensureCurrentMonthSnapshot = async userId => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Create current month snapshot if it doesn't exist
    const currentSnapshot = await ensureMonthlySnapshot(userId, currentYear, currentMonth);

    // Also try to backfill any missing recent months (silently)
    try {
      await backfillMissingSnapshots(userId, 2);
    } catch (backfillError) {
      logger.warn('Backfill failed, but continuing:', backfillError);
    }

    return currentSnapshot;
  } catch (error) {
    logger.error('Error ensuring current month snapshot:', error);
    throw error;
  }
};

// Clean up old snapshots (keep last 24 months)
export const cleanupOldSnapshots = async (userId, keepMonths = 24) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - keepMonths);

    const cutoffYear = cutoffDate.getFullYear();
    const cutoffMonth = cutoffDate.getMonth() + 1;

    const result = await MonthlyAnalytics.deleteMany({
      userId,
      $or: [{ year: { $lt: cutoffYear } }, { year: cutoffYear, month: { $lt: cutoffMonth } }],
    });

    if (result.deletedCount > 0) {
      logger.info(`Cleaned up ${result.deletedCount} old snapshots for user ${userId}`);
    }

    return result.deletedCount;
  } catch (error) {
    logger.error('Error cleaning up old snapshots:', error);
    throw error;
  }
};
