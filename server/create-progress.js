// create-progress.js
import mongoose from 'mongoose';
import { UserProgress } from './src/models/index.js';

const userId = '6868a13297098a13bd68b34d';

mongoose.connect('mongodb://localhost:27017/astralearn')
  .then(async () => {
    console.log('Connected to database');
    
    const userProgress = new UserProgress({
      userId,
      courseId: '6868a13597098a13bd68b367', // Use a valid course ID
      lessonId: '6868a13597098a13bd68b369', // Just use a made-up ID for now
      progressType: 'lesson',
      timestamp: new Date(),
      progressData: {
        completionPercentage: 75,
        score: 85,
        timeSpent: 3600,
        lastActivity: 'quiz_completion',
        assessments: [
          {
            id: 'quiz1',
            score: 85,
            completed: true
          }
        ]
      }
    });
    
    await userProgress.save();
    console.log('Progress saved successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
