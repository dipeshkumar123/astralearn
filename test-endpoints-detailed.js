// Test specific endpoint errors
const fetch = require('node-fetch');

async function testSpecificEndpoints() {
  try {
    // First get auth token
    console.log('Getting auth token...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'demo@astralearn.com', password: 'demo123' })
    });
    const loginData = await loginResponse.json();
    const token = loginData.tokens.accessToken;
    console.log('Token obtained:', !!token);
    
    // Test specific endpoints with detailed error info
    const endpoints = [
      '/api/adaptive-learning/recommendations',
      '/api/analytics/summary',
      '/api/social-learning/study-buddies/list',
      '/api/ai/orchestrated/chat',
      '/api/courses/instructor'
    ];
    
    for (const endpoint of endpoints) {
      console.log(`\n🔍 Testing: ${endpoint}`);
      try {
        let response;
        if (endpoint === '/api/ai/orchestrated/chat') {
          response = await fetch(`http://localhost:5000${endpoint}`, {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: 'test message' })
          });
        } else {
          response = await fetch(`http://localhost:5000${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
        
        console.log(`   Status: ${response.status}`);
        const data = await response.json();
        
        if (response.status >= 400) {
          console.log(`   Error: ${data.error || data.message}`);
          if (data.details) console.log(`   Details: ${JSON.stringify(data.details)}`);
        } else {
          console.log(`   ✅ Success: ${data.success || 'OK'}`);
        }
      } catch (error) {
        console.log(`   ❌ Exception: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testSpecificEndpoints();
