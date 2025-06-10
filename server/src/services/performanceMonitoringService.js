/**
 * Performance Monitoring Service - Phase 3 Step 3
 * Real User Monitoring (RUM) and Application Performance Monitoring (APM)
 */

import os from 'os';
import process from 'process';
import { EventEmitter } from 'events';
import { redisCacheService } from './redisCacheService.js';

class PerformanceMonitoringService extends EventEmitter {
  constructor() {
    super();
    this.metrics = new Map();
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.metricsHistory = [];
    this.maxHistorySize = 1000;
    
    // Performance thresholds
    this.thresholds = {
      cpu: 80, // 80% CPU usage
      memory: 85, // 85% memory usage
      responseTime: 2000, // 2 seconds
      errorRate: 5, // 5% error rate
      throughput: 100, // requests per minute
    };

    // Metrics collection configuration
    this.collectInterval = 5000; // 5 seconds
    this.aggregationWindow = 60000; // 1 minute
    
    this.initializeMetrics();
  }

  /**
   * Initialize performance metrics collection
   */
  initializeMetrics() {
    this.metrics.set('requests', {
      total: 0,
      successful: 0,
      failed: 0,
      averageResponseTime: 0,
      responseTimes: [],
      endpoints: new Map(),
    });

    this.metrics.set('system', {
      cpuUsage: 0,
      memoryUsage: 0,
      heapUsage: 0,
      uptime: 0,
      loadAverage: [],
    });

    this.metrics.set('database', {
      queries: 0,
      averageQueryTime: 0,
      queryTimes: [],
      connections: 0,
      errors: 0,
    });

    this.metrics.set('cache', {
      hits: 0,
      misses: 0,
      hitRate: 0,
      operations: 0,
    });

    this.metrics.set('errors', {
      total: 0,
      byType: new Map(),
      byEndpoint: new Map(),
      recent: [],
    });
  }

  /**
   * Start performance monitoring
   */
  startMonitoring() {
    if (this.isMonitoring) {
      console.log('⚠️ Performance monitoring is already running');
      return;
    }

    console.log('🚀 Starting performance monitoring...');
    this.isMonitoring = true;

    // Start system metrics collection
    this.monitoringInterval = setInterval(() => {
      this.collectSystemMetrics();
      this.checkThresholds();
      this.aggregateMetrics();
    }, this.collectInterval);

    // Setup process event listeners
    this.setupProcessListeners();

    console.log('✅ Performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) {
      console.log('⚠️ Performance monitoring is not running');
      return;
    }

    console.log('🛑 Stopping performance monitoring...');
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('✅ Performance monitoring stopped');
  }

  /**
   * Collect system metrics
   */
  collectSystemMetrics() {
    const systemMetrics = this.metrics.get('system');
    
    // CPU usage
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const cpuUsage = 100 - ~~(100 * idle / total);

    // Memory usage
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = (usedMemory / totalMemory) * 100;

    // Heap usage
    const heapUsed = process.memoryUsage();
    const heapUsage = (heapUsed.heapUsed / heapUsed.heapTotal) * 100;

    // Update metrics
    systemMetrics.cpuUsage = cpuUsage;
    systemMetrics.memoryUsage = memoryUsage;
    systemMetrics.heapUsage = heapUsage;
    systemMetrics.uptime = process.uptime();
    systemMetrics.loadAverage = os.loadavg();

    // Store in history
    this.addToHistory('system', {
      timestamp: new Date().toISOString(),
      cpuUsage,
      memoryUsage,
      heapUsage,
      uptime: systemMetrics.uptime,
      loadAverage: systemMetrics.loadAverage,
    });
  }

