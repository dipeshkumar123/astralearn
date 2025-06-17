// Check AI Service Health
const axios = require('axios');

async function checkAIHealth() {
  console.log('🏥 Checking AI Service Health...\n');
  
  const API_BASE = 'http://localhost:5000/api';
  
  try {
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      identifier: 'newtest@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.tokens.accessToken;
    console.log('✅ Login successful');
    
    // Check AI health
    const healthResponse = await axios.get(`${API_BASE}/ai/orchestrated/health`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('🏥 AI Health Status:');
    console.log(JSON.stringify(healthResponse.data, null, 2));
    
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

checkAIHealth().catch(console.error);
