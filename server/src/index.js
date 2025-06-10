import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { config } from './config/environment.js';
import DatabaseManager from './config/database.js';
import apiRoutes from './routes/index.js';

// Import Phase 3 Step 3 services
import performanceMonitorService from './services/performanceMonitorService.js';
import redisCacheService from './services/redisCacheService.js';
import webSocketService from './services/webSocketService.js';

// Initialize Express app
const app = express();

// Create HTTP server for WebSocket integration
const httpServer = createServer(app);

// Initialize Phase 3 Step 3 services
console.log('🚀 Initializing Phase 3 Step 3: Production Optimization & Advanced Features...');

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.server.corsOrigin,
  credentials: true,
}));

// Compression middleware
app.use(compression());

// Performance monitoring middleware
app.use(performanceMonitorService.trackRequest());

// Logging middleware
if (config.server.environment !== 'test') {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', apiRoutes);

// Health endpoint with performance metrics
app.get('/health', async (req, res) => {
  try {
    const dbManager = DatabaseManager.getInstance();
    const dbStatus = dbManager.isConnected() ? 'Connected' : 'Disconnected';
    
    // Get performance health summary
    const performanceHealth = await performanceMonitorService.getHealthSummary();
    const cacheHealth = await redisCacheService.healthCheck();
    const wsHealth = webSocketService.healthCheck();
    
    res.json({
      status: 'OK',
      message: 'AstraLearn Server is healthy',
      timestamp: new Date().toISOString(),
      environment: config.server.environment,
      database: dbStatus,
      version: '3.3.0', // Updated version for Phase 3 Step 3
      services: {
        performance: performanceHealth.status,
        cache: cacheHealth.status,
        websocket: wsHealth.status
      },
      phase: 'Phase 3 Step 3: Production Optimization & Advanced Features'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message,
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: {
      health: 'GET /health',
      api: 'GET /api/*',
    },
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: config.server.environment === 'development' ? err.message : 'Something went wrong',
    ...(config.server.environment === 'development' && { stack: err.stack }),
  });
});

// Server startup function
async function startServer() {
  try {
    // Initialize database connection
    const dbManager = DatabaseManager.getInstance();
    await dbManager.connect();

    // Initialize WebSocket service
    webSocketService.initialize(httpServer);

    // Start server
    const server = httpServer.listen(config.server.port, () => {
      console.log('🚀 AstraLearn Server Started');
      console.log(`📍 Environment: ${config.server.environment}`);
      console.log(`🌐 Server: http://localhost:${config.server.port}`);
      console.log(`📊 Health: http://localhost:${config.server.port}/health`);
      console.log(`🔗 API: http://localhost:${config.server.port}/api`);
      console.log(`🌐 WebSocket: ws://localhost:${config.server.port}`);
      console.log('✅ Phase 3 Step 3: Production Optimization & Advanced Features - ACTIVE');
      console.log('📈 Performance Monitoring: Enabled');
      console.log('💾 Redis Caching: ' + (redisCacheService.isAvailable() ? 'Enabled' : 'Disabled'));
      console.log('🔄 Real-time Features: Enabled');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🔄 SIGTERM received, shutting down gracefully');
      server.close(async () => {
        await dbManager.disconnect();
        await redisCacheService.disconnect();
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
startServer();

export { app, httpServer, startServer };
