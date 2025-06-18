/**
 * Simple Enrollment Test using flexibleAuthenticate
 * This will use the automatic dev user authentication
 */

const fetch = require('node-fetch');

async function testEnrollmentDirect() {
  console.log('=== Direct Enrollment Test ===\n');

  const baseUrl = 'http://localhost:5000/api';

  try {
    // Step 1: Get courses (this will auto-create a dev user)
    console.log('1. Getting courses (auto-auth)...');
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

    // Step 2: Try enrollment using flexibleAuthenticate (dev mode)
    console.log('\n2. Attempting enrollment...');
    const enrollResponse = await fetch(`${baseUrl}/courses/${firstCourse._id}/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No auth token - will use flexibleAuthenticate
      }
    });

    console.log(`📊 Status: ${enrollResponse.status}`);

    if (enrollResponse.ok) {
      const enrollData = await enrollResponse.json();
      console.log('✅ Enrollment successful!');
      console.log('📋 Response:', JSON.stringify(enrollData, null, 2));
    } else {
      const errorText = await enrollResponse.text();
      console.log('❌ Enrollment failed!');
      console.log('📋 Error:', errorText);
      
      // Try to parse error for better debugging
      try {
        const errorJson = JSON.parse(errorText);
        console.log('📋 Parsed Error:', JSON.stringify(errorJson, null, 2));
      } catch (e) {
        console.log('📋 Raw Error:', errorText);
      }
    }

    // Step 3: Check enrolled courses
    console.log('\n3. Checking enrolled courses...');
    const enrolledResponse = await fetch(`${baseUrl}/courses/my/enrolled`);

    if (enrolledResponse.ok) {
      const enrolledData = await enrolledResponse.json();
      console.log(`✅ Currently enrolled in ${enrolledData.enrolledCourses?.length || 0} courses`);
    } else {
      const enrolledError = await enrolledResponse.text();
      console.log('❌ Failed to get enrolled courses:', enrolledResponse.status, enrolledError);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testEnrollmentDirect();
