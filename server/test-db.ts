// Test database connection
import DatabaseManager from './src/config/database';

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    const dbManager = DatabaseManager.getInstance();
    await dbManager.connect();
    console.log('✅ Database connection successful!');
    await dbManager.disconnect();
    console.log('✅ Database disconnection successful!');
  } catch (error) {
    console.error('❌ Database error:', error);
  }
}

testDatabase();
