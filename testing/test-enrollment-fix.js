/**
 * Debug enrollment endpoint with proper auth and model validation
 */

const API_BASE = 'http://localhost:5000/api';

// Test with a real JWT token from localStorage
async function testEnrollmentEndpoint() {
  console.log('=== ENROLLMENT ENDPOINT DEBUG ===\n');

  try {
    // First, verify we can access the courses endpoint with auth
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzNkNGRlZGVkYTc1MjlhY2JlYWU4MjAiLCJlbWFpbCI6InN0dWRlbnRAZXhhbXBsZS5jb20iLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTczMjEyNDExOCwiZXhwIjoxNzMyMjEwNTE4fQ.d80RYN_oThwIjCNfSeLNgK-Kf7WbqIYSyKP_7Bfx80Y';

    console.log('1. Testing auth verification...');
    const authTest = await fetch(`${API_BASE}/courses/my/enrolled`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Auth test status:', authTest.status);
    console.log('Auth test response:', await authTest.json());

    // Get a course to enroll in
    console.log('\n2. Getting available courses...');
    const coursesResponse = await fetch(`${API_BASE}/courses`);
    const coursesData = await coursesResponse.json();
    
    if (!coursesData.courses || coursesData.courses.length === 0) {
      throw new Error('No courses available');
    }

    const courseToEnroll = coursesData.courses[0];
    console.log('Found course to enroll in:', {
      id: courseToEnroll._id,
      title: courseToEnroll.title,
      isPublished: courseToEnroll.isPublished
    });

    // Try to enroll
    console.log('\n3. Attempting enrollment...');
    const enrollResponse = await fetch(`${API_BASE}/courses/${courseToEnroll._id}/enroll`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Enrollment status:', enrollResponse.status);
    console.log('Enrollment headers:', Object.fromEntries(enrollResponse.headers.entries()));
    
    const enrollResult = await enrollResponse.text();
    console.log('Enrollment response body:', enrollResult);

    if (enrollResponse.status === 500) {
      console.log('\n❌ 500 ERROR DETECTED - Checking backend logs...');
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

testEnrollmentEndpoint();
