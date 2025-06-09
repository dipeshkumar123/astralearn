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

// Health check endpoint
app.get('/health', (req, res) => {
  const dbManager = DatabaseManager.getInstance();
  res.json({
    status: 'OK',
    environment: config.server.environment,
    database: dbManager.isConnected() ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'AstraLearn API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      courses: '/api/courses',
      lessons: '/api/lessons',
      ai: '/api/ai',
    },
  });
});

// Mount API routes
app.use('/api', apiRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server error:', err);
  
  const isDevelopment = config.server.environment === 'development';
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(isDevelopment && { stack: err.stack }),
  });
});

// Start server function
async function startServer() {
  try {
    // Connect to database
    const dbManager = DatabaseManager.getInstance();
    await dbManager.connect();

    // Start HTTP server
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