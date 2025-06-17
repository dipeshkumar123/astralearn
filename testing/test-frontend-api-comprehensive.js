/**
 * Comprehensive Frontend API Test
 * Tests all frontend API endpoints across different user roles
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAPIEndpoints() {
  console.log('🔍 Comprehensive Frontend API Test\n');
  
  try {
    // Test different user types    const testUsers = [
      { identifier: 'alice@example.com', password: 'password123', role: 'student' },
      { identifier: 'sarah@example.com', password: 'password123', role: 'instructor' },
      { identifier: 'admin@astralearn.com', password: 'admin123', role: 'admin' }
    ];
    
    for (const testUser of testUsers) {
      console.log(`\n🔐 Testing ${testUser.role.toUpperCase()} endpoints...`);
      console.log('=' .repeat(60));
      
      try {
        // Login
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
          identifier: testUser.identifier,
          password: testUser.password
        });
        
        const token = loginResponse.data.tokens.accessToken;
        const user = loginResponse.data.user;
        console.log(`✅ Login successful: ${user.firstName} ${user.lastName} (${user.role})`);
        
        // Common endpoints for all users
        await testEndpoint('GET', '/analytics/summary', token, 'Analytics Summary');
        await testEndpoint('GET', '/adaptive-learning/recommendations', token, 'Adaptive Learning Recommendations');
        await testEndpoint('GET', '/social-learning/dashboard/social', token, 'Social Dashboard');
        await testEndpoint('GET', '/gamification/dashboard', token, 'Gamification Dashboard');
        
        // Role-specific endpoints
        if (testUser.role === 'student') {
          await testEndpoint('GET', '/courses/my/enrolled', token, 'Enrolled Courses');
          await testEndpoint('GET', '/social-learning/study-buddies/list', token, 'Study Buddies');
          await testEndpoint('GET', '/social-learning/study-groups/my-groups', token, 'Study Groups');
          await testEndpoint('GET', '/gamification/streaks', token, 'Learning Streaks');
          await testEndpoint('GET', `/adaptive-learning/analytics/dashboard?userId=${user.id}`, token, 'Adaptive Analytics');
        }
        
        if (testUser.role === 'instructor') {
          await testEndpoint('GET', '/courses/instructor', token, 'Instructor Courses');
          await testEndpoint('GET', '/analytics/instructor/dashboard-overview', token, 'Instructor Analytics');
          await testEndpoint('GET', '/course-management/search', token, 'Course Management');
        }
        
        if (testUser.role === 'admin') {
          await testEndpoint('GET', '/analytics/admin/system-overview', token, 'Admin System Overview');
          await testEndpoint('GET', '/analytics/admin/user-analytics', token, 'User Analytics');
        }
        
      } catch (loginError) {
        console.log(`❌ Login failed for ${testUser.role}:`, loginError.response?.data?.error || loginError.message);
      }
    }
    
    console.log('\n🎯 Frontend API Test Complete\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testEndpoint(method, endpoint, token, description) {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: { Authorization: `Bearer ${token}` }
    };
    
    const response = await axios(config);
    const dataKeys = Object.keys(response.data).slice(0, 5);
    console.log(`   ✅ ${description}: Status ${response.status} | Keys: [${dataKeys.join(', ')}${dataKeys.length >= 5 ? '...' : ''}]`);
    
    // Check for actual data vs empty responses
    if (response.data && Object.keys(response.data).length > 0) {
      let hasData = false;
      for (const key in response.data) {
        if (response.data[key] && typeof response.data[key] === 'object' && Object.keys(response.data[key]).length > 0) {
          hasData = true;
          break;
        }
        if (Array.isArray(response.data[key]) && response.data[key].length > 0) {
          hasData = true;
          break;
        }
        if (typeof response.data[key] === 'string' && response.data[key].length > 0) {
          hasData = true;
          break;
        }
        if (typeof response.data[key] === 'number' && response.data[key] > 0) {
          hasData = true;
          break;
        }
      }
      if (hasData) {
        console.log(`      📊 Contains real data`);
      } else {
        console.log(`      ⚠️  Mostly empty response`);
      }
    }
    
  } catch (error) {
    console.log(`   ❌ ${description}: Status ${error.response?.status || 'Failed'} - ${error.response?.data?.error || error.message}`);
  }
}

testAPIEndpoints().catch(console.error);
