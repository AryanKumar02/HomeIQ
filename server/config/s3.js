import path from 'path';

import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import multer from 'multer';
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

// Configure AWS S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Allowed file types
const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// File filter function
const fileFilter = (req, file, cb) => {
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

// Configure multer for S3 upload
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET_NAME || 'estatelink-properties',
    key: (req, file, cb) => {
      const fileExtension = path.extname(file.originalname);
      const userId = req.user?.id || 'anonymous';
      const propertyId = req.params?.id || 'unknown';
      const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const fileName = `users/${userId}/properties/${propertyId}/${timestamp}/${uuidv4()}${fileExtension}`;
      cb(null, fileName);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, {
        fieldName: file.fieldname,
        originalName: file.originalname,
        uploadedBy: req.user?.id || 'anonymous',
        uploadedAt: new Date().toISOString(),
      });
    },
  }),
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10, // Maximum 10 files per upload
  },
});

export { s3Client, upload };
