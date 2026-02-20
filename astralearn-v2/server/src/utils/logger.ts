import winston from 'winston';
import { config } from '@/config/environment.js';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
};

winston.addColors(colors);

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create transports
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    level: config.logging.level,
    format: consoleFormat,
  }),
];

// Add file transports in production
if (config.server.environment === 'production') {
  transports.push(
    // Error log file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined log file
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create logger instance
export const logger = winston.createLogger({
  level: config.logging.level,
  levels,
  transports,
  exitOnError: false,
});

// Create a stream for Morgan HTTP logging
export const httpLogStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Helper functions for structured logging
export const logError = (message: string, error?: Error, meta?: any) => {
  logger.error(message, {
    error: error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : undefined,
    ...meta,
  });
};

export const logInfo = (message: string, meta?: any) => {
  logger.info(message, meta);
};

export const logWarn = (message: string, meta?: any) => {
  logger.warn(message, meta);
};

export const logDebug = (message: string, meta?: any) => {
  logger.debug(message, meta);
};

// Performance logging helper
export const logPerformance = (operation: string, duration: number, meta?: any) => {
  logger.info(`Performance: ${operation}`, {
    duration: `${duration}ms`,
    ...meta,
  });
};

// Request logging helper
export const logRequest = (method: string, url: string, statusCode: number, duration: number, userId?: string) => {
  logger.info(`${method} ${url}`, {
    statusCode,
    duration: `${duration}ms`,
    userId,
  });
};

// Database operation logging
export const logDatabase = (operation: string, collection: string, duration?: number, meta?: any) => {
  logger.debug(`DB: ${operation} on ${collection}`, {
    duration: duration ? `${duration}ms` : undefined,
    ...meta,
  });
};

// Security logging
export const logSecurity = (event: string, userId?: string, ip?: string, meta?: any) => {
  logger.warn(`Security: ${event}`, {
    userId,
    ip,
    timestamp: new Date().toISOString(),
    ...meta,
  });
};

export default logger;
