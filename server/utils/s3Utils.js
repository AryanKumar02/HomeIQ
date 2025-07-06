import { DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

import { s3Client } from '../config/s3.js';

/**
 * Delete an object from S3
 * @param {string} key - The S3 object key (file path)
 * @returns {Promise<boolean>} - Success status
 */
export const deleteS3Object = async key => {
  try {
    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    };

    await s3Client.send(new DeleteObjectCommand(deleteParams));
    return true;
  } catch (error) {
    console.error('Error deleting S3 object:', error);
    return false;
  }
};

/**
 * Extract S3 key from URL
 * @param {string} url - The S3 URL
 * @returns {string|null} - The S3 key or null if invalid
 */
export const extractS3KeyFromUrl = url => {
  try {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    // Validate bucket name is defined
    if (!bucketName) {
      console.error('AWS_S3_BUCKET_NAME environment variable is not defined');
      return null;
    }

    // Handle different S3 URL formats
    if (url.includes(`${bucketName}.s3.`)) {
      // Format: https://bucket-name.s3.region.amazonaws.com/key
      const parts = url.split(`${bucketName}.s3.`);
      if (parts.length > 1) {
        const pathPart = parts[1].split('/').slice(1).join('/');
        return pathPart;
      }
    } else if (
      url.includes(`s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${bucketName}/`)
    ) {
      // Format: https://s3.region.amazonaws.com/bucket-name/key
      const parts = url.split(`/${bucketName}/`);
      if (parts.length > 1) {
        return parts[1];
      }
    }

    return null;
  } catch (error) {
    console.error('Error extracting S3 key from URL:', error);
    return null;
  }
};

/**
 * Check if an S3 object exists
 * @param {string} key - The S3 object key
 * @returns {Promise<boolean>} - Whether the object exists
 */
export const checkS3ObjectExists = async key => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    };

    await s3Client.send(new GetObjectCommand(params));
    return true;
  } catch (error) {
    if (error.name === 'NoSuchKey') {
      return false;
    }
    console.error('Error checking S3 object existence:', error);
    return false;
  }
};

/**
 * Generate S3 URL from key
 * @param {string} key - The S3 object key
 * @returns {string} - The full S3 URL
 */
export const generateS3Url = key => {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const region = process.env.AWS_REGION || 'us-east-1';
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
};
