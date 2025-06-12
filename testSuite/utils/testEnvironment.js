const request = require('supertest');
const { sequelize } = require('../../server/src/models');
const testConfig = require('../config/testConfig');
const redis = require('redis');
const WebSocket = require('ws');

class TestEnvironment {
  constructor() {
    this.app = null;
    this.server = null;
    this.redisClient = null;
    this.isSetup = false;
  }

  /**
   * Setup complete test environment
   */
  async setupTestEnvironment() {
    try {
      console.log('🧪 Setting up test environment...');

      // Setup test database
      await this.setupTestDatabase();

      // Setup test Redis
      await this.setupTestRedis();

      // Setup test server
      await this.setupTestServer();

      // Setup test users
      await this.setupTestUsers();

      // Setup test data
      await this.setupTestData();

      this.isSetup = true;
      console.log('✅ Test environment setup complete');

      return {
        success: true,
        message: 'Test environment ready'
      };
    } catch (error) {
      console.error('❌ Test environment setup failed:', error);
      throw error;
    }
  }

  /**
   * Setup test database with clean schema
   */
  async setupTestDatabase() {
    try {
      console.log('📊 Setting up test database...');

      // Force sync database (recreate tables)
      await sequelize.sync({ force: true });

      // Run test migrations if needed
      await this.runTestMigrations();

      console.log('✅ Test database setup complete');
    } catch (error) {
      console.error('❌ Test database setup failed:', error);
      throw error;
    }
  }

  /**
   * Setup test Redis instance
   */
  async setupTestRedis() {
    try {
      console.log('🔄 Setting up test Redis...');

      this.redisClient = redis.createClient({
        host: testConfig.redis.host,
        port: testConfig.redis.port,
        password: testConfig.redis.password,
        db: testConfig.redis.db
      });

      await this.redisClient.connect();
      await this.redisClient.flushDb(); // Clear test Redis

      console.log('✅ Test Redis setup complete');
    } catch (error) {
      console.error('❌ Test Redis setup failed:', error);
      throw error;
    }
  }

  /**
   * Setup test server instance
   */
  async setupTestServer() {
    try {
      console.log('🚀 Setting up test server...');

      // Import app after environment setup
      const app = require('../../server/src/index');
      this.app = app;

      // Start test server
      this.server = this.app.listen(0, () => {
        const port = this.server.address().port;
        console.log(`🚀 Test server running on port ${port}`);
      });

      console.log('✅ Test server setup complete');
    } catch (error) {
      console.error('❌ Test server setup failed:', error);
      throw error;
    }
  }

