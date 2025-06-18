/**
 * Test Frontend Enrollment Flow
 * Tests the complete enrollment flow as done by the frontend
 */

const fetch = require('node-fetch');

async function testFrontendEnrollment() {
  console.log('=== Frontend Enrollment Flow Test ===\n');

  const baseUrl = 'http://localhost:5000/api';

  try {
    // Step 1: Register a new user (simulating frontend registration)
    console.log('1. Registering a new test user...');
    const registerResponse = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'Student',
        username: `teststudent${Date.now()}`,
        email: `test.student.${Date.now()}@example.com`,
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
    console.log('✅ Registration successful');
    console.log('📋 User:', regData.user?.firstName, regData.user?.email);    // Check if we got a token
    const token = regData.tokens?.accessToken || regData.token;
    if (!token) {
      console.log('❌ No token received from registration');
      console.log('📋 Registration response:', JSON.stringify(regData, null, 2));
      return;
    }
    console.log('✅ Token received');

    // Step 2: Get available courses
    console.log('\n2. Getting available courses...');
    const coursesResponse = await fetch(`${baseUrl}/courses`);
    
    if (!coursesResponse.ok) {
      const coursesError = await coursesResponse.text();
      console.log('❌ Failed to get courses:', coursesResponse.status, coursesError);
      return;
    }

    const coursesData = await coursesResponse.json();
    console.log(`✅ Found ${coursesData.courses?.length || 0} courses`);

    if (!coursesData.courses || coursesData.courses.length === 0) {
      console.log('❌ No courses available');
      return;
    }

    const firstCourse = coursesData.courses[0];
    console.log(`📋 Course: ${firstCourse.title} (ID: ${firstCourse._id})`);

    // Step 3: Enroll with token (as frontend would)
    console.log('\n3. Enrolling with authentication token...');
    const enrollResponse = await fetch(`${baseUrl}/courses/${firstCourse._id}/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`📊 Enrollment Status: ${enrollResponse.status}`);

    if (enrollResponse.ok) {
      const enrollData = await enrollResponse.json();
      console.log('✅ Enrollment successful!');
      console.log('📋 Response:', JSON.stringify(enrollData, null, 2));
    } else {
      const enrollError = await enrollResponse.text();
      console.log('❌ Enrollment failed:', enrollError);
    }

    // Step 4: Check enrolled courses
    console.log('\n4. Checking enrolled courses...');
    const enrolledResponse = await fetch(`${baseUrl}/courses/my/enrolled`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (enrolledResponse.ok) {
      const enrolledData = await enrolledResponse.json();
      console.log(`✅ User enrolled in ${enrolledData.enrolledCourses?.length || 0} courses`);
    } else {
      const enrolledError = await enrolledResponse.text();
      console.log('❌ Failed to get enrolled courses:', enrolledError);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testFrontendEnrollment();
