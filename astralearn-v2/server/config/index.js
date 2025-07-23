/**
 * AstraLearn v2 Configuration Management
 * Centralized configuration with environment-specific settings
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: path.join(__dirname, '../../', envFile) });

/**
 * Configuration object with all application settings
 */
const config = {
  // Application Settings
  app: {
    name: process.env.APP_NAME || 'AstraLearn',
    version: process.env.APP_VERSION || '2.0.0',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 5000,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:5000/api'
  },

  // Database Configuration
  database: {
    type: process.env.DB_TYPE || 'mongodb',
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/astralearn-v2',
      testUri: process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/astralearn-v2-test',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: parseInt(process.env.DB_POOL_SIZE) || 10,
        serverSelectionTimeoutMS: parseInt(process.env.DB_TIMEOUT) || 30000
      }
    }
  },

  // Authentication & Security
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    },
    bcrypt: {
      rounds: parseInt(process.env.BCRYPT_ROUNDS) || 12
    },
    session: {
      secret: process.env.SESSION_SECRET || 'fallback-session-secret'
    }
  },

  // Redis Configuration
  redis: {
    enabled: process.env.REDIS_ENABLED === 'true',
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || '',
    sessionPrefix: process.env.REDIS_SESSION_PREFIX || 'astralearn:session:'
  },

  // Email Configuration
  email: {
    provider: process.env.EMAIL_PROVIDER || 'smtp',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY || ''
    },
    from: {
      email: process.env.FROM_EMAIL || 'noreply@astralearn.com',
      name: process.env.FROM_NAME || 'AstraLearn'
    }
  },

  // File Storage Configuration
  storage: {
    type: process.env.STORAGE_TYPE || 'local',
    local: {
      uploadDir: process.env.UPLOAD_DIR || 'uploads',
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
      allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,pdf,doc,docx,ppt,pptx').split(',')
    },
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      region: process.env.AWS_REGION || 'us-east-1',
      bucket: process.env.AWS_S3_BUCKET || ''
    },
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      apiSecret: process.env.CLOUDINARY_API_SECRET || ''
    }
  },

  // External Services
  external: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || ''
    },
    groq: {
      apiKey: process.env.GROQ_API_KEY || ''
    },
    stripe: {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
    },
    analytics: {
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || ''
    }
  },

  // Security & Rate Limiting
  security: {
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    },
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true
    },
    helmet: {
      enabled: process.env.HELMET_ENABLED === 'true'
    },
    ssl: {
      enabled: process.env.SSL_ENABLED === 'true',
      certPath: process.env.SSL_CERT_PATH || '',
      keyPath: process.env.SSL_KEY_PATH || ''
    }
  },

  // Logging & Monitoring
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
    sentry: {
      dsn: process.env.SENTRY_DSN || ''
    }
  },

  // Feature Flags
  features: {
    discussions: process.env.FEATURE_DISCUSSIONS === 'true',
    aiRecommendations: process.env.FEATURE_AI_RECOMMENDATIONS === 'true',
    analytics: process.env.FEATURE_ANALYTICS === 'true',
    certificates: process.env.FEATURE_CERTIFICATES === 'true',
    payments: process.env.FEATURE_PAYMENTS === 'true',
    liveSessions: process.env.FEATURE_LIVE_SESSIONS === 'true',
    mobileApp: process.env.FEATURE_MOBILE_APP === 'true',
    
    // Development features
    apiDocs: process.env.ENABLE_API_DOCS === 'true',
    devTools: process.env.ENABLE_DEV_TOOLS === 'true',
    mockData: process.env.USE_MOCK_DATA === 'true'
  },

  // Frontend Configuration
  frontend: {
    apiUrl: process.env.VITE_API_URL || 'http://localhost:5000',
    websocketUrl: process.env.VITE_WEBSOCKET_URL || 'http://localhost:5000',
    appName: process.env.VITE_APP_NAME || 'AstraLearn',
    appVersion: process.env.VITE_APP_VERSION || '2.0.0'
  },

  // Health Check
  health: {
    enabled: process.env.HEALTH_CHECK_ENABLED === 'true',
    path: process.env.HEALTH_CHECK_PATH || '/health'
  },

  // Backup & Maintenance
  backup: {
    enabled: process.env.BACKUP_ENABLED === 'true',
    schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *',
    retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS) || 30
  },

  maintenance: {
    mode: process.env.MAINTENANCE_MODE === 'true',
    message: process.env.MAINTENANCE_MESSAGE || 'AstraLearn is currently under maintenance.'
  },

  // Performance Settings
  performance: {
    cache: {
      ttl: parseInt(process.env.CACHE_TTL) || 3600,
      maxSize: parseInt(process.env.CACHE_MAX_SIZE) || 1000
    },
    compression: {
      enabled: process.env.COMPRESSION_ENABLED === 'true',
      level: parseInt(process.env.COMPRESSION_LEVEL) || 6
    }
  }
};

/**
 * Validate required configuration
 */
function validateConfig() {
  const required = [
    'JWT_SECRET',
    'MONGODB_URI'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    console.error('Please check your .env file and ensure all required variables are set.');
    process.exit(1);
  }

  // Warn about default values in production
  if (config.app.env === 'production') {
    const productionWarnings = [];
    
    if (config.auth.jwt.secret === 'fallback-secret-change-in-production') {
      productionWarnings.push('JWT_SECRET is using default value');
    }
    
    if (productionWarnings.length > 0) {
      console.warn('⚠️ Production warnings:', productionWarnings.join(', '));
    }
  }
}

/**
 * Get configuration for specific environment
 */
function getConfig(env = config.app.env) {
  return {
    ...config,
    isDevelopment: env === 'development',
    isProduction: env === 'production',
    isTest: env === 'test'
  };
}

// Validate configuration on load
validateConfig();

module.exports = {
  config: getConfig(),
  validateConfig,
  getConfig
};
