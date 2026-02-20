import express from 'express';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';

// Import configuration and utilities
import { config } from '@/config/environment.js';
import { databaseManager } from '@/config/database.js';
import { logger, httpLogStream } from '@/utils/logger.js';
import {
  globalErrorHandler,
  notFoundHandler,
  setupUnhandledRejectionHandler,
  setupUncaughtExceptionHandler,
} from '@/utils/errors.js';

// Import middleware
import {
  securityHeaders,
  corsOptions,
  sanitizeRequest,
  generalRateLimit,
} from '@/middleware/security.js';

// Import routes
import { apiRoutes } from '@/routes/index.js';

// Setup global error handlers
setupUnhandledRejectionHandler();
setupUncaughtExceptionHandler();

// Create Express application
const app = express();

// Create HTTP server for WebSocket support
const httpServer = createServer(app);

// Trust proxy (for rate limiting and IP detection)
app.set('trust proxy', 1);

// Security middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(sanitizeRequest);

// Compression middleware
app.use(compression());

// Rate limiting
app.use(generalRateLimit);

// Logging middleware
if (config.server.environment !== 'test') {
  app.use(morgan('combined', { stream: httpLogStream }));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', async (_req, res) => {
  try {
    const dbHealth = await databaseManager.healthCheck();
    
    const healthStatus = {
      status: 'OK',
      message: 'AstraLearn v2 Server is healthy',
      timestamp: new Date().toISOString(),
      environment: config.server.environment,
      version: '2.0.0',
      services: {
        database: dbHealth.status,
        server: 'healthy',
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };

    // Set status code based on overall health
    const statusCode = dbHealth.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'ERROR',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// API routes (placeholder - will be implemented in next steps)
app.get('/api', (_req, res) => {
  res.json({
    message: 'AstraLearn v2 API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: 'GET /health',
      api: 'GET /api/*',
    },
  });
});

// Mount API routes
app.use('/api', apiRoutes);

// 404 handler for API routes
app.use('/api/*', notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

// 404 handler for all other routes
app.use('*', notFoundHandler);

// Server startup function
async function startServer() {
  try {
    logger.info('🚀 Starting AstraLearn v2 Server...');

    // Skip database connection for now
    logger.info('⚠️ Skipping database connection for debugging');

    // Start HTTP server
    const server = httpServer.listen(config.server.port, () => {
      logger.info('✅ AstraLearn v2 Server Started Successfully');
      logger.info(`📍 Environment: ${config.server.environment}`);
      logger.info(`🌐 Server: http://localhost:${config.server.port}`);
      logger.info(`📊 Health: http://localhost:${config.server.port}/health`);
      logger.info(`🔗 API: http://localhost:${config.server.port}/api`);
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string) => {
      logger.info(`🔄 ${signal} received, shutting down gracefully...`);
      
      server.close(async () => {
        logger.info('🔌 HTTP server closed');
        
        try {
          await databaseManager.disconnect();
          logger.info('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('❌ Error during graceful shutdown:', error);
          process.exit(1);
        }
      });

      // Force close after 30 seconds
      setTimeout(() => {
        logger.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    // Setup graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export { app, httpServer, startServer };
