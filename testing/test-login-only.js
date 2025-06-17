const axios = require('axios');

async function testLogin() {
  const BASE_URL = 'http://localhost:5000';
  
  try {
    console.log('Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      identifier: 'newtest@example.com',
      password: 'password123'
    }, { timeout: 5000 });
    
    console.log('Login success!');
    console.log('User:', loginResponse.data.user?.email);
    console.log('Token exists:', !!loginResponse.data.tokens?.accessToken);
    console.log('Full response:', JSON.stringify(loginResponse.data, null, 2));
    
  } catch (error) {
    console.error('Login error:');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Message:', error.message);
    console.error('Code:', error.code);
  }
}

testLogin();
