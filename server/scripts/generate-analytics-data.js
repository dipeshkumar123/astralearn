/**
 * Generate Analytics Test Data
 * 
 * This script generates realistic user progress and activity data
 * to test the analytics functionality with meaningful data.
 */

import mongoose from 'mongoose';
import { UserProgress, User, Course, Lesson } from './src/models/index.js';
import { faker } from '@faker-js/faker';

// Configuration
const NUM_PROGRESS_ENTRIES = 50;
const USER_ID = process.argv[2]; // Pass user ID as command line argument
const MONGODB_URI = 'mongodb://localhost:27017/astralearn';

// Connect to database
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Verify user exists
      if (!USER_ID) {
        throw new Error('Please provide a user ID as a command line argument');
      }
      
      const user = await User.findById(USER_ID);
      if (!user) {
        throw new Error(`User with ID ${USER_ID} not found`);
      }
      
      console.log(`Generating analytics data for user: ${user.firstName} ${user.lastName}`);
      
      // Get available courses
      const courses = await Course.find();
      if (courses.length === 0) {
        throw new Error('No courses found in the database');
      }
      
      // Get available lessons
      const lessons = await Lesson.find();
      if (lessons.length === 0) {
        throw new Error('No lessons found in the database');
      }
      
      console.log(`Found ${courses.length} courses and ${lessons.length} lessons`);
      
      // Generate progress entries
      const progressEntries = [];
      
      for (let i = 0; i < NUM_PROGRESS_ENTRIES; i++) {
        // Select random course and lesson
        const course = courses[Math.floor(Math.random() * courses.length)];
        const lesson = lessons[Math.floor(Math.random() * lessons.length)];
        
        // Generate realistic timestamp within last 30 days
        const timestamp = faker.date.recent({ days: 30 });
        
        // Generate realistic progress data
        const progressData = {
          completionPercentage: faker.number.int({ min: 10, max: 100 }),
          score: faker.number.int({ min: 60, max: 100 }),
          timeSpent: faker.number.int({ min: 5 * 60, max: 60 * 60 }), // 5 min to 1 hour in seconds
          lastActivity: faker.helpers.arrayElement([
            'video_watched', 'quiz_completed', 'exercise_completed', 'reading_completed'
          ]),
          contentLength: faker.number.int({ min: 10 * 60, max: 60 * 60 }), // Content length in seconds
          assessments: [
            {
              id: `assessment-${faker.string.uuid()}`,
              score: faker.number.int({ min: 60, max: 100 }),
              completed: true,
              timeSpent: faker.number.int({ min: 5 * 60, max: 30 * 60 })
            }
          ],
          contentInteractions: generateContentInteractions()
        };
        
        // Create progress entry
        const progressEntry = new UserProgress({
          userId: USER_ID,
          courseId: course._id,
          lessonId: lesson._id,
          progressType: faker.helpers.arrayElement(['lesson', 'assessment', 'resource']),
          timestamp,
          progressData
        });
        
        progressEntries.push(progressEntry);
      }
      
      // Save progress entries
      console.log(`Saving ${progressEntries.length} progress entries...`);
      await UserProgress.insertMany(progressEntries);
      
      console.log('✅ Analytics test data generation completed successfully');
      
    } catch (error) {
      console.error('Error generating analytics test data:', error);
    } finally {
      mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

/**
 * Generate realistic content interactions
 */
function generateContentInteractions() {
  const numInteractions = faker.number.int({ min: 3, max: 15 });
  const interactions = [];
  
  const contentTypes = [
    'video', 'text', 'image', 'audio', 'interactive', 
    'diagram', 'lecture', 'article', 'exercise', 'simulation'
  ];
  
  for (let i = 0; i < numInteractions; i++) {
    const contentType = faker.helpers.arrayElement(contentTypes);
    
    interactions.push({
      contentId: faker.string.uuid(),
      contentType,
      interactionType: faker.helpers.arrayElement(['view', 'click', 'complete', 'download']),
      duration: faker.number.int({ min: 10, max: 600 }), // 10 seconds to 10 minutes
      timestamp: faker.date.recent({ days: 1 })
    });
  }
  
  return interactions;
}
