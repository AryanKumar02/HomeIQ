import Property from '../models/Property.js';
import Tenant from '../models/Tenant.js';
import logger from '../utils/logger.js';

import { calculateAnalyticsFromProperties } from './analyticsService.js';

// Calculate real-time analytics for a user
export const calculateRealTimeAnalytics = async userId => {
  try {
    // Use the shared analytics calculation function
    const analytics = await calculateAnalyticsFromProperties(userId);

    // Add timestamp for real-time context
    return {
      ...analytics,
      timestamp: new Date(),
    };
  } catch (error) {
    logger.error('Error calculating real-time analytics:', error);
    throw error;
  }
};

// Emit analytics update to user's connected sockets
export const emitAnalyticsUpdate = async (io, userId, eventType = 'analytics:updated') => {
  try {
    // Calculate fresh analytics
    const analytics = await calculateRealTimeAnalytics(userId);

    // Find all sockets for this user
    const sockets = await io.fetchSockets();
    const userSockets = sockets.filter(
      socket => socket.user?._id?.toString() === userId.toString(),
    );

    // Emit to all user's connected sessions
    userSockets.forEach(socket => {
      socket.emit(eventType, {
        analytics,
        timestamp: new Date(),
        eventType,
      });
    });

    logger.info(`Analytics update emitted to ${userSockets.length} sockets for user ${userId}`);
    return analytics;
  } catch (error) {
    logger.error('Error emitting analytics update:', error);
    throw error;
  }
};

// Emit analytics update to specific socket
export const emitAnalyticsToSocket = async (socket, eventType = 'analytics:updated') => {
  try {
    if (!socket.user?._id) {
      throw new Error('Socket has no authenticated user');
    }

    const analytics = await calculateRealTimeAnalytics(socket.user._id);

    socket.emit(eventType, {
      analytics,
      timestamp: new Date(),
      eventType,
    });

    return analytics;
  } catch (error) {
    logger.error('Error emitting analytics to socket:', error);
    throw error;
  }
};
