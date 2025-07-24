import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

import { s3Client } from '../config/s3.js';

/**
 * Upload a processed image buffer to S3
 * @param {Buffer} buffer - The processed image buffer
 * @param {string} userId - User ID for folder structure
 * @param {string} propertyId - Property ID for folder structure
 * @param {string} extension - File extension (e.g., 'webp')
 * @param {string} size - Image size variant (e.g., 'original', 'thumbnail', 'medium')
 * @returns {Promise<string>} - The S3 URL of the uploaded image
 */
export const uploadToS3 = async (
  buffer,
  userId,
  propertyId,
  extension = 'webp',
  size = 'original',
) => {
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const uniqueId = uuidv4();
  const fileName = `users/${userId}/properties/${propertyId}/${timestamp}/${size}-${uniqueId}.${extension}`;

  const bucketName = process.env.AWS_S3_BUCKET_NAME || 'estatelink-properties';

  const uploadParams = {
    Bucket: bucketName,
    Key: fileName,
    Body: buffer,
    ContentType: `image/${extension}`,
    Metadata: {
      uploadedBy: userId,
      uploadedAt: new Date().toISOString(),
      imageSize: size,
      processed: 'true',
    },
  };

  try {
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Return the S3 URL
    return `https://${bucketName}.s3.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error(`Failed to upload image to S3: ${error.message}`);
  }
};

/**
 * Upload multiple image variants to S3
 * @param {Object} imageVariants - Object containing different sized buffers
 * @param {string} userId - User ID for folder structure
 * @param {string} propertyId - Property ID for folder structure
 * @param {string} extension - File extension (e.g., 'webp')
 * @returns {Promise<Object>} - Object containing URLs for each variant
 */
export const uploadImageVariants = async (
  imageVariants,
  userId,
  propertyId,
  extension = 'webp',
) => {
  const uploadPromises = Object.entries(imageVariants).map(async ([size, buffer]) => {
    const url = await uploadToS3(buffer, userId, propertyId, extension, size);
    return [size, url];
  });

  const results = await Promise.all(uploadPromises);
  return Object.fromEntries(results);
};
