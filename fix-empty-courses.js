/**
 * Fix Existing Empty Courses
 * Add modules and lessons to courses that have none
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Get auth token
async function getToken() {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      identifier: 'sarah@example.com',
      password: 'password123'
    });
    return response.data.tokens?.accessToken;
  } catch (error) {
    console.error('Failed to get token:', error.response?.data || error.message);
    return null;
  }
}

// Course content templates by category
const courseContentTemplates = {
  'Mobile App Development with Flutter': {
    modules: [
      {
        title: 'Flutter Foundations',
        description: 'Get started with Flutter development',
        lessons: [
          {
            title: 'Introduction to Flutter',
            description: 'Understanding Flutter framework and its advantages',
            content: 'Flutter is Google\'s UI toolkit for building natively compiled applications for mobile, web, and desktop from a single codebase. In this lesson, you\'ll learn about Flutter\'s architecture, why it\'s popular among developers, and how it compares to other mobile development frameworks.',
            duration: 45,
            objectives: [
              'Understand what Flutter is and its benefits',
              'Learn about Flutter\'s architecture',
              'Set up Flutter development environment'
            ]
          },
          {
            title: 'Dart Programming Basics',
            description: 'Learning Dart language fundamentals',
            content: 'Dart is the programming language used by Flutter. We\'ll cover variables, functions, classes, and object-oriented programming concepts in Dart. You\'ll also learn about async programming and how Dart handles state management.',
            duration: 60,
            objectives: [
              'Master Dart syntax and basic concepts',
              'Understand object-oriented programming in Dart',
              'Learn async programming with Dart'
            ]
          }
        ]
      },
      {
        title: 'Building User Interfaces',
        description: 'Creating beautiful and responsive UIs with Flutter widgets',
        lessons: [
          {
            title: 'Flutter Widgets Overview',
            description: 'Understanding the widget tree and common widgets',
            content: 'Everything in Flutter is a widget. From layout structures to styling elements, widgets are the building blocks of Flutter apps. We\'ll explore stateless and stateful widgets, the widget tree concept, and commonly used widgets.',
            duration: 75,
            objectives: [
              'Understand the widget system in Flutter',
              'Learn about stateless vs stateful widgets',
              'Use common Flutter widgets effectively'
            ]
          }
        ]
      }
    ]
  },
  'Cybersecurity Fundamentals': {
    modules: [
      {
        title: 'Introduction to Cybersecurity',
        description: 'Understanding cybersecurity basics and principles',
        lessons: [
          {
            title: 'What is Cybersecurity?',
            description: 'Overview of cybersecurity and its importance',
            content: 'Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks. These attacks usually aim to access, change, or destroy sensitive information. We\'ll explore the CIA triad (Confidentiality, Integrity, Availability) and common security threats.',
            duration: 40,
            objectives: [
              'Define cybersecurity and its importance',
              'Understand the CIA triad',
              'Identify common cyber threats'
            ]
          },
          {
            title: 'Types of Cyber Threats',
            description: 'Understanding different categories of cyber attacks',
            content: 'Cyber threats come in many forms including malware, phishing, ransomware, and social engineering. Each type targets different vulnerabilities and requires specific defense strategies. We\'ll examine real-world examples and their impact.',
            duration: 50,
            objectives: [
              'Identify different types of cyber threats',
              'Understand attack vectors and methods',
              'Analyze real-world cyber attack cases'
            ]
          }
        ]
      },
      {
        title: 'Security Best Practices',
        description: 'Implementing effective security measures',
        lessons: [
          {
            title: 'Password Security and Authentication',
            description: 'Creating strong passwords and secure authentication',
            content: 'Strong authentication is the first line of defense against unauthorized access. We\'ll cover password best practices, two-factor authentication, and modern authentication methods like biometrics and single sign-on.',
            duration: 45,
            objectives: [
              'Create and manage strong passwords',
              'Implement two-factor authentication',
              'Understand modern authentication methods'
            ]
          }
        ]
      }
    ]
  },
  'Python for Data Science': {
    modules: [
      {
        title: 'Python Foundations for Data Science',
        description: 'Essential Python skills for data analysis',
        lessons: [
          {
            title: 'Python Data Structures',
            description: 'Working with lists, dictionaries, and data types',
            content: 'Python offers powerful built-in data structures that are essential for data science. We\'ll explore lists, tuples, dictionaries, and sets, learning how to manipulate and analyze data efficiently using these structures.',
            duration: 60,
            objectives: [
              'Master Python data structures',
              'Perform data manipulation operations',
              'Choose appropriate data structures for tasks'
            ]
          },
          {
            title: 'Introduction to NumPy',
            description: 'Numerical computing with NumPy arrays',
            content: 'NumPy is the foundation of scientific computing in Python. We\'ll learn about NumPy arrays, mathematical operations, and how NumPy makes data analysis faster and more efficient than pure Python.',
            duration: 75,
            objectives: [
              'Create and manipulate NumPy arrays',
              'Perform mathematical operations on arrays',
              'Understand NumPy\'s performance benefits'
            ]
          }
        ]
      },
      {
        title: 'Data Analysis with Pandas',
        description: 'Using Pandas for data manipulation and analysis',
        lessons: [
          {
            title: 'DataFrames and Series',
            description: 'Working with Pandas data structures',
            content: 'Pandas provides two main data structures: Series and DataFrames. These structures make it easy to work with structured data, perform cleaning operations, and conduct exploratory data analysis.',
            duration: 90,
            objectives: [
              'Create and manipulate DataFrames and Series',
              'Perform data cleaning operations',
              'Conduct basic exploratory data analysis'
            ]
          }
        ]
      }
    ]
  },
  'React Development Masterclass': {
    modules: [
      {
        title: 'React Fundamentals',
        description: 'Core React concepts and components',
        lessons: [
          {
            title: 'Introduction to React',
            description: 'Understanding React library and its ecosystem',
            content: 'React is a popular JavaScript library for building user interfaces, particularly web applications. We\'ll explore React\'s component-based architecture, virtual DOM concept, and how React fits into modern web development.',
            duration: 50,
            objectives: [
              'Understand React\'s purpose and benefits',
              'Learn about component-based architecture',
              'Set up a React development environment'
            ]
          },
          {
            title: 'JSX and Components',
            description: 'Writing JSX and creating React components',
            content: 'JSX is a syntax extension for JavaScript that looks similar to HTML. It makes writing React components more intuitive and readable. We\'ll learn JSX syntax, create functional components, and understand the component lifecycle.',
            duration: 70,
            objectives: [
              'Write JSX syntax correctly',
              'Create functional React components',
              'Understand component props and children'
            ]
          }
        ]
      },
      {
        title: 'State Management and Hooks',
        description: 'Managing state with React hooks',
        lessons: [
          {
            title: 'useState and useEffect Hooks',
            description: 'Managing component state and side effects',
            content: 'React hooks allow functional components to have state and lifecycle methods. useState manages component state while useEffect handles side effects like API calls and subscriptions.',
            duration: 85,
            objectives: [
              'Use useState for component state',
              'Handle side effects with useEffect',
              'Understand hook rules and best practices'
            ]
          }
        ]
      }
    ]
  }
};

async function fixEmptyCourses() {
  console.log('🔧 Fixing empty courses with content...');
  
  const token = await getToken();
  if (!token) {
    console.error('❌ Failed to get authentication token');
    return;
  }

  try {    // Get all courses
    const coursesResponse = await axios.get(`${API_BASE}/courses`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('📋 Raw courses response:', JSON.stringify(coursesResponse.data, null, 2));
    
    const courses = coursesResponse.data.courses || coursesResponse.data || [];
    console.log(`📚 Found ${courses.length} courses`);

    for (const course of courses) {
      console.log(`\n🔍 Checking course: ${course.title}`);
      
      // Get course hierarchy to see if it has content
      try {
        const hierarchyResponse = await axios.get(`${API_BASE}/course-management/${course._id}/hierarchy`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const modules = hierarchyResponse.data.course.modules || [];
        const totalLessons = modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0);
        
        if (modules.length === 0 || totalLessons === 0) {
          console.log(`   ⚠️ Course has ${modules.length} modules and ${totalLessons} lessons - needs content`);
          
          // Check if we have content template for this course
          const template = courseContentTemplates[course.title];
          if (template) {
            console.log(`   ✅ Found content template, adding modules and lessons...`);
            await addContentToCourse(course._id, template, token);
          } else {
            console.log(`   📝 No specific template, adding generic content...`);
            await addGenericContent(course, token);
          }
        } else {
          console.log(`   ✅ Course already has content: ${modules.length} modules, ${totalLessons} lessons`);
        }
        
      } catch (error) {
        console.log(`   ❌ Failed to check course hierarchy: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Failed to fix courses:', error.response?.data || error.message);
  }
}

// Add content from template to course
async function addContentToCourse(courseId, template, token) {
  try {
    console.log(`     📁 Adding ${template.modules.length} modules with lessons...`);
    
    // Prepare modules with nested lessons for the new API endpoint
    const modulesData = template.modules.map((moduleData, moduleIndex) => ({
      title: moduleData.title,
      description: moduleData.description,
      lessons: moduleData.lessons.map((lessonData, lessonIndex) => ({
        title: lessonData.title,
        content: lessonData.content,
        type: 'text',
        duration: lessonData.duration || 30
      }))
    }));
    
    const response = await axios.post(`${API_BASE}/course-management/${courseId}/modules`, {
      modules: modulesData
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`     ✅ Successfully added ${response.data.addedModules} modules to course`);
  } catch (error) {
    console.log(`     ❌ Failed to add content: ${error.response?.data ? JSON.stringify(error.response.data, null, 2) : error.message}`);
  }
}

// Add generic content to course
async function addGenericContent(course, token) {
  try {
    console.log(`     📁 Creating generic module for: ${course.title}`);
    
    // Create module with nested lessons using the new API structure
    const moduleData = {
      title: `Introduction to ${course.title}`,
      description: `Getting started with ${course.title}`,
      lessons: [
        {
          title: `Overview of ${course.title}`,
          content: `Welcome to ${course.title}! This comprehensive course will guide you through all the essential concepts and practical skills you need to master this subject. We'll start with the basics and gradually build up to more advanced topics.`,
          type: 'text',
          duration: 30
        },
        {
          title: 'Getting Started',
          content: `In this lesson, we'll prepare you for the learning journey ahead. You'll learn about the tools, resources, and mindset needed to succeed in ${course.title}. We'll also outline the course structure and learning path.`,
          type: 'text',
          duration: 45
        }
      ]
    };
    
    const response = await axios.post(`${API_BASE}/course-management/${course._id}/modules`, {
      modules: [moduleData]
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`     ✅ Added generic content: 1 module with ${moduleData.lessons.length} lessons`);
  } catch (error) {
    console.log(`     ❌ Failed to add generic content: ${error.response?.data ? JSON.stringify(error.response.data, null, 2) : error.message}`);
  }
}

// Run the fixer
fixEmptyCourses();
