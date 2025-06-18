/**
 * Test User Creation and Enrollment
 * Create a test student and test enrollment
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function testFullFlow() {
  console.log('🔧 Testing Full User Creation and Enrollment Flow...\n');

  try {
    // Step 1: Create a test student account
    console.log('📋 Step 1: Creating test student account...');
    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'teststudent@astralearn.com',
        username: 'teststudent',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Student',
        role: 'student'
      })
    });

    let token;
    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      token = registerData.token;
      console.log('✅ Registration successful');
    } else {
      const registerError = await registerResponse.text();
      console.log('⚠️ Registration failed, trying login instead:', registerResponse.status);
      
      // Try to login with existing account
      console.log('📋 Attempting login...');
      const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'teststudent@astralearn.com',
          password: 'password123'
        })
      });

      if (!loginResponse.ok) {
        const loginError = await loginResponse.text();
        console.log('❌ Login also failed:', loginResponse.status, loginError);
        return;
      }

      const loginData = await loginResponse.json();
      token = loginData.token;
      console.log('✅ Login successful');
    }

    // Step 2: Get available courses
    console.log('\n📋 Step 2: Getting available courses...');
    const coursesResponse = await fetch(`${BASE_URL}/courses`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!coursesResponse.ok) {
      console.log('❌ Failed to get courses:', coursesResponse.status);
      const coursesError = await coursesResponse.text();
      console.log('Error:', coursesError);
      return;
    }

    const coursesData = await coursesResponse.json();
    console.log(`✅ Found ${coursesData.courses?.length || 0} courses`);

    if (!coursesData.courses || coursesData.courses.length === 0) {
      console.log('❌ No courses available for enrollment');
      return;
    }

    // Step 3: Try to enroll in the first course
    const firstCourse = coursesData.courses[0];
    console.log(`\n📋 Step 3: Attempting to enroll in "${firstCourse.title}" (ID: ${firstCourse._id || firstCourse.id})...`);

    const enrollResponse = await fetch(`${BASE_URL}/courses/${firstCourse._id || firstCourse.id}/enroll`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`📊 Enrollment Response Status: ${enrollResponse.status}`);
    console.log(`📊 Response Headers:`, Object.fromEntries(enrollResponse.headers.entries()));

    if (enrollResponse.ok) {
      const enrollData = await enrollResponse.json();
      console.log('✅ Enrollment successful!');
      console.log('📋 Response:', JSON.stringify(enrollData, null, 2));
    } else {
      const errorText = await enrollResponse.text();
      console.log('❌ Enrollment failed!');
      console.log('📋 Error Response:', errorText);
      
      // Try to parse as JSON for better formatting
      try {
        const errorJson = JSON.parse(errorText);
        console.log('📋 Parsed Error:', JSON.stringify(errorJson, null, 2));
      } catch (e) {
        console.log('📋 Raw Error Text:', errorText);
      }
    }

    // Step 4: Check enrolled courses 
    console.log('\n📋 Step 4: Checking enrolled courses...');
    const enrolledResponse = await fetch(`${BASE_URL}/courses/my/enrolled`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (enrolledResponse.ok) {
      const enrolledData = await enrolledResponse.json();
      console.log(`✅ Currently enrolled in ${enrolledData.enrolledCourses?.length || 0} courses`);
      if (enrolledData.enrolledCourses?.length > 0) {
        enrolledData.enrolledCourses.forEach((enrollment, index) => {
          console.log(`   ${index + 1}. ${enrollment.course?.title || 'Unknown Course'}`);
        });
      }
    } else {
      const enrolledError = await enrolledResponse.text();
      console.log('❌ Failed to get enrolled courses:', enrolledResponse.status, enrolledError);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testFullFlow().catch(console.error);
