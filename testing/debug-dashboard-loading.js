/**
 * Debug Student Dashboard Loading Issue
 */

async function debugDashboardLoading() {
  console.log('🔍 Debugging Student Dashboard Loading Issue\n');

  const baseUrl = 'http://localhost:5000/api';
  
  try {
    // Step 1: Test authentication
    console.log('1. Testing authentication...');
    const authResponse = await fetch('http://localhost:5000/api/auth/create-demo', {
      method: 'POST'
    });
    
    if (authResponse.ok) {
      console.log('✅ Demo user creation available');
    }

    // Try to login
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'demo@astralearn.com',
        password: 'demo123'
      })
    });

    let token = null;
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      token = loginData.tokens.accessToken;
      console.log('✅ Authentication successful');
      console.log(`   User: ${loginData.user.firstName} ${loginData.user.lastName}`);
    } else {
      console.log('❌ Authentication failed');
      return;
    }

    // Step 2: Test individual dashboard endpoints
    console.log('\n2. Testing dashboard API endpoints...');
    
    const endpoints = [
      { name: 'Enrolled Courses', url: '/courses/my/enrolled' },
      { name: 'Learning Analytics', url: '/analytics/summary' },
      { name: 'Recommendations', url: '/adaptive-learning/recommendations' },
      { name: 'Gamification Dashboard', url: '/gamification/dashboard' }
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`   Testing ${endpoint.name}...`);
        const response = await fetch(`${baseUrl}${endpoint.url}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`   ✅ ${endpoint.name}: Working (${response.status})`);
          
          // Log data structure for debugging
          if (endpoint.name === 'Enrolled Courses') {
            console.log(`      Courses found: ${data.enrolledCourses?.length || 0}`);
          } else if (endpoint.name === 'Learning Analytics') {
            console.log(`      Analytics data: ${data.analytics ? 'Present' : 'Missing'}`);
          } else if (endpoint.name === 'Recommendations') {
            console.log(`      Recommendations: ${data.recommendations?.length || 0}`);
          } else if (endpoint.name === 'Gamification Dashboard') {
            console.log(`      Dashboard data: ${data.profile ? 'Present' : 'Missing'}`);
          }
        } else {
          const errorText = await response.text();
          console.log(`   ❌ ${endpoint.name}: Failed (${response.status})`);
          console.log(`      Error: ${errorText.substring(0, 100)}...`);
        }
      } catch (error) {
        console.log(`   ❌ ${endpoint.name}: Error - ${error.message}`);
      }

      // Add small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Step 3: Test course catalog endpoint
    console.log('\n3. Testing course catalog...');
    try {
      const coursesResponse = await fetch(`${baseUrl}/courses`);
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        console.log(`   ✅ Course catalog: ${coursesData.courses?.length || 0} courses available`);
      } else {
        console.log(`   ❌ Course catalog: Failed (${coursesResponse.status})`);
      }
    } catch (error) {
      console.log(`   ❌ Course catalog: Error - ${error.message}`);
    }

    // Step 4: Check for potential timeout issues
    console.log('\n4. Performance analysis...');
    const startTime = Date.now();
    
    // Simulate parallel loading like the dashboard does
    const promises = endpoints.map(endpoint => 
      fetch(`${baseUrl}${endpoint.url}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => null)
    );

    await Promise.all(promises);
    const loadTime = Date.now() - startTime;
    
    console.log(`   Total load time: ${loadTime}ms`);
    if (loadTime > 10000) {
      console.log('   ⚠️  Loading time is very slow (>10s) - this could cause timeout issues');
    } else if (loadTime > 5000) {
      console.log('   ⚠️  Loading time is slow (>5s) - may affect user experience');
    } else {
      console.log('   ✅ Loading time is acceptable');
    }

    console.log('\n📋 Dashboard Loading Debug Summary:');
    console.log('   ✅ Authentication system working');
    console.log('   📊 API endpoints tested');
    console.log('   ⏱️  Performance analyzed');
    console.log('\n💡 Possible solutions if dashboard is stuck loading:');
    console.log('   1. Check browser console for JavaScript errors');
    console.log('   2. Verify authentication token is being passed correctly');
    console.log('   3. Check if any API endpoints are hanging');
    console.log('   4. Clear browser cache and reload');
    console.log('   5. Check network tab in browser developer tools');

  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Ensure backend server is running on localhost:5000');
    console.log('   2. Check database connection');
    console.log('   3. Verify authentication system is working');
  }
}

// Add fetch polyfill for Node.js if needed
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

debugDashboardLoading().catch(console.error);
