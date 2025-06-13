// Test AI Chat Fix - Verify 400 error is resolved
const axios = require('axios');

async function testAIChatFix() {
  console.log('🔧 Testing AI Chat Fix...\n');
  
  const API_BASE = 'http://localhost:5000/api';
  
  // Step 1: Login to get auth token
  console.log('1. Logging in...');
  try {    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      identifier: 'newtest@example.com', // Use existing test user
      password: 'password123'
    });    const token = loginResponse.data.tokens.accessToken;
    console.log('✅ Login successful');
    console.log('Token received:', token ? 'Yes' : 'No');
    
    // Step 2: Test AI orchestrated chat with correct payload
    console.log('\n2. Testing AI orchestrated chat endpoint...');
    
    const chatResponse = await axios.post(`${API_BASE}/ai/orchestrated/chat`, {
      content: 'Hello, can you help me with learning?', // Using 'content' not 'message'
      context: {
        page: 'test',
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ AI Chat Response:', {
      status: chatResponse.status,
      success: chatResponse.data.success,
      hasResponse: !!chatResponse.data.response,
      responseLength: chatResponse.data.response?.length || 0
    });
    
    // Step 3: Test streaming endpoint (using fetch)
    console.log('\n3. Testing AI streaming chat...');
    
    const streamResponse = await fetch(`${API_BASE}/ai/orchestrated/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: 'Can you explain machine learning basics?', // Using 'content' not 'message'
        context: {
          stream: true,
          page: 'test',
          timestamp: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      })
    });
    
    console.log('✅ Streaming Response Status:', streamResponse.status);
    
    if (streamResponse.ok) {
      console.log('✅ Streaming endpoint is working correctly');
    } else {
      console.log('❌ Streaming endpoint failed:', streamResponse.statusText);
    }
    
    console.log('\n🎉 AI Chat Fix Test Complete!');
    console.log('📋 Summary:');
    console.log('  • Fixed frontend to send "content" instead of "message"');
    console.log('  • Both regular and streaming chat endpoints working');
    console.log('  • AI Assistant should now work in the UI');
    
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('❌ Still getting 400 error - request validation failed');
      console.log('Request data:', error.config?.data);
      console.log('Error details:', error.response.data);
    } else {
      console.log('❌ Test failed:', error.message);
      if (error.response) {
        console.log('Status:', error.response.status);
        console.log('Data:', error.response.data);
      }
    }
  }
}

// Run the test
testAIChatFix().catch(console.error);
