/**
 * Simple debug script to test flexible auth
 */

const fetch = require('node-fetch');

async function testFlexibleAuth() {
  try {
    // Test an endpoint that uses flexibleAuthenticate
    const response = await fetch('http://localhost:5000/api/analytics/user/overview');
    const body = await response.text();
    
    console.log('Status:', response.status);
    console.log('Body:', body);
    
    // Also test server environment
    const healthResponse = await fetch('http://localhost:5000/health');
    const healthBody = await healthResponse.text();
    console.log('\nHealth check:', healthBody);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testFlexibleAuth();
