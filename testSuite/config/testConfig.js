// Test Environment Configuration
require('dotenv').config({ path: '.env.test' });

const config = {
  // Test Database Configuration
  database: {
    host: process.env.TEST_DB_HOST || 'localhost',
    port: process.env.TEST_DB_PORT || 5432,
    database: process.env.TEST_DB_NAME || 'astralearn_test',
    username: process.env.TEST_DB_USER || 'test_user',
    password: process.env.TEST_DB_PASSWORD || 'test_password',
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },

  // Test Redis Configuration
  redis: {
    host: process.env.TEST_REDIS_HOST || 'localhost',
    port: process.env.TEST_REDIS_PORT || 6379,
    password: process.env.TEST_REDIS_PASSWORD || null,
    db: process.env.TEST_REDIS_DB || 1
  },

  // Test API Configuration
  api: {
    baseUrl: process.env.TEST_API_BASE_URL || 'http://localhost:3001/api',
    timeout: 10000,
    retries: 3
  },

  // Test User Configuration
  testUsers: {
    student: {
      email: 'test.student@astralearn.com',
      password: 'TestStudent123!',
      role: 'student'
    },
    instructor: {
      email: 'test.instructor@astralearn.com',
      password: 'TestInstructor123!',
      role: 'instructor'
    },
    admin: {
      email: 'test.admin@astralearn.com',
      password: 'TestAdmin123!',
      role: 'admin'
    }
  },

  // Test Performance Thresholds
  performance: {
    apiResponseTime: 500, // milliseconds
    pageLoadTime: 2000, // milliseconds
    webSocketLatency: 1000, // milliseconds
    concurrentUsers: 1000,
    databaseQueryTime: 100 // milliseconds
  },

  // Test Coverage Requirements
  coverage: {
    minimum: 95,
    statements: 95,
    branches: 90,
    functions: 95,
    lines: 95
  },

  // Security Test Configuration
  security: {
    owaspEnabled: true,
    vulnerabilityScanEnabled: true,
    penetrationTestEnabled: true,
    dataEncryptionValidation: true
  },

  // Load Testing Configuration
  loadTesting: {
    maxConcurrentUsers: 1000,
    rampUpTime: 300, // seconds
    testDuration: 900, // seconds
    errorThreshold: 1 // percentage
  }
};

module.exports = config;
