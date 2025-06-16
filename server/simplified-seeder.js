/**
 * Simplified Comprehensive Database Seeder for AstraLearn
 * 
 * This version focuses on core functionality and should work reliably.
 */

import mongoose from 'mongoose';
import { config } from './src/config/environment.js';

// Import core models
import { User } from './src/models/User.js';
import { Course } from './src/models/Course.js';
import { Module } from './src/models/Module.js';
import { Lesson } from './src/models/Lesson.js';
import { UserProgress } from './src/models/UserProgress.js';

console.log('🌱 Starting Simplified Comprehensive Database Seeder for AstraLearn');
console.log('======================================================================');

class SimplifiedSeeder {
  constructor() {
    this.startTime = new Date();
    this.createdData = {
      users: [],
      courses: [],
      modules: [],
      lessons: []
    };
  }

  async connectDatabase() {
    try {
      await mongoose.connect(config.database.uri);
      console.log('✅ Database connected successfully');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
  }

  async wipeDatabase() {
    console.log('🧹 Wiping existing data...');
    
    const collections = ['User', 'Course', 'Module', 'Lesson', 'UserProgress'];
    
    for (const collectionName of collections) {
      try {
        const model = mongoose.model(collectionName);
        const deleteResult = await model.deleteMany({});
        console.log(`   🗑️  ${collectionName}: ${deleteResult.deletedCount} documents deleted`);
      } catch (error) {
        console.log(`   ⚠️  ${collectionName}: Collection doesn't exist or error - ${error.message}`);
      }
    }
    
    console.log('✅ Database wiped clean');
  }

  async createUsers() {
    console.log('👥 Creating users...');
    
    const users = [
      // Students
      {
        firstName: 'Alice',
        lastName: 'Johnson',
        username: 'alice_j',
        email: 'alice@example.com',
        password: 'password123',
        role: 'student',
        profile: {
          bio: 'Passionate about learning new technologies',
          interests: ['coding', 'web development', 'AI'],
          goals: ['Master React', 'Learn Python', 'Build a portfolio']
        }
      },
      {
        firstName: 'Bob',
        lastName: 'Smith',
        username: 'bob_smith',
        email: 'bob@example.com',
        password: 'password123',
        role: 'student',
        profile: {
          bio: 'Data science enthusiast',
          interests: ['data science', 'machine learning', 'statistics'],
          goals: ['Get certified in data science', 'Build ML models']
        }
      },
      {
        firstName: 'Carol',
        lastName: 'Davis',
        username: 'carol_d',
        email: 'carol@example.com',
        password: 'password123',
        role: 'student',
        profile: {
          bio: 'Cybersecurity professional',
          interests: ['cybersecurity', 'ethical hacking', 'networking'],
          goals: ['Get security certifications', 'Master penetration testing']
        }
      },
      // Instructors
      {
        firstName: 'Dr. David',
        lastName: 'Wilson',
        username: 'dr_wilson',
        email: 'david@example.com',
        password: 'password123',
        role: 'instructor',
        profile: {
          bio: 'Computer Science professor with 15 years experience',
          interests: ['algorithms', 'programming', 'education'],
          goals: ['Create engaging courses', 'Help students succeed']
        }
      },
      {
        firstName: 'Emma',
        lastName: 'Brown',
        username: 'emma_brown',
        email: 'emma@example.com',
        password: 'password123',
        role: 'instructor',
        profile: {
          bio: 'Full-stack developer and educator',
          interests: ['web development', 'JavaScript', 'teaching'],
          goals: ['Share knowledge', 'Build better learning experiences']
        }
      },
      // Admin
      {
        firstName: 'Admin',
        lastName: 'User',
        username: 'admin',
        email: 'admin@astralearn.com',
        password: 'admin123',
        role: 'admin',
        profile: {
          bio: 'System administrator',
          interests: ['system administration', 'education technology'],
          goals: ['Maintain platform', 'Support users']
        }
      }
    ];

    for (const userData of users) {
      try {
        const user = new User(userData);
        await user.save();
        this.createdData.users.push(user);
      } catch (error) {
        console.error(`   ❌ Failed to create user ${userData.firstName}:`, error.message);
      }
    }

    console.log(`   ✅ Created ${this.createdData.users.length} users`);
  }

  async createCourses() {
    console.log('📚 Creating courses...');
    
    const instructors = this.createdData.users.filter(u => u.role === 'instructor');
    
    const courses = [
      {
        title: 'JavaScript Fundamentals',
        description: 'Learn the basics of JavaScript programming language',
        category: 'Programming',
        level: 'beginner',
        difficulty: 'beginner',
        tags: ['javascript', 'programming', 'web-development'],
        instructor: instructors[0]._id,
        isPublished: true,
        language: 'en',
        estimatedDuration: 480, // 8 hours
        price: 0
      },
      {
        title: 'React Development',
        description: 'Build modern web applications with React',
        category: 'Web Development',
        level: 'intermediate',
        difficulty: 'intermediate',
        tags: ['react', 'javascript', 'frontend'],
        instructor: instructors[1]._id,
        isPublished: true,
        language: 'en',
        estimatedDuration: 720, // 12 hours
        price: 49
      },
      {
        title: 'Python for Data Science',
        description: 'Introduction to data science using Python',
        category: 'Data Science',
        level: 'beginner',
        difficulty: 'beginner',
        tags: ['python', 'data-science', 'analytics'],
        instructor: instructors[0]._id,
        isPublished: true,
        language: 'en',
        estimatedDuration: 600, // 10 hours
        price: 99
      }
    ];

    for (const courseData of courses) {
      try {
        const course = new Course(courseData);
        await course.save();
        this.createdData.courses.push(course);
      } catch (error) {
        console.error(`   ❌ Failed to create course ${courseData.title}:`, error.message);
      }
    }

    console.log(`   ✅ Created ${this.createdData.courses.length} courses`);
  }

  async createModulesAndLessons() {
    console.log('📖 Creating modules and lessons...');
    
    for (const course of this.createdData.courses) {
      // Create 3 modules per course
      for (let i = 1; i <= 3; i++) {
        const moduleData = {
          title: `Module ${i}: ${course.title} - Part ${i}`,
          description: `This is module ${i} of ${course.title}`,
          courseId: course._id,
          order: i,
          estimatedDuration: Math.floor(course.estimatedDuration / 3),
          isPublished: true
        };

        try {
          const module = new Module(moduleData);
          await module.save();
          this.createdData.modules.push(module);

          // Create 4 lessons per module
          for (let j = 1; j <= 4; j++) {
            const lessonData = {
              title: `Lesson ${j}: ${module.title.split(':')[1]} - Lesson ${j}`,
              description: `This is lesson ${j} of module ${i}`,
              courseId: course._id,
              moduleId: module._id,
              order: j,
              type: ['video', 'text', 'interactive'][j % 3],
              estimatedDuration: Math.floor(module.estimatedDuration / 4),
              isPublished: true,
              content: {
                text: `This is the content for lesson ${j} of module ${i}. It covers important concepts related to ${course.title}.`,
                videoUrl: j % 2 === 0 ? 'https://example.com/video.mp4' : null,
                attachments: []
              }
            };

            try {
              const lesson = new Lesson(lessonData);
              await lesson.save();
              this.createdData.lessons.push(lesson);
            } catch (error) {
              console.error(`   ❌ Failed to create lesson ${lessonData.title}:`, error.message);
            }
          }
        } catch (error) {
          console.error(`   ❌ Failed to create module ${moduleData.title}:`, error.message);
        }
      }
    }

    console.log(`   ✅ Created ${this.createdData.modules.length} modules and ${this.createdData.lessons.length} lessons`);
  }

  async execute() {
    console.log('🔌 Attempting database connection...');
    const connected = await this.connectDatabase();
    if (!connected) {
      throw new Error('Failed to connect to database');
    }

    await this.wipeDatabase();
    await this.createUsers();
    await this.createCourses();
    await this.createModulesAndLessons();

    const endTime = new Date();
    const duration = Math.round((endTime - this.startTime) / 1000);

    console.log('======================================================================');
    console.log('✅ SIMPLIFIED SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================================');
    console.log('📊 SUMMARY:');
    console.log(`   Duration: ${duration} seconds`);
    console.log(`   👥 Users: ${this.createdData.users.length}`);
    console.log(`   📚 Courses: ${this.createdData.courses.length}`);
    console.log(`   📖 Modules: ${this.createdData.modules.length}`);
    console.log(`   📝 Lessons: ${this.createdData.lessons.length}`);
    console.log('');
    console.log('🔑 TEST ACCOUNTS:');
    this.createdData.users.forEach(user => {
      console.log(`   ${user.role.toUpperCase()}: ${user.email} / password123`);
    });
    console.log('');
    console.log('🚀 Ready for testing!');

    await mongoose.disconnect();
    console.log('📋 Database connection closed');
  }
}

// Execute
const seeder = new SimplifiedSeeder();
seeder.execute().catch(console.error);
