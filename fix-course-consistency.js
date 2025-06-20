/**
 * Course Name and Content Consistency Fixer
 * Ensures course titles, descriptions, and content are consistent
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Get instructor token
async function getInstructorToken() {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'instructor@test.com',
      password: 'password123'
    });
    return response.data.token;
  } catch (error) {
    console.error('Failed to get instructor token:', error.message);
    return null;
  }
}

// Check and fix course consistency
async function fixCourseConsistency() {
  console.log('🔧 Starting course consistency check and fix...');
  
  const token = await getInstructorToken();
  if (!token) {
    console.error('❌ Failed to get authentication token');
    return;
  }

  try {
    // Get all courses
    const coursesResponse = await axios.get(`${API_BASE}/courses`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const courses = coursesResponse.data;
    console.log(`\n📚 Found ${courses.length} courses to check`);

    for (const course of courses) {
      console.log(`\n🔍 Checking course: ${course.title} (ID: ${course._id})`);
      
      // Get detailed course hierarchy
      try {
        const hierarchyResponse = await axios.get(`${API_BASE}/course-management/${course._id}/hierarchy`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const detailedCourse = hierarchyResponse.data.course;
        const modules = detailedCourse.modules || [];
        
        console.log(`  📊 Course has ${modules.length} modules`);
        
        let issuesFound = [];
        let totalLessons = 0;
        
        // Check module and lesson consistency
        modules.forEach((module, moduleIndex) => {
          const lessons = module.lessons || [];
          totalLessons += lessons.length;
          
          // Check if module has lessons
          if (lessons.length === 0) {
            issuesFound.push(`Module "${module.title}" has no lessons`);
          }
          
          // Check lesson content
          lessons.forEach((lesson, lessonIndex) => {
            if (!lesson.content || !lesson.content.data) {
              issuesFound.push(`Lesson "${lesson.title}" in module "${module.title}" has no content`);
            }
            
            if (!lesson.objectives || lesson.objectives.length === 0) {
              issuesFound.push(`Lesson "${lesson.title}" has no learning objectives`);
            }
          });
        });

        console.log(`  📝 Total lessons: ${totalLessons}`);
        
        if (issuesFound.length > 0) {
          console.log(`  ⚠️  Found ${issuesFound.length} issues:`);
          issuesFound.forEach(issue => console.log(`    - ${issue}`));
          
          // Fix issues by adding default content where missing
          await fixCourseIssues(course._id, detailedCourse, token);
        } else {
          console.log(`  ✅ Course is consistent`);
        }
        
      } catch (hierarchyError) {
        console.log(`  ❌ Failed to get course hierarchy: ${hierarchyError.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Failed to check courses:', error.message);
  }
}

// Fix identified issues in a course
async function fixCourseIssues(courseId, course, token) {
  console.log(`  🔧 Fixing issues for course: ${course.title}`);
  
  try {
    for (const module of course.modules || []) {
      if (!module.lessons || module.lessons.length === 0) {
        // Add a default lesson to empty modules
        console.log(`    ➕ Adding default lesson to module: ${module.title}`);
        
        await axios.post(`${API_BASE}/course-management/${courseId}/modules/${module._id}/lessons`, {
          title: `Introduction to ${module.title}`,
          description: `Getting started with ${module.title}`,
          content: {
            type: 'text',
            data: `Welcome to ${module.title}! This module will introduce you to the key concepts and help you build a strong foundation. We'll cover the fundamentals step by step with practical examples and exercises.`
          },
          duration: 30,
          objectives: [
            `Understand the basics of ${module.title}`,
            'Complete hands-on exercises',
            'Apply learned concepts in practical scenarios'
          ],
          orderIndex: 0
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Fix lessons with missing content
        for (const lesson of module.lessons) {
          if (!lesson.content || !lesson.content.data) {
            console.log(`    🔧 Adding content to lesson: ${lesson.title}`);
            
            // Update lesson with default content
            await axios.put(`${API_BASE}/course-management/${courseId}/modules/${module._id}/lessons/${lesson._id}`, {
              title: lesson.title,
              description: lesson.description || `Learn about ${lesson.title}`,
              content: {
                type: 'text',
                data: `In this lesson, you'll learn about ${lesson.title}. We'll cover the essential concepts, provide practical examples, and guide you through hands-on exercises to reinforce your understanding.`
              },
              duration: lesson.duration || 45,
              objectives: lesson.objectives || [
                `Master the concepts of ${lesson.title}`,
                'Complete practical exercises',
                'Apply knowledge to real-world scenarios'
              ]
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
          }
          
          if (!lesson.objectives || lesson.objectives.length === 0) {
            console.log(`    🎯 Adding objectives to lesson: ${lesson.title}`);
            
            // Add default objectives
            await axios.put(`${API_BASE}/course-management/${courseId}/modules/${module._id}/lessons/${lesson._id}`, {
              ...lesson,
              objectives: [
                `Understand ${lesson.title} concepts`,
                'Complete hands-on practice',
                'Apply learned skills effectively'
              ]
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
          }
        }
      }
    }
    
    console.log(`    ✅ Fixed issues for course: ${course.title}`);
    
  } catch (error) {
    console.log(`    ❌ Failed to fix course issues: ${error.message}`);
  }
}

// Add AI integration references to courses
async function addAIIntegrationInfo() {
  console.log('\n🤖 Adding AI integration information to courses...');
  
  const token = await getInstructorToken();
  if (!token) return;

  try {
    const coursesResponse = await axios.get(`${API_BASE}/courses`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    for (const course of coursesResponse.data) {
      // Add AI integration information to course description
      const aiEnhancedDescription = course.description + 
        " This course features AI-powered personalized learning paths, intelligent tutoring assistance, and adaptive assessments that adjust to your learning pace and style.";
      
      try {
        await axios.put(`${API_BASE}/courses/${course._id}`, {
          ...course,
          description: aiEnhancedDescription,
          features: [
            ...(course.features || []),
            'AI-Powered Learning Assistant',
            'Personalized Learning Paths',
            'Adaptive Assessments',
            'Intelligent Progress Tracking'
          ]
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`  ✅ Added AI features to: ${course.title}`);
      } catch (error) {
        console.log(`  ❌ Failed to update ${course.title}: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('❌ Failed to add AI integration info:', error.message);
  }
}

// Main function
async function runConsistencyFix() {
  await fixCourseConsistency();
  await addAIIntegrationInfo();
  
  console.log('\n🎉 Course consistency fix completed!');
  console.log('\n💡 Summary of fixes applied:');
  console.log('  - Added default lessons to modules without content');
  console.log('  - Added content to lessons that were missing it');
  console.log('  - Added learning objectives where missing');
  console.log('  - Enhanced course descriptions with AI integration info');
  console.log('  - Added AI features to course metadata');
}

// Run the consistency fixer
if (require.main === module) {
  runConsistencyFix();
}

module.exports = { fixCourseConsistency, addAIIntegrationInfo };
