import { ensureCurrentMonthSnapshot, cleanupOldSnapshots } from '../services/analyticsService.js';
import User from '../models/User.js';

import { cleanupTempUploads } from './multiUserS3.js';
import logger from './logger.js';

/**
 * Scheduled tasks for S3 maintenance
 */

// Store interval IDs for cleanup
let cleanupIntervalId = null;
let analyticsIntervalId = null;

/**
 * Run cleanup tasks every 24 hours
 */
export const startScheduledTasks = () => {
  // Prevent multiple intervals if function is called again
  if (cleanupIntervalId || analyticsIntervalId) {
    logger.warn('Scheduled tasks already running, skipping...');
    return;
  }

  // Clean up temporary uploads every 24 hours
  cleanupIntervalId = setInterval(
    async () => {
      try {
        logger.info('Starting scheduled S3 cleanup...');
        await cleanupTempUploads();
        logger.info('Scheduled S3 cleanup completed');
      } catch (error) {
        logger.error('Scheduled S3 cleanup failed:', error);
      }
    },
    24 * 60 * 60 * 1000,
  ); // 24 hours

  // Create monthly analytics snapshots every day (will skip if already exists)
  analyticsIntervalId = setInterval(
    async () => {
      try {
        logger.info('Starting scheduled analytics snapshot creation...');

        // Get all active users
        const users = await User.find({ isActive: { $ne: false } }).select('_id');

        let successCount = 0;
        let errorCount = 0;

        // Create snapshots for each user
        for (const user of users) {
          try {
            await ensureCurrentMonthSnapshot(user._id);

            // Clean up old snapshots (keep last 24 months)
            await cleanupOldSnapshots(user._id, 24);

            successCount++;
          } catch (userError) {
            logger.error(`Failed to create snapshot for user ${user._id}:`, userError);
            errorCount++;
          }
        }

        logger.info(
          `Scheduled analytics snapshots completed: ${successCount} success, ${errorCount} errors`,
        );
      } catch (error) {
        logger.error('Scheduled analytics snapshot creation failed:', error);
      }
    },
    24 * 60 * 60 * 1000, // 24 hours
  );

  logger.info('Scheduled tasks started (S3 cleanup + Analytics snapshots)');
};

/**
 * Stop all scheduled tasks and clear intervals
 */
export const stopScheduledTasks = () => {
  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
  }

  if (analyticsIntervalId) {
    clearInterval(analyticsIntervalId);
    analyticsIntervalId = null;
  }

  logger.info('Scheduled tasks stopped');
};

/**
 * Manual cleanup function for testing
 */
export const runManualCleanup = async () => {
  try {
    logger.info('Running manual S3 cleanup...');
    await cleanupTempUploads();
    logger.info('Manual S3 cleanup completed');
    return true;
  } catch (error) {
    logger.error('Manual S3 cleanup failed:', error);
    return false;
  }
};
