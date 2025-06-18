/**
 * Quick debug script to check courses endpoint response
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function debugCoursesEndpoint() {
  try {
    console.log('🔍 Debugging courses endpoint...');
    
    // First, let's create a demo user and get auth token
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      identifier: 'demo@astralearn.com',
      password: 'demo123'
    });
    
    const authToken = loginResponse.data.token;
    console.log('✅ Got auth token');
    
    // Now test courses endpoint
    const coursesResponse = await axios.get(`${BASE_URL}/courses`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('📊 Courses response status:', coursesResponse.status);
    console.log('📊 Courses response data type:', typeof coursesResponse.data);
    console.log('📊 Courses response data:', JSON.stringify(coursesResponse.data, null, 2));
    
    if (Array.isArray(coursesResponse.data)) {
      console.log(`✅ Response is array with ${coursesResponse.data.length} courses`);
    } else {
      console.log('⚠️ Response is not an array:', coursesResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('📄 Response status:', error.response.status);
      console.error('📄 Response data:', error.response.data);
    }
  }
}

debugCoursesEndpoint();
