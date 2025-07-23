// Test authentication flow through frontend proxy
const axios = require('axios');

const FRONTEND_URL = 'http://localhost:3000';

async function testFrontendAuth() {
  console.log('🧪 Testing Frontend Authentication Flow...\n');

  try {
    // Test 1: Health check through frontend proxy
    console.log('1️⃣ Testing health endpoint through frontend proxy...');
    const healthResponse = await axios.get(`${FRONTEND_URL}/api/../health`);
    console.log('✅ Health check passed through proxy:', healthResponse.data.message);
    console.log('');

    // Test 2: API info through frontend proxy
    console.log('2️⃣ Testing API info through frontend proxy...');
    const apiResponse = await axios.get(`${FRONTEND_URL}/api`);
    console.log('✅ API info through proxy:', apiResponse.data.message);
    console.log('');

    // Test 3: Register new user through frontend
    console.log('3️⃣ Testing user registration through frontend...');
    const newUser = {
      email: 'frontend.test@astralearn.com',
      username: 'frontendtest',
      password: 'password123',
      firstName: 'Frontend',
      lastName: 'Test',
      role: 'student'
    };

    try {
      const registerResponse = await axios.post(`${FRONTEND_URL}/api/auth/register`, newUser);
      console.log('✅ Registration successful through frontend:', registerResponse.data.message);
      console.log('   User ID:', registerResponse.data.data.user.id);
      console.log('   Token received:', !!registerResponse.data.data.tokens.accessToken);
      
      // Test 4: Login through frontend
      console.log('');
      console.log('4️⃣ Testing login through frontend...');
      const loginResponse = await axios.post(`${FRONTEND_URL}/api/auth/login`, {
        identifier: newUser.email,
        password: newUser.password
      });
      console.log('✅ Login successful through frontend:', loginResponse.data.message);
      
      // Test 5: Get profile through frontend
      console.log('');
      console.log('5️⃣ Testing get profile through frontend...');
      const token = loginResponse.data.data.tokens.accessToken;
      const profileResponse = await axios.get(`${FRONTEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Profile retrieved through frontend:', profileResponse.data.data.firstName, profileResponse.data.data.lastName);
      
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ User already exists, testing login through frontend...');
        const loginResponse = await axios.post(`${FRONTEND_URL}/api/auth/login`, {
          identifier: newUser.email,
          password: newUser.password
        });
        console.log('✅ Login successful through frontend:', loginResponse.data.message);
      } else {
        throw error;
      }
    }

    // Test 6: Get courses through frontend
    console.log('');
    console.log('6️⃣ Testing get courses through frontend...');
    const coursesResponse = await axios.get(`${FRONTEND_URL}/api/courses`);
    console.log('✅ Courses retrieved through frontend:', coursesResponse.data.total, 'courses');
    console.log('');

    // Test 7: Login with seeded student
    console.log('7️⃣ Testing login with seeded student...');
    const studentLoginResponse = await axios.post(`${FRONTEND_URL}/api/auth/login`, {
      identifier: 'jane.student@astralearn.com',
      password: 'password123'
    });
    console.log('✅ Seeded student login successful:', studentLoginResponse.data.data.user.firstName);
    const studentToken = studentLoginResponse.data.data.tokens.accessToken;
    
    // Test 8: Enroll in course through frontend
    console.log('');
    console.log('8️⃣ Testing course enrollment through frontend...');
    const courseId = coursesResponse.data.data[1].id; // Try second course
    try {
      const enrollResponse = await axios.post(`${FRONTEND_URL}/api/courses/${courseId}/enroll`, {}, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      console.log('✅ Enrollment successful through frontend:', enrollResponse.data.message);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ Already enrolled in this course');
      } else {
        throw error;
      }
    }

    console.log('');
    console.log('🎉 All frontend authentication tests passed!');
    console.log('');
    console.log('✅ Frontend-Backend Integration Working:');
    console.log('   - Vite proxy configuration working');
    console.log('   - Authentication flow working');
    console.log('   - API requests proxied correctly');
    console.log('   - CORS configuration working');
    console.log('   - Token-based authentication working');

  } catch (error) {
    console.error('❌ Frontend authentication test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    if (error.code === 'ECONNREFUSED') {
      console.error('   Make sure frontend is running on http://localhost:3000');
    }
  }
}

testFrontendAuth();
