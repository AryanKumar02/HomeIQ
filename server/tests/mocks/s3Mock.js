import { jest } from '@jest/globals';

// Mock S3 Client for testing
export const mockS3Client = {
  send: jest.fn(),
};

// Mock S3 Commands
export const mockPutObjectCommand = jest.fn();
export const mockDeleteObjectCommand = jest.fn();
export const mockGetObjectCommand = jest.fn();

// Mock responses
export const mockS3Responses = {
  putObject: {
    ETag: '"mock-etag"',
    Location: 'https://test-bucket.s3.amazonaws.com/test-key',
    Key: 'test-key',
    Bucket: 'test-bucket',
  },
  deleteObject: {
    $metadata: {
      httpStatusCode: 204,
    },
  },
  getObject: {
    Body: Buffer.from('mock file content'),
    ContentType: 'image/jpeg',
    ContentLength: 1024,
  },
};

// Setup S3 mocks
export const setupS3Mocks = () => {
  // Mock AWS SDK v3 commands
  jest.doMock('@aws-sdk/client-s3', () => ({
    S3Client: jest.fn(() => mockS3Client),
    PutObjectCommand: jest.fn((params) => {
      mockPutObjectCommand(params);
      return params;
    }),
    DeleteObjectCommand: jest.fn((params) => {
      mockDeleteObjectCommand(params);
      return params;
    }),
    GetObjectCommand: jest.fn((params) => {
      mockGetObjectCommand(params);
      return params;
    }),
  }));

  // Mock multer-s3
  jest.doMock('multer-s3', () => {
    const mockMulterS3 = jest.fn(() => ({
      _handleFile: jest.fn((req, file, cb) => {
        cb(null, {
          bucket: 'test-bucket',
          key: `test-${Date.now()}-${file.originalname}`,
          location: `https://test-bucket.s3.amazonaws.com/test-${Date.now()}-${file.originalname}`,
          etag: '"mock-etag"',
        });
      }),
      _removeFile: jest.fn((req, file, cb) => {
        cb(null);
      }),
    }));
    
    mockMulterS3.AUTO_CONTENT_TYPE = 'AUTO_CONTENT_TYPE';
    return mockMulterS3;
  });

  // Setup default successful responses
  mockS3Client.send.mockImplementation((command) => {
    if (command.constructor.name === 'PutObjectCommand') {
      return Promise.resolve(mockS3Responses.putObject);
    }
    if (command.constructor.name === 'DeleteObjectCommand') {
      return Promise.resolve(mockS3Responses.deleteObject);
    }
    if (command.constructor.name === 'GetObjectCommand') {
      return Promise.resolve(mockS3Responses.getObject);
    }
    return Promise.resolve({});
  });
};

// Reset S3 mocks
export const resetS3Mocks = () => {
  mockS3Client.send.mockClear();
  mockPutObjectCommand.mockClear();
  mockDeleteObjectCommand.mockClear();
  mockGetObjectCommand.mockClear();
};

// Make S3 operations fail for error testing
export const makeS3Fail = (errorMessage = 'Mock S3 Error') => {
  mockS3Client.send.mockRejectedValue(new Error(errorMessage));
};