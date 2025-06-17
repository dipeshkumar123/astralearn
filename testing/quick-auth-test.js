// Quick authentication test
const fetch = require('node-fetch');

async function testAuth() {
  try {
    console.log('Creating demo user...');
    const demoResponse = await fetch('http://localhost:5000/api/auth/create-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const demoData = await demoResponse.json();
    console.log('Demo user:', demoData.message);
    
    console.log('\nTesting login...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'demo@astralearn.com', password: 'demo123' })
    });
    const loginData = await loginResponse.json();
    console.log('Login Status:', loginResponse.status);
    console.log('Login Success:', loginData.message);
    console.log('User:', loginData.user?.firstName, loginData.user?.lastName);
    
    if (loginData.tokens?.accessToken) {
      console.log('✅ Authentication working correctly');
      
      // Test protected endpoint
      console.log('\nTesting protected endpoint...');
      const validateResponse = await fetch('http://localhost:5000/api/auth/validate', {
        headers: { 'Authorization': `Bearer ${loginData.tokens.accessToken}` }
      });
      const validateData = await validateResponse.json();
      console.log('Validation:', validateData.message);
      
      // Test adaptive learning endpoint
      console.log('\nTesting adaptive learning endpoint...');
      const adaptiveResponse = await fetch('http://localhost:5000/api/adaptive-learning/recommendations', {
        headers: { 'Authorization': `Bearer ${loginData.tokens.accessToken}` }
      });
      console.log('Adaptive Learning Status:', adaptiveResponse.status);
      const adaptiveData = await adaptiveResponse.json();
      console.log('Adaptive Learning:', adaptiveData.success ? 'Working' : adaptiveData.error);
      
      // Test analytics endpoint
      console.log('\nTesting analytics endpoint...');
      const analyticsResponse = await fetch('http://localhost:5000/api/analytics/summary', {
        headers: { 'Authorization': `Bearer ${loginData.tokens.accessToken}` }
      });
      console.log('Analytics Status:', analyticsResponse.status);
      const analyticsData = await analyticsResponse.json();
      console.log('Analytics:', analyticsData.success ? 'Working' : analyticsData.error);
    } else {
      console.error('❌ Login failed:', loginData.error);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAuth();
