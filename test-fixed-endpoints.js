#!/usr/bin/env node

/**
 * Test Fixed API Endpoints
 * Specifically test the newly added admin endpoints and fixed instructor endpoints
 */

const fetch = require('node-fetch').default || require('node-fetch');

async function testEndpoints() {
  const baseURL = 'http://localhost:5000/api';
  
  console.log('🔍 Testing Fixed API Endpoints...\n');

  // Test instructor dashboard overview
  console.log('Testing Instructor Dashboard Overview...');
  try {
    const response = await fetch(`${baseURL}/analytics/instructor/dashboard-overview`, {
      headers: {
        'Authorization': 'Bearer mock-token-instructor',
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      console.log('   ✅ Instructor dashboard endpoint working');
      console.log(`   📊 Data: ${data.data.totalCourses} courses, ${data.data.totalStudents} students`);
    } else {
      console.log('   ❌ Instructor dashboard endpoint failed');
      console.log(`   Error: ${data.error || data.message}`);
    }
  } catch (error) {
    console.log('   ❌ Network error:', error.message);
  }

  console.log('\nTesting Admin System Overview...');
  try {
    const response = await fetch(`${baseURL}/analytics/admin/system-overview`, {
      headers: {
        'Authorization': 'Bearer mock-token-admin',
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      console.log('   ✅ Admin system overview endpoint working');
      console.log(`   📊 Data: ${data.data.totalUsers} users, ${data.data.totalCourses} courses`);
    } else {
      console.log('   ❌ Admin system overview endpoint failed');
      console.log(`   Error: ${data.error || data.message}`);
    }
  } catch (error) {
    console.log('   ❌ Network error:', error.message);
  }

  console.log('\nTesting Admin User Analytics...');
  try {
    const response = await fetch(`${baseURL}/analytics/admin/user-analytics`, {
      headers: {
        'Authorization': 'Bearer mock-token-admin',
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      console.log('   ✅ Admin user analytics endpoint working');
      console.log(`   📊 Data: ${data.data.userMetrics.totalUsers} total users, ${data.data.userMetrics.activeUsers} active`);
    } else {
      console.log('   ❌ Admin user analytics endpoint failed');
      console.log(`   Error: ${data.error || data.message}`);
    }
  } catch (error) {
    console.log('   ❌ Network error:', error.message);
  }

  console.log('\n✅ API endpoint testing complete!');
}

testEndpoints();
