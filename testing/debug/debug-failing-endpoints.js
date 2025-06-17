/**
 * Debug script to test failing endpoints and see detailed error messages
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Login first to get a token
async function getAuthToken() {
  try {    const response = await axios.post(`${BASE_URL}/auth/login`, {
      identifier: 'alice_j',
      password: 'password123'
    });
    return response.data.token;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    return null;
  }
}

async function testEndpoint(endpoint, token) {
  try {
    console.log(`\n🔍 Testing: ${endpoint}`);
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   ✅ Data:`, JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
  } catch (error) {
    console.log(`   ❌ Status: ${error.response?.status || 'No response'}`);
    console.log(`   ❌ Error:`, error.response?.data || error.message);
    console.log(`   ❌ Stack:`, error.response?.data?.stack?.substring(0, 500) || 'No stack trace');
  }
}

async function main() {
  console.log('Getting auth token...');
  const token = await getAuthToken();
  
  if (!token) {
    console.error('Failed to get auth token');
    return;
  }
  
  console.log('Token obtained, testing endpoints...');
  
  // Test failing endpoints
  const endpoints = [
    '/adaptive-learning/recommendations',
    '/analytics/summary',
    '/social-learning/study-buddies/list',
    '/courses/instructor'
  ];
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint, token);
  }
}

main().catch(console.error);
