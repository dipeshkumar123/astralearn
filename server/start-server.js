/**
 * AstraLearn Server Startup Script
 * Entry point for the Node.js backend server
 */

import './src/config/environment.js';
import { startServer } from './src/index.js';

console.log('🚀 AstraLearn Server Startup Script');
console.log('=====================================');

// Start the main server
try {
  console.log('🔧 Starting AstraLearn server...');
  await startServer();
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}