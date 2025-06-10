/**
 * Performance Monitor Service for AstraLearn
 * Part of Phase 3 Step 3: Production Optimization & Advanced Features
 * 
 * Provides comprehensive performance monitoring including:
 * - Request/response time tracking
 * - Memory usage monitoring
 * - Database query performance
 * - Error rate tracking
 * - Real-time performance metrics
 */

import { performance } from 'perf_hooks';
import redisCacheService from './redisCacheService.js';

class PerformanceMonitorService {
  constructor() {
    this.metrics = {
      requests: new Map(),
      database: new Map(),
      memory: [],
      errors: [],
      cache: new Map()
    };
    
    this.startTime = Date.now();
    this.requestCount = 0;
    this.errorCount = 0;
      // Performance thresholds
    this.thresholds = {
      slowRequest: 1000,      // 1 second
      slowDbQuery: 500,       // 0.5 seconds
      highMemoryUsage: process.env.NODE_ENV === 'production' ? 85 : 95,    // 95% in dev, 85% in production
      highErrorRate: 0.05     // 5% error rate
    };

    this.initializeMonitoring();
  }

  /**
   * Initialize performance monitoring
   */
  initializeMonitoring() {
    // Start memory monitoring
    this.startMemoryMonitoring();
    
    // Clean old metrics every 5 minutes
    setInterval(() => {
      this.cleanOldMetrics();
    }, 5 * 60 * 1000);

    console.log('📊 Performance Monitor: Initialized successfully');
  }

