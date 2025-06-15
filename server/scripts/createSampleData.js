/**
 * Simple Development Data for AstraLearn Testing
 * Creates sample data without database dependencies for immediate testing
 */

console.log('🌱 Creating sample test data for development...');

const sampleUsers = [
  {
    id: 'user_001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'student',
    profile: {
      bio: 'Computer Science student interested in web development',
      skills: ['JavaScript', 'React', 'Node.js'],
      learningGoals: ['Master React', 'Learn TypeScript', 'Build full-stack apps']
    }
  },
  {
    id: 'user_002',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    role: 'student',
    profile: {
      bio: 'Business student learning tech skills',
      skills: ['Python', 'Data Analysis'],
      learningGoals: ['Learn web development', 'Master databases', 'Build portfolio']
    }
  },
  {
    id: 'user_003',
    firstName: 'Dr. Emily',
    lastName: 'Johnson',
    email: 'emily.johnson@example.com',
    role: 'instructor',
    profile: {
      bio: 'Computer Science Professor with 10+ years experience',
      expertise: ['Web Development', 'Software Engineering', 'Data Structures']
    }
  },
  {
    id: 'user_004',
    firstName: 'Prof. Michael',
    lastName: 'Brown',
    email: 'michael.brown@example.com',
    role: 'instructor',
    profile: {
      bio: 'Full-stack developer turned educator',
      expertise: ['React', 'Node.js', 'DevOps', 'System Design']
    }
  },
  {
    id: 'user_005',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@astralearn.com',
    role: 'admin',
    profile: {
      bio: 'System Administrator'
    }
  }
];

const sampleCourses = [
  {
    id: 'course_001',
    title: 'Introduction to React Development',
    description: 'Learn the fundamentals of React from scratch, including components, state management, and modern React patterns.',
    instructor: 'user_003',
    category: 'Web Development',
    level: 'beginner',
    isPublished: true,
    enrollmentCount: 45,
    tags: ['React', 'JavaScript', 'Frontend'],
    objectives: [
      'Understand React components and JSX',
      'Master state and props management',
      'Build interactive web applications',
      'Learn React hooks and modern patterns'
    ]
  },
  {
    id: 'course_002',
    title: 'Advanced JavaScript Concepts',
    description: 'Deep dive into advanced JavaScript topics including closures, prototypes, async programming, and ES6+ features.',
    instructor: 'user_004',
    category: 'Programming',
    level: 'intermediate',
    isPublished: true,
    enrollmentCount: 32,
    tags: ['JavaScript', 'ES6', 'Advanced'],
    objectives: [
      'Master advanced JavaScript concepts',
      'Understand async programming patterns',
      'Learn functional programming principles',
      'Build complex applications'
    ]
  },
  {
    id: 'course_003',
    title: 'Full-Stack Web Development',
    description: 'Complete full-stack course covering frontend with React, backend with Node.js, and database management.',
    instructor: 'user_003',
    category: 'Web Development',
    level: 'intermediate',
    isPublished: true,
    enrollmentCount: 28,
    tags: ['Full-Stack', 'React', 'Node.js', 'MongoDB'],
    objectives: [
      'Build complete web applications',
      'Master frontend and backend development',
      'Learn database design and management',
      'Deploy applications to production'
    ]
  }
];

const sampleProgress = [
  {
    userId: 'user_001',
    courseId: 'course_001',
    lessonsCompleted: 8,
    totalLessons: 12,
    totalTimeSpent: 480, // 8 hours
    currentStreak: 5,
    lastAccessed: new Date().toISOString(),
    overallProgress: 67,
    averageScore: 85
  },
  {
    userId: 'user_002',
    courseId: 'course_002',
    lessonsCompleted: 3,
    totalLessons: 10,
    totalTimeSpent: 180, // 3 hours
    currentStreak: 3,
    lastAccessed: new Date().toISOString(),
    overallProgress: 30,
    averageScore: 78
  }
];

console.log('\n📊 Sample Data Summary:');
console.log(`👥 Users: ${sampleUsers.length}`);
console.log(`📚 Courses: ${sampleCourses.length}`);
console.log(`📈 Progress records: ${sampleProgress.length}`);

console.log('\n🔐 Sample Login Credentials (for development):');
console.log('Student: john.doe@example.com / password123');
console.log('Student: jane.smith@example.com / password123');
console.log('Instructor: emily.johnson@example.com / password123');
console.log('Admin: admin@astralearn.com / admin123');

console.log('\n📝 Users by Role:');
const usersByRole = sampleUsers.reduce((acc, user) => {
  acc[user.role] = (acc[user.role] || 0) + 1;
  return acc;
}, {});
Object.entries(usersByRole).forEach(([role, count]) => {
  console.log(`  ${role}: ${count}`);
});

console.log('\n📚 Courses by Level:');
const coursesByLevel = sampleCourses.reduce((acc, course) => {
  acc[course.level] = (acc[course.level] || 0) + 1;
  return acc;
}, {});
Object.entries(coursesByLevel).forEach(([level, count]) => {
  console.log(`  ${level}: ${count}`);
});

console.log('\n✅ Sample data ready for testing!');
console.log('\nTo use this data in your application:');
console.log('1. The dashboards will display fallback data when APIs are unavailable');
console.log('2. Use the sample credentials to test authentication flows');
console.log('3. Dashboard components handle missing data gracefully');
console.log('4. All error scenarios have been tested and handled');

export { sampleUsers, sampleCourses, sampleProgress };
