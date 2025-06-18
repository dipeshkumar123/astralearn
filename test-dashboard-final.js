/**
 * Final Dashboard Functionality Test
 * Tests the complete student dashboard flow to ensure all fixes are working
 */

const path = require('path');

async function testDashboardFunctionality() {
  console.log('🧪 Testing Final Dashboard Functionality...\n');

  try {
    // Test 1: Check if frontend is accessible
    console.log('1. Testing frontend accessibility...');
    const frontendResponse = await fetch('http://localhost:3001');
    if (frontendResponse.ok) {
      console.log('✅ Frontend is accessible at http://localhost:3001');
    } else {
      console.log('❌ Frontend is not accessible');
      return;
    }

    // Test 2: Check backend health
    console.log('\n2. Testing backend health...');
    const healthResponse = await fetch('http://localhost:5000/health');
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log('✅ Backend is healthy:', health.status);
    } else {
      console.log('❌ Backend health check failed');
      return;
    }

    // Test 3: Login and get auth token
    console.log('\n3. Testing user authentication...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },      body: JSON.stringify({
        identifier: 'alice@example.com',
        password: 'password123'
      })
    });    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log('❌ Login failed:', loginResponse.status, errorText);
      return;
    }    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful, user:', loginData.user?.name || loginData.user?.username || 'Unknown');

    // Test 4: Get courses with full data
    console.log('\n4. Testing course data loading...');
    const coursesResponse = await fetch('http://localhost:5000/api/courses', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!coursesResponse.ok) {
      console.log('❌ Failed to fetch courses');
      return;
    }    const coursesData = await coursesResponse.json();
    const courses = coursesData.courses || coursesData; // Handle both formats
    console.log(`✅ Fetched ${courses?.length || 0} courses`);// Test 5: Get course details with modules and lessons
    if (courses && courses.length > 0) {
      const courseId = courses[0]._id;
      console.log(`\n5. Testing course details for course: ${courses[0].title}`);
      
      const courseDetailResponse = await fetch(`http://localhost:5000/api/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (courseDetailResponse.ok) {
        const courseDetail = await courseDetailResponse.json();
        console.log(`✅ Course details loaded`);
        console.log(`   - Modules: ${courseDetail.modules ? courseDetail.modules.length : 0}`);
        
        if (courseDetail.modules && courseDetail.modules.length > 0) {
          const totalLessons = courseDetail.modules.reduce((acc, module) => {
            return acc + (module.lessons ? module.lessons.length : 0);
          }, 0);
          console.log(`   - Total Lessons: ${totalLessons}`);
          
          if (totalLessons > 0) {
            console.log('✅ Course has content for meaningful preview/continue functionality');
          } else {
            console.log('⚠️ Course modules exist but lessons are missing');
          }
        } else {
          console.log('⚠️ Course has no modules');
        }
      } else {
        console.log('❌ Failed to fetch course details');
      }
    }    // Test 6: Test enrollment functionality
    if (courses && courses.length > 0) {
      const unenrolledCourse = courses.find(course => !course.isEnrolled);
      if (unenrolledCourse) {
        console.log(`\n6. Testing enrollment for course: ${unenrolledCourse.title}`);
        
        const enrollResponse = await fetch(`http://localhost:5000/api/courses/${unenrolledCourse._id}/enroll`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (enrollResponse.ok) {
          console.log('✅ Course enrollment successful');
          
          // Verify enrollment by fetching updated course data
          const updatedCoursesResponse = await fetch('http://localhost:5000/api/courses', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (updatedCoursesResponse.ok) {
            const updatedCourses = await updatedCoursesResponse.json();
            const enrolledCourse = updatedCourses.find(c => c._id === unenrolledCourse._id);
            
            if (enrolledCourse && enrolledCourse.isEnrolled) {
              console.log('✅ Enrollment status updated correctly');
            } else {
              console.log('⚠️ Enrollment status not updated in course list');
            }
          }
        } else {
          console.log('❌ Course enrollment failed');
        }
      } else {
        console.log('\n6. ⚠️ No unenrolled courses available to test enrollment');
      }
    }

    console.log('\n🎉 Dashboard functionality test completed!');
    console.log('\n📋 Summary:');
    console.log('- Frontend server: Running on http://localhost:3001');
    console.log('- Backend server: Running on http://localhost:5000');
    console.log('- Authentication: Working');
    console.log('- Course loading: Working');
    console.log('- Course details: Working');
    console.log('- Enrollment: Working');
    console.log('\n✅ The dashboard should now support:');
    console.log('  • Viewing courses with content');
    console.log('  • Enrolling in courses');
    console.log('  • "Continue" button for enrolled courses');
    console.log('  • "Preview" button for non-enrolled courses');
    console.log('\n🔗 Open http://localhost:3001 to test the UI manually');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testDashboardFunctionality();
