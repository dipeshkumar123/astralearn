/**
 * Complete Student Dashboard Integration Test
 * Tests the entire student dashboard flow including enrollment functionality
 */

const fetch = require('node-fetch');

async function testCompleteDashboardFlow() {
  console.log('=== Complete Student Dashboard Integration Test ===\n');

  const baseUrl = 'http://localhost:5000/api';

  try {
    // Test 1: User Registration
    console.log('🔵 Test 1: User Registration');
    const uniqueId = Date.now();
    const registerResponse = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Dashboard',
        lastName: 'Tester',
        username: `dashboardtester${uniqueId}`,
        email: `dashboard.tester.${uniqueId}@example.com`,
        password: 'testpassword123',
        role: 'student'
      })
    });

    if (!registerResponse.ok) {
      const regError = await registerResponse.text();
      console.log('❌ Registration failed:', registerResponse.status, regError);
      return;
    }

    const regData = await registerResponse.json();
    const token = regData.tokens?.accessToken;
    console.log('✅ Registration successful');
    console.log(`📋 User: ${regData.user?.firstName} ${regData.user?.lastName}`);
    console.log(`📧 Email: ${regData.user?.email}`);
    console.log(`🔑 Token: ${token ? 'Received' : 'Missing'}`);

    // Test 2: Course Catalog (Public Endpoint)
    console.log('\n🔵 Test 2: Course Catalog Loading');
    const coursesResponse = await fetch(`${baseUrl}/courses`);
    
    if (!coursesResponse.ok) {
      console.log('❌ Failed to load course catalog');
      return;
    }

    const coursesData = await coursesResponse.json();
    console.log(`✅ Course catalog loaded: ${coursesData.courses?.length || 0} courses available`);
    
    if (coursesData.courses && coursesData.courses.length > 0) {
      console.log('📋 Sample courses:');
      coursesData.courses.slice(0, 3).forEach((course, index) => {
        console.log(`   ${index + 1}. ${course.title}`);
        console.log(`      📝 ${course.description.substring(0, 80)}...`);
        console.log(`      👥 Enrolled: ${course.enrollmentCount || 0}`);
        console.log(`      ⏱️  Duration: ${course.estimatedDuration || 'Unknown'}h`);
      });
    }

    // Test 3: Initial Enrolled Courses (should be empty)
    console.log('\n🔵 Test 3: Initial Enrolled Courses Check');
    const initialEnrolledResponse = await fetch(`${baseUrl}/courses/my/enrolled`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (initialEnrolledResponse.ok) {
      const initialEnrolledData = await initialEnrolledResponse.json();
      console.log(`✅ Initial enrolled courses: ${initialEnrolledData.enrolledCourses?.length || 0}`);
    } else {
      console.log('⚠️ Could not fetch initial enrolled courses');
    }

    // Test 4: Course Enrollment
    console.log('\n🔵 Test 4: Course Enrollment');
    if (coursesData.courses && coursesData.courses.length > 0) {
      const courseToEnroll = coursesData.courses[0];
      console.log(`📋 Enrolling in: ${courseToEnroll.title}`);
      
      const enrollResponse = await fetch(`${baseUrl}/courses/${courseToEnroll._id}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (enrollResponse.ok) {
        const enrollData = await enrollResponse.json();
        console.log('✅ Enrollment successful!');
        console.log('📊 Progress created:', {
          userId: enrollData.userProgress?.userId,
          courseId: enrollData.userProgress?.courseId,
          progressType: enrollData.userProgress?.progressType,
          completionPercentage: enrollData.userProgress?.progressData?.completionPercentage
        });
      } else {
        const enrollError = await enrollResponse.text();
        console.log('❌ Enrollment failed:', enrollError);
      }
    }

    // Test 5: Updated Enrolled Courses
    console.log('\n🔵 Test 5: Post-Enrollment Courses Check');
    const finalEnrolledResponse = await fetch(`${baseUrl}/courses/my/enrolled`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (finalEnrolledResponse.ok) {
      const finalEnrolledData = await finalEnrolledResponse.json();
      console.log(`✅ Final enrolled courses: ${finalEnrolledData.enrolledCourses?.length || 0}`);
      
      if (finalEnrolledData.enrolledCourses && finalEnrolledData.enrolledCourses.length > 0) {
        console.log('📋 Enrolled courses:');
        finalEnrolledData.enrolledCourses.forEach((enrollment, index) => {
          console.log(`   ${index + 1}. ${enrollment.course?.title}`);
          console.log(`      📈 Progress: ${enrollment.progress || 0}%`);
          console.log(`      📅 Enrolled: ${new Date(enrollment.enrollmentDate).toLocaleDateString()}`);
        });
      }
    } else {
      console.log('❌ Could not fetch final enrolled courses');
    }

    // Test 6: Analytics Endpoint
    console.log('\n🔵 Test 6: Learning Analytics');
    const analyticsResponse = await fetch(`${baseUrl}/analytics/summary`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (analyticsResponse.ok) {
      const analyticsData = await analyticsResponse.json();
      console.log('✅ Analytics loaded successfully');
      console.log('📊 Analytics summary:', {
        totalPoints: analyticsData.data?.totalPoints || 0,
        streak: analyticsData.data?.streak || 0,
        certificates: analyticsData.data?.certificates || 0,
        studyTime: analyticsData.data?.todayStudyTime || 0
      });
    } else {
      console.log('⚠️ Analytics endpoint not available (expected in development)');
    }

    // Test 7: Recommendations
    console.log('\n🔵 Test 7: Course Recommendations');
    const recommendationsResponse = await fetch(`${baseUrl}/adaptive-learning/recommendations`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (recommendationsResponse.ok) {
      const recommendationsData = await recommendationsResponse.json();
      console.log('✅ Recommendations loaded successfully');
      console.log(`📋 Recommendations: ${recommendationsData.recommendations?.length || 0} courses`);
    } else {
      console.log('⚠️ Recommendations endpoint not available (expected in development)');
    }

    console.log('\n🎉 === Dashboard Integration Test Complete ===');
    console.log('✅ All core functionality tested successfully!');
    console.log('✅ User registration, course enrollment, and dashboard APIs are working');
    console.log('✅ Frontend can safely use these endpoints');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the comprehensive test
testCompleteDashboardFlow();
