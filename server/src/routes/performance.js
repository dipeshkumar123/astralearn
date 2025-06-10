/**
 * Performance Monitoring API Routes
 * Part of Phase 3 Step 3: Production Optimization & Advanced Features
 */

import { Router } from 'express';
import { auth, authorize } from '../middleware/auth.js';
import performanceMonitorService from '../services/performanceMonitorService.js';
import redisCacheService from '../services/redisCacheService.js';
import webSocketService from '../services/webSocketService.js';

const router = Router();

/**
 * Get performance metrics
 */
router.get('/metrics',
  auth,
  authorize(['admin', 'instructor']),
  async (req, res) => {
    try {
      const { timeframe = 3600000 } = req.query; // Default 1 hour
      
      const metrics = await performanceMonitorService.getPerformanceMetrics(
        parseInt(timeframe)
      );

      res.json({
        success: true,
        metrics,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Performance metrics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve performance metrics',
        message: error.message
      });
    }
  }
);

/**
 * Get performance health summary
 */
router.get('/health',
  auth,
  authorize(['admin', 'instructor']),
  async (req, res) => {
    try {
      const healthSummary = await performanceMonitorService.getHealthSummary();

      res.json({
        success: true,
        health: healthSummary,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Performance health check error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve health summary',
        message: error.message
      });
    }
  }
);

/**
 * Get cache statistics
 */
router.get('/cache/stats',
  auth,
  authorize(['admin']),
  async (req, res) => {
    try {
      const cacheStats = await redisCacheService.getCacheStatistics();

      res.json({
        success: true,
        cache: cacheStats,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Cache statistics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve cache statistics',
        message: error.message
      });
    }
  }
);

/**
 * Clear cache by pattern
 */
router.delete('/cache',
  auth,
  authorize(['admin']),
  async (req, res) => {
    try {
      const { pattern } = req.query;
      
      if (!pattern) {
        return res.status(400).json({
          success: false,
          error: 'Pattern parameter is required'
        });
      }

      const clearedKeys = await redisCacheService.invalidateCache(pattern);

      res.json({
        success: true,
        clearedKeys: clearedKeys || 0,
        pattern,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Cache clear error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear cache',
        message: error.message
      });
    }
  }
);

/**
 * Clear user-specific cache
 */
