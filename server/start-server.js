/**
 * AstraLearn Server Startup Script
 * Entry point for the Node.js backend server
 */

import './src/config/environment.js';
import { startServer } from './src/index.js';

console.log('🚀 AstraLearn Server Startup Script');
console.log('=====================================');

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Don't exit immediately, let the application handle it gracefully
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit immediately, let the application handle it gracefully
});

// Start the main server
try {
  console.log('🔧 Starting AstraLearn server...');
  await startServer();
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}