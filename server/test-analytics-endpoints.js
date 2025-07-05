/**
 * Test analytics endpoints
 */
import fetch from 'node-fetch';
import { config as dotenvConfig } from 'dotenv';

// Load environment variables
dotenvConfig();

const baseUrl = 'http://localhost:5000';

async function fetchWithAuth(url, options = {}) {
  // Get a valid auth token first
  const authResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      identifier: 'demo@astralearn.com',
      password: 'demo123'
    }),
  });
  
  if (!authResponse.ok) {
    console.error('Auth failed:', await authResponse.text());
    throw new Error('Authentication failed');
  }
  
  const authData = await authResponse.json();
  
  if (!authData.tokens || !authData.tokens.accessToken) {
    console.error('Auth failed:', authData);
    throw new Error('Authentication failed - no token received');
  }
  
  // Now make the actual request with the token
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${authData.tokens.accessToken}`
    }
  });
  
  return response;
}

async function testAnalyticsSummary() {
  try {
    console.log('Testing /api/analytics/summary endpoint...');
    const response = await fetchWithAuth(`${baseUrl}/api/analytics/summary`);
    
    if (!response.ok) {
      console.error('Error:', response.status, response.statusText);
      console.error('Response:', await response.text());
      return;
    }
    
    const data = await response.json();
    console.log('Analytics Summary Response:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error testing analytics summary:', error.message);
  }
}

async function testAnalyticsDashboard() {
  try {
    console.log('\nTesting /api/analytics/dashboard endpoint...');
    const response = await fetchWithAuth(`${baseUrl}/api/analytics/dashboard`);
    
    if (!response.ok) {
      console.error('Error:', response.status, response.statusText);
      console.error('Response:', await response.text());
      return;
    }
    
    const data = await response.json();
    console.log('Analytics Dashboard Response:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error testing analytics dashboard:', error.message);
  }
}

async function testAnalyticsHistory() {
  try {
    console.log('\nTesting /api/analytics/history endpoint...');
    const response = await fetchWithAuth(`${baseUrl}/api/analytics/history`);
    
    if (!response.ok) {
      console.error('Error:', response.status, response.statusText);
      console.error('Response:', await response.text());
      return;
    }
    
    const data = await response.json();
    console.log('Analytics History Response:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error testing analytics history:', error.message);
  }
}

async function runTests() {
  await testAnalyticsSummary();
  await testAnalyticsDashboard();
  await testAnalyticsHistory();
}

runTests().catch(error => {
  console.error('Test script failed:', error);
});
