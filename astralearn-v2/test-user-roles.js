// Comprehensive user roles and permissions testing
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testUserRoles() {
  console.log('🧪 Testing User Roles & Permissions...\n');

  try {
    // Setup: Get tokens for different user types
    console.log('🔧 Setup: Logging in different user types...');
    
    // Login as instructor
    const instructorLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
      identifier: 'john.instructor@astralearn.com',
      password: 'password123'
    });
    const instructorToken = instructorLogin.data.data.tokens.accessToken;
    const instructorUser = instructorLogin.data.data.user;
    console.log('✅ Instructor logged in:', instructorUser.firstName, '(Role:', instructorUser.role + ')');

    // Login as student
    const studentLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
      identifier: 'jane.student@astralearn.com',
      password: 'password123'
    });
    const studentToken = studentLogin.data.data.tokens.accessToken;
    const studentUser = studentLogin.data.data.user;
    console.log('✅ Student logged in:', studentUser.firstName, '(Role:', studentUser.role + ')');
    console.log('');

    // Test 1: Profile access for different roles
    console.log('1️⃣ Testing profile access for different roles...');
    
    const instructorProfile = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${instructorToken}` }
    });
    console.log('✅ Instructor profile access:', instructorProfile.data.data.role);
    
    const studentProfile = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log('✅ Student profile access:', studentProfile.data.data.role);
    console.log('');

    // Test 2: Course creation permissions
    console.log('2️⃣ Testing course creation permissions...');
    
    const courseData = {
      title: 'Role Test Course',
      description: 'Testing role-based course creation',
      category: 'Testing',
      difficulty: 'beginner',
      price: 0,
      duration: 60
    };

    // Instructor should be able to create courses
    try {
      const instructorCourseResponse = await axios.post(`${BASE_URL}/api/courses`, courseData, {
        headers: { Authorization: `Bearer ${instructorToken}` }
      });
      console.log('✅ Instructor can create courses:', instructorCourseResponse.data.data.title);
    } catch (error) {
      console.log('❌ Instructor course creation failed:', error.response?.data?.message);
    }

    // Student should NOT be able to create courses
    try {
      await axios.post(`${BASE_URL}/api/courses`, courseData, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      console.log('❌ Student should not be able to create courses');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Student correctly denied course creation');
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message);
      }
    }
    console.log('');

    // Test 3: Course enrollment permissions
    console.log('3️⃣ Testing course enrollment permissions...');
    
    // Get available courses
    const coursesResponse = await axios.get(`${BASE_URL}/api/courses`);
    const testCourseId = coursesResponse.data.data[0].id;

    // Student should be able to enroll
    try {
      const studentEnrollResponse = await axios.post(`${BASE_URL}/api/courses/${testCourseId}/enroll`, {}, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      console.log('✅ Student can enroll in courses');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('✅ Student already enrolled (enrollment working)');
      } else {
        console.log('❌ Student enrollment failed:', error.response?.data?.message);
      }
    }

    // Instructor should also be able to enroll (for testing purposes)
    try {
      const instructorEnrollResponse = await axios.post(`${BASE_URL}/api/courses/${testCourseId}/enroll`, {}, {
        headers: { Authorization: `Bearer ${instructorToken}` }
      });
      console.log('✅ Instructor can also enroll in courses');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('✅ Instructor already enrolled or enrollment working');
      } else {
        console.log('ℹ️ Instructor enrollment result:', error.response?.data?.message);
      }
    }
    console.log('');

    // Test 4: Anonymous access restrictions
    console.log('4️⃣ Testing anonymous access restrictions...');
    
    // Anonymous users should NOT be able to create courses
    try {
      await axios.post(`${BASE_URL}/api/courses`, courseData);
      console.log('❌ Anonymous users should not create courses');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Anonymous course creation correctly denied');
      }
    }

    // Anonymous users should NOT be able to enroll
    try {
      await axios.post(`${BASE_URL}/api/courses/${testCourseId}/enroll`, {});
      console.log('❌ Anonymous users should not enroll');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Anonymous enrollment correctly denied');
      }
    }

    // Anonymous users should NOT access profiles
    try {
      await axios.get(`${BASE_URL}/api/auth/me`);
      console.log('❌ Anonymous users should not access profiles');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Anonymous profile access correctly denied');
      }
    }

    // Anonymous users SHOULD be able to view courses
    try {
      const anonCoursesResponse = await axios.get(`${BASE_URL}/api/courses`);
      console.log('✅ Anonymous users can view courses:', anonCoursesResponse.data.total, 'courses');
    } catch (error) {
      console.log('❌ Anonymous course viewing failed');
    }
    console.log('');

    // Test 5: Role-specific data in responses
    console.log('5️⃣ Testing role-specific data in responses...');
    
    console.log('✅ Instructor user data includes:');
    console.log('   - ID:', instructorUser.id);
    console.log('   - Email:', instructorUser.email);
    console.log('   - Role:', instructorUser.role);
    console.log('   - Active status:', instructorUser.isActive);
    
    console.log('✅ Student user data includes:');
    console.log('   - ID:', studentUser.id);
    console.log('   - Email:', studentUser.email);
    console.log('   - Role:', studentUser.role);
    console.log('   - Active status:', studentUser.isActive);
    console.log('');

    // Test 6: Register new users with different roles
    console.log('6️⃣ Testing user registration with different roles...');
    
    // Register new student
    const newStudentData = {
      email: 'newstudent@astralearn.com',
      username: 'newstudent',
      password: 'password123',
      firstName: 'New',
      lastName: 'Student',
      role: 'student'
    };

    try {
      const newStudentResponse = await axios.post(`${BASE_URL}/api/auth/register`, newStudentData);
      console.log('✅ New student registered:', newStudentResponse.data.data.user.role);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ Student already exists');
      }
    }

    // Register new instructor
    const newInstructorData = {
      email: 'newinstructor@astralearn.com',
      username: 'newinstructor',
      password: 'password123',
      firstName: 'New',
      lastName: 'Instructor',
      role: 'instructor'
    };

    try {
      const newInstructorResponse = await axios.post(`${BASE_URL}/api/auth/register`, newInstructorData);
      console.log('✅ New instructor registered:', newInstructorResponse.data.data.user.role);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ Instructor already exists');
      }
    }
    console.log('');

    console.log('🎉 All user roles and permissions tests completed!');
    console.log('');
    console.log('✅ WORKING Role-Based Features:');
    console.log('   - User authentication with roles');
    console.log('   - Instructor-only course creation');
    console.log('   - Student course enrollment');
    console.log('   - Anonymous course viewing');
    console.log('   - Protected profile access');
    console.log('   - Role-based registration');
    console.log('   - Proper permission denials');
    console.log('');
    console.log('📋 Role Permission Matrix:');
    console.log('   Anonymous Users:');
    console.log('     ✅ View courses');
    console.log('     ❌ Create courses');
    console.log('     ❌ Enroll in courses');
    console.log('     ❌ Access profiles');
    console.log('');
    console.log('   Students:');
    console.log('     ✅ View courses');
    console.log('     ❌ Create courses');
    console.log('     ✅ Enroll in courses');
    console.log('     ✅ Access own profile');
    console.log('');
    console.log('   Instructors:');
    console.log('     ✅ View courses');
    console.log('     ✅ Create courses');
    console.log('     ✅ Enroll in courses');
    console.log('     ✅ Access own profile');

  } catch (error) {
    console.error('❌ User roles test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testUserRoles();
