import sharp from 'sharp';

/**
 * Image processing configuration
 */
const IMAGE_SIZES = {
  thumbnail: { width: 300, height: 200 },
  medium: { width: 800, height: 600 },
  large: { width: 1200, height: 900 },
  original: { width: 1920, height: null }, // Maintain aspect ratio
};

const WEBP_QUALITY = 80;
const JPEG_QUALITY = 85;

/**
 * Process a single image into multiple variants
 * @param {Buffer} inputBuffer - The original image buffer
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} - Object containing processed image buffers
 */
export const processImage = async (inputBuffer, options = {}) => {
  const {
    formats = ['webp'], // Default to WebP only
    sizes = ['thumbnail', 'medium', 'large', 'original'],
    quality = WEBP_QUALITY,
  } = options;

  try {
    // Validate input buffer
    if (!Buffer.isBuffer(inputBuffer) || inputBuffer.length === 0) {
      throw new Error('Invalid input buffer provided');
    }

    // Get image metadata with timeout
    const metadataPromise = sharp(inputBuffer).metadata();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Metadata extraction timeout')), 10000),
    );

    const metadata = await Promise.race([metadataPromise, timeoutPromise]);

    // Validate image metadata
    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image: missing dimensions');
    }

    if (metadata.width > 10000 || metadata.height > 10000) {
      throw new Error('Image too large: maximum 10000x10000 pixels');
    }

    console.log(
      `Processing image: ${metadata.width}x${metadata.height}, format: ${metadata.format}`,
    );

    const processedImages = {};

    // Process each size variant
    for (const sizeName of sizes) {
      const sizeConfig = IMAGE_SIZES[sizeName];
      if (!sizeConfig) {
        console.warn(`Unknown size variant: ${sizeName}`);
        continue;
      }

      // Process each format
      for (const format of formats) {
        let processor = sharp(inputBuffer);

        // Apply resizing
        if (sizeConfig.width && sizeConfig.height) {
          // Fixed dimensions with smart cropping
          processor = processor.resize(sizeConfig.width, sizeConfig.height, {
            fit: 'cover',
            position: 'center',
          });
        } else if (sizeConfig.width) {
          // Width only, maintain aspect ratio
          processor = processor.resize(sizeConfig.width, null, {
            withoutEnlargement: true,
          });
        }

        // Apply format conversion and optimization
        switch (format) {
          case 'webp':
            processor = processor.webp({
              quality,
              effort: 6, // Higher effort for better compression
            });
            break;
          case 'jpeg':
            processor = processor.jpeg({
              quality: JPEG_QUALITY,
              progressive: true,
              mozjpeg: true,
            });
            break;
          case 'png':
            processor = processor.png({
              compressionLevel: 8,
              adaptiveFiltering: true,
            });
            break;
          default:
            throw new Error(`Unsupported format: ${format}`);
        }

        // Generate the processed buffer with timeout and error handling
        try {
          const processingPromise = processor.toBuffer();
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error(`Processing timeout for ${sizeName}_${format}`)),
              30000,
            ),
          );

          const processedBuffer = await Promise.race([processingPromise, timeoutPromise]);

          // Validate processed buffer
          if (!processedBuffer || processedBuffer.length === 0) {
            throw new Error(`Empty buffer generated for ${sizeName}_${format}`);
          }

          // Store with key format: size_format (e.g., 'thumbnail_webp')
          const key = formats.length > 1 ? `${sizeName}_${format}` : sizeName;
          processedImages[key] = processedBuffer;

          console.log(`Processed ${sizeName} (${format}): ${processedBuffer.length} bytes`);
        } catch (processingError) {
          console.error(`Failed to process ${sizeName} (${format}):`, processingError.message);
          // Continue with other variants instead of failing entire process
          continue;
        }
      }
    }

    return processedImages;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error(`Image processing failed: ${error.message}`);
  }
};

/**
 * Process multiple images
 * @param {Array} imageBuffers - Array of image buffers
 * @param {Object} options - Processing options
 * @returns {Promise<Array>} - Array of processed image objects
 */
export const processMultipleImages = async (imageBuffers, options = {}) => {
  const processingPromises = imageBuffers.map(async (buffer, index) => {
    try {
      const processedVariants = await processImage(buffer, options);
      return {
        index,
        success: true,
        variants: processedVariants,
      };
    } catch (error) {
      console.error(`Failed to process image ${index}:`, error);
      return {
        index,
        success: false,
        error: error.message,
      };
    }
  });

  return Promise.all(processingPromises);
};

/**
 * Get optimized processing options based on use case
 */
export const getProcessingOptions = (useCase = 'property') => {
  switch (useCase) {
    case 'property':
      return {
        formats: ['webp'],
        sizes: ['thumbnail', 'medium', 'large', 'original'],
        quality: 80,
      };
    case 'profile':
      return {
        formats: ['webp'],
        sizes: ['thumbnail', 'medium'],
        quality: 85,
      };
    case 'document':
      return {
        formats: ['jpeg'],
        sizes: ['medium', 'original'],
        quality: 90,
      };
    default:
      return {
        formats: ['webp'],
        sizes: ['original'],
        quality: 80,
      };
  }
};

/**
 * Calculate estimated file size reduction
 * @param {string} format - Target format
 * @returns {number} - Estimated size reduction percentage
 */
export const estimateSizeReduction = (format = 'webp') => {
  const reductionRates = {
    webp: 0.75, // ~75% reduction
    jpeg: 0.6, // ~60% reduction
    png: 0.3, // ~30% reduction
  };

  return reductionRates[format] || 0.5;
};
