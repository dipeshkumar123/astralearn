/**
 * Test Enrollment Endpoint
 * Debug the 500 error when students try to enroll in courses
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function testEnrollment() {
  console.log('🔧 Testing Course Enrollment Endpoint...\n');

  try {
    // Step 1: Login as a student
    console.log('📋 Step 1: Logging in as student...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@test.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      const loginError = await loginResponse.text();
      console.log('❌ Login failed:', loginResponse.status, loginError);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');

    // Step 2: Get available courses
    console.log('\n📋 Step 2: Getting available courses...');
    const coursesResponse = await fetch(`${BASE_URL}/courses`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!coursesResponse.ok) {
      console.log('❌ Failed to get courses:', coursesResponse.status);
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
    console.log(`\n📋 Step 3: Attempting to enroll in "${firstCourse.title}" (ID: ${firstCourse._id})...`);

    const enrollResponse = await fetch(`${BASE_URL}/courses/${firstCourse._id}/enroll`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`📊 Enrollment Response Status: ${enrollResponse.status}`);

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
        console.log('📋 Raw Error:', errorText);
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
      console.log('❌ Failed to get enrolled courses:', enrolledResponse.status);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testEnrollment().catch(console.error);
