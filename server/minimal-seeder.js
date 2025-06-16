/**
 * Minimal Database Seeder for Testing
 */

import mongoose from 'mongoose';
import { config } from './src/config/environment.js';
import { User } from './src/models/User.js';
import { Course } from './src/models/Course.js';

console.log('🌱 Starting Minimal Database Seeder');

try {
  console.log('🔌 Connecting to database...');
  await mongoose.connect(config.database.uri);
  console.log('✅ Database connected');

  console.log('🧹 Clearing existing data...');
  await User.deleteMany({});
  await Course.deleteMany({});
  console.log('✅ Data cleared');

  console.log('👥 Creating test user...');  const testUser = new User({
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    username: 'testuser',
    password: 'password123',
    role: 'student',
    profile: {
      bio: 'Test user for seeding',
      interests: ['coding', 'learning'],
      goals: ['Complete a course']
    }
  });
  await testUser.save();
  console.log('✅ Test user created');

  console.log('📚 Creating test course...');  const testCourse = new Course({
    title: 'Test Course',
    description: 'A test course for seeding',
    category: 'Technology',
    level: 'beginner',
    difficulty: 'beginner',
    tags: ['test', 'coding'],
    instructor: testUser._id,
    isPublished: true,
    language: 'en',
    estimatedDuration: 120
  });
  await testCourse.save();
  console.log('✅ Test course created');

  console.log('✅ MINIMAL SEEDING COMPLETED SUCCESSFULLY!');
  console.log(`Created 1 user and 1 course`);

} catch (error) {
  console.error('❌ Seeding failed:', error);
} finally {
  await mongoose.disconnect();
  console.log('📋 Database connection closed');
  process.exit(0);
}