router.delete('/cache/user/:userId',
  auth,
  authorize(['admin', 'instructor']),
  async (req, res) => {
    try {
      const { userId } = req.params;
      
      const clearedKeys = await redisCacheService.clearUserCache(userId);

      res.json({
        success: true,
        clearedKeys: clearedKeys || 0,
        userId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('User cache clear error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear user cache',
        message: error.message
      });
    }
  }
);

/**
 * Get WebSocket service statistics
 */
router.get('/websocket/stats',
  auth,
  authorize(['admin', 'instructor']),
  async (req, res) => {
    try {
      const wsStats = webSocketService.getStatistics();

      res.json({
        success: true,
        websocket: wsStats,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('WebSocket statistics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve WebSocket statistics',
        message: error.message
      });
    }
  }
);

/**
 * Get real-time performance dashboard data
 */
router.get('/dashboard',
  auth,
  authorize(['admin', 'instructor']),
  async (req, res) => {
    try {
      const { timeframe = 300000 } = req.query; // Default 5 minutes
      
      // Get performance metrics
      const performanceMetrics = await performanceMonitorService.getPerformanceMetrics(
        parseInt(timeframe)
      );

      // Get cache statistics
      const cacheStats = await redisCacheService.getCacheStatistics();

      // Get WebSocket statistics
      const wsStats = webSocketService.getStatistics();

      // Get health summary
      const healthSummary = await performanceMonitorService.getHealthSummary();

      const dashboardData = {
        performance: performanceMetrics,
        cache: cacheStats,
        websocket: wsStats,
        health: healthSummary,
        summary: {
          status: healthSummary.status,
          uptime: performanceMetrics.uptime,
          activeUsers: wsStats.activeUsers,
          requestsPerSecond: performanceMetrics.request.requestsPerSecond,
          averageResponseTime: performanceMetrics.request.averageResponseTime,
          memoryUsage: performanceMetrics.memory.current.usagePercent,
          errorRate: performanceMetrics.error.errorRate,
          cacheHitRate: cacheStats.available ? 
            cacheStats.operations?.hitRate || 0 : 'N/A'
        }
      };

      res.json({
        success: true,
        dashboard: dashboardData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Performance dashboard error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate performance dashboard',
        message: error.message
      });
    }
  }
);

/**
 * Export performance metrics (CSV format)
 */
router.get('/export',
  auth,
  authorize(['admin']),
  async (req, res) => {
    try {
      const { timeframe = 3600000, format = 'json' } = req.query;
      
      const metrics = await performanceMonitorService.getPerformanceMetrics(
        parseInt(timeframe)
      );

      if (format === 'csv') {
        // Convert to CSV format
        const csv = this.convertMetricsToCSV(metrics);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=performance-metrics.csv');
        res.send(csv);
      } else {
        res.json({
          success: true,
          metrics,
          exportedAt: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Performance export error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to export performance metrics',
        message: error.message
      });
    }
  }
);

/**
 * System resource usage
 */
router.get('/system',
  auth,
  authorize(['admin']),
  async (req, res) => {
    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      const systemInfo = {
        memory: {
          rss: formatBytes(memUsage.rss),
          heapUsed: formatBytes(memUsage.heapUsed),
          heapTotal: formatBytes(memUsage.heapTotal),
          external: formatBytes(memUsage.external),
          usagePercent: ((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(2)
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system
        },
        process: {
          uptime: process.uptime(),
          version: process.version,
          platform: process.platform,
          pid: process.pid
        },
        loadAverage: process.loadavg ? process.loadavg() : null,
        timestamp: new Date().toISOString()
      };

      res.json({
        success: true,
        system: systemInfo
      });

    } catch (error) {
      console.error('System info error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve system information',
        message: error.message
      });
    }
  }
);

/**
 * Health check endpoint for all services
 */
router.get('/health/all',
  async (req, res) => {
    try {
      const healthChecks = {
        performance: await performanceMonitorService.getHealthSummary(),
        cache: await redisCacheService.healthCheck(),
        websocket: webSocketService.healthCheck(),
        database: await checkDatabaseHealth(),
        timestamp: new Date().toISOString()
      };

      const overallStatus = Object.values(healthChecks)
        .filter(check => check.status)
        .every(check => check.status === 'healthy') ? 'healthy' : 'degraded';

      res.json({
        success: true,
        status: overallStatus,
        services: healthChecks
      });

    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({
        success: false,
        status: 'unhealthy',
        error: error.message
      });
    }
  }
);

/**
 * Performance alerts endpoint
 */
router.get('/alerts',
  auth,
  authorize(['admin', 'instructor']),
  async (req, res) => {
    try {
      const { timeframe = 3600000 } = req.query;
      
      const metrics = await performanceMonitorService.getPerformanceMetrics(
        parseInt(timeframe)
      );

      res.json({
        success: true,
        alerts: metrics.alerts || [],
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Performance alerts error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve performance alerts',
        message: error.message
      });
    }
  }
);

/**
 * Utility functions
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function convertMetricsToCSV(metrics) {
  // Simple CSV conversion - can be enhanced
  const headers = [
    'Timestamp',
    'Average Response Time',
    'Memory Usage (%)',
    'Error Rate (%)',
    'Requests Per Second',
    'Total Requests'
  ];

  const row = [
    new Date().toISOString(),
    metrics.request.averageResponseTime,
    metrics.memory.current.usagePercent,
    metrics.error.errorRate,
    metrics.request.requestsPerSecond,
    metrics.request.total
  ];

  return [headers.join(','), row.join(',')].join('\n');
}

async function checkDatabaseHealth() {
  try {
    const DatabaseManager = (await import('../config/database.js')).default;
    const dbManager = DatabaseManager.getInstance();
    
    return {
      status: dbManager.isConnected() ? 'healthy' : 'unhealthy',
      connection: dbManager.isConnected()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

export default router;
