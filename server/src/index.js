import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from './config/environment.js';
import DatabaseManager from './config/database.js';
import apiRoutes from './routes/index.js';

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.server.corsOrigin,
  credentials: true,
}));

// Compression middleware
app.use(compression());

// Logging middleware
if (config.server.environment !== 'test') {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', apiRoutes);

// Health endpoint
app.get('/health', async (req, res) => {
  try {
    const dbManager = DatabaseManager.getInstance();
    const dbStatus = dbManager.isConnected() ? 'Connected' : 'Disconnected';
    
    res.json({
      status: 'OK',
      message: 'AstraLearn Server is healthy',
      timestamp: new Date().toISOString(),
      environment: config.server.environment,
      database: dbStatus,
      version: '1.0.0',
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

    // Start server
    const server = app.listen(config.server.port, () => {
      console.log('🚀 AstraLearn Server Started');
      console.log(`📍 Environment: ${config.server.environment}`);
      console.log(`🌐 Server: http://localhost:${config.server.port}`);
      console.log(`📊 Health: http://localhost:${config.server.port}/health`);
      console.log(`🔗 API: http://localhost:${config.server.port}/api`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🔄 SIGTERM received, shutting down gracefully');
      server.close(async () => {
        await dbManager.disconnect();
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

export { app, startServer };