  /**
   * Setup test users with all roles
   */
  async setupTestUsers() {
    try {
      console.log('👥 Setting up test users...');

      const { User } = require('../../server/src/models');
      const bcrypt = require('bcryptjs');

      // Create test users for each role
      for (const [role, userData] of Object.entries(testConfig.testUsers)) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        await User.create({
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          firstName: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
          lastName: 'User',
          isEmailVerified: true,
          isActive: true
        });
      }

      console.log('✅ Test users setup complete');
    } catch (error) {
      console.error('❌ Test users setup failed:', error);
      throw error;
    }
  }

  /**
   * Setup test data for comprehensive testing
   */
  async setupTestData() {
    try {
      console.log('📚 Setting up test data...');

      const { Course, Module, Lesson, Assessment } = require('../../server/src/models');

      // Create test course
      const testCourse = await Course.create({
        title: 'Test Course for QA',
        description: 'Comprehensive test course for quality assurance',
        difficultyLevel: 'intermediate',
        estimatedDuration: 120,
        isPublished: true,
        instructorId: 1 // Test instructor
      });

      // Create test modules
      const testModule = await Module.create({
        title: 'Test Module 1',
        description: 'First test module',
        order: 1,
        courseId: testCourse.id
      });

      // Create test lessons
      await Lesson.create({
        title: 'Test Lesson 1',
        content: 'This is test lesson content for QA validation',
        type: 'text',
        order: 1,
        moduleId: testModule.id,
        estimatedDuration: 30
      });

      // Create test assessment
      await Assessment.create({
        title: 'Test Assessment',
        description: 'Test assessment for QA',
        type: 'quiz',
        questions: [
          {
            question: 'What is 2 + 2?',
            type: 'multiple_choice',
            options: ['3', '4', '5', '6'],
            correctAnswer: '4'
          }
        ],
        timeLimit: 1800,
        passingScore: 70,
        moduleId: testModule.id
      });

      console.log('✅ Test data setup complete');
    } catch (error) {
      console.error('❌ Test data setup failed:', error);
      throw error;
    }
  }

  /**
   * Run test-specific database migrations
   */
  async runTestMigrations() {
    // Add any test-specific migrations here
    console.log('🔄 Running test migrations...');
    // Implementation would go here if needed
  }

  /**
   * Get authenticated user token for testing
   */
  async getAuthToken(userType = 'student') {
    try {
      const userData = testConfig.testUsers[userType];
      
      const response = await request(this.app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      if (response.status !== 200) {
        throw new Error(`Failed to get auth token for ${userType}`);
      }

      return response.body.token;
    } catch (error) {
      console.error(`❌ Failed to get auth token for ${userType}:`, error);
      throw error;
    }
  }

  /**
   * Create test WebSocket connection
   */
  async createWebSocketConnection(token) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`ws://localhost:${this.server.address().port}/ws`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      ws.on('open', () => resolve(ws));
      ws.on('error', reject);
    });
  }

  /**
   * Cleanup test environment
   */
  async cleanupTestEnvironment() {
    try {
      console.log('🧹 Cleaning up test environment...');

      // Close WebSocket connections
      // Close server
      if (this.server) {
        await new Promise((resolve) => {
          this.server.close(resolve);
        });
      }

      // Close Redis connection
      if (this.redisClient) {
        await this.redisClient.quit();
      }

      // Close database connection
      await sequelize.close();

      console.log('✅ Test environment cleanup complete');
    } catch (error) {
      console.error('❌ Test environment cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Reset test data between tests
   */
  async resetTestData() {
    try {
      // Clear Redis cache
      if (this.redisClient) {
        await this.redisClient.flushDb();
      }

      // Reset database to clean state
      await this.setupTestDatabase();
      await this.setupTestUsers();
      await this.setupTestData();

      console.log('✅ Test data reset complete');
    } catch (error) {
      console.error('❌ Test data reset failed:', error);
      throw error;
    }
  }

  /**
   * Validate test environment health
   */
  async validateEnvironmentHealth() {
    const healthChecks = {
      database: false,
      redis: false,
      server: false,
      users: false
    };

    try {
      // Check database connection
      await sequelize.authenticate();
      healthChecks.database = true;

      // Check Redis connection
      await this.redisClient.ping();
      healthChecks.redis = true;

      // Check server
      if (this.server && this.server.listening) {
        healthChecks.server = true;
      }

      // Check test users exist
      const { User } = require('../../server/src/models');
      const userCount = await User.count();
      healthChecks.users = userCount >= 3;

      const allHealthy = Object.values(healthChecks).every(check => check);

      return {
        healthy: allHealthy,
        checks: healthChecks,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Environment health check failed:', error);
      return {
        healthy: false,
        checks: healthChecks,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get test statistics
   */
  getTestStatistics() {
    return {
      environment: 'test',
      setupComplete: this.isSetup,
      database: testConfig.database.database,
      redisDb: testConfig.redis.db,
      serverPort: this.server ? this.server.address().port : null,
      testUsers: Object.keys(testConfig.testUsers),
      performance: testConfig.performance,
      coverage: testConfig.coverage
    };
  }
}

module.exports = TestEnvironment;
