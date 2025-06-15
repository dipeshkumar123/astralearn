/**
 * Database Seeding Script for AstraLearn
 * Populates the database with sample data for testing and development
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/User.js';
import { Course } from '../src/models/Course.js';
import { Lesson } from '../src/models/Lesson.js';
import { UserProgress } from '../src/models/UserProgress.js';
import { Achievement, PointsActivity, UserGamification } from '../src/models/Gamification.js';

// Sample data
const sampleUsers = [
  {
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice@example.com',
    password: 'password123',
    role: 'student',
    learningStyle: 'visual',
    experienceLevel: 'intermediate'
  },
  {
    firstName: 'Bob',
    lastName: 'Smith',
    email: 'bob@example.com',
    password: 'password123',
    role: 'student',
    learningStyle: 'auditory',
    experienceLevel: 'beginner'
  },
  {
    firstName: 'Dr. Carol',
    lastName: 'Brown',
    email: 'carol@example.com',
    password: 'password123',
    role: 'instructor',
    learningStyle: 'kinesthetic',
    experienceLevel: 'expert'
  },
  {
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david@example.com',
    password: 'password123',
    role: 'student',
    learningStyle: 'reading',
    experienceLevel: 'advanced'
  },
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    learningStyle: 'visual',
    experienceLevel: 'expert'
  }
];

const sampleCourses = [
  {
    title: 'JavaScript Fundamentals',
    description: 'Learn the basics of JavaScript programming including variables, functions, and control structures.',
    difficulty: 'beginner',
    estimatedDuration: 20,
    tags: ['javascript', 'programming', 'web-development'],
    isPublished: true
  },
  {
    title: 'React Development',
    description: 'Master React.js for building modern web applications with components, hooks, and state management.',
    difficulty: 'intermediate',
    estimatedDuration: 35,
    tags: ['react', 'javascript', 'frontend'],
    isPublished: true
  },
  {
    title: 'Advanced Node.js',
    description: 'Deep dive into Node.js backend development with Express, databases, and API design.',
    difficulty: 'advanced',
    estimatedDuration: 40,
    tags: ['nodejs', 'backend', 'api'],
    isPublished: true
  },
  {
    title: 'Python for Data Science',
    description: 'Learn Python programming focused on data analysis, visualization, and machine learning.',
    difficulty: 'intermediate',
    estimatedDuration: 30,
    tags: ['python', 'data-science', 'machine-learning'],
    isPublished: true
  }
];

const sampleLessons = [
  // JavaScript Fundamentals lessons
  {
    title: 'Introduction to Variables',
    content: 'Learn about JavaScript variables, including var, let, and const declarations.',
    type: 'theory',
    estimatedDuration: 45
  },
  {
    title: 'Functions and Scope',
    content: 'Understanding JavaScript functions, parameters, return values, and scope.',
    type: 'theory',
    estimatedDuration: 60
  },
  {
    title: 'Control Structures',
    content: 'Master if statements, loops, and conditional logic in JavaScript.',
    type: 'practice',
    estimatedDuration: 50
  },
  // React Development lessons
  {
    title: 'React Components',
    content: 'Learn how to create and use React components effectively.',
    type: 'theory',
    estimatedDuration: 55
  },
  {
    title: 'State and Props',
    content: 'Understanding React state management and component communication.',
    type: 'practice',
    estimatedDuration: 70
  },
  {
    title: 'React Hooks',
    content: 'Master useState, useEffect, and other essential React hooks.',
    type: 'practice',
    estimatedDuration: 65
  }
];

const sampleAchievements = [
  {
    name: 'First Steps',
    description: 'Complete your first lesson',
    type: 'milestone',
    icon: 'trophy',
    points: 50,
    difficulty: 'bronze',
    criteria: { lessonsCompleted: 1 }
  },
  {
    name: 'Learning Streak',
    description: 'Maintain a 7-day learning streak',
    type: 'streak',
    icon: 'flame',
    points: 200,
    difficulty: 'silver',
    criteria: { dailyStreak: 7 }
  },
  {
    name: 'Course Completer',
    description: 'Complete your first course',
    type: 'milestone',
    icon: 'graduation-cap',
    points: 500,
    difficulty: 'gold',
    criteria: { coursesCompleted: 1 }
  },
  {
    name: 'Social Learner',
    description: 'Join a study group and participate actively',
    type: 'social',
    icon: 'users',
    points: 100,
    difficulty: 'bronze',
    criteria: { studyGroupParticipation: 5 }
  }
];

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    await UserProgress.deleteMany({});
    await Achievement.deleteMany({});
    await PointsActivity.deleteMany({});
    await UserGamification.deleteMany({});

    // Create users
    console.log('👥 Creating sample users...');
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`✅ Created user: ${userData.firstName} ${userData.lastName} (${userData.role})`);
    }

    // Find instructor for courses
    const instructor = createdUsers.find(user => user.role === 'instructor');

    // Create courses
    console.log('📚 Creating sample courses...');
    const createdCourses = [];
    for (const courseData of sampleCourses) {
      const course = new Course({
        ...courseData,
        instructor: instructor._id,
        enrollmentCount: Math.floor(Math.random() * 50) + 10 // Random enrollment between 10-60
      });
      const savedCourse = await course.save();
      createdCourses.push(savedCourse);
      console.log(`✅ Created course: ${courseData.title}`);
    }

    // Create lessons
    console.log('📖 Creating sample lessons...');
    let lessonIndex = 0;
    for (let i = 0; i < createdCourses.length && lessonIndex < sampleLessons.length; i++) {
      const course = createdCourses[i];
      const lessonsPerCourse = Math.min(3, sampleLessons.length - lessonIndex);
      
      for (let j = 0; j < lessonsPerCourse; j++) {
        const lessonData = sampleLessons[lessonIndex + j];
        const lesson = new Lesson({
          ...lessonData,
          courseId: course._id,
          order: j + 1
        });
        const savedLesson = await lesson.save();
        
        // Add lesson to course
        course.lessons.push(savedLesson._id);
        await course.save();
        
        console.log(`✅ Created lesson: ${lessonData.title} for ${course.title}`);
      }
      lessonIndex += lessonsPerCourse;
    }

    // Create achievements
    console.log('🏆 Creating sample achievements...');
    for (const achievementData of sampleAchievements) {
      const achievement = new Achievement(achievementData);
      await achievement.save();
      console.log(`✅ Created achievement: ${achievementData.name}`);
    }

    // Create user progress and enrollments
    console.log('📈 Creating user progress data...');
    const students = createdUsers.filter(user => user.role === 'student');
    
    for (const student of students) {
      // Enroll student in 2-3 random courses
      const numberOfCourses = Math.floor(Math.random() * 2) + 2; // 2-3 courses
      const enrolledCourses = createdCourses.slice(0, numberOfCourses);
      
      for (const course of enrolledCourses) {
        const progress = new UserProgress({
          userId: student._id,
          courseId: course._id,
          progress: Math.floor(Math.random() * 80) + 10, // 10-90% progress
          completedLessons: [],
          enrolledAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Enrolled within last 30 days
        });
        
        // Add some completed lessons
        const lessonCount = course.lessons.length;
        const completedCount = Math.floor(lessonCount * (progress.progress / 100));
        progress.completedLessons = course.lessons.slice(0, completedCount);
        
        await progress.save();
        console.log(`✅ Created progress for ${student.firstName} in ${course.title} (${progress.progress}%)`);
      }

      // Create gamification profile
      const totalPoints = Math.floor(Math.random() * 1000) + 200; // 200-1200 points
      const level = Math.floor(totalPoints / 100) + 1;
      
      const gamificationProfile = new UserGamification({
        userId: student._id,
        totalPoints: totalPoints,
        level: level,
        experiencePoints: totalPoints % 100,
        pointsBreakdown: {
          lessonCompletion: Math.floor(totalPoints * 0.6),
          assessmentCompletion: Math.floor(totalPoints * 0.2),
          socialInteraction: Math.floor(totalPoints * 0.1),
          dailyLogin: Math.floor(totalPoints * 0.1)
        },
        badges: [],
        streaks: {
          current: {
            dailyLearning: Math.floor(Math.random() * 15) + 1,
            weeklyGoals: Math.floor(Math.random() * 4)
          },
          longest: {
            dailyLearning: Math.floor(Math.random() * 30) + 5,
            weeklyGoals: Math.floor(Math.random() * 8) + 2
          }
        },
        achievements: [],
        lastActivity: new Date(),
        preferences: {
          notifications: true,
          publicProfile: true,
          showProgress: true
        }
      });
      
      await gamificationProfile.save();
      console.log(`✅ Created gamification profile for ${student.firstName} (Level ${level}, ${totalPoints} points)`);

      // Create some sample activities
      const activities = [
        { activityType: 'lesson_complete', points: 50, description: 'Completed a lesson' },
        { activityType: 'daily_login', points: 10, description: 'Daily login bonus' },
        { activityType: 'assessment_complete', points: 100, description: 'Completed an assessment' }
      ];

      for (let i = 0; i < 5; i++) {
        const activity = activities[Math.floor(Math.random() * activities.length)];
        const pointsActivity = new PointsActivity({
          userId: student._id,
          activityType: activity.activityType,
          points: activity.points,
          description: activity.description,
          metadata: {},
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Within last week
        });
        await pointsActivity.save();
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`👥 Created ${createdUsers.length} users`);
    console.log(`📚 Created ${createdCourses.length} courses`);
    console.log(`📖 Created lessons for all courses`);
    console.log(`🏆 Created ${sampleAchievements.length} achievements`);
    console.log('📈 Created progress data for all students');
    console.log('🎮 Created gamification profiles for all students');

    // Print login credentials
    console.log('\n🔑 Login Credentials:');
    console.log('Student Accounts:');
    sampleUsers.filter(u => u.role === 'student').forEach(u => {
      console.log(`  Email: ${u.email}, Password: ${u.password}`);
    });
    console.log(`Instructor Account: ${instructor.email}, Password: password123`);
    console.log(`Admin Account: admin@example.com, Password: password123`);

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (process.argv[1].includes('seedDatabase.js')) {
  console.log('🌱 Running database seeding...');
  
  // Connect to MongoDB
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/astralearn';
  
  mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('✅ Connected to MongoDB');
    return seedDatabase();
  })
  .then(() => {
    console.log('🎉 Seeding completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
}
