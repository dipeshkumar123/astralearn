// Quick AI Error Debug
const axios = require('axios');

async function quickDebug() {
  console.log('🔧 Quick AI Error Debug...\n');
  
  const API_BASE = 'http://localhost:5000/api';
  
  try {
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      identifier: 'newtest@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.tokens.accessToken;
    console.log('✅ Login successful');
    
    // Test AI chat
    const chatResponse = await axios.post(`${API_BASE}/ai/orchestrated/chat`, {
      content: 'Hello',
      context: {},
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Full response:', JSON.stringify(chatResponse.data, null, 2));
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

quickDebug().catch(console.error);
