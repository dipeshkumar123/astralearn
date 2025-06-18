/**
 * Test Individual Course Endpoint
 * Check if individual course retrieval works
 */

const fetch = require('node-fetch');

async function testCourseEndpoint() {
  console.log('=== Testing Individual Course Endpoint ===\n');

  const baseUrl = 'http://localhost:5000/api';

  try {
    // First get list of courses
    console.log('1. Getting course list...');
    const coursesResponse = await fetch(`${baseUrl}/courses`);
    
    if (!coursesResponse.ok) {
      console.log('❌ Failed to get courses list');
      return;
    }

    const coursesData = await coursesResponse.json();
    console.log(`✅ Found ${coursesData.courses?.length || 0} courses`);

    if (!coursesData.courses || coursesData.courses.length === 0) {
      console.log('❌ No courses available for testing');
      return;
    }

    const firstCourse = coursesData.courses[0];
    console.log(`📋 Testing with course: ${firstCourse.title} (ID: ${firstCourse._id})`);

    // Test individual course endpoint
    console.log('\n2. Testing individual course endpoint...');
    const courseResponse = await fetch(`${baseUrl}/courses/${firstCourse._id}`);
    
    console.log(`📊 Status: ${courseResponse.status}`);

    if (courseResponse.ok) {
      const courseData = await courseResponse.json();
      console.log('✅ Individual course endpoint working!');
      console.log('📋 Course details:');
      console.log(`   Title: ${courseData.course?.title || courseData.title}`);
      console.log(`   Description: ${(courseData.course?.description || courseData.description || '').substring(0, 80)}...`);
      console.log(`   Modules: ${courseData.course?.modules?.length || 0}`);
      console.log(`   Instructor: ${courseData.course?.instructor?.firstName || 'Unknown'}`);
      
      // Check if course has modules and lessons
      if (courseData.course?.modules && courseData.course.modules.length > 0) {
        console.log('📚 Course structure found - good for preview!');
      } else {
        console.log('⚠️ Course has no modules/lessons - preview may be limited');
      }
    } else {
      const errorText = await courseResponse.text();
      console.log('❌ Individual course endpoint failed');
      console.log('📋 Error:', errorText);
    }

    // Test course management endpoint
    console.log('\n3. Testing course-management endpoint...');
    const courseManagementResponse = await fetch(`${baseUrl}/course-management/${firstCourse._id}/hierarchy`);
    
    console.log(`📊 Course Management Status: ${courseManagementResponse.status}`);

    if (courseManagementResponse.ok) {
      const courseManagementData = await courseManagementResponse.json();
      console.log('✅ Course management endpoint working!');
      console.log('📋 Course hierarchy details:');
      console.log(`   Title: ${courseManagementData.course?.title}`);
      console.log(`   Modules: ${courseManagementData.course?.modules?.length || 0}`);
      
      if (courseManagementData.course?.modules) {
        courseManagementData.course.modules.forEach((module, index) => {
          console.log(`   Module ${index + 1}: ${module.title} (${module.lessons?.length || 0} lessons)`);
        });
      }
    } else {
      const errorText = await courseManagementResponse.text();
      console.log('❌ Course management endpoint failed');
      console.log('📋 Error:', errorText);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCourseEndpoint();
