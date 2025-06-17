const fetch = require('node-fetch');

async function debugInstructorEndpoint() {
  try {
    // Create demo user
    const demoResponse = await fetch('http://localhost:5000/api/auth/create-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
      // Login with instructor
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'dr_chen', password: 'password123' })
    });
    const loginData = await loginResponse.json();
    
    console.log('Demo user role:', loginData.user?.role);
    
    if (loginData.tokens?.accessToken) {
      console.log('✅ Got auth token');
      
      // Test instructor endpoint with detailed error handling
      console.log('\n🔍 Testing instructor endpoint...');
      const instructorResponse = await fetch('http://localhost:5000/api/courses/instructor', {
        headers: { 
          'Authorization': `Bearer ${loginData.tokens.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Status:', instructorResponse.status);
      
      const instructorText = await instructorResponse.text();
      console.log('Raw response:', instructorText);
      
      try {
        const instructorData = JSON.parse(instructorText);
        console.log('Parsed response:', JSON.stringify(instructorData, null, 2));
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

debugInstructorEndpoint();
