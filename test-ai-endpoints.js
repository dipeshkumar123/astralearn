// Simple AI endpoints test
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function authenticateUser() {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'demo@astralearn.com',
        password: 'demo123'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log('❌ Authentication failed, status:', response.status);
      console.log('❌ Error details:', errorData);
      return null;
    }

    const data = await response.json();
    return data.tokens?.accessToken;
  } catch (error) {
    console.log('❌ Authentication error:', error.message);
    return null;
  }
}

async function testAIEndpoint(endpoint, token, payload) {
  try {
    console.log(`🧪 Testing ${endpoint}...`);
    
    const response = await fetch(`${BASE_URL}/ai${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    console.log(`📊 Status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Error: ${errorText}`);
      return false;
    }

    const data = await response.json();
    console.log(`✅ Success:`, data.success ? 'TRUE' : 'FALSE');
    if (data.reply || data.explanation || data.help || data.response?.reply) {
      const responseText = data.reply || data.explanation || data.help || data.response?.reply || 'No response text';
      console.log(`💬 Response: ${responseText.substring(0, 100)}...`);
    }
    if (!data.success && data.error) {
      console.log(`⚠️ Error: ${data.error}`);
    }
    if (data.metadata && data.metadata.fallback) {
      console.log(`⚠️ Fallback response used: ${data.metadata.reason || 'Unknown reason'}`);
    }
    
    return true;
  } catch (error) {
    console.log(`❌ ${endpoint} test failed:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🤖 AI ENDPOINTS TEST');
  console.log('===============================');
  
  // First authenticate
  const token = await authenticateUser();
  if (!token) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  console.log('✅ Authentication successful\n');
  
  // Test basic AI endpoints
  const tests = [
    {
      endpoint: '/chat',
      payload: { message: 'Hello, can you help me?' }
    },
    {
      endpoint: '/explain',
      payload: { concept: 'React hooks' }
    },
    {
      endpoint: '/debug',
      payload: { problem: 'My JavaScript code is not working' }
    },
    {
      endpoint: '/orchestrated/chat',
      payload: { content: 'Hello from orchestrated chat' }
    },
    {
      endpoint: '/orchestrated/explain',
      payload: { concept: 'JavaScript closures' }
    }
  ];
  
  let passedTests = 0;
  
  for (const test of tests) {
    const success = await testAIEndpoint(test.endpoint, token, test.payload);
    if (success) passedTests++;
    console.log(''); // Add spacing
  }
  
  console.log(`📊 SUMMARY: ${passedTests}/${tests.length} tests passed`);
}

main().catch(console.error);
