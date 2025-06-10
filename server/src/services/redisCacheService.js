/**
 * Redis Caching Service for AstraLearn
 * Part of Phase 3 Step 3: Production Optimization & Advanced Features
 * 
 * Provides advanced caching strategies for:
 * - User sessions
 * - API responses
 * - Analytics data
 * - Real-time data
 */

import { createClient } from 'redis';
import { config } from '../config/environment.js';

class RedisCacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.connectionRetries = 0;
    this.maxRetries = 5;
    this.retryDelay = 1000; // 1 second
    
    // Cache configuration
    this.defaultTTL = 3600; // 1 hour
    this.sessionTTL = 7200; // 2 hours
    this.analyticsTTL = 1800; // 30 minutes
    this.apiResponseTTL = 300; // 5 minutes
    
    this.initialize();
  }  /**
   * Initialize Redis connection
   */
  async initialize() {
    try {
      // Check if Redis is enabled
      if (!config.redis?.enabled) {
        console.log('⚠️ Redis Cache: Disabled in environment configuration');
        this.isConnected = false;
        this.client = null;
        return;
      }

      // Check if Redis URL is provided
      if (!config.redis?.url || config.redis.url.trim() === '') {
        console.log('⚠️ Redis Cache: No Redis URL provided, operating without cache');
        this.isConnected = false;
        this.client = null;
        return;
      }

      console.log('🔄 Initializing Redis Cache Service...');
      
      const redisUrl = config.redis.url;
      
      this.client = createClient({
        url: redisUrl,
        password: config.redis?.password,
        retryDelayOnFailover: 100,
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
        lazyConnect: true
      });

      // Event listeners
      this.client.on('connect', () => {
        console.log('🔗 Redis Cache: Connection established');
      });

      this.client.on('ready', () => {
        console.log('✅ Redis Cache: Ready for operations');
        this.isConnected = true;
        this.connectionRetries = 0;
      });

      this.client.on('error', (error) => {
        console.error('❌ Redis Cache Error:', error);
        this.isConnected = false;
        this.handleReconnection();
      });

      this.client.on('end', () => {
        console.log('🔌 Redis Cache: Connection closed');
        this.isConnected = false;
      });

      // Connect to Redis
      await this.client.connect();
      
    } catch (error) {
      console.error('❌ Redis Cache initialization failed:', error);
      this.handleReconnection();
    }
  }  /**
   * Handle Redis reconnection with exponential backoff
   */
  async handleReconnection() {
    // Don't retry if Redis is disabled
    if (!config.redis?.enabled || !config.redis?.url || config.redis.url.trim() === '') {
      console.log('⚠️ Redis Cache: Not retrying - Redis is disabled or no URL provided');
      this.isConnected = false;
      this.client = null;
      return;
    }

    if (this.connectionRetries < this.maxRetries) {
      this.connectionRetries++;
      const delay = this.retryDelay * Math.pow(2, this.connectionRetries - 1);
      
      console.log(`🔄 Redis Cache: Retrying connection (${this.connectionRetries}/${this.maxRetries}) in ${delay}ms`);
      
      setTimeout(() => {
        this.initialize();
      }, delay);
    } else {
      console.log('❌ Redis Cache: Max connection retries exceeded. Operating without cache.');
      this.isConnected = false;
      this.client = null;
    }
  }

  /**
   * Check if Redis is available
   */
  isAvailable() {
    return this.isConnected && this.client;
  }

  /**
   * Cache user session data
   */
  async cacheUserSession(userId, sessionData, ttl = this.sessionTTL) {
    if (!this.isAvailable()) return null;

    try {
      const key = this.generateKey('session', userId);
      const data = JSON.stringify({
        ...sessionData,
        cachedAt: new Date().toISOString(),
        ttl
      });

      await this.client.setEx(key, ttl, data);
      
      console.log(`💾 Cache: Session cached for user ${userId}`);
      return true;
      
    } catch (error) {
      console.error('❌ Cache: Failed to cache user session:', error);
      return null;
    }
  }

  /**
   * Get cached user session
   */
  async getUserSession(userId) {
    if (!this.isAvailable()) return null;

    try {
      const key = this.generateKey('session', userId);
      const data = await this.client.get(key);
      
      if (data) {
        const sessionData = JSON.parse(data);
        console.log(`📄 Cache: Session retrieved for user ${userId}`);
        return sessionData;
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Cache: Failed to get user session:', error);
      return null;
    }
  }

  /**
   * Cache API response
   */
  async cacheAPIResponse(endpoint, params, response, ttl = this.apiResponseTTL) {
    if (!this.isAvailable()) return null;

    try {
      const key = this.generateKey('api', endpoint, this.hashParams(params));
      const data = JSON.stringify({
        response,
        cachedAt: new Date().toISOString(),
        ttl
      });

      await this.client.setEx(key, ttl, data);
      
      console.log(`💾 Cache: API response cached for ${endpoint}`);
      return true;
      
    } catch (error) {
      console.error('❌ Cache: Failed to cache API response:', error);
      return null;
    }
  }

  /**
   * Get cached API response
   */
  async getCachedAPIResponse(endpoint, params) {
    if (!this.isAvailable()) return null;

    try {
      const key = this.generateKey('api', endpoint, this.hashParams(params));
      const data = await this.client.get(key);
      
      if (data) {
        const cachedData = JSON.parse(data);
        console.log(`📄 Cache: API response retrieved for ${endpoint}`);
        return cachedData.response;
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Cache: Failed to get API response:', error);
      return null;
    }
  }

  /**
   * Cache analytics data
   */
  async cacheAnalyticsData(queryKey, data, ttl = this.analyticsTTL) {
    if (!this.isAvailable()) return null;

    try {
      const key = this.generateKey('analytics', queryKey);
      const cacheData = JSON.stringify({
        data,
        cachedAt: new Date().toISOString(),
        ttl
      });

      await this.client.setEx(key, ttl, cacheData);
      
      console.log(`💾 Cache: Analytics data cached for ${queryKey}`);
      return true;
      
    } catch (error) {
      console.error('❌ Cache: Failed to cache analytics data:', error);
      return null;
    }
  }

  /**
   * Get cached analytics data
   */
  async getCachedAnalyticsData(queryKey) {
    if (!this.isAvailable()) return null;

    try {
      const key = this.generateKey('analytics', queryKey);
      const data = await this.client.get(key);
      
      if (data) {
        const cachedData = JSON.parse(data);
        console.log(`📄 Cache: Analytics data retrieved for ${queryKey}`);
        return cachedData.data;
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Cache: Failed to get analytics data:', error);
      return null;
    }
  }

  /**
   * Cache real-time data with shorter TTL
   */
  async cacheRealTimeData(dataKey, data, ttl = 60) {
    if (!this.isAvailable()) return null;

    try {
      const key = this.generateKey('realtime', dataKey);
      const cacheData = JSON.stringify({
        data,
        cachedAt: new Date().toISOString(),
        ttl
      });

      await this.client.setEx(key, ttl, cacheData);
      
      console.log(`💾 Cache: Real-time data cached for ${dataKey}`);
      return true;
      
    } catch (error) {
      console.error('❌ Cache: Failed to cache real-time data:', error);
      return null;
    }
  }

  /**
   * Get cached real-time data
   */
  async getCachedRealTimeData(dataKey) {
    if (!this.isAvailable()) return null;

    try {
      const key = this.generateKey('realtime', dataKey);
      const data = await this.client.get(key);
      
      if (data) {
        const cachedData = JSON.parse(data);
        return cachedData.data;
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Cache: Failed to get real-time data:', error);
      return null;
    }
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidateCache(pattern) {
    if (!this.isAvailable()) return null;

    try {
      const keys = await this.client.keys(`astralearn:${pattern}*`);
      
      if (keys.length > 0) {
        await this.client.del(keys);
        console.log(`🗑️ Cache: Invalidated ${keys.length} keys matching pattern: ${pattern}`);
        return keys.length;
      }
      
      return 0;
      
    } catch (error) {
      console.error('❌ Cache: Failed to invalidate cache:', error);
      return null;
    }
  }

  /**
   * Clear user-specific cache
   */
  async clearUserCache(userId) {
    if (!this.isAvailable()) return null;

    try {
      const patterns = [
        `session:${userId}`,
        `analytics:user:${userId}`,
        `realtime:user:${userId}`
      ];

      let totalCleared = 0;
      for (const pattern of patterns) {
        const cleared = await this.invalidateCache(pattern);
        totalCleared += cleared || 0;
      }

      console.log(`🗑️ Cache: Cleared ${totalCleared} cache entries for user ${userId}`);
      return totalCleared;
      
    } catch (error) {
      console.error('❌ Cache: Failed to clear user cache:', error);
      return null;
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStatistics() {
    if (!this.isAvailable()) {
      return {
        available: false,
        message: 'Redis cache not available'
      };
    }

    try {
      const info = await this.client.info('memory');
      const stats = await this.client.info('stats');
      const dbsize = await this.client.dbSize();

      // Parse Redis info
      const memoryInfo = this.parseRedisInfo(info);
      const statsInfo = this.parseRedisInfo(stats);

      return {
        available: true,
        connection: this.isConnected,
        totalKeys: dbsize,
        memoryUsage: {
          used: memoryInfo.used_memory_human,
          peak: memoryInfo.used_memory_peak_human,
          rss: memoryInfo.used_memory_rss_human
        },
        operations: {
          totalConnections: statsInfo.total_connections_received,
          totalCommands: statsInfo.total_commands_processed,
          hitRate: this.calculateHitRate(statsInfo)
        },
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Cache: Failed to get statistics:', error);
      return {
        available: false,
        error: error.message
      };
    }
  }

  /**
   * Generate cache key with namespace
   */
  generateKey(...parts) {
    return `astralearn:${parts.join(':')}`;
  }

  /**
   * Hash parameters for consistent cache keys
   */
  hashParams(params) {
    if (!params) return 'no-params';
    
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});

    return Buffer.from(JSON.stringify(sortedParams)).toString('base64');
  }

  /**
   * Parse Redis INFO response
   */
  parseRedisInfo(info) {
    const result = {};
    info.split('\r\n').forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (key && value) {
          result[key] = value;
        }
      }
    });
    return result;
  }

  /**
   * Calculate cache hit rate
   */
  calculateHitRate(stats) {
    const hits = parseInt(stats.keyspace_hits || 0);
    const misses = parseInt(stats.keyspace_misses || 0);
    const total = hits + misses;
    
    if (total === 0) return 0;
    return ((hits / total) * 100).toFixed(2);
  }

  /**
   * Close Redis connection
   */
  async disconnect() {
    if (this.client) {
      try {
        await this.client.disconnect();
        console.log('🔌 Redis Cache: Disconnected successfully');
      } catch (error) {
        console.error('❌ Redis Cache: Error during disconnect:', error);
      }
    }
  }

  /**
   * Health check for Redis cache
   */
  async healthCheck() {
    if (!this.isAvailable()) {
      return {
        status: 'unhealthy',
        message: 'Redis cache not available'
      };
    }

    try {
      const testKey = this.generateKey('health-check', Date.now());
      const testValue = 'health-check-value';
      
      // Test set and get
      await this.client.setEx(testKey, 10, testValue);
      const retrieved = await this.client.get(testKey);
      await this.client.del(testKey);

      if (retrieved === testValue) {
        return {
          status: 'healthy',
          message: 'Redis cache operational',
          latency: await this.measureLatency()
        };
      } else {
        return {
          status: 'unhealthy',
          message: 'Redis cache read/write test failed'
        };
      }
      
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error.message
      };
    }
  }

  /**
   * Measure Redis operation latency
   */
  async measureLatency() {
    const start = Date.now();
    try {
      await this.client.ping();
      return Date.now() - start;
    } catch (error) {
      return -1;
    }
  }
}

// Create singleton instance
const redisCacheService = new RedisCacheService();

export default redisCacheService;
