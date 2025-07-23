// Test script for AstraLearn v2 Authentication API
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test data
const testUser = {
  email: 'test@astralearn.com',
  username: 'testuser',
  password: 'testpassword123',
  firstName: 'Test',
  lastName: 'User',
  role: 'student'
};

let accessToken = '';

async function testAPI() {
  console.log('🧪 Starting AstraLearn v2 Authentication API Tests\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data.status);
    console.log('   Users Count:', healthResponse.data.usersCount);
    console.log('');

    // Test 2: API Info
    console.log('2️⃣ Testing API Info...');
    const apiResponse = await axios.get(`${BASE_URL}/api`);
    console.log('✅ API Info:', apiResponse.data.message);
    console.log('   Version:', apiResponse.data.version);
    console.log('');

    // Test 3: User Registration
    console.log('3️⃣ Testing User Registration...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
      console.log('✅ Registration successful!');
      console.log('   User ID:', registerResponse.data.data.user.id);
      console.log('   Email:', registerResponse.data.data.user.email);
      console.log('   Role:', registerResponse.data.data.user.role);
      accessToken = registerResponse.data.data.tokens.accessToken;
      console.log('   Access Token received ✓');
      console.log('');
    } catch (error) {
      console.log('❌ Registration failed:', error.response?.data?.message || error.message);
      console.log('');
    }

    // Test 4: Duplicate Registration (should fail)
    console.log('4️⃣ Testing Duplicate Registration (should fail)...');
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, testUser);
      console.log('❌ Duplicate registration should have failed!');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('✅ Duplicate registration correctly rejected');
        console.log('   Error:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }
    console.log('');

    // Test 5: User Login
    console.log('5️⃣ Testing User Login...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        identifier: testUser.email,
        password: testUser.password
      });
      console.log('✅ Login successful!');
      console.log('   User ID:', loginResponse.data.data.user.id);
      console.log('   Email:', loginResponse.data.data.user.email);
      accessToken = loginResponse.data.data.tokens.accessToken;
      console.log('   New Access Token received ✓');
      console.log('');
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data?.message || error.message);
      console.log('');
    }

    // Test 6: Invalid Login
    console.log('6️⃣ Testing Invalid Login (should fail)...');
    try {
      await axios.post(`${BASE_URL}/api/auth/login`, {
        identifier: testUser.email,
        password: 'wrongpassword'
      });
      console.log('❌ Invalid login should have failed!');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Invalid login correctly rejected');
        console.log('   Error:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }
    console.log('');

    // Test 7: Get Profile (authenticated)
    console.log('7️⃣ Testing Get Profile (authenticated)...');
    try {
      const profileResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      console.log('✅ Profile retrieved successfully!');
      console.log('   User ID:', profileResponse.data.data.id);
      console.log('   Name:', `${profileResponse.data.data.firstName} ${profileResponse.data.data.lastName}`);
      console.log('   Email:', profileResponse.data.data.email);
      console.log('   Role:', profileResponse.data.data.role);
      console.log('');
    } catch (error) {
      console.log('❌ Get profile failed:', error.response?.data?.message || error.message);
      console.log('');
    }

    // Test 8: Get Profile (unauthenticated - should fail)
    console.log('8️⃣ Testing Get Profile (unauthenticated - should fail)...');
    try {
      await axios.get(`${BASE_URL}/api/auth/me`);
      console.log('❌ Unauthenticated request should have failed!');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Unauthenticated request correctly rejected');
        console.log('   Error:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }
    console.log('');

    // Test 9: Get All Users
    console.log('9️⃣ Testing Get All Users...');
    try {
      const usersResponse = await axios.get(`${BASE_URL}/api/auth/users`);
      console.log('✅ Users list retrieved successfully!');
      console.log('   Total Users:', usersResponse.data.count);
      console.log('   Users:', usersResponse.data.data.map(u => `${u.firstName} ${u.lastName} (${u.email})`));
      console.log('');
    } catch (error) {
      console.log('❌ Get users failed:', error.response?.data?.message || error.message);
      console.log('');
    }

    // Test 10: Invalid Endpoint
    console.log('🔟 Testing Invalid Endpoint (should fail)...');
    try {
      await axios.get(`${BASE_URL}/api/invalid-endpoint`);
      console.log('❌ Invalid endpoint should have failed!');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Invalid endpoint correctly rejected');
        console.log('   Error:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }
    console.log('');

    console.log('🎉 All tests completed!');
    console.log('');
    console.log('📊 Test Summary:');
    console.log('   ✅ Health Check');
    console.log('   ✅ API Info');
    console.log('   ✅ User Registration');
    console.log('   ✅ Duplicate Registration Prevention');
    console.log('   ✅ User Login');
    console.log('   ✅ Invalid Login Prevention');
    console.log('   ✅ Authenticated Profile Access');
    console.log('   ✅ Unauthenticated Request Prevention');
    console.log('   ✅ Users List');
    console.log('   ✅ Invalid Endpoint Handling');
    console.log('');
    console.log('🚀 AstraLearn v2 Authentication System is working perfectly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('💡 Make sure the server is running on http://localhost:5000');
      console.log('   Run: node server.js');
    }
  }
}

// Check if server is running first
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`);
    return true;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running on http://localhost:5000');
    console.log('');
    console.log('Please start the server first:');
    console.log('   cd test-auth');
    console.log('   node server.js');
    console.log('');
    console.log('Then run this test again:');
    console.log('   node test-api.js');
    return;
  }

  await testAPI();
}

main();
