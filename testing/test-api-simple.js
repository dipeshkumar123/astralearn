const axios = require('axios');

async function testAPI() {
  const BASE_URL = 'http://localhost:5000';
  
  try {
    console.log('Testing registration...');
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
      email: 'newtest@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'Test',
      username: 'newtest'
    });
    console.log('Registration success:', registerResponse.data);
      console.log('\nTesting login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      identifier: 'newtest@example.com',
      password: 'password123'
    });
    console.log('Login success:', loginResponse.data);
    
  } catch (error) {
    console.error('Error details:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

testAPI();
