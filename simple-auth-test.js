/**
 * Simple Auth Test
 */

const axios = require('axios');

async function testAuth() {
  try {
    console.log('Testing authentication...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      identifier: 'demo@test.com',
      password: 'password123'
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.token) {
      console.log('✅ Token received:', response.data.token.substring(0, 20) + '...');
      
      // Test token with protected endpoint
      const testResponse = await axios.get('http://localhost:5000/api/auth/validate', {
        headers: { Authorization: `Bearer ${response.data.token}` }
      });
      
      console.log('✅ Token validation:', testResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Auth test failed:', error.response?.data || error.message);
  }
}

testAuth();
