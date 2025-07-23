import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { config } from './config/environment';
import { logger } from './utils/logger';
import { simpleAuthRoutes } from './routes/simpleAuth';

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Compression
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    message: 'AstraLearn v2 Simple Server is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: config.server.environment,
  });
});

// API info endpoint
app.get('/api', (_req, res) => {
  res.json({
    message: 'AstraLearn v2 Simple API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: 'GET /health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/me',
        users: 'GET /api/auth/users',
      },
    },
  });
});

// Mount auth routes
app.use('/api/auth', simpleAuthRoutes);

// 404 handler for API routes
app.use('/api/*', (_req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: 'API endpoint not found',
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: error.code || 'INTERNAL_ERROR',
    message: error.message || 'Internal server error',
    timestamp: new Date().toISOString(),
    ...(config.server.environment === 'development' && { stack: error.stack }),
  });
});

// 404 handler for all other routes
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: 'Route not found',
    timestamp: new Date().toISOString(),
  });
});

// Start server
const startSimpleServer = async () => {
  try {
    logger.info('🚀 Starting AstraLearn v2 Simple Server...');

    const server = app.listen(config.server.port, () => {
      logger.info('✅ AstraLearn v2 Simple Server Started Successfully');
      logger.info(`📍 Environment: ${config.server.environment}`);
      logger.info(`🌐 Server: http://localhost:${config.server.port}`);
      logger.info(`📊 Health: http://localhost:${config.server.port}/health`);
      logger.info(`🔗 API: http://localhost:${config.server.port}/api`);
      logger.info(`🔐 Auth: http://localhost:${config.server.port}/api/auth`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`🛑 Received ${signal}, shutting down gracefully...`);
      
      server.close(() => {
        logger.info('✅ Server closed successfully');
        process.exit(0);
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
    logger.error('❌ Failed to start simple server:', error);
    process.exit(1);
  }
};

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startSimpleServer();
}

export { startSimpleServer };
