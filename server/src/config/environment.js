import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenvConfig();

// Environment validation schema
const envSchema = z.object({
  // Server Configuration
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database Configuration
  MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),
  MONGODB_URI_TEST: z.string().optional(),

  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT refresh secret must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),  // Redis Configuration
  REDIS_URL: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_ENABLED: z.string().transform(val => val === 'true').default('false'),

  // AI Configuration
  OPENAI_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_BASE_URL: z.string().default('https://openrouter.ai/api/v1'),

  // Email Configuration
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // File Upload Configuration
  MAX_FILE_SIZE: z.string().default('10485760'),
  UPLOAD_PATH: z.string().default('uploads/'),

  // Security Configuration
  BCRYPT_ROUNDS: z.string().default('12'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),

  // CORS Configuration
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// Validate and parse environment variables
const parseEnv = () => {
  try {
    console.log('🔧 Validating environment variables...');
    const result = envSchema.parse(process.env);
    console.log('✅ Environment validation passed');
    return result;
  } catch (error) {
    console.error('❌ Environment validation failed:');
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    
    // In development, try to continue with defaults
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ Continuing with defaults in development mode...');
      try {
        // Try to parse with partial defaults
        return envSchema.parse({
          ...process.env,
          JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-development-fallback',
          JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-this-in-production-development-fallback'
        });
      } catch (fallbackError) {
        console.error('❌ Even fallback validation failed');
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

export const env = parseEnv();

// Derived configuration
export const config = {
  server: {
    port: parseInt(env.PORT, 10),
    environment: env.NODE_ENV,
    corsOrigin: env.CORS_ORIGIN,
  },

  database: {
    uri: env.NODE_ENV === 'test' ? env.MONGODB_URI_TEST || env.MONGODB_URI : env.MONGODB_URI,
  },

  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  redis: {
    url: env.REDIS_URL,
    password: env.REDIS_PASSWORD,
    enabled: env.REDIS_ENABLED,
  },

  ai: {
    openaiApiKey: env.OPENAI_API_KEY,
    openrouterApiKey: env.OPENROUTER_API_KEY,
    openrouterBaseUrl: env.OPENROUTER_BASE_URL,
  },

  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ? parseInt(env.SMTP_PORT, 10) : undefined,
    user: env.SMTP_USER,
    password: env.SMTP_PASS,
  },

  upload: {
    maxFileSize: parseInt(env.MAX_FILE_SIZE, 10),
    uploadPath: env.UPLOAD_PATH,
  },

  security: {
    bcryptRounds: parseInt(env.BCRYPT_ROUNDS, 10),
    rateLimitWindowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
    rateLimitMaxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
  },

  logging: {
    level: env.LOG_LEVEL,
  },
};
