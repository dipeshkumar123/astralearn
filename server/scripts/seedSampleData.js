/**
 * Sample Data Seeder for AstraLearn Testing
 * Creates sample users, courses, lessons, and other data for comprehensive testing
 */

import DatabaseManager from '../src/config/database.js';
import bcrypt from 'bcrypt';
import { config } from '../src/config/environment.js';

// Import models
const models = {
  User: null,
  Course: null,
  Lesson: null,
  UserProgress: null,
  // Will be dynamically imported
};

const sampleData = {
  users: [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
      role: 'student',
      isVerified: true,
      profile: {
        bio: 'Computer Science student interested in web development',
        skills: ['JavaScript', 'React', 'Node.js'],
        learningGoals: ['Master React', 'Learn TypeScript', 'Build full-stack apps']
      }
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      password: 'password123',
      role: 'student',
      isVerified: true,
      profile: {
        bio: 'Business student learning tech skills',
        skills: ['Python', 'Data Analysis'],
        learningGoals: ['Learn web development', 'Master databases', 'Build portfolio']
      }
    },
    {
      firstName: 'Dr. Emily',
      lastName: 'Johnson',
      email: 'emily.johnson@example.com',
      password: 'password123',
      role: 'instructor',
      isVerified: true,
      profile: {
        bio: 'Computer Science Professor with 10+ years experience',
        expertise: ['Web Development', 'Software Engineering', 'Data Structures'],
        courses: []
      }
    },
    {
      firstName: 'Prof. Michael',
      lastName: 'Brown',
      email: 'michael.brown@example.com',
      password: 'password123',
      role: 'instructor',
      isVerified: true,
      profile: {
        bio: 'Full-stack developer turned educator',
        expertise: ['React', 'Node.js', 'DevOps', 'System Design'],
        courses: []
      }
    },
    {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@astralearn.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
      profile: {
        bio: 'System Administrator',
        permissions: ['all']
      }
    }
  ],
  
  courses: [
    {
      title: 'Introduction to React Development',
      description: 'Learn the fundamentals of React from scratch, including components, state management, and modern React patterns.',
      category: 'Web Development',
      level: 'beginner',
      isPublished: true,
      price: 0,
      duration: '8 weeks',
      tags: ['React', 'JavaScript', 'Frontend'],
      objectives: [
        'Understand React components and JSX',
        'Master state and props management',
        'Build interactive web applications',
        'Learn React hooks and modern patterns'
      ]
    },
    {
      title: 'Advanced JavaScript Concepts',
      description: 'Deep dive into advanced JavaScript topics including closures, prototypes, async programming, and ES6+ features.',
      category: 'Programming',
      level: 'intermediate',
      isPublished: true,
      price: 49,
      duration: '6 weeks',
      tags: ['JavaScript', 'ES6', 'Advanced'],
      objectives: [
        'Master advanced JavaScript concepts',
        'Understand async programming patterns',
        'Learn functional programming principles',
        'Build complex applications'
      ]
    },
    {
      title: 'Full-Stack Web Development',
      description: 'Complete full-stack course covering frontend with React, backend with Node.js, and database management.',
      category: 'Web Development',
      level: 'intermediate',
      isPublished: true,
      price: 99,
      duration: '12 weeks',
      tags: ['Full-Stack', 'React', 'Node.js', 'MongoDB'],
      objectives: [
        'Build complete web applications',
        'Master frontend and backend development',
        'Learn database design and management',
        'Deploy applications to production'
      ]
    },
    {
      title: 'Data Structures and Algorithms',
      description: 'Comprehensive course on data structures and algorithms with practical implementations in JavaScript.',
      category: 'Computer Science',
      level: 'intermediate',
      isPublished: true,
      price: 79,
      duration: '10 weeks',
      tags: ['Algorithms', 'Data Structures', 'JavaScript'],
      objectives: [
        'Understand fundamental data structures',
        'Master algorithm design patterns',
        'Solve complex programming problems',
        'Optimize code performance'
      ]
    }
  ],

  lessons: [
    // React Course Lessons
    {
      courseIndex: 0,
      lessons: [
        {
          title: 'Introduction to React',
          description: 'What is React and why use it?',
          content: 'React is a JavaScript library for building user interfaces...',
          type: 'video',
          duration: 45,
          order: 1,
          isPublished: true
        },
        {
          title: 'Setting Up Your Development Environment',
          description: 'Install Node.js, create-react-app, and essential tools',
          content: 'In this lesson, we\'ll set up everything you need...',
          type: 'tutorial',
          duration: 30,
          order: 2,
          isPublished: true
        },
        {
          title: 'Your First React Component',
          description: 'Create and understand React components',
          content: 'Components are the building blocks of React applications...',
          type: 'hands-on',
          duration: 60,
          order: 3,
          isPublished: true
        }
      ]
    },
    // JavaScript Course Lessons
    {
      courseIndex: 1,
      lessons: [
        {
          title: 'Closures and Scope',
          description: 'Understanding lexical scope and closures',
          content: 'Closures are one of the most powerful features in JavaScript...',
          type: 'video',
          duration: 50,
          order: 1,
          isPublished: true
        },
        {
          title: 'Prototypes and Inheritance',
          description: 'JavaScript\'s prototype-based inheritance system',
          content: 'JavaScript uses prototypes instead of classical inheritance...',
          type: 'tutorial',
          duration: 40,
          order: 2,
          isPublished: true
        }
      ]
    }
  ],

  progress: [
    {
      userIndex: 0, // John Doe
      courseIndex: 0, // React Course
      lessonsCompleted: [0, 1], // First 2 lessons
      totalTimeSpent: 75,
      currentStreak: 5,
      lastAccessed: new Date(),
      scores: [85, 92]
    },
    {
      userIndex: 1, // Jane Smith
      courseIndex: 1, // JavaScript Course
      lessonsCompleted: [0],
      totalTimeSpent: 50,
      currentStreak: 3,
      lastAccessed: new Date(),
      scores: [78]
    }
  ]
};

