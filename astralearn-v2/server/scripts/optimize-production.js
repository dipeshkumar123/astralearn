#!/usr/bin/env node

/**
 * AstraLearn v2 Production Optimization Script
 * Optimizes database, creates indexes, and sets up caching
 */

const { MongoClient } = require('mongodb');
const redis = require('redis');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables
require('dotenv').config();

class ProductionOptimizer {
  constructor() {
    this.mongoClient = null;
    this.redisClient = null;
    this.db = null;
  }

  async initialize() {
    console.log('🚀 Starting AstraLearn v2 Production Optimization...\n');
    
    try {
      // Connect to MongoDB
      console.log('📊 Connecting to MongoDB...');
      this.mongoClient = new MongoClient(process.env.MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
      });
      await this.mongoClient.connect();
      this.db = this.mongoClient.db();
      console.log('✅ MongoDB connected successfully\n');

      // Connect to Redis
      if (process.env.REDIS_ENABLED === 'true') {
        console.log('🔄 Connecting to Redis...');
        this.redisClient = redis.createClient({
          url: process.env.REDIS_URL,
          password: process.env.REDIS_PASSWORD || undefined
        });
        await this.redisClient.connect();
        console.log('✅ Redis connected successfully\n');
      }

    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
      process.exit(1);
    }
  }

  async createDatabaseIndexes() {
    console.log('🔍 Creating database indexes for optimal performance...\n');

    const indexOperations = [
      // Users collection indexes
      {
        collection: 'users',
        indexes: [
          { key: { email: 1 }, options: { unique: true, name: 'email_unique' } },
          { key: { username: 1 }, options: { unique: true, name: 'username_unique' } },
          { key: { role: 1 }, options: { name: 'role_index' } },
          { key: { isActive: 1 }, options: { name: 'active_users' } },
          { key: { createdAt: -1 }, options: { name: 'user_creation_date' } },
          { key: { lastLoginAt: -1 }, options: { name: 'last_login' } }
        ]
      },

      // Courses collection indexes
      {
        collection: 'courses',
        indexes: [
          { key: { title: 'text', description: 'text' }, options: { name: 'course_text_search' } },
          { key: { category: 1, difficulty: 1 }, options: { name: 'category_difficulty' } },
          { key: { instructorId: 1 }, options: { name: 'instructor_courses' } },
          { key: { isPublished: 1, createdAt: -1 }, options: { name: 'published_courses' } },
          { key: { tags: 1 }, options: { name: 'course_tags' } },
          { key: { price: 1 }, options: { name: 'course_price' } },
          { key: { rating: -1 }, options: { name: 'course_rating' } }
        ]
      },

      // Enrollments collection indexes
      {
        collection: 'enrollments',
        indexes: [
          { key: { userId: 1, courseId: 1 }, options: { unique: true, name: 'user_course_enrollment' } },
          { key: { userId: 1 }, options: { name: 'user_enrollments' } },
          { key: { courseId: 1 }, options: { name: 'course_enrollments' } },
          { key: { enrolledAt: -1 }, options: { name: 'enrollment_date' } },
          { key: { status: 1 }, options: { name: 'enrollment_status' } }
        ]
      },

      // User Progress collection indexes
      {
        collection: 'userProgress',
        indexes: [
          { key: { userId: 1, lessonId: 1 }, options: { unique: true, name: 'user_lesson_progress' } },
          { key: { userId: 1, status: 1 }, options: { name: 'user_progress_status' } },
          { key: { lessonId: 1 }, options: { name: 'lesson_progress' } },
          { key: { completedAt: -1 }, options: { name: 'completion_date' } }
        ]
      },

      // Forum Posts collection indexes
      {
        collection: 'forumPosts',
        indexes: [
          { key: { courseId: 1, createdAt: -1 }, options: { name: 'course_posts' } },
          { key: { authorId: 1 }, options: { name: 'author_posts' } },
          { key: { title: 'text', content: 'text' }, options: { name: 'post_text_search' } },
          { key: { type: 1 }, options: { name: 'post_type' } },
          { key: { isPinned: 1, createdAt: -1 }, options: { name: 'pinned_posts' } },
          { key: { tags: 1 }, options: { name: 'post_tags' } }
        ]
      },

      // User Activities collection indexes
      {
        collection: 'userActivities',
        indexes: [
          { key: { userId: 1, timestamp: -1 }, options: { name: 'user_activities' } },
          { key: { type: 1 }, options: { name: 'activity_type' } },
          { key: { timestamp: -1 }, options: { name: 'recent_activities' } }
        ]
      },

      // Recommendations collection indexes
      {
        collection: 'recommendations',
        indexes: [
          { key: { userId: 1, type: 1 }, options: { name: 'user_recommendations' } },
          { key: { confidence: -1 }, options: { name: 'recommendation_confidence' } },
          { key: { createdAt: -1 }, options: { name: 'recommendation_date' } }
        ]
      }
    ];

    for (const { collection, indexes } of indexOperations) {
      console.log(`📋 Creating indexes for ${collection} collection...`);
      
      try {
        for (const { key, options } of indexes) {
          await this.db.collection(collection).createIndex(key, options);
          console.log(`   ✅ Created index: ${options.name}`);
        }
        console.log(`   🎉 All indexes created for ${collection}\n`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`   ⚠️ Index already exists for ${collection}`);
        } else {
          console.error(`   ❌ Error creating indexes for ${collection}:`, error.message);
        }
      }
    }
  }

  async optimizeDatabase() {
    console.log('⚡ Optimizing database performance...\n');

    try {
      // Get database statistics
      const stats = await this.db.stats();
      console.log('📊 Database Statistics:');
      console.log(`   Database Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Index Size: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Collections: ${stats.collections}`);
      console.log(`   Objects: ${stats.objects}\n`);

      // Analyze collection performance
      const collections = ['users', 'courses', 'enrollments', 'userProgress', 'forumPosts'];
      
      for (const collectionName of collections) {
        const collection = this.db.collection(collectionName);
        const count = await collection.countDocuments();
        const indexes = await collection.indexes();
        
        console.log(`📋 ${collectionName}:`);
        console.log(`   Documents: ${count}`);
        console.log(`   Indexes: ${indexes.length}`);
        
        // Check for missing indexes on large collections
        if (count > 1000 && indexes.length < 3) {
          console.log(`   ⚠️ Consider adding more indexes for better performance`);
        }
        console.log('');
      }

    } catch (error) {
      console.error('❌ Database optimization failed:', error.message);
    }
  }

  async setupCaching() {
    if (!this.redisClient) {
      console.log('⚠️ Redis not enabled, skipping cache setup\n');
      return;
    }

    console.log('🔄 Setting up Redis caching...\n');

    try {
      // Test Redis connection
      const pong = await this.redisClient.ping();
      console.log(`✅ Redis connection test: ${pong}`);

      // Set cache configuration
      await this.redisClient.configSet('maxmemory-policy', 'allkeys-lru');
      console.log('✅ Set Redis eviction policy to allkeys-lru');

      // Pre-populate cache with frequently accessed data
      console.log('📦 Pre-populating cache with frequently accessed data...');

      // Cache popular courses
      const popularCourses = await this.db.collection('courses')
        .find({ isPublished: true })
        .sort({ enrollmentCount: -1 })
        .limit(10)
        .toArray();

      await this.redisClient.setEx(
        'cache:popular-courses',
        3600, // 1 hour TTL
        JSON.stringify(popularCourses)
      );
      console.log(`✅ Cached ${popularCourses.length} popular courses`);

      // Cache course categories
      const categories = await this.db.collection('courses').distinct('category');
      await this.redisClient.setEx(
        'cache:course-categories',
        7200, // 2 hours TTL
        JSON.stringify(categories)
      );
      console.log(`✅ Cached ${categories.length} course categories`);

      console.log('🎉 Cache setup completed successfully\n');

    } catch (error) {
      console.error('❌ Cache setup failed:', error.message);
    }
  }

  async createLogDirectories() {
    console.log('📁 Creating log directories...\n');

    const logDirs = ['logs', 'logs/api', 'logs/jobs', 'logs/websocket'];

    for (const dir of logDirs) {
      try {
        await fs.mkdir(path.join(process.cwd(), dir), { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      } catch (error) {
        if (error.code !== 'EEXIST') {
          console.error(`❌ Failed to create directory ${dir}:`, error.message);
        }
      }
    }
    console.log('');
  }

  async generatePerformanceReport() {
    console.log('📊 Generating Performance Report...\n');

    const report = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: {
        connected: !!this.db,
        uri: process.env.MONGODB_URI ? 'configured' : 'missing'
      },
      redis: {
        enabled: process.env.REDIS_ENABLED === 'true',
        connected: !!this.redisClient
      },
      features: {
        discussions: process.env.FEATURE_DISCUSSIONS === 'true',
        analytics: process.env.FEATURE_ANALYTICS === 'true',
        aiRecommendations: process.env.FEATURE_AI_RECOMMENDATIONS === 'true',
        payments: process.env.FEATURE_PAYMENTS === 'true'
      },
      security: {
        jwtConfigured: !!process.env.JWT_SECRET,
        corsConfigured: !!process.env.CORS_ORIGIN,
        rateLimitConfigured: !!process.env.RATE_LIMIT_MAX_REQUESTS
      }
    };

    // Save report
    await fs.writeFile(
      path.join(process.cwd(), 'optimization-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('📋 Performance Report:');
    console.log(`   Environment: ${report.environment}`);
    console.log(`   Database: ${report.database.connected ? '✅ Connected' : '❌ Disconnected'}`);
    console.log(`   Redis: ${report.redis.connected ? '✅ Connected' : '❌ Disconnected'}`);
    console.log(`   Features Enabled: ${Object.values(report.features).filter(Boolean).length}/4`);
    console.log(`   Security: ${Object.values(report.security).filter(Boolean).length}/3 configured`);
    console.log(`   Report saved to: optimization-report.json\n`);
  }

  async cleanup() {
    console.log('🧹 Cleaning up connections...\n');

    try {
      if (this.redisClient) {
        await this.redisClient.quit();
        console.log('✅ Redis connection closed');
      }

      if (this.mongoClient) {
        await this.mongoClient.close();
        console.log('✅ MongoDB connection closed');
      }
    } catch (error) {
      console.error('❌ Cleanup error:', error.message);
    }
  }

  async run() {
    try {
      await this.initialize();
      await this.createLogDirectories();
      await this.createDatabaseIndexes();
      await this.optimizeDatabase();
      await this.setupCaching();
      await this.generatePerformanceReport();
      
      console.log('🎉 Production optimization completed successfully!');
      console.log('🚀 AstraLearn v2 is now optimized for production deployment.\n');
      
    } catch (error) {
      console.error('❌ Optimization failed:', error.message);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }
}

// Run optimization if called directly
if (require.main === module) {
  const optimizer = new ProductionOptimizer();
  optimizer.run().catch(console.error);
}

module.exports = ProductionOptimizer;
