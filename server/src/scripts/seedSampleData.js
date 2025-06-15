/**
 * Sample Data Seeder for AstraLearn
 * Creates users, courses, and sample data for testing dashboard functionality
 */

import mongoose from 'mongoose';
import { config } from '../config/environment.js';

// Import models
import { User } from '../models/User.js';
import { Course } from '../models/Course.js';
import { UserProgress } from '../models/UserProgress.js';

async function connectDatabase() {
  try {
    await mongoose.connect(config.database.mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

async function createSampleUsers() {
  console.log('👥 Creating sample users...');
  
  const users = [
    {
      email: 'student1@astralearn.dev',
      username: 'alice_student',
      password: 'password123',
      firstName: 'Alice',
      lastName: 'Johnson',
      role: 'student',
      learningStyle: 'visual',
      learningStyleAssessment: {
        lastAssessmentDate: new Date(),
        assessmentAnswers: [],
        scores: {
          visual: 85,
          auditory: 60,
          kinesthetic: 45,
          reading: 70
        },
        confidence: 0.8
      }
    },
    {
      email: 'student2@astralearn.dev',
      username: 'bob_student',
      password: 'password123',
      firstName: 'Bob',
      lastName: 'Smith',
      role: 'student',
      learningStyle: 'auditory',
      learningStyleAssessment: {
        lastAssessmentDate: new Date(),
        assessmentAnswers: [],
        scores: {
          visual: 55,
          auditory: 90,
          kinesthetic: 60,
          reading: 65
        },
        confidence: 0.9
      }
    },
    {
      email: 'instructor1@astralearn.dev',
      username: 'dr_garcia',
      password: 'password123',
      firstName: 'Dr. Maria',
      lastName: 'Garcia',
      role: 'instructor',
      learningStyle: 'reading',
      bio: 'Experienced computer science educator with 10+ years of teaching experience.'
    },
    {
      email: 'admin@astralearn.dev',
      username: 'admin_user',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      learningStyle: 'kinesthetic'
    }
  ];

  const createdUsers = [];
  
  for (const userData of users) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`   ⚠️  User ${userData.email} already exists`);
        createdUsers.push(existingUser);
        continue;
      }

      const user = new User(userData);
      await user.save();
      console.log(`   ✅ Created user: ${userData.firstName} ${userData.lastName} (${userData.role})`);
      createdUsers.push(user);
    } catch (error) {
      console.error(`   ❌ Failed to create user ${userData.email}:`, error.message);
    }
  }

  return createdUsers;
}

async function createSampleCourses(users) {
  console.log('📚 Creating sample courses...');
  
  // Find instructor
  const instructor = users.find(u => u.role === 'instructor');
  if (!instructor) {
    console.log('   ⚠️  No instructor found, skipping course creation');
    return [];
  }

  const courses = [
    {
      title: 'JavaScript Fundamentals',
      description: 'Learn the basics of JavaScript programming including variables, functions, objects, and DOM manipulation.',
      category: 'Programming',
      difficulty: 'beginner',
      instructor: instructor._id,
      tags: ['javascript', 'programming', 'web-development'],
      isPublished: true,
      estimatedDuration: 40,
      price: 0,
      requirements: ['Basic computer skills', 'Text editor'],
      learningObjectives: [
        'Understand JavaScript syntax and basic concepts',
        'Work with variables, functions, and objects',
        'Manipulate the DOM using JavaScript',
        'Handle events and user interactions'
      ]
    },
    {
      title: 'React for Beginners',
      description: 'Introduction to React.js library for building user interfaces. Learn components, props, state, and hooks.',
      category: 'Web Development',
      difficulty: 'intermediate',
      instructor: instructor._id,
      tags: ['react', 'javascript', 'frontend', 'ui'],
      isPublished: true,
      estimatedDuration: 60,
      price: 0,
      requirements: ['JavaScript fundamentals', 'HTML/CSS knowledge'],
      learningObjectives: [
        'Create React components and manage props',
        'Use React state and lifecycle methods',
        'Implement React hooks',
        'Build interactive user interfaces'
      ]
    },
    {
      title: 'Data Structures and Algorithms',
      description: 'Comprehensive course on fundamental data structures and algorithms with practical implementations.',
      category: 'Computer Science',
      difficulty: 'advanced',
      instructor: instructor._id,
      tags: ['algorithms', 'data-structures', 'computer-science'],
      isPublished: true,
      estimatedDuration: 80,
      price: 0,
      requirements: ['Programming experience', 'Basic mathematics'],
      learningObjectives: [
        'Implement common data structures',
        'Understand algorithm complexity',
        'Solve algorithmic problems',
        'Optimize code performance'
      ]
    }
  ];

  const createdCourses = [];
  
  for (const courseData of courses) {
    try {
      // Check if course already exists
      const existingCourse = await Course.findOne({ title: courseData.title });
      if (existingCourse) {
        console.log(`   ⚠️  Course "${courseData.title}" already exists`);
        createdCourses.push(existingCourse);
        continue;
      }

      const course = new Course(courseData);
      await course.save();
      console.log(`   ✅ Created course: ${courseData.title}`);
      createdCourses.push(course);
    } catch (error) {
      console.error(`   ❌ Failed to create course "${courseData.title}":`, error.message);
    }
  }

  return createdCourses;
}

