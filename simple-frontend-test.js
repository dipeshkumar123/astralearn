/**
 * Simple Frontend Endpoint Test
 * Tests the specific endpoints that frontend components are calling
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testEndpoints() {
  console.log('🔍 Frontend Endpoint Test\n');
  
  // Get auth token
  try {    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        identifier: 'alice@example.com', 
        password: 'password123' 
      })
    });
      if (!loginResponse.ok) {
      console.log('❌ Authentication failed');
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('Login response:', JSON.stringify(loginData, null, 2));
    const token = loginData.token || loginData.tokens?.accessToken;
    console.log('✅ Authentication successful\n');
    console.log('Token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.log('❌ No token received');
      return;
    }
    
    // Test endpoints that frontend components are calling
    const endpoints = [
      // Core endpoints that are working
      '/api/analytics/summary',
      '/api/adaptive-learning/recommendations',
      '/api/social-learning/study-buddies/list',
      '/api/courses/instructor',
      
      // Endpoints that frontend tries to call but may not exist
      '/api/courses/my/enrolled',
      '/api/social-learning/dashboard/social',
      '/api/social-learning/study-groups/my-groups',
      '/api/adaptive-learning/analytics/dashboard?userId=674abcd1234567890123456a',
      '/api/adaptive-learning/learning-path/current?userId=674abcd1234567890123456a',
      '/api/gamification/dashboard',
      '/api/gamification/streaks',
      '/api/course-management/search'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${endpoint}: Status ${response.status}`);
          // Show data structure
          if (data && typeof data === 'object') {
            const keys = Object.keys(data);
            console.log(`   Keys: [${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}]`);
          }
        } else {
          console.log(`❌ ${endpoint}: Status ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint}: Error - ${error.message}`);
      }
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testEndpoints();
