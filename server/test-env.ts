// Simple test to check environment loading
import { config } from './src/config/environment';

console.log('Testing environment config...');
console.log('Port:', config.server.port);
console.log('Environment:', config.server.environment);
console.log('MongoDB URI:', config.database.uri.substring(0, 20) + '...');
console.log('✅ Environment config loaded successfully');
