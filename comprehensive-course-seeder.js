/**
 * Comprehensive Course Content Seeder
 * Creates courses with proper modules, lessons, and content
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Sample course content templates
const courseTemplates = [
  {
    title: "JavaScript Fundamentals",
    description: "Master the basics of JavaScript programming with hands-on exercises and real-world projects.",
    category: "Programming",
    difficulty: "Beginner",
    estimatedDuration: 20,
    modules: [
      {
        title: "Getting Started with JavaScript",
        description: "Introduction to JavaScript and setting up your development environment",
        lessons: [
          {
            title: "What is JavaScript?",
            description: "Understanding JavaScript and its role in web development",
            content: "JavaScript is a versatile programming language that powers the web. In this lesson, you'll learn about its history, capabilities, and why it's essential for modern web development.",
            duration: 30,
            objectives: [
              "Understand what JavaScript is and its history",
              "Learn about JavaScript's role in web development",
              "Explore different environments where JavaScript runs"
            ]
          },
          {
            title: "Setting Up Your Environment",
            description: "Installing tools and setting up your development workspace",
            content: "Setting up a proper development environment is crucial for JavaScript programming. We'll cover installing Node.js, choosing a code editor, and setting up debugging tools.",
            duration: 45,
            objectives: [
              "Install Node.js and npm",
              "Set up a code editor with extensions",
              "Configure debugging tools"
            ]
          }
        ]
      },
      {
        title: "JavaScript Basics",
        description: "Core concepts and syntax of JavaScript",
        lessons: [
          {
            title: "Variables and Data Types",
            description: "Learning about variables, constants, and different data types",
            content: "Variables are containers for storing data values. JavaScript has several data types including strings, numbers, booleans, objects, and arrays. Understanding these is fundamental to programming.",
            duration: 60,
            objectives: [
              "Declare variables using let, const, and var",
              "Understand primitive data types",
              "Work with arrays and objects"
            ]
          },
          {
            title: "Functions and Control Flow",
            description: "Writing functions and controlling program flow",
            content: "Functions are reusable blocks of code. Control flow statements like if/else and loops allow you to control how your program executes based on different conditions.",
            duration: 75,
            objectives: [
              "Write and call functions",
              "Use if/else statements",
              "Implement loops for repetitive tasks"
            ]
          }
        ]
      }
    ]
  },
  {
    title: "React Development Mastery",
    description: "Build modern web applications with React hooks, state management, and best practices.",
    category: "Web Development",
    difficulty: "Intermediate",
    estimatedDuration: 35,
    modules: [
      {
        title: "React Fundamentals",
        description: "Core concepts of React development",
        lessons: [
          {
            title: "Components and JSX",
            description: "Understanding React components and JSX syntax",
            content: "React components are the building blocks of React applications. JSX allows you to write HTML-like syntax in JavaScript, making it easy to describe what the UI should look like.",
            duration: 90,
            objectives: [
              "Create functional and class components",
              "Understand JSX syntax and its benefits",
              "Pass and use props in components"
            ]
          },
          {
            title: "State and Event Handling",
            description: "Managing component state and handling user interactions",
            content: "State allows components to create and manage their own data. Event handling in React lets you respond to user interactions like clicks, form submissions, and more.",
            duration: 120,
            objectives: [
              "Use useState hook for state management",
              "Handle events in React components",
              "Update state based on user interactions"
            ]
          }
        ]
      },
      {
        title: "Advanced React Patterns",
        description: "Advanced techniques and patterns in React",
        lessons: [
          {
            title: "Custom Hooks and Context",
            description: "Creating reusable logic with custom hooks and managing global state",
            content: "Custom hooks allow you to extract component logic into reusable functions. Context provides a way to pass data through the component tree without having to pass props down manually.",
            duration: 150,
            objectives: [
              "Create and use custom hooks",
              "Implement Context for global state",
              "Understand when to use different patterns"
            ]
          }
        ]
      }
    ]
  },
  {
    title: "Data Science with Python",
    description: "Learn data analysis, visualization, and machine learning using Python and popular libraries.",
    category: "Data Science",
    difficulty: "Intermediate",
    estimatedDuration: 40,
    modules: [
      {
        title: "Python for Data Science",
        description: "Getting started with Python libraries for data science",
        lessons: [
          {
            title: "NumPy and Pandas Basics",
            description: "Working with numerical data and dataframes",
            content: "NumPy and Pandas are essential libraries for data science in Python. NumPy provides powerful numerical computing capabilities, while Pandas offers data structures and analysis tools.",
            duration: 120,
            objectives: [
              "Work with NumPy arrays",
              "Create and manipulate Pandas DataFrames",
              "Perform basic data cleaning operations"
            ]
          },
          {
            title: "Data Visualization",
            description: "Creating charts and graphs to visualize data",
            content: "Data visualization is crucial for understanding and communicating insights from data. We'll use Matplotlib and Seaborn to create various types of plots and charts.",
            duration: 90,
            objectives: [
              "Create basic plots with Matplotlib",
              "Use Seaborn for statistical visualizations",
              "Customize plots for better presentation"
            ]
          }
        ]
      }
    ]
  },
  {
    title: "Machine Learning Foundations",
    description: "Introduction to machine learning concepts, algorithms, and practical applications.",
    category: "Artificial Intelligence",
    difficulty: "Advanced",
    estimatedDuration: 50,
    modules: [
      {
        title: "Introduction to Machine Learning",
        description: "Understanding ML concepts and types of learning",
        lessons: [
          {
            title: "What is Machine Learning?",
            description: "Overview of machine learning and its applications",
            content: "Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed. We'll explore different types of ML and real-world applications.",
            duration: 60,
            objectives: [
              "Understand what machine learning is",
              "Distinguish between supervised, unsupervised, and reinforcement learning",
              "Identify real-world ML applications"
            ]
          },
          {
            title: "Linear Regression",
            description: "Understanding and implementing linear regression",
            content: "Linear regression is one of the most fundamental algorithms in machine learning. It's used to predict continuous values and understand relationships between variables.",
            duration: 180,
            objectives: [
              "Understand the mathematical foundation of linear regression",
              "Implement linear regression from scratch",
              "Evaluate model performance using metrics"
            ]
          }
        ]
      }
    ]
  },
  {
    title: "Digital Marketing Strategy",
    description: "Comprehensive guide to digital marketing including SEO, social media, and analytics.",
    category: "Marketing",
    difficulty: "Beginner",
    estimatedDuration: 25,
    modules: [
      {
        title: "Digital Marketing Basics",
        description: "Foundation concepts of digital marketing",
        lessons: [
          {
            title: "Introduction to Digital Marketing",
            description: "Overview of digital marketing channels and strategies",
            content: "Digital marketing encompasses all marketing efforts that use electronic devices or the internet. Businesses leverage digital channels such as search engines, social media, email, and websites to connect with current and prospective customers.",
            duration: 45,
            objectives: [
              "Understand the digital marketing landscape",
              "Identify key digital marketing channels",
              "Learn about customer journey mapping"
            ]
          },
          {
            title: "SEO Fundamentals",
            description: "Search engine optimization basics and best practices",
            content: "SEO is the practice of increasing the quantity and quality of traffic to your website through organic search engine results. Understanding how search engines work and what people search for is crucial for success.",
            duration: 90,
            objectives: [
              "Understand how search engines work",
              "Learn keyword research techniques",
              "Implement on-page SEO best practices"
            ]
          }
        ]
      }
    ]
  }
];

// Get instructor token
async function getInstructorToken() {
  try {    // Try existing demo accounts first
    const accounts = [
      { identifier: 'demo@test.com', password: 'password123' },
      { identifier: 'instructor@test.com', password: 'password123' },
      { identifier: 'admin@test.com', password: 'password123' }
    ];
    
    for (const account of accounts) {
      try {
        const response = await axios.post(`${API_BASE}/auth/login`, account);
        console.log(`✅ Logged in as: ${account.identifier}`);
        return response.data.token;
      } catch (error) {
        console.log(`⚠️ Failed to login as ${account.identifier}: ${error.response?.data?.error || error.message}`);
      }
    }
      // If no existing accounts work, create a new instructor
    console.log('📝 Creating new instructor account...');
    await axios.post(`${API_BASE}/auth/register`, {
      firstName: 'Course',
      lastName: 'Instructor',
      email: 'instructor@test.com',
      username: 'instructor_demo',
      password: 'password123',
      role: 'instructor'
    });
      const response = await axios.post(`${API_BASE}/auth/login`, {
      identifier: 'instructor@test.com',
      password: 'password123'
    });
    
    return response.data.token;
  } catch (error) {
    console.error('Failed to get instructor token:', error.response?.data || error.message);
    return null;
  }
}

// Create a course with modules and lessons
async function createCourseWithContent(courseData, token) {
  try {
    console.log(`\n📚 Creating course: ${courseData.title}`);
    
    // Create the course
    const courseResponse = await axios.post(`${API_BASE}/courses`, {
      title: courseData.title,
      description: courseData.description,
      category: courseData.category,
      difficulty: courseData.difficulty,
      estimatedDuration: courseData.estimatedDuration,
      isPublished: true
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const courseId = courseResponse.data._id;
    console.log(`✅ Course created with ID: ${courseId}`);

    // Create modules and lessons
    for (let moduleIndex = 0; moduleIndex < courseData.modules.length; moduleIndex++) {
      const moduleData = courseData.modules[moduleIndex];
      
      console.log(`  📁 Creating module: ${moduleData.title}`);
      
      const moduleResponse = await axios.post(`${API_BASE}/course-management/${courseId}/modules`, {
        title: moduleData.title,
        description: moduleData.description,
        orderIndex: moduleIndex
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const moduleId = moduleResponse.data._id;
      console.log(`    ✅ Module created with ID: ${moduleId}`);

      // Create lessons for this module
      for (let lessonIndex = 0; lessonIndex < moduleData.lessons.length; lessonIndex++) {
        const lessonData = moduleData.lessons[lessonIndex];
        
        console.log(`    📝 Creating lesson: ${lessonData.title}`);
        
        await axios.post(`${API_BASE}/course-management/${courseId}/modules/${moduleId}/lessons`, {
          title: lessonData.title,
          description: lessonData.description,
          content: {
            type: 'text',
            data: lessonData.content
          },
          duration: lessonData.duration,
          objectives: lessonData.objectives,
          orderIndex: lessonIndex
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`      ✅ Lesson created`);
      }
    }

    return courseId;
  } catch (error) {
    console.error(`❌ Failed to create course ${courseData.title}:`, error.response?.data || error.message);
    return null;
  }
}

// Main seeding function
async function seedCourseContent() {
  console.log('🌱 Starting comprehensive course content seeding...');
  
  const token = await getInstructorToken();
  if (!token) {
    console.error('❌ Failed to get authentication token');
    return;
  }

  console.log('✅ Authentication successful');

  const createdCourses = [];
  
  for (const courseTemplate of courseTemplates) {
    const courseId = await createCourseWithContent(courseTemplate, token);
    if (courseId) {
      createdCourses.push({
        id: courseId,
        title: courseTemplate.title
      });
    }
    
    // Small delay between courses
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n🎉 Course seeding completed!');
  console.log(`📊 Successfully created ${createdCourses.length} courses:`);
  createdCourses.forEach(course => {
    console.log(`  - ${course.title} (ID: ${course.id})`);
  });

  // Verify course hierarchy
  console.log('\n🔍 Verifying course hierarchy...');
  for (const course of createdCourses) {
    try {
      const response = await axios.get(`${API_BASE}/course-management/${course.id}/hierarchy`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const modules = response.data.course.modules || [];
      const totalLessons = modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0);
      
      console.log(`  ✅ ${course.title}: ${modules.length} modules, ${totalLessons} lessons`);
    } catch (error) {
      console.log(`  ❌ ${course.title}: Failed to verify hierarchy`);
    }
  }
}

// Run the seeder
if (require.main === module) {
  seedCourseContent();
}

module.exports = { seedCourseContent, courseTemplates };