async function createSampleProgress(users, courses) {
  console.log('📈 Creating sample progress data...');
  
  const students = users.filter(u => u.role === 'student');
  
  if (students.length === 0 || courses.length === 0) {
    console.log('   ⚠️  No students or courses found, skipping progress creation');
    return;
  }

  const progressData = [];
  
  // Enroll students in courses with varying progress
  for (const student of students) {
    for (let i = 0; i < Math.min(courses.length, 2); i++) {
      const course = courses[i];
      const progress = Math.floor(Math.random() * 80) + 10; // 10-90% progress
      
      progressData.push({
        userId: student._id,
        courseId: course._id,
        progress: progress,
        completedLessons: Math.floor((progress / 100) * 10), // Assuming 10 lessons per course
        totalLessons: 10,
        lastAccessed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Within last week
        timeSpent: Math.floor(Math.random() * 1200) + 300, // 5-25 minutes
        isCompleted: progress >= 100,
        completionDate: progress >= 100 ? new Date() : null
      });
    }
  }

  for (const progressItem of progressData) {
    try {
      // Check if progress already exists
      const existingProgress = await UserProgress.findOne({
        userId: progressItem.userId,
        courseId: progressItem.courseId
      });
      
      if (existingProgress) {
        console.log(`   ⚠️  Progress already exists for user/course`);
        continue;
      }

      const progress = new UserProgress(progressItem);
      await progress.save();
      console.log(`   ✅ Created progress: ${progressItem.progress}% complete`);
    } catch (error) {
      console.error(`   ❌ Failed to create progress:`, error.message);
    }
  }
}

async function seedSampleData() {
  console.log('🌱 Starting sample data seeding...');
  console.log('=' .repeat(50));

  try {
    await connectDatabase();
    
    const users = await createSampleUsers();
    const courses = await createSampleCourses(users);
    await createSampleProgress(users, courses);
    
    console.log('=' .repeat(50));
    console.log('✅ Sample data seeding completed successfully!');
    console.log(`👥 Users created: ${users.length}`);
    console.log(`📚 Courses created: ${courses.length}`);
    console.log('');
    console.log('🔑 Test Accounts:');
    console.log('   Student: student1@astralearn.dev / password123');
    console.log('   Student: student2@astralearn.dev / password123');
    console.log('   Instructor: instructor1@astralearn.dev / password123');
    console.log('   Admin: admin@astralearn.dev / password123');
    console.log('');
    console.log('🚀 You can now test the dashboard with sample data!');
    
  } catch (error) {
    console.error('❌ Sample data seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📋 Database connection closed');
  }
}

// Run the seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedSampleData();
}

export default seedSampleData;
