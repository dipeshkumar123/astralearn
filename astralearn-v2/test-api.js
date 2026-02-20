// Quick API test for AstraLearn v2
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAPI() {
  console.log('🧪 Testing AstraLearn v2 API...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.message);
    console.log('');

    // Test 2: API info
    console.log('2️⃣ Testing API info endpoint...');
    const apiResponse = await axios.get(`${BASE_URL}/api`);
    console.log('✅ API info:', apiResponse.data.message);
    console.log('');

    // Test 3: Register a test user
    console.log('3️⃣ Testing user registration...');
    const testUser = {
      email: 'test@astralearn.com',
      username: 'testuser',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'student'
    };

    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
      console.log('✅ Registration successful:', registerResponse.data.message);
      console.log('   User ID:', registerResponse.data.data.user.id);
      console.log('   Token received:', !!registerResponse.data.data.tokens.accessToken);
      
      // Test 4: Login with the same user
      console.log('');
      console.log('4️⃣ Testing user login...');
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        identifier: testUser.email,
        password: testUser.password
      });
      console.log('✅ Login successful:', loginResponse.data.message);
      console.log('   User:', loginResponse.data.data.user.firstName, loginResponse.data.data.user.lastName);
      
      // Test 5: Get profile with token
      console.log('');
      console.log('5️⃣ Testing get profile...');
      const token = loginResponse.data.data.tokens.accessToken;
      const profileResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Profile retrieved:', profileResponse.data.data.firstName, profileResponse.data.data.lastName);
      console.log('   Email:', profileResponse.data.data.email);
      console.log('   Role:', profileResponse.data.data.role);
      
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ User already exists, testing login...');
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
          identifier: testUser.email,
          password: testUser.password
        });
        console.log('✅ Login successful:', loginResponse.data.message);
      } else {
        throw error;
      }
    }

    console.log('');
    console.log('🎉 All API tests passed! The server is working correctly.');
    console.log('');
    console.log('✅ Frontend can now connect to:');
    console.log('   - Registration: POST /api/auth/register');
    console.log('   - Login: POST /api/auth/login');
    console.log('   - Profile: GET /api/auth/me');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testAPI();
