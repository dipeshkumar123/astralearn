/**
 * Generate User Progress Data for Analytics Testing
 * 
 * This script creates realistic user progress data to test the analytics
 * functionality with meaningful data for the specified user.
 */

import mongoose from 'mongoose';
import { UserProgress, User, Course, Lesson } from './src/models/index.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const NUM_PROGRESS_ENTRIES = 50;
const USER_ID = process.argv[2] || '6868a13297098a13bd68b34d'; // Default or pass user ID as command line argument
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/astralearn';

// Sample content types for variety
const contentTypes = [
  'video', 'article', 'quiz', 'exercise', 'interactive',
  'discussion', 'project', 'assessment', 'lecture', 'practice'
];

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Verify user exists
      const user = await User.findById(USER_ID);
      if (!user) {
        throw new Error(`User with ID ${USER_ID} not found`);
      }
      
      console.log(`Generating progress data for user: ${user.email}`);
      
      // Get available courses
      const courses = await Course.find();
      if (courses.length === 0) {
        throw new Error('No courses found in the database');
      }
      
      console.log(`Found ${courses.length} courses`);
      
      // Get available lessons or create sample lessons if none exist
      let lessons = await Lesson.find();
      if (lessons.length === 0) {
        console.log('No lessons found, using course IDs instead');
        lessons = courses;
      }
      
      // Create progress entries over the past 30 days
      const now = new Date();
      const progressEntries = [];
      
      // Generate progress entries with varied timestamps and data
      for (let i = 0; i < NUM_PROGRESS_ENTRIES; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const hoursAgo = Math.floor(Math.random() * 24);
        const timestamp = new Date(now);
        timestamp.setDate(timestamp.getDate() - daysAgo);
        timestamp.setHours(timestamp.getHours() - hoursAgo);
        
        // Select a random course
        const course = courses[Math.floor(Math.random() * courses.length)];
        
        // Select a random lesson if available
        const lesson = lessons[Math.floor(Math.random() * lessons.length)];
        
        // Generate random progress data
        const score = 50 + Math.floor(Math.random() * 50); // 50-100
        const completionPercentage = 10 + Math.floor(Math.random() * 90); // 10-100
        const timeSpent = 300 + Math.floor(Math.random() * 3000); // 5-55 minutes
        
        // Generate content interactions
        const numInteractions = 1 + Math.floor(Math.random() * 10); // 1-10 interactions
        const contentInteractions = [];
        
        for (let j = 0; j < numInteractions; j++) {
          const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
          const interactionDuration = 10 + Math.floor(Math.random() * 300); // 10-310 seconds
          
          contentInteractions.push({
            contentId: `content_${j}_${Date.now()}`,
            contentType,
            interactionType: Math.random() > 0.5 ? 'view' : 'interaction',
            duration: interactionDuration,
            timestamp: new Date(timestamp)
          });
        }
        
        // Create the progress entry
        const progressEntry = new UserProgress({
          userId: USER_ID,
          courseId: course._id,
          lessonId: lesson._id,
          progressType: Math.random() > 0.3 ? 'lesson' : 'assessment',
          timestamp,
          progressData: {
            score,
            completionPercentage,
            timeSpent,
            contentType: contentTypes[Math.floor(Math.random() * contentTypes.length)],
            contentInteractions,
            lastActivity: 'completed',
            assessments: [{
              id: `assessment_${Date.now()}`,
              type: 'quiz',
              score,
              completed: true,
              timeSpent: Math.floor(timeSpent * 0.8)
            }]
          }
        });
        
        progressEntries.push(progressEntry);
      }
      
      // Save all progress entries
      console.log(`Saving ${progressEntries.length} progress entries...`);
      await UserProgress.insertMany(progressEntries);
      
      console.log('✅ Successfully generated user progress data for analytics testing');
      
    } catch (error) {
      console.error('Error generating progress data:', error);
    } finally {
      mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
