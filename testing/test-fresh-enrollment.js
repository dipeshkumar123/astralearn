/**
 * Test authentication and enrollment with fresh login
 */

const API_BASE = 'http://localhost:5000/api';

async function testWithFreshAuth() {
  console.log('=== FRESH AUTH + ENROLLMENT TEST ===\n');

  try {
    // 1. Login as student
    console.log('1. Logging in as student...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },      body: JSON.stringify({
        identifier: 'student@example.com',
        password: 'password123'
      })
    });

    console.log('Login status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginData.token) {
      throw new Error('No token received from login');
    }

    const token = loginData.token;

    // 2. Test auth with the new token
    console.log('\n2. Testing auth with new token...');
    const authTest = await fetch(`${API_BASE}/courses/my/enrolled`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Auth test status:', authTest.status);
    const authResult = await authTest.json();
    console.log('Auth test response:', authResult);

    // 3. Get courses
    console.log('\n3. Getting available courses...');
    const coursesResponse = await fetch(`${API_BASE}/courses`);
    const coursesData = await coursesResponse.json();
    
    if (!coursesData.courses || coursesData.courses.length === 0) {
      throw new Error('No courses available');
    }

    const courseToEnroll = coursesData.courses[0];
    console.log('Course to enroll in:', {
      id: courseToEnroll._id,
      title: courseToEnroll.title,
      isPublished: courseToEnroll.isPublished
    });

    // 4. Check if already enrolled
    const alreadyEnrolled = authResult.enrolledCourses?.some(
      enrollment => enrollment.course?._id === courseToEnroll._id
    );
    
    if (alreadyEnrolled) {
      console.log('\n⚠️  Already enrolled in this course, trying different course...');
      const unenrolledCourse = coursesData.courses.find(course => 
        !authResult.enrolledCourses?.some(enrollment => 
          enrollment.course?._id === course._id
        )
      );
      
      if (unenrolledCourse) {
        courseToEnroll._id = unenrolledCourse._id;
        courseToEnroll.title = unenrolledCourse.title;
        console.log('Using course:', courseToEnroll.title);
      }
    }

    // 5. Attempt enrollment
    console.log('\n5. Attempting enrollment...');
    const enrollResponse = await fetch(`${API_BASE}/courses/${courseToEnroll._id}/enroll`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Enrollment status:', enrollResponse.status);
    
    const enrollResult = await enrollResponse.text();
    console.log('Enrollment response:', enrollResult);

    // If successful, verify enrollment
    if (enrollResponse.status === 201) {
      console.log('\n✅ Enrollment successful! Verifying...');
      const verifyResponse = await fetch(`${API_BASE}/courses/my/enrolled`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const verifyData = await verifyResponse.json();
      console.log('Updated enrolled courses:', verifyData.enrolledCourses?.length);
    }

  } catch (error) {
    console.error('Test error:', error);
  }
}

testWithFreshAuth();
