import fetch from 'node-fetch';

async function testDashboardAPIs() {
  const baseUrl = 'http://localhost:5000/api';
  const token = 'demo-token';
  
  console.log('Testing Student Dashboard APIs...\n');
  
  const endpoints = [
    { name: 'Enrolled Courses', url: '/courses/my/enrolled' },
    { name: 'Learning Analytics', url: '/analytics/summary' },
    { name: 'Recommendations', url: '/adaptive-learning/recommendations' },
    { name: 'Gamification Dashboard', url: '/gamification/dashboard' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint.url}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint.name}: OK`);
        console.log(`   Data keys: ${Object.keys(data).join(', ')}`);
        if (endpoint.name === 'Enrolled Courses') {
          console.log(`   Courses found: ${data.enrolledCourses?.length || 0}`);
        }
      } else {
        console.log(`❌ ${endpoint.name}: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.message}`);
    }
  }
}

testDashboardAPIs();
