import { DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

import { s3Client } from '../config/s3.js';

/**
 * Multi-user S3 management utilities
 * Handles user isolation and data organization
 */

/**
 * Delete all images for a specific property
 * @param {string} userId - The user ID
 * @param {string} propertyId - The property ID
 * @returns {Promise<boolean>} - Success status
 */
export const deleteAllPropertyImages = async (userId, propertyId) => {
  try {
    const prefix = `users/${userId}/properties/${propertyId}/`;

    // List all objects with this prefix
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Prefix: prefix,
    });

    const listedObjects = await s3Client.send(listCommand);

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      return true; // No objects to delete
    }

    // Delete all objects
    const deletePromises = listedObjects.Contents.map(object => {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: object.Key,
      });
      return s3Client.send(deleteCommand);
    });

    await Promise.all(deletePromises);

    console.log(`Deleted ${listedObjects.Contents.length} images for property ${propertyId}`);
    return true;
  } catch (error) {
    console.error('Error deleting property images:', error);
    return false;
  }
};

/**
 * Delete all data for a user (when user account is deleted)
 * @param {string} userId - The user ID
 * @returns {Promise<boolean>} - Success status
 */
export const deleteAllUserData = async userId => {
  try {
    const prefix = `users/${userId}/`;

    // List all objects for this user
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Prefix: prefix,
    });

    const listedObjects = await s3Client.send(listCommand);

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      return true; // No objects to delete
    }

    // Delete all objects in batches (S3 has a 1000 object limit per delete request)
    const deletePromises = listedObjects.Contents.map(object => {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: object.Key,
      });
      return s3Client.send(deleteCommand);
    });

    await Promise.all(deletePromises);

    console.log(`Deleted all data for user ${userId} (${listedObjects.Contents.length} objects)`);
    return true;
  } catch (error) {
    console.error('Error deleting user data:', error);
    return false;
  }
};

/**
 * Get storage usage statistics for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - Storage statistics
 */
export const getUserStorageStats = async userId => {
  try {
    const prefix = `users/${userId}/`;

    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Prefix: prefix,
    });

    const listedObjects = await s3Client.send(listCommand);

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      return {
        totalFiles: 0,
        totalSizeBytes: 0,
        totalSizeMB: 0,
        properties: 0,
      };
    }

    const totalSizeBytes = listedObjects.Contents.reduce((sum, obj) => sum + (obj.Size || 0), 0);
    const totalSizeMB = Math.round((totalSizeBytes / (1024 * 1024)) * 100) / 100;

    // Count unique properties
    const propertyIds = new Set();
    listedObjects.Contents.forEach(obj => {
      const pathParts = obj.Key.split('/');
      if (pathParts.length >= 4 && pathParts[2] === 'properties') {
        propertyIds.add(pathParts[3]);
      }
    });

    return {
      totalFiles: listedObjects.Contents.length,
      totalSizeBytes,
      totalSizeMB,
      properties: propertyIds.size,
    };
  } catch (error) {
    console.error('Error getting user storage stats:', error);
    return {
      totalFiles: 0,
      totalSizeBytes: 0,
      totalSizeMB: 0,
      properties: 0,
    };
  }
};

/**
 * Generate user-specific S3 URL
 * @param {string} userId - The user ID
 * @param {string} propertyId - The property ID
 * @param {string} filename - The filename
 * @returns {string} - The full S3 URL
 */
export const generateUserPropertyImageUrl = (userId, propertyId, filename) => {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const region = process.env.AWS_REGION || 'us-east-1';
  const timestamp = new Date().toISOString().split('T')[0];
  return `https://${bucketName}.s3.${region}.amazonaws.com/users/${userId}/properties/${propertyId}/${timestamp}/${filename}`;
};

/**
 * Clean up old temporary uploads (files older than 24 hours in temp directory)
 * @returns {Promise<boolean>} - Success status
 */
export const cleanupTempUploads = async () => {
  try {
    const tempPrefix = 'temp/';
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Prefix: tempPrefix,
    });

    const listedObjects = await s3Client.send(listCommand);

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      return true;
    }

    // Filter objects older than 24 hours
    const oldObjects = listedObjects.Contents.filter(
      obj => obj.LastModified && obj.LastModified < oneDayAgo,
    );

    if (oldObjects.length === 0) {
      return true;
    }

    // Delete old objects
    const deletePromises = oldObjects.map(object => {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: object.Key,
      });
      return s3Client.send(deleteCommand);
    });

    await Promise.all(deletePromises);

    console.log(`Cleaned up ${oldObjects.length} temporary files`);
    return true;
  } catch (error) {
    console.error('Error cleaning up temp uploads:', error);
    return false;
  }
};