class DataSeeder {
  constructor() {
    this.db = null;
    this.createdUsers = [];
    this.createdCourses = [];
    this.createdLessons = [];
  }

  async initialize() {
    try {
      // Initialize database connection
      this.db = DatabaseManager.getInstance();
      await this.db.connect();
      
      console.log('🌱 Starting data seeding process...');
      
      // Import models dynamically
      try {
        const { User } = await import('../src/models/User.js');
        const { Course } = await import('../src/models/Course.js');
        models.User = User;
        models.Course = Course;
        
        console.log('📦 Models loaded successfully');
      } catch (error) {
        console.warn('⚠️  Models not available, using mock data only');
      }

      return true;
    } catch (error) {
      console.error('❌ Database initialization error:', error);
      return false;
    }
  }

  async seedUsers() {
    console.log('\n👥 Seeding users...');
    
    for (const userData of sampleData.users) {
      try {
        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        const user = {
          ...userData,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        if (models.User) {
          // Check if user already exists
          const existingUser = await models.User.findOne({ email: userData.email });
          if (!existingUser) {
            const newUser = new models.User(user);
            await newUser.save();
            this.createdUsers.push(newUser);
            console.log(`✅ Created user: ${userData.firstName} ${userData.lastName} (${userData.role})`);
          } else {
            this.createdUsers.push(existingUser);
            console.log(`ℹ️  User already exists: ${userData.email}`);
          }
        } else {
          // Mock data for development
          this.createdUsers.push({ ...user, _id: `user_${this.createdUsers.length}` });
          console.log(`📝 Mock user: ${userData.firstName} ${userData.lastName} (${userData.role})`);
        }
      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error);
      }
    }
  }

  async seedCourses() {
    console.log('\n📚 Seeding courses...');
    
    for (let i = 0; i < sampleData.courses.length; i++) {
      const courseData = sampleData.courses[i];
      try {
        // Assign instructor (use instructors from created users)
        const instructors = this.createdUsers.filter(u => u.role === 'instructor');
        const instructor = instructors[i % instructors.length];

        const course = {
          ...courseData,
          instructor: instructor._id,
          enrollmentCount: Math.floor(Math.random() * 50) + 10,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        if (models.Course) {
          const existingCourse = await models.Course.findOne({ title: courseData.title });
          if (!existingCourse) {
            const newCourse = new models.Course(course);
            await newCourse.save();
            this.createdCourses.push(newCourse);
            console.log(`✅ Created course: ${courseData.title}`);
          } else {
            this.createdCourses.push(existingCourse);
            console.log(`ℹ️  Course already exists: ${courseData.title}`);
          }
        } else {
          this.createdCourses.push({ ...course, _id: `course_${this.createdCourses.length}` });
          console.log(`📝 Mock course: ${courseData.title}`);
        }
      } catch (error) {
        console.error(`❌ Error creating course ${courseData.title}:`, error);
      }
    }
  }

  async seedProgress() {
    console.log('\n📈 Seeding user progress...');
    
    for (const progressData of sampleData.progress) {
      try {
        const user = this.createdUsers[progressData.userIndex];
        const course = this.createdCourses[progressData.courseIndex];
        
        if (!user || !course) {
          console.warn('⚠️  Skipping progress - user or course not found');
          continue;
        }

        const progress = {
          userId: user._id,
          courseId: course._id,
          lessonsCompleted: progressData.lessonsCompleted,
          totalTimeSpent: progressData.totalTimeSpent,
          currentStreak: progressData.currentStreak,
          lastAccessed: progressData.lastAccessed,
          scores: progressData.scores,
          overallProgress: (progressData.lessonsCompleted.length / 10) * 100, // Assume 10 lessons per course
          createdAt: new Date(),
          updatedAt: new Date()
        };

        console.log(`✅ Mock progress: ${user.firstName} in ${course.title}`);
      } catch (error) {
        console.error('❌ Error creating progress:', error);
      }
    }
  }

  async run() {
    const initialized = await this.initialize();
    if (!initialized) {
      console.error('❌ Failed to initialize database connection');
      return false;
    }

    try {
      await this.seedUsers();
      await this.seedCourses();
      await this.seedProgress();
      
      console.log('\n🎉 Data seeding completed successfully!');
      console.log('\n📊 Summary:');
      console.log(`👥 Users: ${this.createdUsers.length}`);
      console.log(`📚 Courses: ${this.createdCourses.length}`);
      console.log(`📈 Progress records: ${sampleData.progress.length}`);
      
      console.log('\n🔐 Sample Login Credentials:');
      console.log('Student: john.doe@example.com / password123');
      console.log('Student: jane.smith@example.com / password123');
      console.log('Instructor: emily.johnson@example.com / password123');
      console.log('Admin: admin@astralearn.com / admin123');
      
      return true;
    } catch (error) {
      console.error('❌ Error during seeding:', error);
      return false;
    } finally {
      if (this.db && this.db.isConnected()) {
        await this.db.disconnect();
        console.log('📡 Database connection closed');
      }
    }
  }
}

// Run seeder if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const seeder = new DataSeeder();
  seeder.run()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default DataSeeder;
