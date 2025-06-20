/**
 * Create Test User and Seed Courses
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function createTestUserAndSeedCourses() {
  console.log('🛠️ Creating test instructor and seeding basic courses...');
  
  try {
    // Create instructor user
    console.log('1️⃣ Creating instructor account...');
    try {
      await axios.post(`${API_BASE}/auth/register`, {
        firstName: 'Test',
        lastName: 'Instructor',
        email: 'test.instructor@example.com',
        username: 'test_instructor',
        password: 'password123',
        role: 'instructor'
      });
      console.log('✅ Instructor account created');
    } catch (error) {
      if (error.response?.data?.message?.includes('already taken')) {
        console.log('ℹ️ Instructor account already exists');
      } else {
        throw error;
      }
    }    // Login as instructor
    console.log('2️⃣ Logging in as instructor...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      identifier: 'test.instructor@example.com',
      password: 'password123'
    });
    
    console.log('📋 Full login response:', JSON.stringify(loginResponse.data, null, 2));
    
    const token = loginResponse.data.tokens?.accessToken || loginResponse.data.token || loginResponse.data.accessToken;
    console.log('✅ Logged in successfully');
    console.log('🔑 Token received:', token ? 'Yes' : 'No');
    console.log('🔑 Token length:', token ? token.length : 0);
    
    // Test token with a simple endpoint first
    console.log('🧪 Testing token with validation endpoint...');
    try {
      const validateResponse = await axios.get(`${API_BASE}/auth/validate`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Token validation successful:', validateResponse.data);
    } catch (error) {
      console.log('❌ Token validation failed:', error.response?.data);
      return;
    }    // Create a basic course with content
    console.log('3️⃣ Creating JavaScript Fundamentals course...');
    try {
      const courseResponse = await axios.post(`${API_BASE}/courses`, {
        title: 'JavaScript Fundamentals',
        description: 'Master the basics of JavaScript programming with hands-on exercises and real-world projects.',
        category: 'Programming',
        difficulty: 'Beginner',
        estimatedDuration: 20,
        isPublished: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const courseId = courseResponse.data._id;
      console.log(`✅ Course created with ID: ${courseId}`);
    } catch (courseError) {
      console.log('❌ Course creation failed:', courseError.response?.data || courseError.message);
      console.log('🔍 Trying with minimal course data...');
      
      // Try with minimal data
      const courseResponse = await axios.post(`${API_BASE}/courses`, {
        title: 'JavaScript Basics',
        description: 'Learn JavaScript fundamentals'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const courseId = courseResponse.data._id;
      console.log(`✅ Minimal course created with ID: ${courseId}`);
    }

    // Create module
    console.log('4️⃣ Creating module: Getting Started with JavaScript...');
    const moduleResponse = await axios.post(`${API_BASE}/course-management/${courseId}/modules`, {
      title: 'Getting Started with JavaScript',
      description: 'Introduction to JavaScript and setting up your development environment',
      orderIndex: 0
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const moduleId = moduleResponse.data._id;
    console.log(`✅ Module created with ID: ${moduleId}`);

    // Create lessons
    const lessons = [
      {
        title: 'What is JavaScript?',
        description: 'Understanding JavaScript and its role in web development',
        content: 'JavaScript is a versatile programming language that powers the web. In this lesson, you\'ll learn about its history, capabilities, and why it\'s essential for modern web development. We\'ll explore how JavaScript works in browsers, its syntax basics, and how it enables interactive web experiences.',
        duration: 30,
        objectives: [
          'Understand what JavaScript is and its history',
          'Learn about JavaScript\'s role in web development',
          'Explore different environments where JavaScript runs'
        ]
      },
      {
        title: 'Setting Up Your Environment',
        description: 'Installing tools and setting up your development workspace',
        content: 'Setting up a proper development environment is crucial for JavaScript programming. We\'ll cover installing Node.js, choosing a code editor like VS Code, and setting up debugging tools. You\'ll also learn about browser developer tools and how to run JavaScript code.',
        duration: 45,
        objectives: [
          'Install Node.js and npm',
          'Set up a code editor with extensions',
          'Configure debugging tools and browser dev tools'
        ]
      },
      {
        title: 'Variables and Data Types',
        description: 'Learning about variables, constants, and different data types',
        content: 'Variables are containers for storing data values. JavaScript has several data types including strings, numbers, booleans, objects, and arrays. Understanding these is fundamental to programming. We\'ll cover let, const, and var declarations, and when to use each.',
        duration: 60,
        objectives: [
          'Declare variables using let, const, and var',
          'Understand primitive data types',
          'Work with arrays and objects'
        ]
      }
    ];

    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      console.log(`5️⃣.${i + 1} Creating lesson: ${lesson.title}...`);
      
      await axios.post(`${API_BASE}/course-management/${courseId}/modules/${moduleId}/lessons`, {
        title: lesson.title,
        description: lesson.description,
        content: {
          type: 'text',
          data: lesson.content
        },
        duration: lesson.duration,
        objectives: lesson.objectives,
        orderIndex: i
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`   ✅ Lesson "${lesson.title}" created`);
    }

    // Create another course
    console.log('6️⃣ Creating React Development course...');
    const reactCourseResponse = await axios.post(`${API_BASE}/courses`, {
      title: 'React Development Mastery',
      description: 'Build modern web applications with React hooks, state management, and best practices. Features AI-powered code suggestions and personalized learning paths.',
      category: 'Web Development',
      difficulty: 'Intermediate',
      estimatedDuration: 35,
      isPublished: true,
      features: [
        'AI-Powered Learning Assistant',
        'Interactive Code Editor',
        'Real-time Feedback',
        'Project-based Learning'
      ]
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const reactCourseId = reactCourseResponse.data._id;
    console.log(`✅ React course created with ID: ${reactCourseId}`);

    // Create module for React course
    const reactModuleResponse = await axios.post(`${API_BASE}/course-management/${reactCourseId}/modules`, {
      title: 'React Fundamentals',
      description: 'Core concepts of React development',
      orderIndex: 0
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const reactModuleId = reactModuleResponse.data._id;

    // Create React lessons
    const reactLessons = [
      {
        title: 'Components and JSX',
        description: 'Understanding React components and JSX syntax',
        content: 'React components are the building blocks of React applications. JSX allows you to write HTML-like syntax in JavaScript, making it easy to describe what the UI should look like. We\'ll explore functional and class components, props, and component composition.',
        duration: 90,
        objectives: [
          'Create functional and class components',
          'Understand JSX syntax and its benefits',
          'Pass and use props in components'
        ]
      },
      {
        title: 'State and Event Handling',
        description: 'Managing component state and handling user interactions',
        content: 'State allows components to create and manage their own data. Event handling in React lets you respond to user interactions like clicks, form submissions, and more. We\'ll cover the useState hook and proper event handling patterns.',
        duration: 120,
        objectives: [
          'Use useState hook for state management',
          'Handle events in React components',
          'Update state based on user interactions'
        ]
      }
    ];

    for (let i = 0; i < reactLessons.length; i++) {
      const lesson = reactLessons[i];
      console.log(`7️⃣.${i + 1} Creating React lesson: ${lesson.title}...`);
      
      await axios.post(`${API_BASE}/course-management/${reactCourseId}/modules/${reactModuleId}/lessons`, {
        title: lesson.title,
        description: lesson.description,
        content: {
          type: 'text',
          data: lesson.content
        },
        duration: lesson.duration,
        objectives: lesson.objectives,
        orderIndex: i
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`   ✅ React lesson "${lesson.title}" created`);
    }

    // Verify courses
    console.log('8️⃣ Verifying created courses...');
    const coursesResponse = await axios.get(`${API_BASE}/courses`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✅ Total courses in system: ${coursesResponse.data.length}`);
    coursesResponse.data.forEach(course => {
      console.log(`   - ${course.title} (${course.difficulty})`);
    });

    console.log('\n🎉 Course seeding completed successfully!');
    console.log('📚 You now have courses with proper modules and lessons');
    console.log('🤖 AI integration features have been added to course descriptions');
    console.log('🎯 Learning objectives are included in each lesson');

  } catch (error) {
    console.error('❌ Seeding failed:', error.response?.data || error.message);
  }
}

// Run the seeder
createTestUserAndSeedCourses();
