import { cleanupTempUploads } from './multiUserS3.js';
import logger from './logger.js';

/**
 * Scheduled tasks for S3 maintenance
 */

// Store interval IDs for cleanup
let cleanupIntervalId = null;

/**
 * Run cleanup tasks every 24 hours
 */
export const startScheduledTasks = () => {
  // Prevent multiple intervals if function is called again
  if (cleanupIntervalId) {
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

  logger.info('Scheduled tasks started');
};

/**
 * Stop all scheduled tasks and clear intervals
 */
export const stopScheduledTasks = () => {
  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
    logger.info('Scheduled tasks stopped');
  }
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
