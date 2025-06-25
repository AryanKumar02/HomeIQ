import winston from 'winston';
import 'winston-daily-rotate-file';

// Custom log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 4,
  debug: 5,
};

// Level-specific colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Custom format to minimize log size
const minimalFormat = winston.format(info => {
  // Remove null or undefined values
  Object.keys(info).forEach(key => {
    if (info[key] === null || info[key] === undefined) {
      delete info[key];
    }
  });

  // Remove stack trace in production
  if (process.env.NODE_ENV === 'production' && info.stack) {
    info.stack = info.stack.split('\n')[0]; // Keep only first line of stack trace
  }

  return info;
});

// Create the logger
const logger = winston.createLogger({
  levels,
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss', // Consistent timestamp format
    }),
    winston.format.errors({ stack: true }),
    minimalFormat(),
    winston.format.json(),
  ),
  transports: [
    // Error logs
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      maxFiles: '7d', // Keep only 7 days of error logs
      maxSize: '10m', // Rotate when file reaches 10MB
      compress: true, // Enable gzip compression
      zippedArchive: true,
    }),

    // Combined logs
    new winston.transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      maxFiles: '7d', // Keep only 7 days of combined logs
      maxSize: '20m', // Larger size for combined logs
      compress: true,
      zippedArchive: true,
    }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
      ),
    }),
  );
}

export default logger;