  /**
   * Start monitoring memory usage
   */
  startMemoryMonitoring() {
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const timestamp = Date.now();
      
      this.metrics.memory.push({
        timestamp,
        rss: memUsage.rss,
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers
      });

      // Keep only last 100 memory snapshots
      if (this.metrics.memory.length > 100) {
        this.metrics.memory = this.metrics.memory.slice(-100);
      }

      // Check for high memory usage
      const memoryUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
      if (memoryUsagePercent > this.thresholds.highMemoryUsage) {
        this.logAlert('HIGH_MEMORY_USAGE', {
          usage: memoryUsagePercent.toFixed(2),
          heapUsed: this.formatBytes(memUsage.heapUsed),
          heapTotal: this.formatBytes(memUsage.heapTotal)
        });
      }
      
    }, 30000); // Every 30 seconds
  }

  /**
   * Middleware for Express to track request performance
   */
  trackRequest() {
    return (req, res, next) => {
      const requestId = this.generateRequestId();
      const startTime = performance.now();
      
      req.performanceId = requestId;
      req.startTime = startTime;
      
      // Track request start
      this.metrics.requests.set(requestId, {
        method: req.method,
        url: req.originalUrl,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        startTime,
        timestamp: Date.now()
      });

      // Override res.end to capture response time
      const originalEnd = res.end;
      res.end = (...args) => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.recordRequest(requestId, {
          statusCode: res.statusCode,
          duration,
          contentLength: res.get('Content-Length') || 0
        });
        
        originalEnd.apply(res, args);
      };

      next();
    };
  }

  /**
   * Record completed request metrics
   */
  recordRequest(requestId, responseData) {
    const requestData = this.metrics.requests.get(requestId);
    if (!requestData) return;

    const completeData = {
      ...requestData,
      ...responseData,
      endTime: performance.now()
    };

    this.requestCount++;
    
    // Check for slow requests
    if (responseData.duration > this.thresholds.slowRequest) {
      this.logAlert('SLOW_REQUEST', {
        url: requestData.url,
        method: requestData.method,
        duration: responseData.duration.toFixed(2)
      });
    }

    // Track error rates
    if (responseData.statusCode >= 400) {
      this.errorCount++;
      this.recordError({
        type: 'HTTP_ERROR',
        statusCode: responseData.statusCode,
        url: requestData.url,
        method: requestData.method,
        duration: responseData.duration
      });
    }

    // Cache performance data
    this.cachePerformanceData(completeData);
    
    // Update request data
    this.metrics.requests.set(requestId, completeData);
  }

  /**
   * Track database query performance
   */
  async trackDatabaseQuery(operation, query, executor) {
    const queryId = this.generateQueryId();
    const startTime = performance.now();
    
    try {
      const result = await executor();
      const duration = performance.now() - startTime;
      
      this.metrics.database.set(queryId, {
        operation,
        query: this.sanitizeQuery(query),
        duration,
        success: true,
        timestamp: Date.now()
      });

      // Check for slow queries
      if (duration > this.thresholds.slowDbQuery) {
        this.logAlert('SLOW_DATABASE_QUERY', {
          operation,
          duration: duration.toFixed(2),
          query: this.sanitizeQuery(query, 100)
        });
      }

      return result;
      
    } catch (error) {
      const duration = performance.now() - startTime;
      
      this.metrics.database.set(queryId, {
        operation,
        query: this.sanitizeQuery(query),
        duration,
        success: false,
        error: error.message,
        timestamp: Date.now()
      });

      this.recordError({
        type: 'DATABASE_ERROR',
        operation,
        error: error.message,
        duration
      });

      throw error;
    }
  }

  /**
   * Record error for tracking
   */
  recordError(errorData) {
    this.metrics.errors.push({
      ...errorData,
      timestamp: Date.now()
    });

    // Keep only last 1000 errors
    if (this.metrics.errors.length > 1000) {
      this.metrics.errors = this.metrics.errors.slice(-1000);
    }

    // Check error rate
    const recentErrors = this.getRecentErrors(5 * 60 * 1000); // Last 5 minutes
    const recentRequests = this.getRecentRequests(5 * 60 * 1000);
    
    if (recentRequests > 10) { // Only check if we have meaningful data
      const errorRate = recentErrors / recentRequests;
      if (errorRate > this.thresholds.highErrorRate) {
        this.logAlert('HIGH_ERROR_RATE', {
          errorRate: (errorRate * 100).toFixed(2),
          recentErrors,
          recentRequests
        });
      }
    }
  }

  /**
   * Track cache performance
   */
  trackCacheOperation(operation, key, hit = false, duration = 0) {
    const cacheId = `${operation}_${Date.now()}`;
    
    this.metrics.cache.set(cacheId, {
      operation,
      key: this.sanitizeKey(key),
      hit,
      duration,
      timestamp: Date.now()
    });

    // Keep only last 1000 cache operations
    if (this.metrics.cache.size > 1000) {
      const entries = Array.from(this.metrics.cache.entries());
      this.metrics.cache.clear();
      entries.slice(-1000).forEach(([k, v]) => {
        this.metrics.cache.set(k, v);
      });
    }
  }

  /**
   * Get comprehensive performance metrics
   */
  async getPerformanceMetrics(timeframe = 3600000) { // Default 1 hour
    const now = Date.now();
    const since = now - timeframe;

    // Request metrics
    const requestMetrics = this.calculateRequestMetrics(since);
    
    // Database metrics
    const databaseMetrics = this.calculateDatabaseMetrics(since);
    
    // Memory metrics
    const memoryMetrics = this.calculateMemoryMetrics();
    
    // Error metrics
    const errorMetrics = this.calculateErrorMetrics(since);
    
    // Cache metrics
    const cacheMetrics = this.calculateCacheMetrics(since);
    
    // System metrics
    const systemMetrics = await this.getSystemMetrics();

    return {
      timestamp: new Date().toISOString(),
      timeframe,
      uptime: now - this.startTime,
      request: requestMetrics,
      database: databaseMetrics,
      memory: memoryMetrics,
      error: errorMetrics,
      cache: cacheMetrics,
      system: systemMetrics,
      alerts: this.getRecentAlerts(timeframe)
    };
  }

  /**
   * Calculate request metrics
   */
  calculateRequestMetrics(since) {
    const recentRequests = Array.from(this.metrics.requests.values())
      .filter(req => req.timestamp >= since && req.endTime);

    const totalRequests = recentRequests.length;
    const totalDuration = recentRequests.reduce((sum, req) => sum + req.duration, 0);
    
    const statusCodes = {};
    recentRequests.forEach(req => {
      const code = req.statusCode || 'unknown';
      statusCodes[code] = (statusCodes[code] || 0) + 1;
    });

    const durations = recentRequests.map(req => req.duration).sort((a, b) => a - b);
    
    return {
      total: totalRequests,
      averageResponseTime: totalRequests > 0 ? (totalDuration / totalRequests).toFixed(2) : 0,
      medianResponseTime: this.calculateMedian(durations),
      p95ResponseTime: this.calculatePercentile(durations, 95),
      p99ResponseTime: this.calculatePercentile(durations, 99),
      requestsPerSecond: totalRequests > 0 ? (totalRequests / (Date.now() - since) * 1000).toFixed(2) : 0,
      statusCodes,
      slowRequests: recentRequests.filter(req => req.duration > this.thresholds.slowRequest).length
    };
  }

  /**
   * Calculate database metrics
   */
  calculateDatabaseMetrics(since) {
    const recentQueries = Array.from(this.metrics.database.values())
      .filter(query => query.timestamp >= since);

    const totalQueries = recentQueries.length;
    const successfulQueries = recentQueries.filter(q => q.success).length;
    const failedQueries = totalQueries - successfulQueries;
    
    const durations = recentQueries.map(q => q.duration);
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);

    return {
      total: totalQueries,
      successful: successfulQueries,
      failed: failedQueries,
      successRate: totalQueries > 0 ? ((successfulQueries / totalQueries) * 100).toFixed(2) : 100,
      averageQueryTime: totalQueries > 0 ? (totalDuration / totalQueries).toFixed(2) : 0,
      slowQueries: recentQueries.filter(q => q.duration > this.thresholds.slowDbQuery).length
    };
  }
  /**
   * Calculate memory metrics
   */
  calculateMemoryMetrics() {
    if (this.metrics.memory.length === 0) {
      // Return default memory metrics if no data available yet
      const currentMemUsage = process.memoryUsage();
      const memoryUsagePercent = (currentMemUsage.heapUsed / currentMemUsage.heapTotal) * 100;
      
      return {
        current: {
          rss: this.formatBytes(currentMemUsage.rss),
          heapUsed: this.formatBytes(currentMemUsage.heapUsed),
          heapTotal: this.formatBytes(currentMemUsage.heapTotal),
          external: this.formatBytes(currentMemUsage.external),
          usagePercent: memoryUsagePercent.toFixed(2)
        },
        trend: 'stable'
      };
    }

    const latest = this.metrics.memory[this.metrics.memory.length - 1];
    const memoryUsagePercent = (latest.heapUsed / latest.heapTotal) * 100;

    return {
      current: {
        rss: this.formatBytes(latest.rss),
        heapUsed: this.formatBytes(latest.heapUsed),
        heapTotal: this.formatBytes(latest.heapTotal),
        external: this.formatBytes(latest.external),
        usagePercent: memoryUsagePercent.toFixed(2)
      },
      trend: this.calculateMemoryTrend()
    };
  }

  /**
   * Calculate error metrics
   */
  calculateErrorMetrics(since) {
    const recentErrors = this.metrics.errors.filter(error => error.timestamp >= since);
    const errorsByType = {};
    
    recentErrors.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
    });

    return {
      total: recentErrors.length,
      errorRate: this.requestCount > 0 ? ((this.errorCount / this.requestCount) * 100).toFixed(2) : 0,
      byType: errorsByType,
      recent: recentErrors.slice(-10) // Last 10 errors
    };
  }

  /**
   * Calculate cache metrics
   */
  calculateCacheMetrics(since) {
    const recentCacheOps = Array.from(this.metrics.cache.values())
      .filter(op => op.timestamp >= since);

    const hits = recentCacheOps.filter(op => op.hit).length;
    const total = recentCacheOps.length;
    
    return {
      total,
      hits,
      misses: total - hits,
      hitRate: total > 0 ? ((hits / total) * 100).toFixed(2) : 0,
      averageResponseTime: this.calculateAverageResponseTime(recentCacheOps)
    };
  }

  /**
   * Get system metrics
   */
  async getSystemMetrics() {
    const cpuUsage = process.cpuUsage();
    
    return {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      cpuUsage: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      loadAverage: process.loadavg ? process.loadavg() : null
    };
  }

  /**
   * Cache performance data to Redis
   */
  async cachePerformanceData(data) {
    try {
      await redisCacheService.cacheRealTimeData(
        `performance:${data.url}:${data.method}`,
        {
          duration: data.duration,
          statusCode: data.statusCode,
          timestamp: data.timestamp
        },
        300 // 5 minutes TTL
      );
    } catch (error) {
      // Silently fail if caching is not available
    }
  }

  /**
   * Log performance alert
   */
  logAlert(type, data) {
    const alert = {
      type,
      data,
      timestamp: new Date().toISOString()
    };

    console.warn(`⚠️ Performance Alert [${type}]:`, data);

    // Store alert for monitoring dashboard
    if (!this.alerts) this.alerts = [];
    this.alerts.push(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  /**
   * Utility functions
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateQueryId() {
    return `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  sanitizeQuery(query, maxLength = 200) {
    if (typeof query === 'string') {
      return query.length > maxLength ? query.substring(0, maxLength) + '...' : query;
    }
    if (typeof query === 'object') {
      const str = JSON.stringify(query);
      return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
    }
    return String(query);
  }

  sanitizeKey(key) {
    return typeof key === 'string' ? key.substring(0, 100) : String(key).substring(0, 100);
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  calculateMedian(arr) {
    if (arr.length === 0) return 0;
    const sorted = arr.sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? 
      ((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2) : 
      sorted[mid].toFixed(2);
  }

  calculatePercentile(arr, percentile) {
    if (arr.length === 0) return 0;
    const index = Math.ceil((percentile / 100) * arr.length) - 1;
    return arr[index] ? arr[index].toFixed(2) : 0;
  }

  calculateMemoryTrend() {
    if (this.metrics.memory.length < 2) return 'stable';
    
    const recent = this.metrics.memory.slice(-10);
    const first = recent[0].heapUsed;
    const last = recent[recent.length - 1].heapUsed;
    
    const change = ((last - first) / first) * 100;
    
    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  }

  calculateAverageResponseTime(operations) {
    if (operations.length === 0) return 0;
    const total = operations.reduce((sum, op) => sum + op.duration, 0);
    return (total / operations.length).toFixed(2);
  }

  getRecentErrors(timeframe) {
    const since = Date.now() - timeframe;
    return this.metrics.errors.filter(error => error.timestamp >= since).length;
  }

  getRecentRequests(timeframe) {
    const since = Date.now() - timeframe;
    return Array.from(this.metrics.requests.values())
      .filter(req => req.timestamp >= since).length;
  }

  getRecentAlerts(timeframe) {
    if (!this.alerts) return [];
    const since = Date.now() - timeframe;
    return this.alerts.filter(alert => new Date(alert.timestamp).getTime() >= since);
  }

  cleanOldMetrics() {
    const oneHourAgo = Date.now() - 3600000;
    
    // Clean old requests
    for (const [id, request] of this.metrics.requests.entries()) {
      if (request.timestamp < oneHourAgo) {
        this.metrics.requests.delete(id);
      }
    }

    // Clean old database queries
    for (const [id, query] of this.metrics.database.entries()) {
      if (query.timestamp < oneHourAgo) {
        this.metrics.database.delete(id);
      }
    }

    // Clean old errors
    this.metrics.errors = this.metrics.errors.filter(error => error.timestamp >= oneHourAgo);
    
    console.log('🧹 Performance Monitor: Cleaned old metrics');
  }
  /**
   * Get performance summary for health checks
   */
  async getHealthSummary() {
    try {
      const metrics = await this.getPerformanceMetrics(300000); // Last 5 minutes
      
      const issues = [];
      
      // Check request performance
      if (metrics.request && parseFloat(metrics.request.averageResponseTime) > this.thresholds.slowRequest) {
        issues.push('Slow average response time');
      }
      
      // Check memory usage (with null safety)
      const memoryUsage = metrics.memory?.current?.usagePercent;
      if (memoryUsage && parseFloat(memoryUsage) > this.thresholds.highMemoryUsage) {
        issues.push('High memory usage');
      }
      
      // Check error rate
      if (metrics.error && parseFloat(metrics.error.errorRate) > this.thresholds.highErrorRate * 100) {
        issues.push('High error rate');
      }

      return {
        status: issues.length === 0 ? 'healthy' : 'degraded',
        issues,
        metrics: {
          averageResponseTime: metrics.request?.averageResponseTime || '0',
          memoryUsage: memoryUsage || '0',
          errorRate: metrics.error?.errorRate || '0',
          uptime: metrics.uptime || 0
        }
      };
    } catch (error) {
      console.error('Performance health check error:', error);
      return {
        status: 'error',
        issues: ['Performance monitoring service error'],
        metrics: {
          averageResponseTime: '0',
          memoryUsage: '0',
          errorRate: '0',
          uptime: 0
        },
        error: error.message
      };
    }
  }
}

// Create singleton instance
const performanceMonitorService = new PerformanceMonitorService();

export default performanceMonitorService;
