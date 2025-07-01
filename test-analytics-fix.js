// Analytics Service Error Fix Validation
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function testAnalyticsEndpoints() {
  console.log('🔧 ANALYTICS SERVICE ERROR FIX VALIDATION');
  console.log('==========================================');
  
  try {
    // Test analytics endpoint that was throwing errors
    const response = await fetch(`${BASE_URL}/analytics/summary`, {
      headers: {
        'Authorization': `Bearer ${await getToken()}`
      }
    });
    
    console.log(`📊 Analytics Summary Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Analytics endpoint working without errors');
      console.log(`📈 Data received: ${JSON.stringify(data).length} characters`);
    } else {
      console.log('❌ Analytics endpoint failed');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

async function getToken() {
  const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'demo@astralearn.com',
      password: 'demo123'
    })
  });
  
  const loginData = await loginResponse.json();
  return loginData.tokens?.accessToken;
}

testAnalyticsEndpoints().catch(console.error);
