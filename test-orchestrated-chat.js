const axios = require('axios');

async function testOrchestration() {
  try {
    console.log('Testing orchestrated chat endpoint...');
    
    // First get auth token
    const authRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    const token = authRes.data.token;
    console.log('✅ Auth successful, token obtained');
    
    // Test orchestrated chat
    const chatRes = await axios.post('http://localhost:5000/api/ai/orchestrated/chat', {
      content: 'Hello, can you help me with learning?',
      context: {}
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Chat successful:', JSON.stringify(chatRes.data, null, 2));
  } catch (error) {
    console.error('❌ Error details:');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Message:', error.message);
  }
}

testOrchestration();
