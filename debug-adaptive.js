const fetch = require('node-fetch');

async function debugAdaptiveLearning() {
  try {
    // Create demo user
    const demoResponse = await fetch('http://localhost:5000/api/auth/create-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    // Login
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'demo@astralearn.com', password: 'demo123' })
    });
    const loginData = await loginResponse.json();
    
    if (loginData.tokens?.accessToken) {
      console.log('✅ Got auth token');
      
      // Test adaptive learning endpoint with detailed error handling
      console.log('\n🔍 Testing adaptive learning endpoint...');
      const adaptiveResponse = await fetch('http://localhost:5000/api/adaptive-learning/recommendations', {
        headers: { 
          'Authorization': `Bearer ${loginData.tokens.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Status:', adaptiveResponse.status);
      console.log('Headers:', adaptiveResponse.headers.raw());
      
      const adaptiveText = await adaptiveResponse.text();
      console.log('Raw response:', adaptiveText);
      
      try {
        const adaptiveData = JSON.parse(adaptiveText);
        console.log('Parsed response:', JSON.stringify(adaptiveData, null, 2));
      } catch (e) {
        console.log('Failed to parse as JSON:', e.message);
      }
      
    } else {
      console.error('Failed to get auth token');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugAdaptiveLearning();
