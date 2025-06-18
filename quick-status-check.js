/**
 * Quick endpoint status check
 */

const fetch = require('node-fetch');

async function quickCheck() {
  try {
    // Demo user login
    await fetch('http://localhost:5000/api/auth/create-demo', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    const login = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'demo@astralearn.com', password: 'demo123' })
    });
    const { tokens } = await login.json();
    
    const endpoints = [
      '/api/adaptive-learning/recommendations',
      '/api/analytics/summary', 
      '/api/social-learning/study-buddies/list',
      '/api/courses/instructor'
    ];
    
    console.log('🔍 Endpoint Status Check:');
    for (const endpoint of endpoints) {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        headers: { Authorization: `Bearer ${tokens.accessToken}` }
      });
      console.log(`${endpoint}: ${response.status === 200 ? '✅' : '❌'} ${response.status}`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

quickCheck();
