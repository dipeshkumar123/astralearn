// Debug script to test seeder imports and basic functionality
import { config } from './src/config/environment.js';
import mongoose from 'mongoose';

console.log('Starting debug script...');
console.log('Database URI:', config.database.uri);

try {
  console.log('Attempting MongoDB connection...');
  await mongoose.connect(config.database.uri);
  console.log('✅ MongoDB connected successfully');
  
  console.log('Testing model imports...');
  
  // Test imports one by one
  console.log('Importing User model...');
  const { User } = await import('./src/models/User.js');
  console.log('✅ User model imported');
  
  console.log('Importing Course model...');
  const { Course } = await import('./src/models/Course.js');
  console.log('✅ Course model imported');
  
  console.log('Importing Analytics models...');
  const { LearningEvent, LearningSession, DailyAnalytics } = await import('./src/models/Analytics.js');
  console.log('✅ Analytics models imported');
  
  console.log('Importing SocialLearning models...');
  const { StudyGroup, Discussion } = await import('./src/models/SocialLearning.js');
  console.log('✅ SocialLearning models imported');
  
  console.log('All imports successful!');
  
} catch (error) {
  console.error('❌ Error:', error);
  console.error('Stack:', error.stack);
} finally {
  await mongoose.disconnect();
  console.log('Script completed');
  process.exit(0);
}
