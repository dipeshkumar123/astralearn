/**
 * Comprehensive Course Content Seeder - Final Version
 * Logs in as the appropriate instructor for each course to bypass authorization
 */

import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Instructor credentials mapping
const instructorCredentials = {
  'sarah@example.com': { identifier: 'sarah@example.com', password: 'password123' },
  'michael@example.com': { identifier: 'michael@example.com', password: 'password123' },
  'jennifer@example.com': { identifier: 'jennifer@example.com', password: 'password123' }
};

// Get auth token for specific instructor
async function getTokenForInstructor(instructorEmail) {
  try {
    const credentials = instructorCredentials[instructorEmail];
    if (!credentials) {
      throw new Error(`No credentials found for instructor: ${instructorEmail}`);
    }

    const response = await axios.post(`${API_BASE}/auth/login`, credentials);
    return response.data.tokens?.accessToken;
  } catch (error) {
    console.error(`Failed to get token for ${instructorEmail}:`, error.response?.data || error.message);
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
            content: 'Flutter is Google\'s UI toolkit for building natively compiled applications for mobile, web, and desktop from a single codebase. In this lesson, you\'ll learn about Flutter\'s architecture, its relationship with Dart, and why it\'s becoming the preferred choice for cross-platform development.',
            duration: 45
          },
          {
            title: 'Setting Up Development Environment',
            content: 'Learn how to install Flutter SDK, set up Android Studio and VS Code, configure emulators, and create your first Flutter project. We\'ll walk through the installation process step by step.',
            duration: 60
          }
        ]
      },
      {
        title: 'Building User Interfaces',
        description: 'Create beautiful and responsive mobile UIs with Flutter widgets',
        lessons: [
          {
            title: 'Understanding Widgets',
            content: 'Everything in Flutter is a widget. Learn about StatelessWidget and StatefulWidget, the widget tree, and how to compose complex UIs from simple building blocks.',
            duration: 50
          },
          {
            title: 'Layout and Navigation',
            content: 'Master Flutter\'s layout system with Column, Row, Stack, and other layout widgets. Learn about navigation between screens and passing data.',
            duration: 55
          }
        ]
      }
    ]
  },
  'Cybersecurity Fundamentals': {
    modules: [
      {
        title: 'Introduction to Cybersecurity',
        description: 'Understanding the fundamentals of cybersecurity',
        lessons: [
          {
            title: 'What is Cybersecurity?',
            content: 'Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks. These attacks usually aim to access, change, or destroy sensitive information. We\'ll explore the CIA triad (Confidentiality, Integrity, Availability) and common security threats.',
            duration: 40
          },
          {
            title: 'Types of Cyber Threats',
            content: 'Cyber threats come in many forms including malware, phishing, ransomware, and social engineering. Each type targets different vulnerabilities and requires specific defense strategies. We\'ll examine real-world examples and their impact.',
            duration: 50
          }
        ]
      },
      {
        title: 'Network Security',
        description: 'Protecting networks and network communication',
        lessons: [
          {
            title: 'Network Security Fundamentals',
            content: 'Learn about firewalls, intrusion detection systems, VPNs, and network segmentation. Understand how network protocols can be secured and common network attack vectors.',
            duration: 45
          },
          {
            title: 'Wireless Security',
            content: 'Explore the unique challenges of securing wireless networks, including WPA3, enterprise wireless security, and mobile device management.',
            duration: 40
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
            title: 'Python Basics and Data Types',
            content: 'Learn Python fundamentals including variables, data types, control structures, and functions with a focus on data science applications. We\'ll cover lists, dictionaries, and NumPy arrays.',
            duration: 50
          },
          {
            title: 'Working with Pandas',
            content: 'Master the Pandas library for data manipulation and analysis. Learn about DataFrames, Series, data cleaning, filtering, and basic statistical operations.',
            duration: 60
          }
        ]
      },
      {
        title: 'Data Visualization and Analysis',
        description: 'Creating insights through data visualization',
        lessons: [
          {
            title: 'Matplotlib and Seaborn',
            content: 'Create compelling data visualizations using Matplotlib and Seaborn. Learn about different chart types, customization options, and best practices for data storytelling.',
            duration: 55
          },
          {
            title: 'Statistical Analysis with Python',
            content: 'Perform statistical analysis using SciPy and statsmodels. Learn about descriptive statistics, hypothesis testing, and correlation analysis.',
            duration: 50
          }
        ]
      }
    ]
  },
  'React Development Masterclass': {
    modules: [
      {
        title: 'React Fundamentals',
        description: 'Core concepts of React development',
        lessons: [
          {
            title: 'Introduction to React',
            content: 'React is a JavaScript library for building user interfaces, particularly web applications. Learn about the virtual DOM, component-based architecture, and JSX syntax.',
            duration: 45
          },
          {
            title: 'Components and Props',
            content: 'Understand how to create reusable components, pass data through props, and compose complex UIs from simple building blocks.',
            duration: 50
          }
        ]
      },
      {
        title: 'State Management and Hooks',
        description: 'Managing application state in React',
        lessons: [
          {
            title: 'React Hooks',
            content: 'React hooks allow functional components to have state and lifecycle methods. useState manages component state while useEffect handles side effects like API calls and subscriptions.',
            duration: 55
          },
          {
            title: 'Context API and State Management',
            content: 'Learn about React Context for sharing state across components and when to consider external state management libraries like Redux.',
            duration: 60
          }
        ]
      }
    ]
  }
};

// Main function to fix empty courses
async function fixAllCourses() {
  try {
    console.log('🔧 Comprehensively fixing all courses with proper instructor authentication...');
    
    // Get all courses
    const coursesResponse = await axios.get(`${API_BASE}/courses`);
    const courses = coursesResponse.data.courses;
    
    console.log(`📚 Found ${courses.length} courses`);
    
    for (const course of courses) {
      console.log(`\\n🔍 Processing course: ${course.title}`);
      console.log(`   📧 Instructor: ${course.instructor.email}`);
      
      try {
        // Get token for this course's instructor
        const token = await getTokenForInstructor(course.instructor.email);
        if (!token) {
          console.log(`   ❌ Failed to authenticate as instructor ${course.instructor.email}`);
          continue;
        }
        
        // Check course hierarchy
        const hierarchyResponse = await axios.get(`${API_BASE}/course-management/${course._id}/hierarchy`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const courseData = hierarchyResponse.data.course;
        const modules = courseData.modules || [];
        const totalLessons = modules.reduce((total, module) => total + (module.lessons?.length || 0), 0);
        
        if (modules.length === 0) {
          console.log(`   ⚠️ Course has 0 modules and 0 lessons - needs content`);
          
          // Check if we have a template for this course
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
        console.log(`   ❌ Failed to process course: ${error.response?.data?.message || error.message}`);
      }
    }
    
    console.log('\\n✅ Course content seeding completed!');

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
          title: 'Getting Started',            content: 'In this lesson, we\'ll prepare you for the learning journey ahead. You\'ll learn about the tools, resources, and mindset needed to succeed in ${course.title}. We\'ll also outline the course structure and learning path.',
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

// Run the comprehensive fixer
fixAllCourses();