  /**
   * Track HTTP request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {number} responseTime - Response time in milliseconds
   */
  trackRequest(req, res, responseTime) {
    const requestMetrics = this.metrics.get('requests');
    const endpoint = `${req.method} ${req.route?.path || req.path}`;
    
    requestMetrics.total++;
    
    if (res.statusCode >= 200 && res.statusCode < 400) {
      requestMetrics.successful++;
    } else {
      requestMetrics.failed++;
    }

    // Track response time
    requestMetrics.responseTimes.push(responseTime);
    if (requestMetrics.responseTimes.length > 100) {
      requestMetrics.responseTimes.shift();
    }

    // Calculate average response time
    requestMetrics.averageResponseTime = 
      requestMetrics.responseTimes.reduce((a, b) => a + b, 0) / 
      requestMetrics.responseTimes.length;

    // Track by endpoint
    if (!requestMetrics.endpoints.has(endpoint)) {
      requestMetrics.endpoints.set(endpoint, {
        count: 0,
        totalTime: 0,
        averageTime: 0,
        errors: 0,
      });
    }

    const endpointMetrics = requestMetrics.endpoints.get(endpoint);
    endpointMetrics.count++;
    endpointMetrics.totalTime += responseTime;
    endpointMetrics.averageTime = endpointMetrics.totalTime / endpointMetrics.count;

    if (res.statusCode >= 400) {
      endpointMetrics.errors++;
    }

    // Store in history
    this.addToHistory('request', {
      timestamp: new Date().toISOString(),
      endpoint,
      method: req.method,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });

    // Emit event for real-time monitoring
    this.emit('request', {
      endpoint,
      responseTime,
      statusCode: res.statusCode,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track database query
   * @param {string} query - SQL query or operation name
   * @param {number} executionTime - Execution time in milliseconds
   * @param {boolean} success - Whether the query was successful
   */
  trackDatabaseQuery(query, executionTime, success = true) {
    const dbMetrics = this.metrics.get('database');
    
    dbMetrics.queries++;
    dbMetrics.queryTimes.push(executionTime);
    
    if (dbMetrics.queryTimes.length > 100) {
      dbMetrics.queryTimes.shift();
    }

    dbMetrics.averageQueryTime = 
      dbMetrics.queryTimes.reduce((a, b) => a + b, 0) / 
      dbMetrics.queryTimes.length;

    if (!success) {
      dbMetrics.errors++;
    }

    // Store in history
    this.addToHistory('database', {
      timestamp: new Date().toISOString(),
      query: query.substring(0, 100), // Truncate for privacy
      executionTime,
      success,
    });
  }

  /**
   * Track cache operation
   * @param {string} operation - Cache operation (hit, miss, set, delete)
   * @param {string} key - Cache key
   */
  trackCacheOperation(operation, key) {
    const cacheMetrics = this.metrics.get('cache');
    
    cacheMetrics.operations++;
    
    if (operation === 'hit') {
      cacheMetrics.hits++;
    } else if (operation === 'miss') {
      cacheMetrics.misses++;
    }

    // Calculate hit rate
    const totalHitMiss = cacheMetrics.hits + cacheMetrics.misses;
    if (totalHitMiss > 0) {
      cacheMetrics.hitRate = (cacheMetrics.hits / totalHitMiss) * 100;
    }

    // Store in history
    this.addToHistory('cache', {
      timestamp: new Date().toISOString(),
      operation,
      key: key.substring(0, 50), // Truncate for privacy
    });
  }

  /**
   * Track error
   * @param {Error} error - Error object
   * @param {Object} context - Additional context
   */
  trackError(error, context = {}) {
    const errorMetrics = this.metrics.get('errors');
    
    errorMetrics.total++;
    
    // Track by error type
    const errorType = error.constructor.name;
    if (!errorMetrics.byType.has(errorType)) {
      errorMetrics.byType.set(errorType, 0);
    }
    errorMetrics.byType.set(errorType, errorMetrics.byType.get(errorType) + 1);

    // Track by endpoint if available
    if (context.endpoint) {
      if (!errorMetrics.byEndpoint.has(context.endpoint)) {
        errorMetrics.byEndpoint.set(context.endpoint, 0);
      }
      errorMetrics.byEndpoint.set(context.endpoint, 
        errorMetrics.byEndpoint.get(context.endpoint) + 1);
    }

    // Store recent errors
    const errorDetails = {
      timestamp: new Date().toISOString(),
      type: errorType,
      message: error.message,
      stack: error.stack?.substring(0, 500), // Truncate stack trace
      context,
    };

    errorMetrics.recent.push(errorDetails);
    if (errorMetrics.recent.length > 50) {
      errorMetrics.recent.shift();
    }

    // Store in history
    this.addToHistory('error', errorDetails);

    // Emit event for real-time monitoring
    this.emit('error', errorDetails);
  }

  /**
   * Check performance thresholds and emit alerts
   */
  checkThresholds() {
    const systemMetrics = this.metrics.get('system');
    const requestMetrics = this.metrics.get('requests');

    // Check CPU usage
    if (systemMetrics.cpuUsage > this.thresholds.cpu) {
      this.emitAlert('cpu_high', {
        current: systemMetrics.cpuUsage,
        threshold: this.thresholds.cpu,
        message: `High CPU usage: ${systemMetrics.cpuUsage.toFixed(2)}%`,
      });
    }

    // Check memory usage
    if (systemMetrics.memoryUsage > this.thresholds.memory) {
      this.emitAlert('memory_high', {
        current: systemMetrics.memoryUsage,
        threshold: this.thresholds.memory,
        message: `High memory usage: ${systemMetrics.memoryUsage.toFixed(2)}%`,
      });
    }

    // Check response time
    if (requestMetrics.averageResponseTime > this.thresholds.responseTime) {
      this.emitAlert('response_time_high', {
        current: requestMetrics.averageResponseTime,
        threshold: this.thresholds.responseTime,
        message: `High response time: ${requestMetrics.averageResponseTime.toFixed(2)}ms`,
      });
    }

    // Check error rate
    const errorRate = requestMetrics.total > 0 ? 
      (requestMetrics.failed / requestMetrics.total) * 100 : 0;
    
    if (errorRate > this.thresholds.errorRate) {
      this.emitAlert('error_rate_high', {
        current: errorRate,
        threshold: this.thresholds.errorRate,
        message: `High error rate: ${errorRate.toFixed(2)}%`,
      });
    }
  }

  /**
   * Emit performance alert
   * @param {string} type - Alert type
   * @param {Object} data - Alert data
   */
  emitAlert(type, data) {
    const alert = {
      type,
      timestamp: new Date().toISOString(),
      severity: this.getAlertSeverity(type, data),
      ...data,
    };

    console.warn(`⚠️ Performance Alert [${type}]: ${data.message}`);
    this.emit('alert', alert);

    // Store alert in history
    this.addToHistory('alert', alert);
  }

  /**
   * Get alert severity based on type and data
   * @param {string} type - Alert type
   * @param {Object} data - Alert data
   */
  getAlertSeverity(type, data) {
    const ratio = data.current / data.threshold;
    
    if (ratio >= 2) return 'critical';
    if (ratio >= 1.5) return 'high';
    if (ratio >= 1.2) return 'medium';
    return 'low';
  }

  /**
   * Add metrics to history
   * @param {string} type - Metrics type
   * @param {Object} data - Metrics data
   */
  addToHistory(type, data) {
    this.metricsHistory.push({
      type,
      timestamp: new Date().toISOString(),
      data,
    });

    // Limit history size
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.shift();
    }
  }

  /**
   * Aggregate metrics over time window
   */
  aggregateMetrics() {
    const now = Date.now();
    const windowStart = now - this.aggregationWindow;

    // Filter recent metrics
    const recentMetrics = this.metricsHistory.filter(
      metric => new Date(metric.timestamp).getTime() >= windowStart
    );

    // Aggregate by type
    const aggregated = {};
    for (const metric of recentMetrics) {
      if (!aggregated[metric.type]) {
        aggregated[metric.type] = [];
      }
      aggregated[metric.type].push(metric.data);
    }

    // Store aggregated metrics in cache
    redisCacheService.cacheAnalyticsData(
      `performance_metrics_${Math.floor(now / this.aggregationWindow)}`,
      aggregated,
      3600 // 1 hour TTL
    );
  }

  /**
   * Setup process event listeners
   */
  setupProcessListeners() {
    process.on('uncaughtException', (error) => {
      this.trackError(error, { type: 'uncaughtException' });
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.trackError(new Error(reason), { 
        type: 'unhandledRejection',
        promise: promise.toString(),
      });
    });
  }

  /**
   * Get current metrics snapshot
   */
  getMetricsSnapshot() {
    const snapshot = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      metrics: {},
    };

    // Convert Maps to Objects for JSON serialization
    for (const [key, value] of this.metrics.entries()) {
      snapshot.metrics[key] = this.serializeMetric(value);
    }

    return snapshot;
  }

  /**
   * Serialize metric object (convert Maps to Objects)
   * @param {Object} metric - Metric object
   */
  serializeMetric(metric) {
    const serialized = { ...metric };
    
    for (const [key, value] of Object.entries(serialized)) {
      if (value instanceof Map) {
        serialized[key] = Object.fromEntries(value);
      }
    }
    
    return serialized;
  }

  /**
   * Get performance report
   * @param {number} timeframe - Timeframe in milliseconds
   */
  getPerformanceReport(timeframe = 3600000) { // 1 hour default
    const now = Date.now();
    const start = now - timeframe;
    
    const relevantMetrics = this.metricsHistory.filter(
      metric => new Date(metric.timestamp).getTime() >= start
    );

    const report = {
      timeframe: {
        start: new Date(start).toISOString(),
        end: new Date(now).toISOString(),
        duration: timeframe,
      },
      summary: this.getMetricsSnapshot(),
      trends: this.calculateTrends(relevantMetrics),
      alerts: relevantMetrics.filter(m => m.type === 'alert'),
      recommendations: this.generateRecommendations(),
    };

    return report;
  }

  /**
   * Calculate performance trends
   * @param {Array} metrics - Metrics array
   */
  calculateTrends(metrics) {
    const trends = {};
    
    // Group metrics by type
    const grouped = {};
    for (const metric of metrics) {
      if (!grouped[metric.type]) {
        grouped[metric.type] = [];
      }
      grouped[metric.type].push(metric);
    }

    // Calculate trends for each type
    for (const [type, typeMetrics] of Object.entries(grouped)) {
      if (typeMetrics.length >= 2) {
        const latest = typeMetrics[typeMetrics.length - 1];
        const previous = typeMetrics[0];
        
        trends[type] = {
          direction: this.calculateTrendDirection(typeMetrics),
          change: this.calculateTrendChange(previous, latest),
          stability: this.calculateStability(typeMetrics),
        };
      }
    }

    return trends;
  }

  /**
   * Calculate trend direction
   * @param {Array} metrics - Metrics array
   */
  calculateTrendDirection(metrics) {
    if (metrics.length < 2) return 'stable';
    
    const first = metrics[0];
    const last = metrics[metrics.length - 1];
    
    // This is a simplified calculation - in practice, you'd want more sophisticated trend analysis
    if (last.timestamp > first.timestamp) {
      return 'improving';
    } else if (last.timestamp < first.timestamp) {
      return 'degrading';
    }
    return 'stable';
  }

  /**
   * Calculate trend change percentage
   * @param {Object} previous - Previous metric
   * @param {Object} current - Current metric
   */
  calculateTrendChange(previous, current) {
    // Simplified calculation - would need type-specific logic
    return {
      timestamp: {
        previous: previous.timestamp,
        current: current.timestamp,
      },
    };
  }

  /**
   * Calculate stability score
   * @param {Array} metrics - Metrics array
   */
  calculateStability(metrics) {
    if (metrics.length < 3) return 'unknown';
    
    // Simplified stability calculation
    const variance = this.calculateVariance(metrics);
    
    if (variance < 0.1) return 'stable';
    if (variance < 0.3) return 'moderate';
    return 'volatile';
  }

  /**
   * Calculate variance (simplified)
   * @param {Array} metrics - Metrics array
   */
  calculateVariance(metrics) {
    // This is a placeholder - real implementation would calculate actual variance
    return Math.random() * 0.5; // Random value for demo
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    const systemMetrics = this.metrics.get('system');
    const requestMetrics = this.metrics.get('requests');
    const cacheMetrics = this.metrics.get('cache');

    // CPU recommendations
    if (systemMetrics.cpuUsage > 70) {
      recommendations.push({
        type: 'optimization',
        priority: 'high',
        category: 'cpu',
        message: 'Consider implementing CPU-intensive task queuing or scaling horizontally',
        impact: 'high',
      });
    }

    // Memory recommendations
    if (systemMetrics.memoryUsage > 80) {
      recommendations.push({
        type: 'optimization',
        priority: 'high',
        category: 'memory',
        message: 'Review memory usage patterns and implement memory optimization strategies',
        impact: 'high',
      });
    }

    // Response time recommendations
    if (requestMetrics.averageResponseTime > 1000) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        category: 'response_time',
        message: 'Consider implementing response caching or optimizing database queries',
        impact: 'medium',
      });
    }

    // Cache recommendations
    if (cacheMetrics.hitRate < 80) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        category: 'cache',
        message: 'Review caching strategy and consider increasing cache TTL for stable data',
        impact: 'medium',
      });
    }

    return recommendations;
  }
}

// Create and export singleton instance
export const performanceMonitoringService = new PerformanceMonitoringService();
export default performanceMonitoringService;
