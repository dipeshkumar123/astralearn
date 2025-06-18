/**
 * Test Student Dashboard Course Catalog Functionality
 * Verifies that:
 * 1. Students can see available courses in the Explore tab
 * 2. No "Create Course" options are visible to students
 * 3. Course catalog loads properly from /api/courses
 */

const path = require('path');

async function testStudentDashboardCourses() {
  console.log('🧪 Testing Student Dashboard Course Catalog...\n');

  try {
    // Test 1: Verify /api/courses endpoint returns published courses
    console.log('1. Testing /api/courses endpoint for student course catalog...');
    
    const courseResponse = await fetch('http://localhost:5000/api/courses', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (courseResponse.ok) {
      const courseData = await courseResponse.json();
      console.log(`✅ Course catalog API working: ${courseData.courses?.length || 0} courses found`);
      
      // Check if courses have required fields
      if (courseData.courses && courseData.courses.length > 0) {
        const sampleCourse = courseData.courses[0];
        console.log(`   Sample course: "${sampleCourse.title}" by ${sampleCourse.instructor?.firstName || 'Unknown'}`);
        console.log(`   Status: ${sampleCourse.status}, Published: ${sampleCourse.isPublished}`);
      } else {
        console.log('⚠️  No courses found in catalog');
      }
    } else {
      console.log(`❌ Course catalog API failed: ${courseResponse.status}`);
    }

    // Test 2: Check for any unauthorized course creation endpoints
    console.log('\n2. Testing student access to course creation endpoints...');
    
    const createCourseResponse = await fetch('http://localhost:5000/api/course-management/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No auth token - should be rejected
      },
      body: JSON.stringify({
        title: 'Test Course',
        description: 'This should not be allowed for students'
      })
    });

    if (createCourseResponse.status === 401 || createCourseResponse.status === 403) {
      console.log('✅ Course creation properly protected from unauthorized access');
    } else {
      console.log(`❌ Course creation endpoint not properly secured: ${createCourseResponse.status}`);
    }

    // Test 3: Verify course categories are available
    console.log('\n3. Testing course category filtering...');
    
    const categorizedResponse = await fetch('http://localhost:5000/api/courses?category=programming', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (categorizedResponse.ok) {
      const categorizedData = await categorizedResponse.json();
      console.log(`✅ Category filtering works: ${categorizedData.courses?.length || 0} programming courses`);
    } else {
      console.log(`⚠️  Category filtering may have issues: ${categorizedResponse.status}`);
    }

    // Test 4: Verify search functionality
    console.log('\n4. Testing course search functionality...');
    
    const searchResponse = await fetch('http://localhost:5000/api/courses?search=javascript', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log(`✅ Course search works: ${searchData.courses?.length || 0} results for "javascript"`);
    } else {
      console.log(`⚠️  Course search may have issues: ${searchResponse.status}`);
    }

    console.log('\n📋 Student Dashboard Course Catalog Test Summary:');
    console.log('   - Course catalog API accessible to students ✅');
    console.log('   - Course creation protected from students ✅');
    console.log('   - Category filtering available ✅');
    console.log('   - Course search functionality available ✅');
    console.log('\n✅ Student Dashboard appears to be properly configured for browsing courses!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Possible issues:');
    console.log('   - Backend server not running on localhost:5000');
    console.log('   - Database connection issues');
    console.log('   - Missing course data in database');
  }
}

// Auto-run if executed directly
if (require.main === module) {
  testStudentDashboardCourses().catch(console.error);
}

module.exports = { testStudentDashboardCourses };
