/**
 * Add Course Content (Modules and Lessons)
 * This will add meaningful content to existing courses so that preview works
 */

const fetch = require('node-fetch');

async function addCourseContent() {
  console.log('=== Adding Course Content for Preview ===\n');

  const baseUrl = 'http://localhost:5000/api';

  try {
    // Get the first course
    const coursesResponse = await fetch(`${baseUrl}/courses`);
    const coursesData = await coursesResponse.json();
    
    if (!coursesData.courses || coursesData.courses.length === 0) {
      console.log('❌ No courses found');
      return;
    }

    const firstCourse = coursesData.courses[0];
    console.log(`📋 Adding content to: ${firstCourse.title}`);

    // Create a complete course hierarchy using course-management API
    const courseHierarchy = {
      courseInfo: {
        title: firstCourse.title,
        description: firstCourse.description,
        difficulty: firstCourse.difficulty || 'beginner',
        estimatedDuration: firstCourse.estimatedDuration || 60,
        objectives: [
          'Understand the fundamentals of the subject',
          'Apply learned concepts in practical scenarios',
          'Complete hands-on exercises and projects'
        ],
        tags: firstCourse.tags || ['programming', 'development'],
        metadata: {
          category: firstCourse.category || 'Programming',
          targetAudience: ['beginners', 'intermediate'],
          skillsGained: ['problem-solving', 'coding', 'project-development']
        }
      },
      modules: [
        {
          title: 'Introduction and Setup',
          description: 'Get started with the fundamentals and set up your development environment',
          objectives: [
            'Understand the course objectives',
            'Set up development environment',
            'Complete first hands-on exercise'
          ],
          estimatedDuration: 30,
          difficulty: 'beginner',
          lessons: [
            {
              title: 'Welcome to the Course',
              description: 'Course overview and what you will learn',
              type: 'video',
              estimatedDuration: 10,
              content: {
                type: 'mixed',
                blocks: [
                  {
                    type: 'text',
                    content: 'Welcome to this comprehensive course! In this introductory lesson, we will cover the course objectives, learning outcomes, and what you can expect to achieve by the end of this program.'
                  },
                  {
                    type: 'text', 
                    content: 'This course is designed to take you from beginner to proficient level through hands-on exercises, real-world projects, and expert guidance.'
                  }
                ]
              },
              objectives: ['Understand course structure', 'Set learning expectations']
            },
            {
              title: 'Environment Setup',
              description: 'Setting up your development environment',
              type: 'text',
              estimatedDuration: 20,
              content: {
                type: 'mixed',
                blocks: [
                  {
                    type: 'text',
                    content: 'Before we dive into the core content, lets set up your development environment. This is a crucial step that will ensure you can follow along with all the practical exercises.'
                  },
                  {
                    type: 'code',
                    content: '// Sample setup code\nconst environment = {\n  version: "latest",\n  tools: ["editor", "debugger", "compiler"]\n};\n\nconsole.log("Environment ready!", environment);'
                  },
                  {
                    type: 'text',
                    content: 'Make sure to test your setup before proceeding to the next lesson.'
                  }
                ]
              },
              objectives: ['Install required tools', 'Configure development environment', 'Test setup']
            }
          ]
        },
        {
          title: 'Core Concepts',
          description: 'Learn the fundamental concepts and principles',
          objectives: [
            'Master core concepts',
            'Understand key principles',
            'Apply concepts in practice'
          ],
          estimatedDuration: 45,
          difficulty: 'intermediate',
          lessons: [
            {
              title: 'Fundamental Principles',
              description: 'Understanding the core principles',
              type: 'text',
              estimatedDuration: 15,
              content: {
                type: 'mixed',
                blocks: [
                  {
                    type: 'text',
                    content: 'In this lesson, we will explore the fundamental principles that form the foundation of everything we will learn in this course.'
                  },
                  {
                    type: 'text',
                    content: 'These principles include: modularity, reusability, scalability, and maintainability. Each of these concepts plays a crucial role in professional development.'
                  }
                ]
              },
              objectives: ['Learn key principles', 'Understand their importance']
            },
            {
              title: 'Practical Application',
              description: 'Applying concepts in real scenarios',
              type: 'exercise',
              estimatedDuration: 30,
              content: {
                type: 'mixed',
                blocks: [
                  {
                    type: 'text',
                    content: 'Now that you understand the fundamental principles, lets apply them in a practical exercise.'
                  },
                  {
                    type: 'code',
                    content: '// Exercise: Implement a simple module\nclass Module {\n  constructor(name) {\n    this.name = name;\n    this.initialized = false;\n  }\n  \n  initialize() {\n    this.initialized = true;\n    console.log(`${this.name} module initialized`);\n  }\n  \n  execute() {\n    if (!this.initialized) {\n      throw new Error("Module not initialized");\n    }\n    return `${this.name} module executed successfully`;\n  }\n}\n\n// Your task: Create and use the module'
                  }
                ]
              },
              objectives: ['Implement practical solution', 'Test your implementation']
            }
          ]
        },
        {
          title: 'Advanced Topics',
          description: 'Explore advanced concepts and best practices',
          objectives: [
            'Master advanced techniques',
            'Learn industry best practices',
            'Build complex projects'
          ],
          estimatedDuration: 60,
          difficulty: 'advanced',
          lessons: [
            {
              title: 'Advanced Techniques',
              description: 'Learning advanced implementation techniques',
              type: 'video',
              estimatedDuration: 25,
              content: {
                type: 'mixed',
                blocks: [
                  {
                    type: 'text',
                    content: 'In this advanced lesson, we will explore sophisticated techniques used by industry professionals.'
                  },
                  {
                    type: 'text',
                    content: 'These techniques will help you write more efficient, maintainable, and scalable code.'
                  }
                ]
              },
              objectives: ['Learn advanced patterns', 'Understand performance optimization']
            },
            {
              title: 'Final Project',
              description: 'Build a comprehensive project',
              type: 'project',
              estimatedDuration: 35,
              content: {
                type: 'mixed',
                blocks: [
                  {
                    type: 'text',
                    content: 'For your final project, you will build a comprehensive application that demonstrates all the concepts you have learned throughout this course.'
                  },
                  {
                    type: 'text',
                    content: 'Project Requirements:\n• Apply all learned principles\n• Implement advanced techniques\n• Include proper documentation\n• Follow best practices'
                  }
                ]
              },
              objectives: ['Build complete project', 'Demonstrate mastery', 'Apply all concepts']
            }
          ]
        }
      ]
    };

    // Create the course hierarchy
    console.log('\n📚 Creating course content...');
    const createResponse = await fetch(`${baseUrl}/course-management/${firstCourse._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Use flexible auth for development
      },
      body: JSON.stringify(courseHierarchy)
    });

    if (createResponse.ok) {
      const result = await createResponse.json();
      console.log('✅ Course content created successfully!');
      console.log(`📋 Course: ${result.course?.title || 'Unknown'}`);
      console.log(`📚 Modules: ${result.course?.modules?.length || 0}`);
      
      if (result.course?.modules) {
        result.course.modules.forEach((module, index) => {
          console.log(`   Module ${index + 1}: ${module.title} (${module.lessons?.length || 0} lessons)`);
        });
      }
    } else {
      const errorText = await createResponse.text();
      console.log('❌ Failed to create course content');
      console.log('📋 Error:', errorText);
      
      // Try alternative approach - create modules directly
      console.log('\n🔄 Trying alternative approach...');
      await createModulesDirectly(firstCourse._id);
    }

  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

async function createModulesDirectly(courseId) {
  const baseUrl = 'http://localhost:5000/api';
  
  console.log('📚 Creating modules directly...');
  
  const modules = [
    {
      title: 'Introduction and Setup',
      description: 'Get started with the fundamentals',
      courseId: courseId,
      estimatedDuration: 30,
      difficulty: 'beginner',
      objectives: ['Understand course structure', 'Set up environment']
    },
    {
      title: 'Core Concepts',
      description: 'Learn the fundamental concepts',
      courseId: courseId,
      estimatedDuration: 45,
      difficulty: 'intermediate',
      objectives: ['Master core concepts', 'Apply principles']
    }
  ];

  for (const moduleData of modules) {
    try {
      const response = await fetch(`${baseUrl}/modules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(moduleData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Created module: ${result.data?.title || moduleData.title}`);
      } else {
        console.log(`❌ Failed to create module: ${moduleData.title}`);
      }
    } catch (error) {
      console.log(`❌ Error creating module ${moduleData.title}:`, error.message);
    }
  }
}

// Run the script
addCourseContent();
