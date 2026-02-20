// Debug server to isolate the startup issue
import express from 'express';
import cors from 'cors';

console.log('🔧 Starting debug server...');

// Import configuration step by step
console.log('📦 Importing environment config...');
import { config } from './src/config/environment.js';
console.log('✅ Environment config imported');

console.log('📦 Importing logger...');
import { logger } from './src/utils/logger.js';
console.log('✅ Logger imported');

console.log('🚀 Creating Express app...');
const app = express();

console.log('🔧 Setting up middleware...');
app.use(cors());
app.use(express.json());

console.log('🛣️ Setting up routes...');
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Debug server is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'Debug API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

console.log('🌐 Starting server...');
const PORT = config.server.port || 5000;

app.listen(PORT, () => {
  console.log('✅ Debug server started successfully');
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  logger.info('Debug server is running');
});

console.log('🎯 Server setup complete');
