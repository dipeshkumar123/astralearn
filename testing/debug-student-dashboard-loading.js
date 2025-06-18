/**
 * Quick Debug Test for StudentDashboard Loading Issue
 */

console.log('🔍 Quick debug test for StudentDashboard loading issue\n');

// Test if servers are running
async function checkServers() {
  console.log('1. Checking if servers are accessible...');
  
  try {
    // Check frontend
    const frontendResponse = await fetch('http://localhost:3000/');
    console.log(`Frontend: ${frontendResponse.ok ? '✅ Running' : '❌ Error'}`);
  } catch (error) {
    console.log('Frontend: ❌ Not accessible');
  }
  
  try {
    // Check backend health
    const backendResponse = await fetch('http://localhost:5000/health');
    if (backendResponse.ok) {
      const healthData = await backendResponse.json();
      console.log('Backend: ✅ Running');
      console.log('Database:', healthData.database ? '✅ Connected' : '❌ Disconnected');
    } else {
      console.log('Backend: ❌ Error');
    }
  } catch (error) {
    console.log('Backend: ❌ Not accessible');
  }
}

// Test basic API endpoints
async function checkAPIs() {
  console.log('\n2. Checking API endpoints...');
  
  const endpoints = [
    { name: 'Courses', url: 'http://localhost:5000/api/courses' },
    { name: 'Analytics (no auth)', url: 'http://localhost:5000/api/analytics/summary' },
    { name: 'Recommendations (no auth)', url: 'http://localhost:5000/api/adaptive-learning/recommendations' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint.url);
      console.log(`${endpoint.name}: ${response.status} ${response.ok ? '✅' : '❌'}`);
    } catch (error) {
      console.log(`${endpoint.name}: ❌ Failed`);
    }
  }
}

// Check if there are any CORS issues
function checkBrowserConsole() {
  console.log('\n3. Browser console recommendations:');
  console.log('   - Open browser DevTools (F12)');
  console.log('   - Check Console tab for errors');
  console.log('   - Look for CORS, network, or authentication errors');
  console.log('   - Check Network tab for failed requests');
}

async function main() {
  await checkServers();
  await checkAPIs();
  checkBrowserConsole();
  
  console.log('\n🔧 Troubleshooting steps:');
  console.log('   1. Ensure both frontend and backend servers are running');
  console.log('   2. Check browser console for JavaScript errors');
  console.log('   3. Verify authentication token is being set properly');
  console.log('   4. Try refreshing the page or clearing browser cache');
  console.log('   5. Check if the loading timeout (15s) helps identify the issue');
}

// Make fetch available for Node.js
if (typeof fetch === 'undefined') {
  console.log('Note: Run this in browser console or install node-fetch for Node.js');
} else {
  main().catch(console.error);
}
