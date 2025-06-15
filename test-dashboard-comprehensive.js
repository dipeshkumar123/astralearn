/**
 * Comprehensive Dashboard Error Handling Test Suite
 * Tests all dashboard-related API endpoints and verifies JSON response handling
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const TEST_TOKEN = 'demo-token';
const TEST_USER_ID = 'test-user-123';

// Test configuration
const ENDPOINTS_TO_TEST = [
  // Analytics endpoints
  { url: '/api/analytics/user/overview', method: 'GET', requiresAuth: true, description: 'User Analytics Overview' },
  { url: '/api/analytics/instructor/dashboard-overview', method: 'GET', requiresAuth: true, description: 'Instructor Dashboard Overview' },
  
  // Course endpoints
  { url: '/api/courses/my/enrolled', method: 'GET', requiresAuth: true, description: 'User Enrolled Courses' },
  { url: '/api/courses/instructor', method: 'GET', requiresAuth: true, description: 'Instructor Courses' },
  
  // Gamification endpoints
  { url: '/api/gamification/leaderboard/rank', method: 'GET', requiresAuth: true, description: 'Gamification Leaderboard Rank' },
  { url: '/api/gamification/recommendations/social', method: 'GET', requiresAuth: false, description: 'Social Recommendations' },
  
  // Adaptive Learning endpoints
  { url: `/api/adaptive-learning/analytics/dashboard?userId=${TEST_USER_ID}`, method: 'GET', requiresAuth: true, description: 'Adaptive Learning Dashboard' },
  { url: `/api/adaptive-learning/recommendations?userId=${TEST_USER_ID}&limit=5`, method: 'GET', requiresAuth: true, description: 'Adaptive Learning Recommendations' },
  { url: `/api/adaptive-learning/learning-path/current?userId=${TEST_USER_ID}`, method: 'GET', requiresAuth: true, description: 'Current Learning Path' },
  
  // Health check
  { url: '/api/health', method: 'GET', requiresAuth: false, description: 'Health Check' }
];

async function testEndpoint(endpoint) {
  try {
    console.log(`\n🔍 Testing: ${endpoint.description}`);
    console.log(`   URL: ${endpoint.url}`);
    
    const config = {
      method: endpoint.method,
      url: `${BASE_URL}${endpoint.url}`,
      timeout: 5000,
      validateStatus: () => true // Accept all status codes
    };
    
    if (endpoint.requiresAuth) {
      config.headers = {
        'Authorization': `Bearer ${TEST_TOKEN}`
      };
    }
    
    const response = await axios(config);
    
    // Check if response is JSON
    const contentType = response.headers['content-type'] || '';
    const isJson = contentType.includes('application/json');
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Content-Type: ${contentType}`);
    console.log(`   Is JSON: ${isJson ? '✅' : '❌'}`);
    
    if (isJson) {
      try {
        const data = response.data;
        console.log(`   Response Size: ${JSON.stringify(data).length} chars`);
        
        // Check for expected structure
        if (response.status === 200) {
          console.log(`   ✅ SUCCESS: Valid JSON response`);
        } else {
          // Check if error is properly formatted JSON
          if (data.error || data.message) {
            console.log(`   ✅ SUCCESS: JSON error response`);
          } else {
            console.log(`   ⚠️  WARNING: Non-standard error format`);
          }
        }
      } catch (e) {
        console.log(`   ❌ ERROR: Invalid JSON response`);
      }
    } else {
      console.log(`   ❌ ERROR: Non-JSON response (likely HTML error page)`);
    }
    
    return {
      endpoint: endpoint.description,
      url: endpoint.url,
      status: response.status,
      isJson,
      success: isJson
    };
    
  } catch (error) {
    console.log(`   ❌ NETWORK ERROR: ${error.message}`);
    return {
      endpoint: endpoint.description,
      url: endpoint.url,
      status: 'NETWORK_ERROR',
      isJson: false,
      success: false,
      error: error.message
    };
  }
}

async function testNonExistentEndpoint() {
  console.log(`\n🔍 Testing: Non-existent API endpoint`);
  console.log(`   URL: /api/non-existent-endpoint`);
  
  try {
    const response = await axios({
      method: 'GET',
      url: `${BASE_URL}/api/non-existent-endpoint`,
      timeout: 5000,
      validateStatus: () => true
    });
    
    const contentType = response.headers['content-type'] || '';
    const isJson = contentType.includes('application/json');
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Content-Type: ${contentType}`);
    console.log(`   Is JSON: ${isJson ? '✅' : '❌'}`);
    
    return {
      endpoint: 'Non-existent endpoint',
      url: '/api/non-existent-endpoint',
      status: response.status,
      isJson,
      success: isJson && response.status === 404
    };
    
  } catch (error) {
    console.log(`   ❌ NETWORK ERROR: ${error.message}`);
    return {
      endpoint: 'Non-existent endpoint',
      url: '/api/non-existent-endpoint',
      status: 'NETWORK_ERROR',
      isJson: false,
      success: false,
      error: error.message
    };
  }
}

async function runComprehensiveTest() {
  console.log('🚀 Starting Comprehensive Dashboard Error Handling Test');
  console.log('=' .repeat(60));
  
  const results = [];
  
  // Test all defined endpoints
  for (const endpoint of ENDPOINTS_TO_TEST) {
    const result = await testEndpoint(endpoint);
    results.push(result);
  }
  
  // Test non-existent endpoint
  const nonExistentResult = await testNonExistentEndpoint();
  results.push(nonExistentResult);
  
  // Generate summary report
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY REPORT');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`\n✅ Successful: ${successful.length}/${results.length} tests passed`);
  console.log(`❌ Failed: ${failed.length}/${results.length} tests failed`);
  
  if (failed.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    failed.forEach(f => {
      console.log(`   - ${f.endpoint} (${f.url}): ${f.status} - ${f.error || 'Non-JSON response'}`);
    });
  }
  
  if (successful.length === results.length) {
    console.log('\n🎉 ALL TESTS PASSED! Dashboard error handling is working correctly.');
    console.log('✅ All API endpoints return JSON responses');
    console.log('✅ No HTML error pages detected');
    console.log('✅ Frontend dashboards should no longer crash from JSON parsing errors');
  } else {
    console.log('\n⚠️  Some tests failed. Dashboard may still have JSON parsing issues.');
  }
  
  console.log('\n🔧 NEXT STEPS:');
  console.log('1. Test frontend dashboards manually');
  console.log('2. Check browser console for any remaining errors');
  console.log('3. Verify fallback data displays correctly when APIs fail');
  
  return results;
}

// Run the test if this file is executed directly
if (require.main === module) {
  runComprehensiveTest()
    .then(results => {
      console.log('\n✅ Test completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { runComprehensiveTest, testEndpoint };
